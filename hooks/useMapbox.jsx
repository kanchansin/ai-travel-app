import { useState, useEffect } from 'react';
import { fetchPointsOfInterest, fetchDirections, geocodePlace } from '../services/mapbox';

/**
 * Custom hook for Mapbox interactions
 * @param {Object} initialLocation - Initial location coordinates
 * @returns {Object} Mapbox data and functions
 */
const useMapbox = (initialLocation = null) => {
  const [pointsOfInterest, setPointsOfInterest] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [route, setRoute] = useState(null);

  /**
   * Search for places using geocoding
   * @param {string} query - Search query
   */
  const searchPlaces = async (query) => {
    if (!query || query.trim() === '') {
      setSearchResults([]);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSearchQuery(query);
    
    try {
      const results = await geocodePlace(query);
      setSearchResults(results);
    } catch (err) {
      setError('Failed to search places');
      console.error('Error searching places:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get points of interest near a location
   * @param {Object} location - Location coordinates
   * @param {string} category - Category of POIs to fetch
   * @param {number} radius - Search radius in meters
   */
  const getNearbyPointsOfInterest = async (location, category = 'all', radius = 1000) => {
    if (!location) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const pois = await fetchPointsOfInterest(
        location.latitude || location.coords.latitude,
        location.longitude || location.coords.longitude,
        category,
        radius
      );
      setPointsOfInterest(pois);
    } catch (err) {
      setError('Failed to fetch nearby points of interest');
      console.error('Error fetching POIs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get directions between two points
   * @param {Object} startLocation - Start location coordinates
   * @param {Object} endLocation - End location coordinates
   * @param {string} mode - Transportation mode
   */
  const getDirections = async (startLocation, endLocation, mode = 'driving') => {
    if (!startLocation || !endLocation) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const routeData = await fetchDirections(
        startLocation.latitude || startLocation.coords.latitude,
        startLocation.longitude || startLocation.coords.longitude,
        endLocation.latitude || endLocation.coords.latitude,
        endLocation.longitude || endLocation.coords.longitude,
        mode
      );
      setRoute(routeData);
      return routeData;
    } catch (err) {
      setError('Failed to fetch directions');
      console.error('Error fetching directions:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Select a place from search results or POIs
   * @param {Object} place - Place to select
   */
  const selectPlace = (place) => {
    setSelectedPlace(place);
  };

  /**
   * Clear the current selection
   */
  const clearSelection = () => {
    setSelectedPlace(null);
  };

  /**
   * Clear search results
   */
  const clearSearchResults = () => {
    setSearchResults([]);
    setSearchQuery('');
  };

  return {
    pointsOfInterest,
    isLoading,
    error,
    searchResults,
    searchQuery,
    selectedPlace,
    route,
    searchPlaces,
    getNearbyPointsOfInterest,
    getDirections,
    selectPlace,
    clearSelection,
    clearSearchResults,
  };
};

export default useMapbox;