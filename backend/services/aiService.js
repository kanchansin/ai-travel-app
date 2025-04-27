// backend/services/aiService.js
const { admin } = require('../config/firebase');
const db = admin.firestore();

/**
 * Generate AI-powered travel itinerary recommendations
 * @param {Object} preferences - User preferences
 * @param {string} destination - Destination name/country
 * @param {number} duration - Trip duration in days
 * @returns {Promise<Object>} - Recommended itinerary
 */
const generateItinerary = async (preferences, destination, duration) => {
  try {
    // In a real implementation, this would call a machine learning model or external AI API
    // For now, we'll implement a rule-based recommendation system
    
    // Get destination information
    const destinationInfo = await getDestinationInfo(destination);
    if (!destinationInfo) {
      throw new Error('Destination not found');
    }
    
    // Create daily activities based on preferences and destination
    const dailyActivities = [];
    
    for (let day = 1; day <= duration; day++) {
      const activities = await generateDailyActivities(preferences, destinationInfo, day);
      dailyActivities.push({
        day,
        activities
      });
    }
    
    return {
      destination: destinationInfo,
      duration,
      dailyActivities,
      accommodationSuggestions: await suggestAccommodations(preferences, destinationInfo),
      transportationOptions: await suggestTransportation(preferences, destinationInfo),
      estimatedBudget: calculateEstimatedBudget(preferences, destinationInfo, duration)
    };
  } catch (error) {
    console.error('Error generating itinerary:', error);
    throw error;
  }
};

/**
 * Get detailed information about a destination
 * @param {string} destination - Destination name/country
 * @returns {Promise<Object>} - Destination information
 */
const getDestinationInfo = async (destination) => {
  try {
    // Search for destination in places collection
    const placesRef = db.collection('places');
    const snapshot = await placesRef
      .where('name', '==', destination)
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      // Try searching by country
      const countrySnapshot = await placesRef
        .where('country', '==', destination)
        .limit(1)
        .get();
      
      if (countrySnapshot.empty) {
        return null;
      }
      
      return {
        id: countrySnapshot.docs[0].id,
        ...countrySnapshot.docs[0].data()
      };
    }
    
    return {
      id: snapshot.docs[0].id,
      ...snapshot.docs[0].data()
    };
  } catch (error) {
    console.error('Error getting destination info:', error);
    throw error;
  }
};

/**
 * Generate daily activities based on user preferences and destination
 * @param {Object} preferences - User preferences
 * @param {Object} destination - Destination information
 * @param {number} dayNumber - Day number in the itinerary
 * @returns {Promise<Array>} - Recommended daily activities
 */
const generateDailyActivities = async (preferences, destination, dayNumber) => {
  try {
    // Get attractions from the destination
    const attractionsRef = db.collection('places')
      .where('country', '==', destination.country)
      .where('type', '==', 'attraction')
      .limit(100);
    
    const snapshot = await attractionsRef.get();
    
    if (snapshot.empty) {
      return [];
    }
    
    const attractions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Filter attractions based on user preferences
    let filteredAttractions = attractions;
    
    // Apply preference filters
    if (preferences.interests && preferences.interests.length > 0) {
      filteredAttractions = filteredAttractions.filter(attraction => {
        if (!attraction.tags) return false;
        return preferences.interests.some(interest => attraction.tags.includes(interest));
      });
    }
    
    // Sort attractions by relevance to the day number
    // (This is a simplified approach; a real implementation would be more sophisticated)
    const sortedAttractions = filteredAttractions.sort((a, b) => {
      // Popular attractions earlier in the trip
      if (a.popularity > b.popularity && dayNumber <= Math.ceil(preferences.duration / 2)) {
        return -1;
      }
      // Less crowded attractions later in the trip
      if (a.crowdLevel < b.crowdLevel && dayNumber > Math.ceil(preferences.duration / 2)) {
        return -1;
      }
      return 0;
    });
    
    // Select a subset of attractions for the day (3-5 activities per day)
    const activitiesCount = Math.min(5, Math.max(3, Math.floor(8 / preferences.duration * 2)));
    const dailyActivities = sortedAttractions.slice(0, activitiesCount).map(attraction => ({
      name: attraction.name,
      description: attraction.description,
      location: attraction.location,
      duration: attraction.averageDuration || 2, // hours
      cost: attraction.cost || 'Free',
      type: attraction.activityType || 'sightseeing',
      timeOfDay: suggestTimeOfDay(attraction, dayNumber)
    }));
    
    // Add meals and rest periods
    dailyActivities.push(
      {
        name: 'Breakfast',
        type: 'meal',
        timeOfDay: 'morning',
        duration: 1,
        cost: preferences.budget === 'budget' ? '$' : (preferences.budget === 'luxury' ? '$$$' : '$$')
      },
      {
        name: 'Lunch',
        type: 'meal',
        timeOfDay: 'afternoon',
        duration: 1.5,
        cost: preferences.budget === 'budget' ? '$' : (preferences.budget === 'luxury' ? '$$$' : '$$')
      },
      {
        name: 'Dinner',
        type: 'meal',
        timeOfDay: 'evening',
        duration: 2,
        cost: preferences.budget === 'budget' ? '$' : (preferences.budget === 'luxury' ? '$$$' : '$$')
      }
    );
    
    // Sort by time of day
    return dailyActivities.sort((a, b) => {
      const timeOrder = { 'morning': 1, 'afternoon': 2, 'evening': 3, 'night': 4 };
      return timeOrder[a.timeOfDay] - timeOrder[b.timeOfDay];
    });
  } catch (error) {
    console.error('Error generating daily activities:', error);
    throw error;
  }
};

/**
 * Suggest accommodation options based on preferences
 * @param {Object} preferences - User preferences
 * @param {Object} destination - Destination information
 * @returns {Promise<Array>} - Accommodation suggestions
 */
const suggestAccommodations = async (preferences, destination) => {
  try {
    // Determine accommodation type based on budget
    let accommodationType;
    switch (preferences.budget) {
      case 'budget':
        accommodationType = ['hostel', 'guesthouse', 'budget_hotel'];
        break;
      case 'luxury':
        accommodationType = ['luxury_hotel', 'resort', 'villa'];
        break;
      default: // mid-range
        accommodationType = ['hotel', 'apartment', 'bed_and_breakfast'];
        break;
    }
    
    // Query accommodations in the destination
    const accommodationsRef = db.collection('accommodations')
      .where('country', '==', destination.country)
      .where('city', '==', destination.name)
      .where('type', 'in', accommodationType)
      .limit(5);
    
    const snapshot = await accommodationsRef.get();
    
    if (snapshot.empty) {
      // Return generic recommendations if no specific accommodations found
      return generateGenericAccommodations(preferences, destination);
    }
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error suggesting accommodations:', error);
    return generateGenericAccommodations(preferences, destination);
  }
};

/**
 * Generate generic accommodation suggestions when specific ones aren't available
 * @param {Object} preferences - User preferences
 * @param {Object} destination - Destination information
 * @returns {Array} - Generic accommodation suggestions
 */
const generateGenericAccommodations = (preferences, destination) => {
  const accommodations = [];
  
  switch (preferences.budget) {
    case 'budget':
      accommodations.push(
        {
          name: 'Budget Hostel',
          type: 'hostel',
          priceRange: '$',
          amenities: ['Free WiFi', 'Shared Kitchen', 'Locker Storage']
        },
        {
          name: 'Affordable Guesthouse',
          type: 'guesthouse',
          priceRange: '$-$$',
          amenities: ['Free Breakfast', 'WiFi', 'Air Conditioning']
        }
      );
      break;
    case 'luxury':
      accommodations.push(
        {
          name: 'Luxury Resort',
          type: 'resort',
          priceRange: '$$$$$',
          amenities: ['Spa', 'Pool', 'Fine Dining', 'Concierge Service']
        },
        {
          name: 'Boutique Hotel',
          type: 'luxury_hotel',
          priceRange: '$$$$',
          amenities: ['Room Service', 'Gym', 'Restaurant', 'Bar']
        }
      );
      break;
    default: // mid-range
      accommodations.push(
        {
          name: 'Mid-range Hotel',
          type: 'hotel',
          priceRange: '$$$',
          amenities: ['WiFi', 'Breakfast', 'Air Conditioning', 'TV']
        },
        {
          name: 'Vacation Apartment',
          type: 'apartment',
          priceRange: '$$-$$$',
          amenities: ['Kitchen', 'Washing Machine', 'WiFi', 'Living Area']
        }
      );
      break;
  }
  
  // Add location info
  return accommodations.map(accommodation => ({
    ...accommodation,
    location: `${destination.name}, ${destination.country}`,
    description: `${accommodation.type.replace('_', ' ')} in ${destination.name}`
  }));
};

/**
 * Suggest transportation options based on preferences
 * @param {Object} preferences - User preferences
 * @param {Object} destination - Destination information
 * @returns {Promise<Array>} - Transportation suggestions
 */
const suggestTransportation = async (preferences, destination) => {
  // Determine appropriate transportation options based on destination and preferences
  const transportOptions = [];
  
  // Public transportation
  if (destination.hasPublicTransport) {
    transportOptions.push({
      type: 'public_transport',
      name: `${destination.name} Public Transportation`,
      description: 'Local buses, trams, or metro',
      cost: '$',
      bestFor: 'Getting around the city affordably'
    });
  }
  
  // Taxi/rideshare
  transportOptions.push({
    type: 'taxi',
    name: 'Taxi or Rideshare',
    description: 'On-demand transportation',
    cost: '$$',
    bestFor: 'Convenience and direct routes'
  });
  
  // Rental car
  if (destination.carFriendly) {
    transportOptions.push({
      type: 'rental_car',
      name: 'Rental Car',
      description: 'Self-drive option',
      cost: preferences.budget === 'luxury' ? '$$$' : '$$',
      bestFor: 'Freedom to explore at your own pace'
    });
  }
  
  // Walking
  if (destination.walkable) {
    transportOptions.push({
      type: 'walking',
      name: 'Walking',
      description: 'Explore on foot',
      cost: 'Free',
      bestFor: 'Short distances and sightseeing'
    });
  }
  
  // Bicycle
  if (destination.bikeFriendly) {
    transportOptions.push({
      type: 'bicycle',
      name: 'Bicycle Rental',
      description: 'Explore by bike',
      cost: '$',
      bestFor: 'Moderate distances and outdoor enjoyment'
    });
  }
  
  // Sort by budget preference
  return sortTransportationByBudget(transportOptions, preferences.budget);
};

/**
 * Sort transportation options based on budget preferences
 * @param {Array} options - Transportation options
 * @param {string} budget - Budget preference (budget, mid-range, luxury)
 * @returns {Array} - Sorted transportation options
 */
const sortTransportationByBudget = (options, budget) => {
  const costRank = {
    'Free': 0,
    '$': 1,
    '$$': 2,
    '$$$': 3,
    '$$$$': 4
  };
  
  return options.sort((a, b) => {
    const aRank = costRank[a.cost] || 0;
    const bRank = costRank[b.cost] || 0;
    
    switch (budget) {
      case 'budget':
        return aRank - bRank; // Cheaper first
      case 'luxury':
        return bRank - aRank; // More expensive first
      default: // mid-range
        // Mid-range options first, then budget, then luxury
        const aMidRange = Math.abs(aRank - 1.5);
        const bMidRange = Math.abs(bRank - 1.5);
        return aMidRange - bMidRange;
    }
  });
};

/**
 * Calculate estimated budget for the trip
 * @param {Object} preferences - User preferences
 * @param {Object} destination - Destination information
 * @param {number} duration - Trip duration in days
 * @returns {Object} - Budget estimation
 */
const calculateEstimatedBudget = (preferences, destination, duration) => {
  // Base costs per day by budget category and destination cost level
  const destinationCostLevel = destination.costLevel || 'medium'; // low, medium, high
  
  // Base daily costs by budget preference and destination cost
  let dailyCosts = {
    accommodation: 0,
    food: 0,
    transportation: 0,
    activities: 0
  };
  
  // Set base costs by destination cost level
  const costMultiplier = {
    'low': 0.7,
    'medium': 1.0,
    'high': 1.5
  }[destinationCostLevel];
  
  // Set costs by budget preference
  switch (preferences.budget) {
    case 'budget':
      dailyCosts.accommodation = 50 * costMultiplier;
      dailyCosts.food = 30 * costMultiplier;
      dailyCosts.transportation = 15 * costMultiplier;
      dailyCosts.activities = 20 * costMultiplier;
      break;
    case 'luxury':
      dailyCosts.accommodation = 300 * costMultiplier;
      dailyCosts.food = 150 * costMultiplier;
      dailyCosts.transportation = 80 * costMultiplier;
      dailyCosts.activities = 100 * costMultiplier;
      break;
    default: // mid-range
      dailyCosts.accommodation = 150 * costMultiplier;
      dailyCosts.food = 80 * costMultiplier;
      dailyCosts.transportation = 40 * costMultiplier;
      dailyCosts.activities = 60 * costMultiplier;
      break;
  }
  
  // Calculate total costs for the trip
  const totalCosts = {
    accommodation: Math.round(dailyCosts.accommodation * duration),
    food: Math.round(dailyCosts.food * duration),
    transportation: Math.round(dailyCosts.transportation * duration),
    activities: Math.round(dailyCosts.activities * duration)
  };
  
  const totalBudget = Object.values(totalCosts).reduce((sum, cost) => sum + cost, 0);
  
  return {
    dailyCosts,
    totalCosts,
    totalBudget,
    currencyCode: 'USD', // Default to USD
    breakdown: {
      accommodation: Math.round(totalCosts.accommodation / totalBudget * 100),
      food: Math.round(totalCosts.food / totalBudget * 100),
      transportation: Math.round(totalCosts.transportation / totalBudget * 100),
      activities: Math.round(totalCosts.activities / totalBudget * 100)
    }
  };
};

/**
 * Suggest appropriate time of day for an activity
 * @param {Object} activity - Activity information
 * @param {number} dayNumber - Day number in the itinerary
 * @returns {string} - Suggested time of day
 */
const suggestTimeOfDay = (activity, dayNumber) => {
  // Determine time of day based on activity type and other factors
  if (activity.bestTimeOfDay) {
    return activity.bestTimeOfDay;
  }
  
  if (activity.indoors && activity.type === 'museum') {
    return dayNumber % 2 === 0 ? 'morning' : 'afternoon';
  }
  
  if (activity.type === 'nature' || activity.type === 'beach') {
    return 'morning';
  }
  
  if (activity.type === 'nightlife' || activity.name.toLowerCase().includes('bar')) {
    return 'night';
  }
  
  if (activity.type === 'shopping') {
    return 'afternoon';
  }
  
  // Default to afternoon if no specific time is determined
  return 'afternoon';
};

/**
 * Get trending destinations based on recent user activity
 * @param {number} limit - Number of trending destinations to return
 * @returns {Promise<Array>} - Trending destinations
 */
const getTrendingDestinations = async (limit = 5) => {
  try {
    // In a real implementation, this would query analytics data
    // For now, we'll use a simple implementation based on recent trips
    
    const tripsRef = db.collection('trips')
      .orderBy('createdAt', 'desc')
      .limit(50);
    
    const snapshot = await tripsRef.get();
    
    if (snapshot.empty) {
      return [];
    }
    
    // Count destination occurrences
    const destinationCounts = {};
    
    snapshot.forEach(doc => {
      const trip = doc.data();
      if (trip.destination) {
        destinationCounts[trip.destination] = (destinationCounts[trip.destination] || 0) + 1;
      }
    });
    
    // Sort destinations by count
    const trendingDestinations = Object.entries(destinationCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, limit)
      .map(([destination, count]) => ({ destination, count }));
    
    // Get additional details for each trending destination
    const enrichedDestinations = await Promise.all(
      trendingDestinations.map(async ({ destination, count }) => {
        const destinationInfo = await getDestinationInfo(destination);
        return {
          ...destinationInfo,
          trendCount: count
        };
      })
    );
    
    return enrichedDestinations.filter(Boolean);
  } catch (error) {
    console.error('Error getting trending destinations:', error);
    throw error;
  }
};

module.exports = {
  generateItinerary,
  getTrendingDestinations
};