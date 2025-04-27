// backend/controllers/recommendationController.js
const recommendationService = require('../services/recommendationService');
const aiService = require('../services/aiService');

/**
 * Get popular destinations
 */
const getPopular = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const popularDestinations = await recommendationService.getPopularDestinations(limit);
    res.status(200).json({ success: true, data: popularDestinations });
  } catch (error) {
    next(error);
  }
};

/**
 * Get personalized recommendations for a user
 */
const getPersonalized = async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const limit = parseInt(req.query.limit) || 5;
    const recommendations = await recommendationService.getPersonalizedRecommendations(userId, limit);
    res.status(200).json({ success: true, data: recommendations });
  } catch (error) {
    next(error);
  }
};

/**
 * Get nearby places based on provided coordinates
 */
const getNearby = async (req, res, next) => {
  try {
    const { latitude, longitude, radius, limit } = req.query;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ 
        success: false, 
        message: 'Latitude and longitude are required' 
      });
    }
    
    const coordinates = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude)
    };
    
    const nearbyPlaces = await recommendationService.getNearbyPlaces(
      coordinates,
      parseFloat(radius) || 5,
      parseInt(limit) || 10
    );
    
    res.status(200).json({ success: true, data: nearbyPlaces });
  } catch (error) {
    next(error);
  }
};

/**
 * Get similar places to a specified place
 */
const getSimilar = async (req, res, next) => {
  try {
    const { placeId } = req.params;
    const limit = parseInt(req.query.limit) || 5;
    
    if (!placeId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Place ID is required' 
      });
    }
    
    const similarPlaces = await recommendationService.getSimilarPlaces(placeId, limit);
    res.status(200).json({ success: true, data: similarPlaces });
  } catch (error) {
    next(error);
  }
};

/**
 * Get seasonal recommendations for a destination
 */
const getSeasonal = async (req, res, next) => {
  try {
    const { country } = req.params;
    const limit = parseInt(req.query.limit) || 5;
    
    if (!country) {
      return res.status(400).json({ 
        success: false, 
        message: 'Country is required' 
      });
    }
    
    const seasonalPlaces = await recommendationService.getSeasonalRecommendations(country, limit);
    res.status(200).json({ success: true, data: seasonalPlaces });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate AI-powered itinerary
 */
const generateItinerary = async (req, res, next) => {
  try {
    const { preferences, destination, duration } = req.body;
    
    if (!preferences || !destination || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Preferences, destination, and duration are required'
      });
    }
    
    // Validate duration
    const durationDays = parseInt(duration);
    if (isNaN(durationDays) || durationDays < 1 || durationDays > 30) {
      return res.status(400).json({
        success: false,
        message: 'Duration must be between 1 and 30 days'
      });
    }
    
    // Generate itinerary
    const itinerary = await aiService.generateItinerary(preferences, destination, durationDays);
    
    res.status(200).json({
      success: true,
      data: itinerary
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get trending destinations
 */
const getTrending = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const trendingDestinations = await aiService.getTrendingDestinations(limit);
    
    res.status(200).json({
      success: true,
      data: trendingDestinations
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPopular,
  getPersonalized,
  getNearby,
  getSimilar,
  getSeasonal,
  generateItinerary,
  getTrending
};