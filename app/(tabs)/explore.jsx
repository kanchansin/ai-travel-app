import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Animated, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Search, X, Compass, MapPin } from 'lucide-react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { colors, spacing } from '../../constants/theme';
import { searchPlaces, getPlaceDetails } from '../../services/mapbox';

const { width } = Dimensions.get('window');

export default function Explore() {
  const router = useRouter();
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
      <MapPin size={18} color={colors.gray[600]} />
      <View style={styles.searchResultTextContainer}>
        <Text style={styles.searchResultTitle} numberOfLines={1}>
          {item.text}
        </Text>
        <Text style={styles.searchResultSubtitle} numberOfLines={1}>
          {item.place_name.replace(`${item.text}, `, '')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={colors.gray[500]} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search destinations..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor={colors.gray[400]}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <X size={18} color={colors.gray[500]} />
            </TouchableOpacity>
          )}
        </View>
        
        {searchResults.length > 0 && (
          <View style={styles.searchResultsContainer}>
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              style={styles.searchResultsList}
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
          style={styles.currentLocationButton}
          onPress={() => {
            mapRef.current?.animateToRegion({
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }, 1000);
          }}
        >
          <Compass size={24} color={colors.primary} />
        </TouchableOpacity>
      )}
      
      <Animated.View 
        style={[
          styles.placeCard,
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
            <View style={styles.placeCardHeader}>
              <Text style={styles.placeCardTitle} numberOfLines={1}>
                {selectedPlace.text}
              </Text>
              <TouchableOpacity onPress={closeSelectedPlace}>
                <X size={20} color={colors.gray[600]} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.placeCardAddress} numberOfLines={2}>
              {selectedPlace.place_name}
            </Text>
            
            <TouchableOpacity 
              style={styles.exploreButton}
              onPress={navigateToPlaceDetails}
            >
              <Text style={styles.exploreButtonText}>Explore this destination</Text>
            </TouchableOpacity>
          </>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    padding: spacing.md,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.gray[800],
  },
  searchResultsContainer: {
    backgroundColor: colors.white,
    borderRadius: 8,
    marginTop: spacing.xs,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchResultsList: {
    padding: spacing.sm,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  searchResultTextContainer: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  searchResultTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.gray[800],
  },
  searchResultSubtitle: {
    fontSize: 14,
    color: colors.gray[600],
    marginTop: 2,
  },
  map: {
    flex: 1,
  },
  currentLocationButton: {
    position: 'absolute',
    bottom: 100,
    right: spacing.md,
    backgroundColor: colors.white,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  placeCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 10,
  },
  placeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  placeCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray[800],
    flex: 1,
  },
  placeCardAddress: {
    fontSize: 14,
    color: colors.gray[600],
    marginBottom: spacing.lg,
  },
  exploreButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  exploreButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 16,
  },
});