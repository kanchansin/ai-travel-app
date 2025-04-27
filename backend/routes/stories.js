// backend/routes/stories.js
const express = require('express');
const router = express.Router();
const storyController = require('../controllers/storyController');
const { verifyToken } = require('../middleware/auth');

// Public routes
router.get('/', storyController.getAllStories);
router.get('/:id', storyController.getStoryById);

// Protected routes
router.use(verifyToken);
router.get('/user/:userId?', storyController.getUserStories);
router.get('/trip/:tripId', storyController.getTripStories);
router.post('/', storyController.createStory);
router.put('/:id', storyController.updateStory);
router.delete('/:id', storyController.deleteStory);
router.post('/:id/comments', storyController.addComment);
router.post('/:id/like', storyController.toggleLike);

module.exports = router;