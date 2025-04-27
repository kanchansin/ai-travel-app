import * as Location from 'expo-location';
import * as MediaLibrary from 'expo-media-library';
import * as Notifications from 'expo-notifications';

/**
 * Request location permissions
 * @returns {Promise<boolean>} Whether permission was granted
 */
export const requestLocationPermissions = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return false;
  }
};

/**
 * Request media library permissions
 * @returns {Promise<boolean>} Whether permission was granted
 */
export const requestMediaLibraryPermissions = async () => {
  try {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting media library permission:', error);
    return false;
  }
};

/**
 * Request camera permissions
 * @returns {Promise<boolean>} Whether permission was granted
 */
export const requestCameraPermissions = async () => {
  try {
    const { status } = await Camera.requestCameraPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting camera permission:', error);
    return false;
  }
};

/**
 * Request notification permissions
 * @returns {Promise<boolean>} Whether permission was granted
 */
export const requestNotificationPermissions = async () => {
  try {
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
    });
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

/**
 * Check if location permissions are granted
 * @returns {Promise<boolean>} Whether permission is granted
 */
export const checkLocationPermissions = async () => {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error checking location permission:', error);
    return false;
  }
};

/**
 * Get current location coordinates
 * @returns {Promise<{latitude: number, longitude: number} | null>} Location coordinates or null
 */
export const getCurrentLocation = async () => {
  try {
    const hasPermission = await checkLocationPermissions();
    
    if (!hasPermission) {
      const granted = await requestLocationPermissions();
      if (!granted) return null;
    }
    
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.error('Error getting current location:', error);
    return null;
  }
};