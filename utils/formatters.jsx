/**
 * Utility functions for formatting data in the app
 */

/**
 * Format a date to a readable string
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
    if (!date) return '';
    
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    
    return new Date(date).toLocaleDateString(undefined, options);
  };
  
  /**
   * Format a date range to a readable string
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {string} Formatted date range string
   */
  export const formatDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) return '';
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const startOptions = { 
      month: 'short', 
      day: 'numeric' 
    };
    
    const endOptions = { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    };
    
    return `${start.toLocaleDateString(undefined, startOptions)} - ${end.toLocaleDateString(undefined, endOptions)}`;
  };
  
  /**
   * Format a distance in meters to a readable string
   * @param {number} distance - Distance in meters
   * @returns {string} Formatted distance string
   */
  export const formatDistance = (distance) => {
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    } else {
      return `${(distance / 1000).toFixed(1)}km`;
    }
  };
  
  /**
   * Format a duration in seconds to a readable string
   * @param {number} seconds - Duration in seconds
   * @returns {string} Formatted duration string
   */
  export const formatDuration = (seconds) => {
    if (!seconds) return '';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours === 0) {
      return `${minutes} min`;
    } else {
      return `${hours}h ${minutes}min`;
    }
  };
  
  /**
   * Truncate a long text with ellipsis
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length before truncation
   * @returns {string} Truncated text
   */
  export const truncateText = (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) {
      return text;
    }
    
    return text.substring(0, maxLength - 3) + '...';
  };
  
  /**
   * Format a place name by removing unnecessary parts
   * @param {string} placeName - Place name to format
   * @returns {string} Formatted place name
   */
  export const formatPlaceName = (placeName) => {
    if (!placeName) return '';
    
    // Remove country and state information if present
    const parts = placeName.split(',');
    
    if (parts.length > 2) {
      return parts.slice(0, -2).join(',').trim();
    }
    
    return placeName;
  };