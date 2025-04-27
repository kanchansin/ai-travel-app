// backend/routes/mapbox.js
const express = require('express');
const router = express.Router();
const mapboxController = require('../controllers/mapboxController');
const { verifyToken } = require('../middleware/auth');

// Apply auth middleware to all mapbox routes
router.use(verifyToken);

// Mapbox routes
router.get('/search', mapboxController.searchPlaces);
router.post('/directions', mapboxController.getDirections);
router.post('/static-map', mapboxController.getStaticMapUrl);

module.exports = router;