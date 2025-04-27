// backend/middleware/errorHandler.js

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Default error message and status
  let message = 'Server error';
  let statusCode = 500;
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    // Mongoose validation error
    message = Object.values(err.errors).map(val => val.message).join(', ');
    statusCode = 400;
  } else if (err.code === 11000) {
    // MongoDB duplicate key error
    message = 'Duplicate field value entered';
    statusCode = 400;
  } else if (err.name === 'CastError') {
    // MongoDB cast error
    message = `Resource not found with id of ${err.value}`;
    statusCode = 404;
  } else if (err.name === 'JsonWebTokenError') {
    // JWT error
    message = 'Invalid token';
    statusCode = 401;
  } else if (err.name === 'TokenExpiredError') {
    // JWT expired
    message = 'Token expired';
    statusCode = 401;
  } else if (err.status) {
    // Error with status property
    statusCode = err.status;
    message = err.message;
  } else if (err.response && err.response.data) {
    // Error from external API
    message = err.response.data.message || 'Error from external service';
    statusCode = err.response.status || 500;
  }
  
  // Return error response
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  });
};

module.exports = errorHandler;