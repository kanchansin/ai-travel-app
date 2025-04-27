// backend/services/storyService.js
const { admin } = require('../config/firebase');
const db = admin.firestore();

// Story collection reference
const storiesRef = db.collection('stories');

// Get all stories (with optional filtering)
const getAllStories = async (limit = 20, cursor = null) => {
  try {
    let query = storiesRef
      .where('isPublic', '==', true)
      .orderBy('createdAt', 'desc')
      .limit(limit);
    
    if (cursor) {
      const cursorDoc = await storiesRef.doc(cursor).get();
      if (cursorDoc.exists) {
        query = query.startAfter(cursorDoc);
      }
    }
    
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting stories:', error);
    throw error;
  }
};

// Get stories by user ID
const getUserStories = async (userId) => {
  try {
    const snapshot = await storiesRef
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting user stories:', error);
    throw error;
  }
};

// Get stories for a specific trip
const getTripStories = async (tripId) => {
  try {
    const snapshot = await storiesRef
      .where('tripId', '==', tripId)
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting trip stories:', error);
    throw error;
  }
};

// Get a specific story by ID
const getStoryById = async (storyId) => {
  try {
    const storyDoc = await storiesRef.doc(storyId).get();
    
    if (!storyDoc.exists) {
      throw { statusCode: 404, message: 'Story not found' };
    }
    
    return {
      id: storyDoc.id,
      ...storyDoc.data()
    };
  } catch (error) {
    console.error('Error getting story by ID:', error);
    throw error;
  }
};

// Create a new story
const createStory = async (storyData) => {
  try {
    const storyToAdd = {
      ...storyData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likes: 0,
      comments: []
    };
    
    const docRef = await storiesRef.add(storyToAdd);
    return {
      id: docRef.id,
      ...storyToAdd
    };
  } catch (error) {
    console.error('Error creating story:', error);
    throw error;
  }
};

// Update an existing story
const updateStory = async (storyId, userId, updatedData) => {
  try {
    const storyRef = storiesRef.doc(storyId);
    const storyDoc = await storyRef.get();
    
    if (!storyDoc.exists) {
      throw { statusCode: 404, message: 'Story not found' };
    }
    
    // Check if the story belongs to the user
    const storyData = storyDoc.data();
    if (storyData.userId !== userId) {
      throw { statusCode: 403, message: 'You do not have permission to update this story' };
    }
    
    const dataToUpdate = {
      ...updatedData,
      updatedAt: new Date().toISOString()
    };
    
    await storyRef.update(dataToUpdate);
    
    return {
      id: storyId,
      ...storyDoc.data(),
      ...dataToUpdate
    };
  } catch (error) {
    console.error('Error updating story:', error);
    throw error;
  }
};

// Delete a story
const deleteStory = async (storyId, userId) => {
  try {
    const storyRef = storiesRef.doc(storyId);
    const storyDoc = await storyRef.get();
    
    if (!storyDoc.exists) {
      throw { statusCode: 404, message: 'Story not found' };
    }
    
    // Check if the story belongs to the user
    const storyData = storyDoc.data();
    if (storyData.userId !== userId) {
      throw { statusCode: 403, message: 'You do not have permission to delete this story' };
    }
    
    await storyRef.delete();
    return true;
  } catch (error) {
    console.error('Error deleting story:', error);
    throw error;
  }
};

// Add a comment to a story
const addComment = async (storyId, commentData) => {
  try {
    const storyRef = storiesRef.doc(storyId);
    const storyDoc = await storyRef.get();
    
    if (!storyDoc.exists) {
      throw { statusCode: 404, message: 'Story not found' };
    }
    
    const storyData = storyDoc.data();
    const comments = storyData.comments || [];
    
    const newComment = {
      id: Date.now().toString(),
      ...commentData,
      createdAt: new Date().toISOString()
    };
    
    const updatedComments = [...comments, newComment];
    
    await storyRef.update({
      comments: updatedComments,
      updatedAt: new Date().toISOString()
    });
    
    return newComment;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

// Like/unlike a story
const toggleLike = async (storyId, userId) => {
  try {
    const storyRef = storiesRef.doc(storyId);
    const storyDoc = await storyRef.get();
    
    if (!storyDoc.exists) {
      throw { statusCode: 404, message: 'Story not found' };
    }
    
    const storyData = storyDoc.data();
    const likes = storyData.likes || [];
    
    // Check if user has already liked the story
    const userLikeIndex = likes.indexOf(userId);
    let updatedLikes;
    
    if (userLikeIndex === -1) {
      // Add like
      updatedLikes = [...likes, userId];
    } else {
      // Remove like
      updatedLikes = likes.filter(id => id !== userId);
    }
    
    await storyRef.update({
      likes: updatedLikes,
      likeCount: updatedLikes.length,
      updatedAt: new Date().toISOString()
    });
    
    return {
      liked: userLikeIndex === -1,
      likeCount: updatedLikes.length
    };
  } catch (error) {
    console.error('Error toggling like:', error);
    throw error;
  }
};

module.exports = {
  getAllStories,
  getUserStories,
  getTripStories,
  getStoryById,
  createStory,
  updateStory,
  deleteStory,
  addComment,
  toggleLike
};