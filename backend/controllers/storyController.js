// backend/controllers/storyController.js
const storyService = require('../services/storyService');

// Get all public stories (with pagination)
const getAllStories = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const cursor = req.query.cursor || null;
    
    const stories = await storyService.getAllStories(limit, cursor);
    
    res.status(200).json({
      success: true,
      data: stories,
      pagination: {
        nextCursor: stories.length > 0 ? stories[stories.length - 1].id : null,
        hasMore: stories.length === limit
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all stories by user
const getUserStories = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.user.uid;
    const stories = await storyService.getUserStories(userId);
    
    res.status(200).json({
      success: true,
      data: stories
    });
  } catch (error) {
    next(error);
  }
};

// Get all stories for a trip
const getTripStories = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const stories = await storyService.getTripStories(tripId);
    
    res.status(200).json({
      success: true,
      data: stories
    });
  } catch (error) {
    next(error);
  }
};

// Get story by ID
const getStoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const story = await storyService.getStoryById(id);
    
    res.status(200).json({
      success: true,
      data: story
    });
  } catch (error) {
    next(error);
  }
};

// Create a new story
const createStory = async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const storyData = { ...req.body, userId };
    
    const newStory = await storyService.createStory(storyData);
    
    res.status(201).json({
      success: true,
      data: newStory
    });
  } catch (error) {
    next(error);
  }
};

// Update a story
const updateStory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;
    const updatedData = req.body;
    
    const updatedStory = await storyService.updateStory(id, userId, updatedData);
    
    res.status(200).json({
      success: true,
      data: updatedStory
    });
  } catch (error) {
    next(error);
  }
};

// Delete a story
const deleteStory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;
    
    await storyService.deleteStory(id, userId);
    
    res.status(200).json({
      success: true,
      message: 'Story deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Add a comment to a story
const addComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;
    const { text } = req.body;
    
    const commentData = {
      userId,
      text,
      userName: req.user.name || 'Anonymous'
    };
    
    const newComment = await storyService.addComment(id, commentData);
    
    res.status(201).json({
      success: true,
      data: newComment
    });
  } catch (error) {
    next(error);
  }
};

// Like/unlike a story
const toggleLike = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;
    
    const result = await storyService.toggleLike(id, userId);
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
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