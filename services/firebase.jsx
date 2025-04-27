// services/firebase.jsx
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  initializeAuth,
  getReactNativePersistence,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile 
} from "firebase/auth";
import { getFirestore, collection, doc, setDoc, getDoc, updateDoc, query, where, getDocs } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-app-id",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id",
  measurementId: "your-measurement-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export const db = getFirestore(app);
export const storage = getStorage(app);

// Auth functions
export const registerUser = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update profile with display name
    await updateProfile(user, { displayName });
    
    // Create user document in Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email,
      displayName,
      createdAt: new Date(),
      photoURL: null,
    });
    
    return user;
  } catch (error) {
    throw error;
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

// User functions
export const updateUserProfile = async (uid, data) => {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, { ...data, updatedAt: new Date() });
    
    // Update auth profile if displayName or photoURL is provided
    if (data.displayName || data.photoURL) {
      const updateData = {};
      if (data.displayName) updateData.displayName = data.displayName;
      if (data.photoURL) updateData.photoURL = data.photoURL;
      
      await updateProfile(auth.currentUser, updateData);
    }
  } catch (error) {
    throw error;
  }
};

export const uploadUserPhoto = async (uid, uri) => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const fileRef = ref(storage, `users/${uid}/profile.jpg`);
    
    await uploadBytes(fileRef, blob);
    const photoURL = await getDownloadURL(fileRef);
    
    // Update user profile with new photo URL
    await updateUserProfile(uid, { photoURL });
    
    return photoURL;
  } catch (error) {
    throw error;
  }
};

// Trip functions
export const createTrip = async (tripData) => {
  try {
    const tripRef = doc(collection(db, "trips"));
    await setDoc(tripRef, {
      ...tripData,
      id: tripRef.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return tripRef.id;
  } catch (error) {
    throw error;
  }
};

export const getUserTrips = async (userId) => {
  try {
    const q = query(collection(db, "trips"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    const trips = [];
    querySnapshot.forEach((doc) => {
      trips.push(doc.data());
    });
    
    return trips;
  } catch (error) {
    throw error;
  }
};

export const getTrip = async (tripId) => {
  try {
    const tripRef = doc(db, "trips", tripId);
    const tripDoc = await getDoc(tripRef);
    
    if (tripDoc.exists()) {
      return tripDoc.data();
    } else {
      throw new Error("Trip not found");
    }
  } catch (error) {
    throw error;
  }
};

export const updateTrip = async (tripId, tripData) => {
  try {
    const tripRef = doc(db, "trips", tripId);
    await updateDoc(tripRef, {
      ...tripData,
      updatedAt: new Date(),
    });
  } catch (error) {
    throw error;
  }
};

// Stories functions
export const createStory = async (storyData) => {
  try {
    const storyRef = doc(collection(db, "stories"));
    await setDoc(storyRef, {
      ...storyData,
      id: storyRef.id,
      createdAt: new Date(),
      likes: 0,
    });
    return storyRef.id;
  } catch (error) {
    throw error;
  }
};

export const getStories = async (limit = 10) => {
  try {
    const q = query(collection(db, "stories"));
    const querySnapshot = await getDocs(q);
    
    const stories = [];
    querySnapshot.forEach((doc) => {
      stories.push(doc.data());
    });
    
    return stories;
  } catch (error) {
    throw error;
  }
};

export const getStory = async (storyId) => {
  try {
    const storyRef = doc(db, "stories", storyId);
    const storyDoc = await getDoc(storyRef);
    
    if (storyDoc.exists()) {
      return storyDoc.data();
    } else {
      throw new Error("Story not found");
    }
  } catch (error) {
    throw error;
  }
};