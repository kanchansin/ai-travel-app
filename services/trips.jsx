//services/trips.jsx

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy
} from 'firebase/firestore';
import { db } from './firebase';

// Collection reference
const tripsRef = collection(db, 'trips');

// Get all trips for a user with optional filtering
export const getUserTrips = async (userId, filter = 'all') => {
  try {
    let q;
    const now = new Date().toISOString();
    
    if (filter === 'upcoming') {
      // Get trips where start date is in the future
      q = query(
        tripsRef, 
        where('userId', '==', userId),
        where('startDate', '>=', now),
        orderBy('startDate', 'asc')
      );
    } else if (filter === 'past') {
      // Get trips where end date is in the past
      q = query(
        tripsRef, 
        where('userId', '==', userId),
        where('endDate', '<', now),
        orderBy('endDate', 'desc')
      );
    } else {
      // Get all trips
      q = query(
        tripsRef, 
        where('userId', '==', userId),
        orderBy('startDate', 'asc')
      );
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting user trips:', error);
    throw error;
  }
};

// Get a specific trip by ID
export const getTripById = async (tripId) => {
  try {
    const tripDoc = await getDoc(doc(tripsRef, tripId));
    
    if (!tripDoc.exists()) {
      throw new Error('Trip not found');
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
export const createTrip = async (tripData) => {
  try {
    const tripToAdd = {
      ...tripData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const docRef = await addDoc(tripsRef, tripToAdd);
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
export const updateTrip = async (tripId, updatedData) => {
  try {
    const tripRef = doc(tripsRef, tripId);
    const dataToUpdate = {
      ...updatedData,
      updatedAt: new Date().toISOString()
    };
    
    await updateDoc(tripRef, dataToUpdate);
    
    return {
      id: tripId,
      ...dataToUpdate
    };
  } catch (error) {
    console.error('Error updating trip:', error);
    throw error;
  }
};

// Delete a trip
export const deleteTrip = async (tripId) => {
  try {
    await deleteDoc(doc(tripsRef, tripId));
    return true;
  } catch (error) {
    console.error('Error deleting trip:', error);
    throw error;
  }
};

// Add a place to a trip
export const addPlaceToTrip = async (tripId, placeData) => {
  try {
    const tripDoc = await getDoc(doc(tripsRef, tripId));
    
    if (!tripDoc.exists()) {
      throw new Error('Trip not found');
    }
    
    const tripData = tripDoc.data();
    const places = tripData.places || [];
    
    // Check if place already exists in the trip
    const placeExists = places.some(place => place.id === placeData.id);
    
    if (placeExists) {
      throw new Error('Place already added to this trip');
    }
    
    // Add the new place
    const updatedPlaces = [...places, placeData];
    
    await updateDoc(doc(tripsRef, tripId), {
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
export const removePlaceFromTrip = async (tripId, placeId) => {
  try {
    const tripDoc = await getDoc(doc(tripsRef, tripId));
    
    if (!tripDoc.exists()) {
      throw new Error('Trip not found');
    }
    
    const tripData = tripDoc.data();
    const places = tripData.places || [];
    
    // Filter out the place to remove
    const updatedPlaces = places.filter(place => place.id !== placeId);
    
    await updateDoc(doc(tripsRef, tripId), {
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
export const updatePlaceOrder = async (tripId, reorderedPlaces) => {
  try {
    await updateDoc(doc(tripsRef, tripId), {
      places: reorderedPlaces,
      updatedAt: new Date().toISOString()
    });
    
    return reorderedPlaces;
  } catch (error) {
    console.error('Error updating place order:', error);
    throw error;
  }
};