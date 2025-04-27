// backend/controllers/tripController.js
const tripService = require('../services/tripService');

// Get all trips for authenticated user
const getUserTrips = async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const filter = req.query.filter || 'all';
    
    const trips = await tripService.getUserTrips(userId, filter);
    
    res.status(200).json({
      success: true,
      data: trips
    });
  } catch (error) {
    next(error);
  }
};

// Get trip by ID
const getTripById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const trip = await tripService.getTripById(id);
    
    // Check if the trip belongs to the user
    if (trip.userId !== req.user.uid) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this trip'
      });
    }
    
    res.status(200).json({
      success: true,
      data: trip
    });
  } catch (error) {
    next(error);
  }
};

// Create a new trip
const createTrip = async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const tripData = { ...req.body, userId };
    
    const newTrip = await tripService.createTrip(tripData);
    
    res.status(201).json({
      success: true,
      data: newTrip
    });
  } catch (error) {
    next(error);
  }
};

// Update a trip
const updateTrip = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;
    const updatedData = req.body;
    
    const updatedTrip = await tripService.updateTrip(id, userId, updatedData);
    
    res.status(200).json({
      success: true,
      data: updatedTrip
    });
  } catch (error) {
    next(error);
  }
};

// Delete a trip
const deleteTrip = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;
    
    await tripService.deleteTrip(id, userId);
    
    res.status(200).json({
      success: true,
      message: 'Trip deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Add a place to a trip
const addPlaceToTrip = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;
    const placeData = req.body;
    
    const updatedPlaces = await tripService.addPlaceToTrip(id, userId, placeData);
    
    res.status(200).json({
      success: true,
      data: updatedPlaces
    });
  } catch (error) {
    next(error);
  }
};

// Remove a place from a trip
const removePlaceFromTrip = async (req, res, next) => {
  try {
    const { id, placeId } = req.params;
    const userId = req.user.uid;
    
    const updatedPlaces = await tripService.removePlaceFromTrip(id, userId, placeId);
    
    res.status(200).json({
      success: true,
      data: updatedPlaces
    });
  } catch (error) {
    next(error);
  }
};

// Update place order in a trip
const updatePlaceOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;
    const { places } = req.body;
    
    const updatedPlaces = await tripService.updatePlaceOrder(id, userId, places);
    
    res.status(200).json({
      success: true,
      data: updatedPlaces
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
  addPlaceToTrip,
  removePlaceFromTrip,
  updatePlaceOrder
};