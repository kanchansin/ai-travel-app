// backend/controllers/mapboxController.js
const mapboxService = require('../services/mapboxService');

// Search for places
const searchPlaces = async (req, res, next) => {
  try {
    const { query, longitude, latitude, limit } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    let proximity = null;
    if (longitude && latitude) {
      proximity = { longitude, latitude };
    }
    
    const places = await mapboxService.searchPlaces(
      query, 
      proximity, 
      limit ? parseInt(limit) : 10
    );
    
    res.status(200).json({
      success: true,
      data: places
    });
  } catch (error) {
    next(error);
  }
};

// Get directions between places
const getDirections = async (req, res, next) => {
  try {
    const { places, mode } = req.body;
    
    if (!places || !Array.isArray(places) || places.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'At least two places are required for directions'
      });
    }
    
    const directions = await mapboxService.getDirections(places, mode || 'driving');
    
    res.status(200).json({
      success: true,
      data: directions
    });
  } catch (error) {
    next(error);
  }
};

// Get static map image URL
const getStaticMapUrl = async (req, res, next) => {
  try {
    const { markers, width, height, zoom, style } = req.body;
    
    if (!markers || !Array.isArray(markers) || markers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one marker is required'
      });
    }
    
    const mapUrl = mapboxService.getStaticMapUrl(
      markers, 
      width || 600, 
      height || 400, 
      zoom || 12, 
      style || 'streets-v11'
    );
    
    res.status(200).json({
      success: true,
      data: { url: mapUrl }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchPlaces,
  getDirections,
  getStaticMapUrl
};