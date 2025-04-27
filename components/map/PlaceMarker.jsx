import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

const PlaceMarker = ({ 
  coordinate, 
  title, 
  description, 
  type = 'attraction', 
  isCustom = false,
  onPress 
}) => {
  const { theme } = useTheme();
  
  // Choose icon based on place type
  const getIconName = () => {
    switch (type.toLowerCase()) {
      case 'restaurant':
        return 'restaurant';
      case 'cafe':
        return 'cafe';
      case 'hotel':
        return 'bed';
      case 'attraction':
        return 'camera';
      case 'shopping':
        return 'cart';
      case 'entertainment':
        return 'film';
      case 'outdoor':
        return 'leaf';
      case 'transport':
        return 'bus';
      default:
        return 'location';
    }
  };

  // Get color based on type
  const getColor = () => {
    if (isCustom) return theme.colors.accent;
    
    switch (type.toLowerCase()) {
      case 'restaurant':
        return '#FF6B6B';
      case 'cafe':
        return '#FFAB76';
      case 'hotel':
        return '#6B8FF9';
      case 'attraction':
        return '#9C6BFF';
      case 'shopping':
        return '#FF6BD6';
      case 'entertainment':
        return '#76FFCE';
      case 'outdoor':
        return '#76FF7A';
      case 'transport':
        return '#FFE76B';
      default:
        return theme.colors.primary;
    }
  };

  return (
    <MapboxGL.MarkerView coordinate={coordinate} anchor={{ x: 0.5, y: 0.5 }}>
      <View style={styles.markerContainer} onTouchEnd={onPress}>
        <View style={[styles.marker, { backgroundColor: getColor() }]}>
          <Ionicons name={getIconName()} size={18} color="#FFFFFF" />
        </View>
        {isCustom && (
          <View style={[styles.customRing, { borderColor: getColor() }]} />
        )}
      </View>
    </MapboxGL.MarkerView>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
  marker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  customRing: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
  },
});

export default PlaceMarker;