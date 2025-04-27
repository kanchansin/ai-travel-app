// backend/routes/recommendations.js
const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');
const { authenticate } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');

/**
 * @route   GET /api/recommendations/popular
 * @desc    Get popular destinations
 * @access  Public
 */
router.get('/popular', recommendationController.getPopular);

/**
 * @route   GET /api/recommendations/personalized
 * @desc    Get personalized recommendations for the authenticated user
 * @access  Private
 */
router.get('/personalized', authenticate, recommendationController.getPersonalized);

/**
 * @route   GET /api/recommendations/nearby
 * @desc    Get nearby places based on coordinates
 * @access  Public
 */
router.get('/nearby', recommendationController.getNearby);

/**
 * @route   GET /api/recommendations/similar/:placeId
 * @desc    Get places similar to the specified place
 * @access  Public
 */
router.get('/similar/:placeId', recommendationController.getSimilar);

/**
 * @route   GET /api/recommendations/seasonal/:country
 * @desc    Get seasonal recommendations for a country
 * @access  Public
 */
router.get('/seasonal/:country', recommendationController.getSeasonal);

/**
 * @route   POST /api/recommendations/itinerary
 * @desc    Generate AI-powered itinerary
 * @access  Private
 */
router.post('/itinerary', 
  authenticate,
  validateRequest([
    { field: 'preferences', type: 'object', required: true },
    { field: 'destination', type: 'string', required: true },
    { field: 'duration', type: 'number', required: true }
  ]),
  recommendationController.generateItinerary
);

/**
 * @route   GET /api/recommendations/trending
 * @desc    Get trending destinations based on user activity
 * @access  Public
 */
router.get('/trending', recommendationController.getTrending);

module.exports = router;