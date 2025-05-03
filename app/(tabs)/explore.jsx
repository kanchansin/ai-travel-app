import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Search, X, Compass, MapPin } from 'lucide-react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useTheme } from '../../contexts/ThemeContext';
import { searchPlaces, getPlaceDetails } from '../../services/mapbox';

const { width } = Dimensions.get('window');

export default function Explore() {
  const router = useRouter();
  const { theme } = useTheme(); // Get theme from context
  const mapRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [region, setRegion] = useState({
    latitude: 37.7749,
    longitude: -122.4194,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  
  const cardAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    // Show/hide the place details card with animation
    Animated.timing(cardAnimation, {
      toValue: selectedPlace ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [selectedPlace]);

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setUserLocation({ latitude, longitude });
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  };

  const handleSearch = async (text) => {
    setSearchQuery(text);
    if (text.length > 2) {
      try {
        const results = await searchPlaces(text, userLocation);
        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
      }
    } else {
      setSearchResults([]);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSelectPlace = async (place) => {
    try {
      setSearchQuery(place.place_name);
      setSearchResults([]);
      
      const placeDetails = await getPlaceDetails(place.id);
      setSelectedPlace(placeDetails);
      
      // Animate map to the selected location
      const { center } = place;
      mapRef.current?.animateToRegion({
        latitude: center[1],
        longitude: center[0],
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    } catch (error) {
      console.error('Error getting place details:', error);
    }
  };

  const closeSelectedPlace = () => {
    setSelectedPlace(null);
  };

  const navigateToPlaceDetails = () => {
    if (selectedPlace) {
      router.push({
        pathname: `/place/${selectedPlace.id}`,
        params: { placeData: JSON.stringify(selectedPlace) }
      });
    }
  };

  const renderSearchResult = ({ item }) => (
    <TouchableOpacity 
      style={styles.searchResultItem}
      onPress={() => handleSelectPlace(item)}
    >
      <MapPin size={18} color={theme.colors.textLight} />
      <View style={styles.searchResultTextContainer}>
        <Text style={[styles.searchResultTitle, { color: theme.colors.text }]} numberOfLines={1}>
          {item.text}
        </Text>
        <Text style={[styles.searchResultSubtitle, { color: theme.colors.textLight }]} numberOfLines={1}>
          {item.place_name.replace(`${item.text}, `, '')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Create styles using the theme
  const themedStyles = {
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    searchContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
      padding: theme.sizes.md,
    },
    searchInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      borderRadius: 8,
      paddingHorizontal: theme.sizes.md,
      height: 48,
      ...theme.shadows.small,
    },
    searchInput: {
      flex: 1,
      fontSize: theme.fonts.sizes.md,
      color: theme.colors.text,
    },
    searchResultsContainer: {
      backgroundColor: theme.colors.background,
      borderRadius: 8,
      marginTop: theme.sizes.xs,
      maxHeight: 300,
      ...theme.shadows.small,
    },
    currentLocationButton: {
      position: 'absolute',
      bottom: 100,
      right: theme.sizes.md,
      backgroundColor: theme.colors.background,
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows.medium,
    },
    placeCard: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: theme.colors.background,
      padding: theme.sizes.lg,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      ...theme.shadows.medium,
    },
    placeCardTitle: {
      fontSize: theme.fonts.sizes.lg,
      fontWeight: '700',
      color: theme.colors.text,
      flex: 1,
    },
    placeCardAddress: {
      fontSize: theme.fonts.sizes.sm,
      color: theme.colors.textLight,
      marginBottom: theme.sizes.lg,
    },
    exploreButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 8,
      paddingVertical: theme.sizes.md,
      alignItems: 'center',
    },
    exploreButtonText: {
      color: '#FFFFFF', // White is typically safe across light/dark themes for buttons
      fontWeight: '600',
      fontSize: theme.fonts.sizes.md,
    },
  };

  return (
    <SafeAreaView style={themedStyles.container} edges={['top']}>
      <StatusBar style="auto" /> {/* Auto will adapt to theme */}
      
      <View style={themedStyles.searchContainer}>
        <View style={themedStyles.searchInputContainer}>
          <Search size={20} color={theme.colors.textLight} style={{ marginRight: theme.sizes.sm }} />
          <TextInput
            style={themedStyles.searchInput}
            placeholder="Search destinations..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor={theme.colors.textLight}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <X size={18} color={theme.colors.textLight} />
            </TouchableOpacity>
          )}
        </View>
        
        {searchResults.length > 0 && (
          <View style={themedStyles.searchResultsContainer}>
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              style={{ padding: theme.sizes.sm }}
            />
          </View>
        )}
      </View>
      
      <MapView
        ref={mapRef}
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation={true}
        showsCompass={true}
        showsMyLocationButton={false}
      >
        {selectedPlace && (
          <Marker
            coordinate={{
              latitude: selectedPlace.geometry.coordinates[1],
              longitude: selectedPlace.geometry.coordinates[0],
            }}
            title={selectedPlace.text}
          />
        )}
      </MapView>
      
      {userLocation && !selectedPlace && (
        <TouchableOpacity 
          style={themedStyles.currentLocationButton}
          onPress={() => {
            mapRef.current?.animateToRegion({
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }, 1000);
          }}
        >
          <Compass size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      )}
      
      <Animated.View 
        style={[
          themedStyles.placeCard,
          {
            transform: [
              {
                translateY: cardAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [200, 0],
                }),
              },
            ],
            opacity: cardAnimation,
          },
        ]}
      >
        {selectedPlace && (
          <>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.sizes.sm }}>
              <Text style={themedStyles.placeCardTitle} numberOfLines={1}>
                {selectedPlace.text}
              </Text>
              <TouchableOpacity onPress={closeSelectedPlace}>
                <X size={20} color={theme.colors.textLight} />
              </TouchableOpacity>
            </View>
            
            <Text style={themedStyles.placeCardAddress} numberOfLines={2}>
              {selectedPlace.place_name}
            </Text>
            
            <TouchableOpacity 
              style={themedStyles.exploreButton}
              onPress={navigateToPlaceDetails}
            >
              <Text style={themedStyles.exploreButtonText}>Explore this destination</Text>
            </TouchableOpacity>
          </>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

// Keep some styles that don't need theming
const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  searchResultTextContainer: {
    marginLeft: 8,
    flex: 1,
  },
  searchResultTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  searchResultSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
});