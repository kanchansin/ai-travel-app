// utils/dateUtils.js

/**
 * Formats a date into a readable string
 * @param {Date|string} date - The date to format
 * @returns {string} Formatted date string (e.g., "Jan 1, 2023")
 */
export const formatDate = (date) => {
    if (!date) return '';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Return empty string for invalid dates
    if (isNaN(dateObj.getTime())) return '';
    
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  /**
   * Formats a date range into a readable string
   * @param {Date|string} startDate - The start date
   * @param {Date|string} endDate - The end date
   * @returns {string} Formatted date range (e.g., "Jan 1 - Jan 5, 2023" or "Jan 1, 2023")
   */
  export const formatDateRange = (startDate, endDate) => {
    if (!startDate) return '';
    
    const start = formatDate(startDate);
    
    if (!endDate || startDate === endDate) {
      return start;
    }
    
    const startObj = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const endObj = typeof endDate === 'string' ? new Date(endDate) : endDate;
    
    // If dates are in the same month and year
    if (
      startObj.getMonth() === endObj.getMonth() &&
      startObj.getFullYear() === endObj.getFullYear()
    ) {
      const startDay = startObj.toLocaleDateString('en-US', { day: 'numeric' });
      const endFormatted = endObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      
      return `${startDay} - ${endFormatted}`;
    }
    
    // If dates are in the same year
    if (startObj.getFullYear() === endObj.getFullYear()) {
      const startFormatted = startObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
      const endFormatted = endObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      
      return `${startFormatted} - ${endFormatted}`;
    }
    
    // Different years
    const end = formatDate(endDate);
    return `${start} - ${end}`;
  };
  
  /**
   * Calculates the duration between two dates in days
   * @param {Date|string} startDate - The start date
   * @param {Date|string} endDate - The end date
   * @returns {number} Number of days between the dates (inclusive)
   */
  export const calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    
    // Return 0 for invalid dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    
    // Add 1 to include both the start and end date in the count
    const durationMs = end.getTime() - start.getTime();
    const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24)) + 1;
    
    return Math.max(1, durationDays); // Ensure minimum of 1 day
  };
  
  /**
   * Checks if a date is in the past
   * @param {Date|string} date - The date to check
   * @returns {boolean} True if the date is in the past
   */
  export const isPastDate = (date) => {
    if (!date) return false;
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    
    // Set times to midnight for comparison
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(dateObj);
    compareDate.setHours(0, 0, 0, 0);
    
    return compareDate < today;
  };
  
  /**
   * Checks if a date is today
   * @param {Date|string} date - The date to check
   * @returns {boolean} True if the date is today
   */
  export const isToday = (date) => {
    if (!date) return false;
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    
    return (
      dateObj.getDate() === today.getDate() &&
      dateObj.getMonth() === today.getMonth() &&
      dateObj.getFullYear() === today.getFullYear()
    );
  };