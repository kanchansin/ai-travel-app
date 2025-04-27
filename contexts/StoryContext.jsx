import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { collection, addDoc, updateDoc, deleteDoc, getDocs, doc, query, where } from 'firebase/firestore';
import { db } from '../services/firebase';

export const StoryContext = createContext();

export const StoryProvider = ({ children }) => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchStories();
    } else {
      setStories([]);
      setLoading(false);
    }
  }, [user]);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const storiesRef = collection(db, 'stories');
      const q = query(storiesRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      
      const storiesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      setStories(storiesData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stories:', error);
      setLoading(false);
    }
  };

  const fetchPublicStories = async () => {
    try {
      const storiesRef = collection(db, 'stories');
      const q = query(storiesRef, where('isPublic', '==', true));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error fetching public stories:', error);
      throw error;
    }
  };

  const addStory = async (storyData) => {
    try {
      const storyToAdd = {
        ...storyData,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const docRef = await addDoc(collection(db, 'stories'), storyToAdd);
      const newStory = { id: docRef.id, ...storyToAdd };
      
      setStories(prevStories => [...prevStories, newStory]);
      return newStory;
    } catch (error) {
      console.error('Error adding story:', error);
      throw error;
    }
  };

  const updateStory = async (storyId, updatedData) => {
    try {
      const storyRef = doc(db, 'stories', storyId);
      const dataToUpdate = {
        ...updatedData,
        updatedAt: new Date().toISOString(),
      };
      
      await updateDoc(storyRef, dataToUpdate);
      
      setStories(prevStories => 
        prevStories.map(story => 
          story.id === storyId ? { ...story, ...dataToUpdate } : story
        )
      );
      
      return { id: storyId, ...dataToUpdate };
    } catch (error) {
      console.error('Error updating story:', error);
      throw error;
    }
  };

  const deleteStory = async (storyId) => {
    try {
      await deleteDoc(doc(db, 'stories', storyId));
      setStories(prevStories => prevStories.filter(story => story.id !== storyId));
    } catch (error) {
      console.error('Error deleting story:', error);
      throw error;
    }
  };

  const getStory = (storyId) => {
    return stories.find(story => story.id === storyId);
  };

  return (
    <StoryContext.Provider value={{
      stories,
      loading,
      fetchStories,
      fetchPublicStories,
      addStory,
      updateStory,
      deleteStory,
      getStory,
    }}>
      {children}
    </StoryContext.Provider>
  );
};

export const useStory = () => useContext(StoryContext);