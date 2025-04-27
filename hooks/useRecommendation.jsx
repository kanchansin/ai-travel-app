import { useState } from 'react';
import { getRecommendations } from '../services/ai';

/**
 * Custom hook for handling AI-powered travel recommendations
 * @returns {Object} Recommendations methods and state
 */
const useRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Travel types supported by the app
   */
  const travelTypes = [
    { id: 'solo', label: 'Just Me', icon: 'person' },
    { id: 'friends', label: 'Friends', icon: 'people' },
    { id: 'family', label: 'Family', icon: 'home' },
    { id: 'couple', label: 'Couple', icon: 'heart' },
  ];

  /**
   * Activity categories
   */
  const activityCategories = [
    { id: 'attractions', label: 'Attractions', icon: 'camera' },
    { id: 'food', label: 'Food & Drinks', icon: 'restaurant' },
    { id: 'outdoors', label: 'Outdoors', icon: 'leaf' },
    { id: 'shopping', label: 'Shopping', icon: 'cart' },
    { id: 'entertainment', label: 'Entertainment', icon: 'film' },
    { id: 'relaxation', label: 'Relaxation', icon: 'bed' },
  ];

  /**
   * Fetch AI recommendations based on parameters
   * @param {Object} params - Recommendation parameters
   * @returns {Promise<Array>} Recommendations
   */
  const fetchRecommendations = async (params) => {
    const { location, travelType, categories, duration, budget, preferences } = params;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await getRecommendations({
        location,
        travelType,
        categories: categories || [],
        duration: duration || 'day',
        budget: budget || 'medium',
        preferences: preferences || [],
      });
      
      setRecommendations(result);
      return result;
    } catch (err) {
      setError('Failed to get recommendations');
      console.error('Error getting recommendations:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get recommendations for a specific place
   * @param {Object} place - Place object
   * @param {string} travelType - Type of travel
   * @returns {Promise<Array>} Similar place recommendations
   */
  const getSimilarPlaces = async (place, travelType) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await getRecommendations({
        placeId: place.id,
        placeName: place.name,
        placeType: place.type,
        travelType,
        mode: 'similar',
      });
      
      return result;
    } catch (err) {
      setError('Failed to get similar places');
      console.error('Error getting similar places:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Clear current recommendations
   */
  const clearRecommendations = () => {
    setRecommendations([]);
  };

  return {
    recommendations,
    isLoading,
    error,
    travelTypes,
    activityCategories,
    fetchRecommendations,
    getSimilarPlaces,
    clearRecommendations,
  };
};

export default useRecommendations;