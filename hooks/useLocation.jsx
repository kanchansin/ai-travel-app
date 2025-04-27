import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';
import { requestLocationPermissions } from '../utils/permissions';

/**
 * Custom hook for handling location functionality
 * @returns {Object} Location data and functions
 */
export const useLocation = () => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [watchId, setWatchId] = useState(null);

  // Initialize location services
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const hasPermission = await requestLocationPermissions();
        
        if (!hasPermission) {
          setErrorMsg('Location permission not granted');
          setIsLoading(false);
          return;
        }
        
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        
        setLocation(currentLocation);
        setErrorMsg(null);
      } catch (error) {
        setErrorMsg('Could not get your location');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    })();
    
    // Cleanup function
    return () => {
      if (watchId !== null) {
        Location.stopLocationUpdatesAsync(watchId);
      }
    };
  }, []);

  /**
   * Get the current location once
   */
  const refreshLocation = async () => {
    setIsLoading(true);
    try {
      const hasPermission = await requestLocationPermissions();
      
      if (!hasPermission) {
        setErrorMsg('Location permission not granted');
        setIsLoading(false);
        return;
      }
      
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      setLocation(currentLocation);
      setErrorMsg(null);
      return currentLocation;
    } catch (error) {
      setErrorMsg('Could not get your location');
      console.error(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Start watching location changes
   */
  const startWatchingLocation = async () => {
    try {
      const hasPermission = await requestLocationPermissions();
      
      if (!hasPermission) {
        setErrorMsg('Location permission not granted');
        return;
      }
      
      // Stop any existing watch
      if (watchId !== null) {
        await Location.stopLocationUpdatesAsync(watchId);
      }
      
      // Start new watch
      const id = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (newLocation) => {
          setLocation(newLocation);
          setErrorMsg(null);
        }
      );
      
      setWatchId(id);
    } catch (error) {
      setErrorMsg('Could not watch your location');
      console.error(error);
    }
  };

  /**
   * Stop watching location changes
   */
  const stopWatchingLocation = async () => {
    if (watchId !== null) {
      await Location.stopLocationUpdatesAsync(watchId);
      setWatchId(null);
    }
  };

  /**
   * Get geocoding information for an address
   * @param {string} address - Address to geocode
   * @returns {Promise<Object|null>} Geocoded location or null
   */
  const geocodeAddress = async (address) => {
    try {
      const geocodedLocations = await Location.geocodeAsync(address);
      return geocodedLocations.length > 0 ? geocodedLocations[0] : null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  /**
   * Get reverse geocoding information for coordinates
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @returns {Promise<Object|null>} Address information or null
   */
  const reverseGeocodeLocation = async (latitude, longitude) => {
    try {
      const addressInfo = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      return addressInfo.length > 0 ? addressInfo[0] : null;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  };

  return {
    location,
    errorMsg,
    isLoading,
    refreshLocation,
    startWatchingLocation,
    stopWatchingLocation,
    geocodeAddress,
    reverseGeocodeLocation,
  };
};

export default useLocation;