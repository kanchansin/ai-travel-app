import { auth, firestore, storage } from './firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

// Get user profile data
export const getUserProfile = async (userId) => {
  try {
    const userRef = doc(firestore, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() };
    } else {
      console.log('No user profile found');
      return null;
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

// Update user profile data
export const updateUserProfile = async (userId, profileData) => {
  try {
    const userRef = doc(firestore, 'users', userId);
    await updateDoc(userRef, profileData);
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Upload profile image
export const uploadProfileImage = async (userId, imageUri) => {
  try {
    // Resize and compress the image
    const manipResult = await manipulateAsync(
      imageUri,
      [{ resize: { width: 500 } }],
      { compress: 0.7, format: SaveFormat.JPEG }
    );
    
    // Convert image to blob
    const response = await fetch(manipResult.uri);
    const blob = await response.blob();
    
    // Create storage reference
    const storageRef = ref(storage, `profile_images/${userId}`);
    
    // Upload image
    await uploadBytes(storageRef, blob);
    
    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw error;
  }
};