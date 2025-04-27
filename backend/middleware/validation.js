// backend/middleware/validation.js

/**
 * Middleware to validate request data
 * @param {Array} rules - Validation rules
 * @returns {Function} - Express middleware function
 */
const validateRequest = (rules) => {
    return (req, res, next) => {
      const errors = [];
      
      // Check each validation rule
      rules.forEach(rule => {
        const { field, type, required, min, max, pattern, options, message } = rule;
        
        // Get value from request body, query or params
        const value = req.body[field] || req.query[field] || req.params[field];
        
        // Check if field is required
        if (required && (value === undefined || value === null || value === '')) {
          errors.push({
            field,
            message: message || `${field} is required`
          });
          return; // Skip further validation for this field
        }
        
        // Skip validation if field is not required and not provided
        if (!required && (value === undefined || value === null || value === '')) {
          return;
        }
        
        // Type validation
        if (type) {
          let typeValid = true;
          
          switch (type) {
            case 'string':
              typeValid = typeof value === 'string';
              break;
            case 'number':
              typeValid = !isNaN(Number(value));
              break;
            case 'boolean':
              typeValid = typeof value === 'boolean' || value === 'true' || value === 'false';
              break;
            case 'object':
              typeValid = typeof value === 'object' && !Array.isArray(value);
              break;
            case 'array':
              typeValid = Array.isArray(value);
              break;
            case 'date':
              typeValid = !isNaN(Date.parse(value));
              break;
            case 'email':
              typeValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
              break;
            default:
              typeValid = true;
          }
          
          if (!typeValid) {
            errors.push({
              field,
              message: message || `${field} must be a valid ${type}`
            });
            return; // Skip further validation for this field
          }
        }
        
        // Min/max validation for strings and arrays
        if ((typeof value === 'string' || Array.isArray(value)) && (min !== undefined || max !== undefined)) {
          const length = value.length;
          
          if (min !== undefined && length < min) {
            errors.push({
              field,
              message: message || `${field} must be at least ${min} characters long`
            });
          }
          
          if (max !== undefined && length > max) {
            errors.push({
              field,
              message: message || `${field} must be no more than ${max} characters long`
            });
          }
        }
        
        // Min/max validation for numbers
        if (typeof value === 'number' || !isNaN(Number(value))) {
          const numValue = Number(value);
          
          if (min !== undefined && numValue < min) {
            errors.push({
              field,
              message: message || `${field} must be at least ${min}`
            });
          }
          
          if (max !== undefined && numValue > max) {
            errors.push({
              field,
              message: message || `${field} must be no more than ${max}`
            });
          }
        }
        
        // Pattern validation
        if (pattern && typeof value === 'string') {
          const regex = new RegExp(pattern);
          if (!regex.test(value)) {
            errors.push({
              field,
              message: message || `${field} format is invalid`
            });
          }
        }
        
        // Options validation
        if (options && Array.isArray(options)) {
          if (!options.includes(value)) {
            errors.push({
              field,
              message: message || `${field} must be one of: ${options.join(', ')}`
            });
          }
        }
      });
      
      // Return errors if any
      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          errors
        });
      }
      
      // Continue to the next middleware
      next();
    };
  };
  
  module.exports = {
    validateRequest
  };