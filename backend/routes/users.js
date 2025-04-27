// backend/routes/users.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');

// Apply auth middleware to all user routes
router.use(verifyToken);

// Profile routes
router.get('/profile/:id?', userController.getUserProfile);
router.put('/profile', userController.updateUserProfile);

// Social routes
router.post('/follow/:id', userController.followUser);
router.delete('/follow/:id', userController.unfollowUser);
router.get('/:id/followers', userController.getUserFollowers);
router.get('/:id/following', userController.getUserFollowing);

module.exports = router;