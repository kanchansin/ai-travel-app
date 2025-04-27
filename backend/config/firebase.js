// backend/config/firebase.js
const admin = require('firebase-admin');
const { 
  FIREBASE_ADMIN_PROJECT_ID, 
  FIREBASE_ADMIN_CLIENT_EMAIL, 
  FIREBASE_ADMIN_PRIVATE_KEY 
} = require('./env');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  // Check if running locally or with environment variables
  if (FIREBASE_ADMIN_PRIVATE_KEY) {
    // Initialize with service account credentials
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: FIREBASE_ADMIN_PRIVATE_KEY
      })
    });
  } else {
    // Initialize with application default credentials (useful in cloud environments)
    admin.initializeApp();
  }
}

// Configure Firestore
const db = admin.firestore();
if (process.env.NODE_ENV === 'development') {
  // Use emulator in development if FIRESTORE_EMULATOR_HOST is set
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    db.settings({
      host: process.env.FIRESTORE_EMULATOR_HOST,
      ssl: false
    });
  }
}

module.exports = {
  admin,
  db
};