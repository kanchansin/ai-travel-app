// services/mapbox.jsx
import AsyncStorage from '@react-native-async-storage/async-storage';

const MAPBOX_ACCESS_TOKEN = 'YOUR_MAPBOX_ACCESS_TOKEN';

// Cache settings
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Base URL for Mapbox API
const MAPBOX_API_URL = 'https://api.mapbox.com';

// Helper to build URLs with access token
const buildUrl = (endpoint) => {
  return `${MAPBOX_API_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}access_token=${MAPBOX_ACCESS_TOKEN}`;
};

// Check if cache is valid
const isCacheValid = (timestamp) => {
  return Date.now() - timestamp < CACHE_DURATION;
};

// Forward geocoding (address to coordinates)
export const forwardGeocode = async (searchText, limit = 5) => {
  try {
    // Check cache first
    const cacheKey = `geo_fwd_${searchText}_${limit}`;
    const cachedData = await AsyncStorage.getItem(cacheKey);
    
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      if (isCacheValid(timestamp)) {
        return data;
      }
    }
    
    // Make API request if no valid cache
    const endpoint = `/geocoding/v5/mapbox.places/${encodeURIComponent(searchText)}.json?limit=${limit}&types=place,poi,address`;
    const response = await fetch(buildUrl(endpoint));
    
    if (!response.ok) {
      throw new Error(`Error fetching geocoding data: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Cache the results
    await AsyncStorage.setItem(cacheKey, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
    
    return data;
  } catch (error) {
    console.error('Forward geocoding error:', error);
    throw error;
  }
};

// Reverse geocoding (coordinates to address)
export const reverseGeocode = async (longitude, latitude) => {
  try {
    // Check cache first
    const cacheKey = `geo_rev_${longitude}_${latitude}`;
    const cachedData = await AsyncStorage.getItem(cacheKey);
    
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      if (isCacheValid(timestamp)) {
        return data;
      }
    }
    
    // Make API request if no valid cache
    const endpoint = `/geocoding/v5/mapbox.places/${longitude},${latitude}.json`;
    const response = await fetch(buildUrl(endpoint));
    
    if (!response.ok) {
      throw new Error(`Error fetching reverse geocoding data: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Cache the results
    await AsyncStorage.setItem(cacheKey, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
    
    return data;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    throw error;
  }
};

// Get POIs (Points of Interest) around a location
export const getPOIs = async (longitude, latitude, radius = 1000, category) => {
  try {
    // Create cache key including all parameters
    const cacheKey = `poi_${longitude}_${latitude}_${radius}_${category || 'all'}`;
    const cachedData = await AsyncStorage.getItem(cacheKey);
    
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      if (isCacheValid(timestamp)) {
        return data;
      }
    }
    
    // Build query parameters
    let endpoint = `/geocoding/v5/mapbox.places/`;
    let queryParams = `proximity=${longitude},${latitude}&limit=10`;
    
    if (category) {
      queryParams += `&types=${category}`;
      endpoint += `${category}.json?${queryParams}`;
    } else {
      endpoint += `.json?${queryParams}`;
    }
    
    const response = await fetch(buildUrl(endpoint));
    
    if (!response.ok) {
      throw new Error(`Error fetching POIs: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Cache the results
    await AsyncStorage.setItem(cacheKey, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
    
    return data;
  } catch (error) {
    console.error('POI fetch error:', error);
    throw error;
  }
};

// Get directions between two points
export const getDirections = async (startLng, startLat, endLng, endLat, mode = 'driving') => {
  try {
    // Cache key includes all parameters
    const cacheKey = `directions_${startLng}_${startLat}_${endLng}_${endLat}_${mode}`;
    const cachedData = await AsyncStorage.getItem(cacheKey);
    
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      if (isCacheValid(timestamp)) {
        return data;
      }
    }
    
    // Valid modes: driving, walking, cycling
    const endpoint = `/directions/v5/mapbox/${mode}/${startLng},${startLat};${endLng},${endLat}?geometries=geojson&overview=full&steps=true`;
    
    const response = await fetch(buildUrl(endpoint));
    
    if (!response.ok) {
      throw new Error(`Error fetching directions: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Cache the results
    await AsyncStorage.setItem(cacheKey, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
    
    return data;
  } catch (error) {
    console.error('Directions fetch error:', error);
    throw error;
  }
};

// Get optimized routes (for multiple stops)
export const getOptimizedRoute = async (coordinates, mode = 'driving') => {
  try {
    // Create a string of coordinates for the cache key
    const coordString = coordinates.map(coord => `${coord[0]},${coord[1]}`).join('_');
    const cacheKey = `route_opt_${coordString}_${mode}`;
    
    const cachedData = await AsyncStorage.getItem(cacheKey);
    
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      if (isCacheValid(timestamp)) {
        return data;
      }
    }
    
    // Format coordinates for API request
    const waypointsString = coordinates.map(coord => `${coord[0]},${coord[1]}`).join(';');
    
    const endpoint = `/optimized-trips/v1/mapbox/${mode}/${waypointsString}?geometries=geojson&overview=full&steps=true`;
    
    const response = await fetch(buildUrl(endpoint));
    
    if (!response.ok) {
      throw new Error(`Error fetching optimized route: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Cache the results
    await AsyncStorage.setItem(cacheKey, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
    
    return data;
  } catch (error) {
    console.error('Optimized route fetch error:', error);
    throw error;
  }
};

export default {
  forwardGeocode,
  reverseGeocode,
  getPOIs,
  getDirections,
  getOptimizedRoute,
};