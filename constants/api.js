/**
 * API URLs and configuration for the app
 */

// Firebase configuration
export const FIREBASE_CONFIG = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  };
  
  // Mapbox configuration
  export const MAPBOX_CONFIG = {
    accessToken: process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN,
    baseUrl: 'https://api.mapbox.com',
    geocodingUrl: 'https://api.mapbox.com/geocoding/v5/mapbox.places',
    directionsUrl: 'https://api.mapbox.com/directions/v5/mapbox',
  };
  
  // Gemini AI configuration
  export const GEMINI_CONFIG = {
    apiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY,
    baseUrl: 'https://generativelanguage.googleapis.com',
    version: 'v1beta',
    model: 'gemini-pro',
  };
  
  // Local server configuration (if needed)
  export const SERVER_CONFIG = {
    baseUrl: process.env.EXPO_PUBLIC_SERVER_URL || 'http://localhost:3000',
    apiVersion: 'v1',
  };
  
  // API endpoints
  export const ENDPOINTS = {
    // User endpoints
    user: {
      profile: '/api/users/profile',
      preferences: '/api/users/preferences',
    },
    
    // Trip endpoints
    trips: {
      list: '/api/trips',
      details: (id) => `/api/trips/${id}`,
      create: '/api/trips',
      update: (id) => `/api/trips/${id}`,
      delete: (id) => `/api/trips/${id}`,
    },
    
    // Story endpoints
    stories: {
      list: '/api/stories',
      details: (id) => `/api/stories/${id}`,
      create: '/api/stories',
      update: (id) => `/api/stories/${id}`,
      delete: (id) => `/api/stories/${id}`,
    },
    
    // Place endpoints
    places: {
      search: '/api/places/search',
      details: (id) => `/api/places/${id}`,
      nearby: '/api/places/nearby',
    },
  };
  
  // API request timeout (in milliseconds)
  export const REQUEST_TIMEOUT = 10000;
  
  // Default headers for API requests
  export const DEFAULT_HEADERS = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  
  // Error messages
  export const ERROR_MESSAGES = {
    network: 'Network error. Please check your internet connection.',
    server: 'Server error. Please try again later.',
    unauthorized: 'You are not authorized. Please sign in.',
    notFound: 'The requested resource was not found.',
    timeout: 'Request timed out. Please try again.',
    default: 'Something went wrong. Please try again.',
  };