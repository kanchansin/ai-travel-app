import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import { useTheme } from '../../contexts/ThemeContext';
import { getPointsOfInterest } from '../../services/mapbox';
import PlaceMarker from './PlaceMarker';
import { useAuth } from '../../hooks/useAuth';

MapboxGL.setAccessToken('YOUR_MAPBOX_ACCESS_TOKEN'); // Replace with your actual token in production

const MapView = ({ 
  initialRegion = { 
    latitude: 37.78825, 
    longitude: -122.4324, 
    latitudeDelta: 0.0922, 
    longitudeDelta: 0.0421 
  },
  onSelectLocation,
  showPOIs = true,
  travelType = 'Just Me',
  customMarkers = []
}) => {
  const mapRef = useRef(null);
  const { theme } = useTheme();
  const { user } = useAuth();
  const [pois, setPois] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentRegion, setCurrentRegion] = useState(initialRegion);

  useEffect(() => {
    const fetchPOIs = async () => {
      if (showPOIs) {
        setLoading(true);
        try {
          const poisData = await getPointsOfInterest(
            currentRegion.longitude,
            currentRegion.latitude,
            travelType
          );
          setPois(poisData);
        } catch (error) {
          console.error('Error fetching POIs:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchPOIs();
  }, [currentRegion, showPOIs, travelType]);

  const onRegionDidChange = (region) => {
    setCurrentRegion({
      latitude: region.geometry.coordinates[1],
      longitude: region.geometry.coordinates[0],
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421
    });
  };

  return (
    <View style={styles.container}>
      <MapboxGL.MapView
        ref={mapRef}
        style={styles.map}
        styleURL={theme.dark ? MapboxGL.StyleURL.Dark : MapboxGL.StyleURL.Street}
        onRegionDidChange={onRegionDidChange}
      >
        <MapboxGL.Camera
          zoomLevel={14}
          centerCoordinate={[initialRegion.longitude, initialRegion.latitude]}
          animationDuration={2000}
        />
        
        {/* User's current location */}
        <MapboxGL.UserLocation visible />
        
        {/* Points of Interest */}
        {showPOIs && pois.map((poi, index) => (
          <PlaceMarker 
            key={`poi-${index}`}
            coordinate={[poi.longitude, poi.latitude]}
            title={poi.name}
            description={poi.description}
            type={poi.type}
            onPress={() => onSelectLocation && onSelectLocation(poi)}
          />
        ))}
        
        {/* Custom markers passed from parent */}
        {customMarkers.map((marker, index) => (
          <PlaceMarker
            key={`custom-${index}`}
            coordinate={[marker.longitude, marker.latitude]}
            title={marker.name}
            description={marker.description}
            type={marker.type}
            isCustom
            onPress={() => onSelectLocation && onSelectLocation(marker)}
          />
        ))}
      </MapboxGL.MapView>
      
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
});

export default MapView;