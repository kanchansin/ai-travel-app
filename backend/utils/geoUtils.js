// backend/utils/geoUtils.js

/**
 * Calculate distance between two points using the Haversine formula
 * @param {Object} point1 - First point with lat and lng properties
 * @param {Object} point2 - Second point with lat and lng properties
 * @returns {number} - Distance in kilometers
 */
const getDistanceBetween = (point1, point2) => {
    const toRad = value => (value * Math.PI) / 180;
    
    const R = 6371; // Earth's radius in km
    const dLat = toRad(point2.latitude - point1.latitude);
    const dLon = toRad(point2.longitude - point1.longitude);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(point1.latitude)) * Math.cos(toRad(point2.latitude)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
  };
  
  /**
   * Check if a point is within a specified radius of another point
   * @param {Object} center - Center point with lat and lng properties
   * @param {Object} point - Point to check with lat and lng properties
   * @param {number} radiusKm - Radius in kilometers
   * @returns {boolean} - Whether the point is within the radius
   */
  const isPointWithinRadius = (center, point, radiusKm) => {
    return getDistanceBetween(center, point) <= radiusKm;
  };
  
  /**
   * Get bounding box coordinates for a given center and radius
   * @param {Object} center - Center point {latitude, longitude}
   * @param {number} radiusKm - Radius in kilometers
   * @returns {Object} - Bounding box coordinates
   */
  const getBoundingBox = (center, radiusKm) => {
    const R = 6371; // Earth's radius in km
    
    // Angular distance in radians
    const radDist = radiusKm / R;
    
    const degLat = center.latitude;
    const degLon = center.longitude;
    
    const radLat = (degLat * Math.PI) / 180;
    const radLon = (degLon * Math.PI) / 180;
    
    let minLat = radLat - radDist;
    let maxLat = radLat + radDist;
    
    // Longitude calculations
    let deltaLon = Math.asin(Math.sin(radDist) / Math.cos(radLat));
    let minLon = radLon - deltaLon;
    let maxLon = radLon + deltaLon;
    
    // Convert back to degrees
    minLat = (minLat * 180) / Math.PI;
    maxLat = (maxLat * 180) / Math.PI;
    minLon = (minLon * 180) / Math.PI;
    maxLon = (maxLon * 180) / Math.PI;
    
    return {
      southwest: { latitude: minLat, longitude: minLon },
      northeast: { latitude: maxLat, longitude: maxLon }
    };
  };
  
  module.exports = {
    getDistanceBetween,
    isPointWithinRadius,
    getBoundingBox
  };