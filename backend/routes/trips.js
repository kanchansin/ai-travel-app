// backend/routes/trips.js
const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const { verifyToken } = require('../middleware/auth');

// Apply auth middleware to all trip routes
router.use(verifyToken);

// Trip routes
router.get('/', tripController.getUserTrips);
router.get('/:id', tripController.getTripById);
router.post('/', tripController.createTrip);
router.put('/:id', tripController.updateTrip);
router.delete('/:id', tripController.deleteTrip);

// Place routes within trips
router.post('/:id/places', tripController.addPlaceToTrip);
router.delete('/:id/places/:placeId', tripController.removePlaceFromTrip);
router.put('/:id/places', tripController.updatePlaceOrder);

module.exports = router;