import { firestore } from './firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy 
} from 'firebase/firestore';

// Get stories created by a user
export const getUserStories = async (userId) => {
  try {
    const storiesRef = collection(firestore, 'stories');
    const q = query(
      storiesRef, 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const stories = [];
    
    querySnapshot.forEach((doc) => {
      stories.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    
    return stories;
  } catch (error) {
    console.error('Error getting user stories:', error);
    throw error;
  }
};