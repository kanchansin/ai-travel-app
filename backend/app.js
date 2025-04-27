// backend/app.js
const express = require('express');
const cors = require('cors');
const { corsOptions } = require('./config/cors');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const tripRoutes = require('./routes/trips');
const storyRoutes = require('./routes/stories');
const placeRoutes = require('./routes/places');
const userRoutes = require('./routes/users');
const recommendationRoutes = require('./routes/recommendations'); // Add recommendation routes

const app = express();

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/places', placeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/recommendations', recommendationRoutes); // Add recommendation routes

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;