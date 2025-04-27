// backend/services/mapboxService.js
const axios = require('axios');
const { MAPBOX_API_KEY } = require('../config/env');

// Base URL for Mapbox API
const MAPBOX_BASE_URL = 'https://api.mapbox.com';

/**
 * Search for places near a given location
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @param {number} radiusKm - Search radius in kilometers
 * @returns {Promise<Array>} - Array of nearby places
 */
const searchNearbyPlaces = async (latitude, longitude, radiusKm = 5) => {
  try {
    // Convert radius from km to meters for Mapbox API
    const radiusMeters = radiusKm * 1000;
    
    // Mapbox expects coordinates as longitude,latitude
    const coordinates = `${longitude},${latitude}`;
    
    // Call Mapbox Places API
    const response = await axios.get(`${MAPBOX_BASE_URL}/geocoding/v5/mapbox.places/poi.json`, {
      params: {
        access_token: MAPBOX_API_KEY,
        proximity: coordinates,
        limit: 50, // Get more results to filter by distance
        types: 'poi,landmark,place'
      }
    });

    if (!response.data || !response.data.features) {
      return [];
    }

    // Process and filter results
    const places = response.data.features.map(feature => {
      // Calculate approximate distance using the feature's center point
      const [featureLon, featureLat] = feature.center;
      const placeCoords = { latitude: featureLat, longitude: featureLon };
      const userCoords = { latitude, longitude };
      
      // Use a simple distance calculation formula
      const distance = calculateDistance(userCoords, placeCoords);
      
      return {
        id: feature.id,
        name: feature.text,
        placeName: feature.place_name,
        category: feature.properties.category || feature.place_type[0],
        location: {
          latitude: featureLat,
          longitude: featureLon
        },
        distance: distance, // Distance in km
        address: feature.properties.address,
        properties: feature.properties
      };
    });

    // Filter places within the radius
    return places
      .filter(place => place.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);
  } catch (error) {
    console.error('Error searching nearby places:', error);
    throw error;
  }
};

/**
 * Get details for a specific place by ID
 * @param {string} placeId - Mapbox place ID
 * @returns {Promise<Object>} - Place details
 */
const getPlaceDetails = async (placeId) => {
  try {
    const response = await axios.get(`${MAPBOX_BASE_URL}/geocoding/v5/mapbox.places/${placeId}.json`, {
      params: {
        access_token: MAPBOX_API_KEY
      }
    });

    if (!response.data || !response.data.features || response.data.features.length === 0) {
      throw new Error('Place not found');
    }

    const feature = response.data.features[0];
    const [longitude, latitude] = feature.center;

    return {
      id: feature.id,
      name: feature.text,
      placeName: feature.place_name,
      location: {
        latitude,
        longitude
      },
      address: feature.properties.address,
      category: feature.properties.category || feature.place_type[0],
      properties: feature.properties
    };
  } catch (error) {
    console.error('Error getting place details:', error);
    throw error;
  }
};

/**
 * Forward geocoding - convert place name to coordinates
 * @param {string} query - Place name or address
 * @returns {Promise<Object>} - Location coordinates and details
 */
const geocodePlace = async (query) => {
  try {
    const response = await axios.get(`${MAPBOX_BASE_URL}/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`, {
      params: {
        access_token: MAPBOX_API_KEY,
        limit: 1
      }
    });

    if (!response.data || !response.data.features || response.data.features.length === 0) {
      throw new Error('Location not found');
    }

    const feature = response.data.features[0];
    const [longitude, latitude] = feature.center;

    return {
      placeName: feature.place_name,
      location: {
        latitude,
        longitude
      },
      country: getCountryFromFeature(feature),
      placeType: feature.place_type[0],
      bbox: feature.bbox
    };
  } catch (error) {
    console.error('Error geocoding place:', error);
    throw error;
  }
};

/**
 * Generate recommendations for routes between two points
 * @param {Object} origin - Starting coordinates {latitude, longitude}
 * @param {Object} destination - Ending coordinates {latitude, longitude}
 * @returns {Promise<Object>} - Route information
 */
const getRouteRecommendations = async (origin, destination) => {
  try {
    // Format coordinates as longitude,latitude for Mapbox API
    const originCoords = `${origin.longitude},${origin.latitude}`;
    const destCoords = `${destination.longitude},${destination.latitude}`;
    
    // Call Mapbox Directions API
    const response = await axios.get(`${MAPBOX_BASE_URL}/directions/v5/mapbox/driving/${originCoords};${destCoords}`, {
      params: {
        access_token: MAPBOX_API_KEY,
        geometries: 'geojson',
        overview: 'full',
        steps: true,
        annotations: 'distance,duration'
      }
    });

    if (!response.data || !response.data.routes || response.data.routes.length === 0) {
      throw new Error('No routes found');
    }

    const route = response.data.routes[0];
    
    return {
      distance: route.distance / 1000, // Convert to km
      duration: route.duration / 60, // Convert to minutes
      geometry: route.geometry,
      legs: route.legs,
      // Additional route info as needed
    };
  } catch (error) {
    console.error('Error getting route recommendations:', error);
    throw error;
  }
};

/**
 * Calculate distance between two points using the Haversine formula
 * @param {Object} point1 - First point {latitude, longitude}
 * @param {Object} point2 - Second point {latitude, longitude}
 * @returns {number} - Distance in kilometers
 */
const calculateDistance = (point1, point2) => {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(point2.latitude - point1.latitude);
  const dLon = toRadians(point2.longitude - point1.longitude);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.latitude)) * Math.cos(toRadians(point2.latitude)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

/**
 * Convert degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} - Angle in radians
 */
const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

/**
 * Extract country from Mapbox feature
 * @param {Object} feature - Mapbox feature object
 * @returns {string} - Country name
 */
const getCountryFromFeature = (feature) => {
  if (!feature.context) return null;
  
  // Look for country in context
  const countryContext = feature.context.find(item => 
    item.id.startsWith('country.')
  );
  
  return countryContext ? countryContext.text : null;
};

module.exports = {
  searchNearbyPlaces,
  getPlaceDetails,
  geocodePlace,
  getRouteRecommendations
};