import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from '../services/firebase';

/**
 * Custom hook to handle authentication
 * @returns {Object} Auth methods and state
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

/**
 * Setup auth state listener
 * @param {Function} setUser - Function to set user state
 * @returns {Function} Cleanup function
 */
export const setupAuthListener = (setUser) => {
  return onAuthStateChanged((user) => {
    if (user) {
      // User is signed in
      setUser({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      });
    } else {
      // User is signed out
      setUser(null);
    }
  });
};

/**
 * Sign in with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User credential
 */
export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};

/**
 * Sign up with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} displayName - User display name
 * @returns {Promise<Object>} User credential
 */
export const signUp = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(email, password);
    
    // Update profile with display name
    // Update profile with display name
    if (displayName) {
        await updateProfile(userCredential.user, {
          displayName: displayName,
        });
      }
      
      return userCredential.user;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };
  
  /**
   * Sign out the current user
   * @returns {Promise<void>}
   */
  export const signOut = async () => {
    try {
      await firebaseSignOut();
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };
  
  /**
   * Send password reset email
   * @param {string} email - User email
   * @returns {Promise<void>}
   */
  export const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };
  
  export default useAuth;