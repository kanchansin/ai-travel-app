// backend/services/recommendationService.js
const { admin } = require('../config/firebase');
const db = admin.firestore();
const mapboxService = require('./mapboxService');
const { getDistanceBetween } = require('../utils/geoUtils');

/**
 * Get popular destinations based on visit count or ratings
 * @param {number} limit - Number of destinations to return
 * @returns {Promise<Array>} - Popular destinations
 */
const getPopularDestinations = async (limit = 10) => {
  try {
    const placesRef = db.collection('places');
    const snapshot = await placesRef
      .orderBy('visitCount', 'desc')
      .limit(limit)
      .get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching popular destinations:', error);
    throw error;
  }
};

/**
 * Get personalized recommendations based on user history
 * @param {string} userId - User ID
 * @param {number} limit - Number of recommendations to return
 * @returns {Promise<Array>} - Recommended places
 */
const getPersonalizedRecommendations = async (userId, limit = 5) => {
  try {
    // Get user's previously visited places
    const userTripsRef = db.collection('trips').where('userId', '==', userId);
    const userTripsSnapshot = await userTripsRef.get();
    
    // Extract places from user's trips
    const visitedPlaces = new Set();
    const userInterests = new Set();
    const visitedCountries = new Set();
    
    userTripsSnapshot.forEach(doc => {
      const tripData = doc.data();
      if (tripData.destinations) {
        tripData.destinations.forEach(dest => {
          visitedPlaces.add(dest.placeId);
          if (dest.country) visitedCountries.add(dest.country);
        });
      }
      if (tripData.tags) {
        tripData.tags.forEach(tag => userInterests.add(tag));
      }
    });
    
    // Find places with similar tags or in similar countries
    let recommendationsQuery = db.collection('places');
    
    // Don't recommend already visited places
    if (visitedPlaces.size > 0) {
      recommendationsQuery = recommendationsQuery.where('id', 'not-in', Array.from(visitedPlaces));
    }
    
    const snapshot = await recommendationsQuery.limit(limit * 2).get();
    
    // Score each potential recommendation
    const scoredRecommendations = snapshot.docs.map(doc => {
      const place = {
        id: doc.id,
        ...doc.data()
      };
      
      let score = 0;
      
      // Score based on matching interests/tags
      if (place.tags) {
        place.tags.forEach(tag => {
          if (userInterests.has(tag)) score += 2;
        });
      }
      
      // Score based on country preferences
      if (visitedCountries.has(place.country)) {
        score += 1; // Small boost for same country
      }
      
      // Add popularity factor
      score += (place.rating || 0) / 2;
      
      return {
        ...place,
        score
      };
    });
    
    // Sort by score and return top recommendations
    return scoredRecommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting personalized recommendations:', error);
    throw error;
  }
};

/**
 * Get nearby places based on current coordinates
 * @param {Object} coordinates - User's current location {latitude, longitude}
 * @param {number} radius - Search radius in kilometers
 * @param {number} limit - Maximum number of results
 * @returns {Promise<Array>} - Nearby places
 */
const getNearbyPlaces = async (coordinates, radius = 5, limit = 10) => {
  try {
    // Use Mapbox service to find nearby places
    const places = await mapboxService.searchNearbyPlaces(
      coordinates.latitude,
      coordinates.longitude,
      radius
    );
    
    // Filter and format results
    return places
      .slice(0, limit)
      .map(place => ({
        id: place.id,
        name: place.name,
        location: place.location,
        category: place.category,
        distance: place.distance,
        // Add additional info as needed
      }));
  } catch (error) {
    console.error('Error fetching nearby places:', error);
    throw error;
  }
};

/**
 * Get similar places to a given place
 * @param {string} placeId - ID of the place to find similar places for
 * @param {number} limit - Number of similar places to return
 * @returns {Promise<Array>} - Similar places
 */
const getSimilarPlaces = async (placeId, limit = 5) => {
  try {
    // Get the reference place
    const placeRef = db.collection('places').doc(placeId);
    const placeDoc = await placeRef.get();
    
    if (!placeDoc.exists) {
      throw new Error('Place not found');
    }
    
    const place = placeDoc.data();
    
    // Find places with similar attributes
    const placesRef = db.collection('places')
      .where('id', '!=', placeId) // Exclude the reference place
      .limit(20); // Get a broader set to filter from
      
    const snapshot = await placesRef.get();
    
    // Score each place based on similarity
    const scoredPlaces = snapshot.docs.map(doc => {
      const similarPlace = {
        id: doc.id,
        ...doc.data()
      };
      
      let similarityScore = 0;
      
      // Compare tags/categories
      if (place.tags && similarPlace.tags) {
        const commonTags = place.tags.filter(tag => similarPlace.tags.includes(tag));
        similarityScore += commonTags.length * 2;
      }
      
      // Same country bonus
      if (place.country === similarPlace.country) {
        similarityScore += 1;
      }
      
      // Similar rating bonus
      if (place.rating && similarPlace.rating) {
        const ratingDiff = Math.abs(place.rating - similarPlace.rating);
        if (ratingDiff < 0.5) similarityScore += 1;
      }
      
      return {
        ...similarPlace,
        similarityScore
      };
    });
    
    // Return top matches
    return scoredPlaces
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, limit);
  } catch (error) {
    console.error('Error finding similar places:', error);
    throw error;
  }
};

/**
 * Get seasonal recommendations based on current month and destination
 * @param {string} destinationCountry - Target country
 * @returns {Promise<Array>} - Seasonal recommendations
 */
const getSeasonalRecommendations = async (destinationCountry, limit = 5) => {
  try {
    // Determine current season based on month
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); // 0-11
    
    // Simple season determination (adjust for northern/southern hemisphere)
    let season;
    if (currentMonth >= 2 && currentMonth <= 4) {
      season = 'spring';
    } else if (currentMonth >= 5 && currentMonth <= 7) {
      season = 'summer';
    } else if (currentMonth >= 8 && currentMonth <= 10) {
      season = 'autumn';
    } else {
      season = 'winter';
    }
    
    // Query places with seasonal tags and in the specified country
    const placesRef = db.collection('places')
      .where('country', '==', destinationCountry)
      .where('seasonalTags', 'array-contains', season)
      .limit(limit);
      
    const snapshot = await placesRef.get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      seasonRecommended: season
    }));
  } catch (error) {
    console.error('Error getting seasonal recommendations:', error);
    throw error;
  }
};

module.exports = {
  getPopularDestinations,
  getPersonalizedRecommendations,
  getNearbyPlaces,
  getSimilarPlaces,
  getSeasonalRecommendations
};