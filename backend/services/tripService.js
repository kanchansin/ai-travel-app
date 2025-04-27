// backend/services/tripService.js
const { admin } = require('../config/firebase');
const db = admin.firestore();

// Trip collection reference
const tripsRef = db.collection('trips');

// Get all trips for a user with optional filtering
const getUserTrips = async (userId, filter = 'all') => {
  try {
    let query = tripsRef.where('userId', '==', userId);
    const now = new Date().toISOString();
    
    if (filter === 'upcoming') {
      // Get trips where start date is in the future
      query = query.where('startDate', '>=', now).orderBy('startDate', 'asc');
    } else if (filter === 'past') {
      // Get trips where end date is in the past
      query = query.where('endDate', '<', now).orderBy('endDate', 'desc');
    } else {
      // Get all trips
      query = query.orderBy('startDate', 'asc');
    }
    
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting user trips:', error);
    throw error;
  }
};

// Get a specific trip by ID
const getTripById = async (tripId) => {
  try {
    const tripDoc = await tripsRef.doc(tripId).get();
    
    if (!tripDoc.exists) {
      throw { statusCode: 404, message: 'Trip not found' };
    }
    
    return {
      id: tripDoc.id,
      ...tripDoc.data()
    };
  } catch (error) {
    console.error('Error getting trip by ID:', error);
    throw error;
  }
};

// Create a new trip
const createTrip = async (tripData) => {
  try {
    const tripToAdd = {
      ...tripData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const docRef = await tripsRef.add(tripToAdd);
    return {
      id: docRef.id,
      ...tripToAdd
    };
  } catch (error) {
    console.error('Error creating trip:', error);
    throw error;
  }
};

// Update an existing trip
const updateTrip = async (tripId, userId, updatedData) => {
  try {
    const tripRef = tripsRef.doc(tripId);
    const tripDoc = await tripRef.get();
    
    if (!tripDoc.exists) {
      throw { statusCode: 404, message: 'Trip not found' };
    }
    
    // Check if the trip belongs to the user
    const tripData = tripDoc.data();
    if (tripData.userId !== userId) {
      throw { statusCode: 403, message: 'You do not have permission to update this trip' };
    }
    
    const dataToUpdate = {
      ...updatedData,
      updatedAt: new Date().toISOString()
    };
    
    await tripRef.update(dataToUpdate);
    
    return {
      id: tripId,
      ...tripDoc.data(),
      ...dataToUpdate
    };
  } catch (error) {
    console.error('Error updating trip:', error);
    throw error;
  }
};

// Delete a trip
const deleteTrip = async (tripId, userId) => {
  try {
    const tripRef = tripsRef.doc(tripId);
    const tripDoc = await tripRef.get();
    
    if (!tripDoc.exists) {
      throw { statusCode: 404, message: 'Trip not found' };
    }
    
    // Check if the trip belongs to the user
    const tripData = tripDoc.data();
    if (tripData.userId !== userId) {
      throw { statusCode: 403, message: 'You do not have permission to delete this trip' };
    }
    
    await tripRef.delete();
    return true;
  } catch (error) {
    console.error('Error deleting trip:', error);
    throw error;
  }
};

// Add a place to a trip
const addPlaceToTrip = async (tripId, userId, placeData) => {
  try {
    const tripRef = tripsRef.doc(tripId);
    const tripDoc = await tripRef.get();
    
    if (!tripDoc.exists) {
      throw { statusCode: 404, message: 'Trip not found' };
    }
    
    // Check if the trip belongs to the user
    const tripData = tripDoc.data();
    if (tripData.userId !== userId) {
      throw { statusCode: 403, message: 'You do not have permission to update this trip' };
    }
    
    const places = tripData.places || [];
    
    // Check if place already exists in the trip
    if (places.some(place => place.id === placeData.id)) {
      throw { statusCode: 409, message: 'Place already added to this trip' };
    }
    
    // Add the new place
    const updatedPlaces = [...places, placeData];
    
    await tripRef.update({
      places: updatedPlaces,
      updatedAt: new Date().toISOString()
    });
    
    return updatedPlaces;
  } catch (error) {
    console.error('Error adding place to trip:', error);
    throw error;
  }
};

// Remove a place from a trip
const removePlaceFromTrip = async (tripId, userId, placeId) => {
  try {
    const tripRef = tripsRef.doc(tripId);
    const tripDoc = await tripRef.get();
    
    if (!tripDoc.exists) {
      throw { statusCode: 404, message: 'Trip not found' };
    }
    
    // Check if the trip belongs to the user
    const tripData = tripDoc.data();
    if (tripData.userId !== userId) {
      throw { statusCode: 403, message: 'You do not have permission to update this trip' };
    }
    
    const places = tripData.places || [];
    
    // Filter out the place to remove
    const updatedPlaces = places.filter(place => place.id !== placeId);
    
    await tripRef.update({
      places: updatedPlaces,
      updatedAt: new Date().toISOString()
    });
    
    return updatedPlaces;
  } catch (error) {
    console.error('Error removing place from trip:', error);
    throw error;
  }
};

// Update place order in a trip
const updatePlaceOrder = async (tripId, userId, reorderedPlaces) => {
  try {
    const tripRef = tripsRef.doc(tripId);
    const tripDoc = await tripRef.get();
    
    if (!tripDoc.exists) {
      throw { statusCode: 404, message: 'Trip not found' };
    }
    
    // Check if the trip belongs to the user
    const tripData = tripDoc.data();
    if (tripData.userId !== userId) {
      throw { statusCode: 403, message: 'You do not have permission to update this trip' };
    }
    
    await tripRef.update({
      places: reorderedPlaces,
      updatedAt: new Date().toISOString()
    });
    
    return reorderedPlaces;
  } catch (error) {
    console.error('Error updating place order:', error);
    throw error;
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