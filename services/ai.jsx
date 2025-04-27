// services/ai.jsx
import { db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Placeholder for your Gemini API key
const API_KEY = 'YOUR_GEMINI_API_KEY';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// Cache settings
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// Helper to check if cache is valid
const isCacheValid = (timestamp) => {
  return Date.now() - timestamp < CACHE_DURATION;
};

/**
 * Get travel recommendations based on location and travel type
 * @param {string} location - City or area name
 * @param {string} travelType - 'Just Me', 'Friends', 'Family', or 'Couple'
 * @param {string} interests - Optional interests
 * @returns {Promise<Object>} Recommendations
 */
export const getTravelRecommendations = async (location, travelType, interests = '') => {
  try {
    // Create a cache key
    const cacheKey = `rec_${location.toLowerCase()}_${travelType.toLowerCase()}_${interests.toLowerCase()}`;
    
    // Check local cache first
    const localCache = await AsyncStorage.getItem(cacheKey);
    if (localCache) {
      const { data, timestamp } = JSON.parse(localCache);
      if (isCacheValid(timestamp)) {
        return data;
      }
    }
    
    // Then check Firestore cache
    const cacheRef = doc(db, "aiCache", cacheKey);
    const cacheDoc = await getDoc(cacheRef);
    
    if (cacheDoc.exists()) {
      const cachedData = cacheDoc.data();
      if (isCacheValid(cachedData.timestamp)) {
        // Update local cache for future requests
        await AsyncStorage.setItem(cacheKey, JSON.stringify({
          data: cachedData.data,
          timestamp: cachedData.timestamp
        }));
        
        return cachedData.data;
      }
    }
    
    // Prepare the prompt for Gemini
    let prompt = `Give me travel recommendations for ${location} for a ${travelType.toLowerCase()} trip.`;
    
    if (interests) {
      prompt += ` We're interested in ${interests}.`;
    }
    
    prompt += ` Please include recommendations for: 
    1. Top attractions to visit 
    2. Best restaurants to try 
    3. Hidden gems that locals know about
    4. Best time to visit each place
    5. Estimated time to spend at each place
    
    Format the response as a JSON object with these categories. For each recommendation, include a short description and why it's good for ${travelType.toLowerCase()} travelers.`;
    
    // Make API request to Gemini
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Error getting AI recommendations: ${response.statusText}`);
    }
    
    const responseData = await response.json();
    
    // Parse the results - assume Gemini returns a proper JSON string
    // First get the text from the response
    const generatedText = responseData.candidates[0].content.parts[0].text;
    
    // Find JSON portion (between first { and last })
    const jsonStart = generatedText.indexOf('{');
    const jsonEnd = generatedText.lastIndexOf('}') + 1;
    const jsonPortion = generatedText.substring(jsonStart, jsonEnd);
    
    // Parse the JSON
    const recommendations = JSON.parse(jsonPortion);
    
    // Save to both local and Firestore cache
    const cacheData = {
      data: recommendations,
      timestamp: Date.now()
    };
    
    await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
    await setDoc(cacheRef, cacheData);
    
    return recommendations;
  } catch (error) {
    console.error('AI recommendation error:', error);
    // Return a fallback response if AI fails
    return {
      error: true,
      message: "Couldn't get AI recommendations. Please try again later.",
      fallbackRecommendations: {
        attractions: [
          {
            name: "Local Park",
            description: "A peaceful spot to explore.",
            suitableFor: travelType,
            bestTime: "Mornings or late afternoons",
            timeToSpend: "1-2 hours"
          }
        ],
        restaurants: [
          {
            name: "City Café",
            description: "Popular spot with great local food.",
            suitableFor: travelType,
            bestTime: "Lunch or early dinner",
            timeToSpend: "1 hour"
          }
        ],
        hiddenGems: [
          {
            name: "Local Market",
            description: "Experience local culture and find unique items.",
            suitableFor: travelType,
            bestTime: "Morning hours",
            timeToSpend: "1 hour"
          }
        ]
      }
    };
  }
};

/**
 * Generate a travel story title and intro based on trip details
 * @param {Object} tripDetails - Details about the trip
 * @returns {Promise<Object>} Generated title and intro
 */
export const generateStoryIdeas = async (tripDetails) => {
  try {
    const { location, travelType, highlights } = tripDetails;
    
    // Create prompt
    const prompt = `Generate a catchy title and brief introduction for a travel story about a ${travelType.toLowerCase()} trip to ${location}. 
    
    Some highlights from the trip: ${highlights || "exploring local attractions and enjoying the atmosphere"}
    
    Format the response as a JSON object with 'title' and 'introduction' fields. Make the introduction about 2-3 sentences that would make someone want to read the full story.`;
    
    // Make API request to Gemini
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Error generating story ideas: ${response.statusText}`);
    }
    
    const responseData = await response.json();
    
    // Parse the results
    const generatedText = responseData.candidates[0].content.parts[0].text;
    
    // Find JSON portion
    const jsonStart = generatedText.indexOf('{');
    const jsonEnd = generatedText.lastIndexOf('}') + 1;
    const jsonPortion = generatedText.substring(jsonStart, jsonEnd);
    
    // Parse the JSON
    const storyIdeas = JSON.parse(jsonPortion);
    
    return storyIdeas;
  } catch (error) {
    console.error('Story generation error:', error);
    // Return fallback
    return {
      title: `My ${tripDetails.travelType} Trip to ${tripDetails.location}`,
      introduction: `I recently spent some time in ${tripDetails.location} and wanted to share my experience. It was a memorable journey with many wonderful moments.`
    };
  }
};

export default {
  getTravelRecommendations,
  generateStoryIdeas
};