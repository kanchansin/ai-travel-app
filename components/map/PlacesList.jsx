import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { truncateText, formatDistance } from '../../utils/formatters';

/**
 * Component for displaying a list of places
 * @param {Object} props - Component props
 * @returns {JSX.Element} PlacesList component
 */
const PlacesList = ({
  places,
  onSelectPlace,
  onAddToTrip,
  userLocation,
  isLoading,
  showDistance = true,
  showAddButton = true,
}) => {
  const { theme } = useTheme();
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    loadingText: {
      color: theme.colors.text,
      marginTop: 10,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    emptyText: {
      color: theme.colors.text,
      marginTop: 10,
      textAlign: 'center',
    },
    placeItem: {
      flexDirection: 'row',
      backgroundColor: theme.colors.cardBackground,
      borderRadius: 12,
      marginBottom: 16,
      overflow: 'hidden',
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    placeImage: {
      width: 100,
      height: 100,
      backgroundColor: theme.colors.neutral,
    },
    placeholder: {
      width: 100,
      height: 100,
      backgroundColor: theme.colors.neutral,
      justifyContent: 'center',
      alignItems: 'center',
    },
    contentContainer: {
      flex: 1,
      padding: 12,
    },
    nameContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    placeName: {
      flex: 1,
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    rating: {
      fontSize: 14,
      color: theme.colors.text,
      marginLeft: 4,
    },
    infoContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 8,
    },
    infoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 12,
      marginBottom: 4,
    },
    infoText: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginLeft: 4,
    },
    description: {
      fontSize: 13,
      color: theme.colors.textSecondary,
    },
    buttonsContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 'auto',
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: theme.colors.accentLight,
      marginLeft: 8,
    },
    buttonText: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.colors.accent,
      marginLeft: 4,
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="timer-outline" size={40} color={theme.colors.textSecondary} />
        <Text style={styles.loadingText}>Loading places...</Text>
      </View>
    );
  }

  if (!places || places.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="location-outline" size={40} color={theme.colors.textSecondary} />
        <Text style={styles.emptyText}>No places found in this area. Try adjusting your search or exploring a different location.</Text>
      </View>
    );
  }

  const calculateDistance = (place) => {
    if (!userLocation || !place.coordinates || !showDistance) return null;
    
    // Simple distance calculation
    const lat1 = userLocation.latitude;
    const lon1 = userLocation.longitude;
    const lat2 = place.coordinates.latitude;
    const lon2 = place.coordinates.longitude;
    
    const toRad = value => (value * Math.PI) / 180;
    const R = 6371e3; // Earth radius in meters
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lon2 - lon1);
    
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return formatDistance(distance);
  };

  const renderPlaceItem = ({ item }) => {
    const distance = calculateDistance(item);
    
    return (
      <TouchableOpacity
        style={styles.placeItem}
        onPress={() => onSelectPlace(item)}
        activeOpacity={0.7}
      >
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.placeImage} resizeMode="cover" />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="image-outline" size={32} color={theme.colors.textSecondary} />
          </View>
        )}
        
        <View style={styles.contentContainer}>
          <View style={styles.nameContainer}>
            <Text style={styles.placeName} numberOfLines={1}>
              {item.name}
            </Text>
          </View>
          
          {item.rating && (
            <View style={styles.ratingContainer}>
              <Ionicons 
                name="star" 
                size={16} 
                color={theme.colors.rating} 
              />
              <Text style={styles.rating}>{item.rating} {item.reviewCount ? `(${item.reviewCount})` : ''}</Text>
            </View>
          )}
          
          <View style={styles.infoContainer}>
            {item.category && (
              <View style={styles.infoItem}>
                <Ionicons name="pricetag-outline" size={14} color={theme.colors.textSecondary} />
                <Text style={styles.infoText}>{item.category}</Text>
              </View>
            )}
            
            {distance && (
              <View style={styles.infoItem}>
                <Ionicons name="location-outline" size={14} color={theme.colors.textSecondary} />
                <Text style={styles.infoText}>{distance}</Text>
              </View>
            )}
            
            {item.isOpen !== undefined && (
              <View style={styles.infoItem}>
                <Ionicons 
                  name="time-outline" 
                  size={14} 
                  color={item.isOpen ? theme.colors.success : theme.colors.error} 
                />
                <Text 
                  style={[
                    styles.infoText, 
                    { color: item.isOpen ? theme.colors.success : theme.colors.error }
                  ]}
                >
                  {item.isOpen ? 'Open' : 'Closed'}
                </Text>
              </View>
            )}
          </View>
          
          {item.description && (
            <Text style={styles.description} numberOfLines={2}>
              {truncateText(item.description, 100)}
            </Text>
          )}
          
          <View style={styles.buttonsContainer}>
            <TouchableOpacity 
              style={styles.button}
              onPress={() => onSelectPlace(item)}
            >
              <Ionicons name="information-circle-outline" size={16} color={theme.colors.accent} />
              <Text style={styles.buttonText}>Details</Text>
            </TouchableOpacity>
            
            {showAddButton && (
              <TouchableOpacity 
                style={styles.button}
                onPress={() => onAddToTrip(item)}
              >
                <Ionicons name="add-circle-outline" size={16} color={theme.colors.accent} />
                <Text style={styles.buttonText}>Add to Trip</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={places}
        renderItem={renderPlaceItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16 }}
      />
    </View>
  );
};

export default PlacesList;