// backend/middleware/auth.js
const { admin } = require('../config/firebase');

/**
 * Middleware to authenticate users using Firebase tokens
 */
const authenticate = async (req, res, next) => {
  try {
    // Check for authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No token provided'
      });
    }
    
    // Extract token
    const token = authHeader.split(' ')[1];
    
    // Verify token with Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Attach user info to request
    req.user = decodedToken;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    // Handle specific Firebase auth errors
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Token expired'
      });
    }
    
    if (error.code === 'auth/id-token-revoked') {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Token revoked'
      });
    }
    
    // Generic auth error
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid token'
    });
  }
};

/**
 * Middleware to check if user has specific role
 * @param {Array|string} roles - Required role(s)
 */
const checkRole = (roles) => {
  return (req, res, next) => {
    // Ensure user is authenticated first
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User not authenticated'
      });
    }
    
    // Convert single role to array
    const requiredRoles = Array.isArray(roles) ? roles : [roles];
    
    // Get user role from token claims
    const userRole = req.user.role || 'user';
    
    // Check if user has required role
    if (!requiredRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Insufficient permissions'
      });
    }
    
    next();
  };
};

module.exports = {
  authenticate,
  checkRole
};