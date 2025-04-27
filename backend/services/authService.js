// backend/services/authService.js
const { admin } = require('../config/firebase');
const auth = admin.auth();

// Create a new user
const createUser = async (userData) => {
  try {
    const { email, password, displayName } = userData;
    
    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName,
      emailVerified: false
    });
    
    // Generate custom token for the user
    const token = await auth.createCustomToken(userRecord.uid);
    
    return {
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        emailVerified: userRecord.emailVerified
      },
      token
    };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Get user by ID
const getUserById = async (uid) => {
  try {
    const userRecord = await auth.getUser(uid);
    
    return {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      emailVerified: userRecord.emailVerified,
      photoURL: userRecord.photoURL,
      metadata: userRecord.metadata
    };
  } catch (error) {
    console.error('Error getting user by ID:', error);
    throw error;
  }
};

// Update user profile
const updateUserProfile = async (uid, userData) => {
  try {
    const { displayName, photoURL } = userData;
    
    await auth.updateUser(uid, {
      displayName,
      photoURL
    });
    
    const updatedUser = await auth.getUser(uid);
    
    return {
      uid: updatedUser.uid,
      email: updatedUser.email,
      displayName: updatedUser.displayName,
      emailVerified: updatedUser.emailVerified,
      photoURL: updatedUser.photoURL
    };
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Send password reset email
const sendPasswordReset = async (email) => {
  try {
    // This action would typically be done on the frontend
    // Backend can trigger it for admin purposes, but the link
    // will be sent from Firebase directly to the user's email
    
    // For backend purposes, we'd verify the email exists
    const userRecord = await auth.getUserByEmail(email);
    
    // In a real implementation, you'd use a custom email action
    // handler to generate a server-side reset link
    
    return { 
      success: true, 
      message: 'Password reset email would be sent' 
    };
  } catch (error) {
    console.error('Error sending password reset:', error);
    throw error;
  }
};

module.exports = {
  createUser,
  getUserById,
  updateUserProfile,
  sendPasswordReset
};