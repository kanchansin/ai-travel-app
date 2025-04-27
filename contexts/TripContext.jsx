import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../hooks/useAuth';
import { doc, collection, addDoc, updateDoc, deleteDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../services/firebase';

export const TripContext = createContext();

export const TripProvider = ({ children }) => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Fetch trips when user changes
  useEffect(() => {
    if (user) {
      fetchTrips();
    } else {
      setTrips([]);
      setLoading(false);
    }
  }, [user]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const tripsRef = collection(db, 'trips');
      const q = query(tripsRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      
      const tripsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      setTrips(tripsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching trips:', error);
      setLoading(false);
    }
  };

  const addTrip = async (tripData) => {
    try {
      const tripToAdd = {
        ...tripData,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const docRef = await addDoc(collection(db, 'trips'), tripToAdd);
      const newTrip = { id: docRef.id, ...tripToAdd };
      
      setTrips(prevTrips => [...prevTrips, newTrip]);
      return newTrip;
    } catch (error) {
      console.error('Error adding trip:', error);
      throw error;
    }
  };

  const updateTrip = async (tripId, updatedData) => {
    try {
      const tripRef = doc(db, 'trips', tripId);
      const dataToUpdate = {
        ...updatedData,
        updatedAt: new Date().toISOString(),
      };
      
      await updateDoc(tripRef, dataToUpdate);
      
      setTrips(prevTrips => 
        prevTrips.map(trip => 
          trip.id === tripId ? { ...trip, ...dataToUpdate } : trip
        )
      );
      
      return { id: tripId, ...dataToUpdate };
    } catch (error) {
      console.error('Error updating trip:', error);
      throw error;
    }
  };

  const deleteTrip = async (tripId) => {
    try {
      await deleteDoc(doc(db, 'trips', tripId));
      setTrips(prevTrips => prevTrips.filter(trip => trip.id !== tripId));
    } catch (error) {
      console.error('Error deleting trip:', error);
      throw error;
    }
  };

  const getTrip = (tripId) => {
    return trips.find(trip => trip.id === tripId);
  };

  return (
    <TripContext.Provider value={{
      trips,
      loading,
      fetchTrips,
      addTrip,
      updateTrip,
      deleteTrip,
      getTrip,
    }}>
      {children}
    </TripContext.Provider>
  );
};

export const useTrip = () => useContext(TripContext);