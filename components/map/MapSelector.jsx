import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Dimensions
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { colors, spacing } from '../../constants/theme';
import { MapPin, X, Search, CheckCircle } from 'lucide-react-native';

// This would typically come from your Mapbox service configuration
// For this example we'll mock a simple search function
const searchLocations = async (query) => {
  // In a real app, this would call your Mapbox geocoding API
  // For now, we'll simulate a delay and return dummy data
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  if (!query.trim()) return [];
  
  // Dummy results for demonstration
  return [
    { 
      id: '1', 
      name: `${query} City Center`, 
      fullName: `${query} City Center, State, Country`,
      coordinates: { 
        latitude: 37.78825 + (Math.random() * 0.02 - 0.01), 
        longitude: -122.4324 + (Math.random() * 0.02 - 0.01) 
      } 
    },
    { 
      id: '2', 
      name: `${query} Downtown`, 
      fullName: `${query} Downtown, State, Country`,
      coordinates: { 
        latitude: 37.78825 + (Math.random() * 0.02 - 0.01), 
        longitude: -122.4324 + (Math.random() * 0.02 - 0.01) 
      } 
    },
    { 
      id: '3', 
      name: `${query} Park`, 
      fullName: `${query} Park, State, Country`,
      coordinates: { 
        latitude: 37.78825 + (Math.random() * 0.02 - 0.01), 
        longitude: -122.4324 + (Math.random() * 0.02 - 0.01) 
      } 
    }
  ];
};

const MapSelector = ({
  visible,
  onClose,
  onSelect,
  initialLocation = '',
  initialCoordinates = { latitude: 37.78825, longitude: -122.4324 }
}) => {
  const mapRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [coordinates, setCoordinates] = useState(initialCoordinates || { 
    latitude: 37.78825, 
    longitude: -122.4324 
  });
  const [loading, setLoading] = useState(false);
  const [region, setRegion] = useState({
    latitude: initialCoordinates?.latitude || 37.78825,
    longitude: initialCoordinates?.longitude || -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  
  useEffect(() => {
    if (visible) {
      setSelectedLocation(initialLocation);
      setCoordinates(initialCoordinates || { latitude: 37.78825, longitude: -122.4324 });
      
      if (initialCoordinates) {
        setRegion({
          latitude: initialCoordinates.latitude,
          longitude: initialCoordinates.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      }
    }
  }, [visible, initialLocation, initialCoordinates]);
  
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    try {
      setLoading(true);
      const results = await searchLocations(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching locations:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSelectLocation = (location) => {
    setSelectedLocation(location.fullName);
    setCoordinates(location.coordinates);
    setSearchResults([]);
    setSearchQuery('');
    Keyboard.dismiss();
    
    // Animate map to the selected location
    mapRef.current?.animateToRegion({
      ...location.coordinates,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    }, 500);
  };
  
  const handleMapPress = (event) => {
    const newCoordinates = event.nativeEvent.coordinate;
    setCoordinates(newCoordinates);
    
    // In a real app, you would call reverse geocoding to get the location name
    setSelectedLocation('Selected Location');
  };
  
  const handleConfirm = () => {
    onSelect(selectedLocation, coordinates);
  };
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={onClose}
          >
            <X size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Location</Text>
        </View>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color={colors.textLight} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for a location"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
              >
                <X size={18} color={colors.textLight} />
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity 
            style={styles.searchButton} 
            onPress={handleSearch}
          >
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>
        
        {/* Search Results */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : searchResults.length > 0 ? (
          <View style={styles.resultsContainer}>
            {searchResults.map(result => (
              <TouchableOpacity
                key={result.id}
                style={styles.resultItem}
                onPress={() => handleSelectLocation(result)}
              >
                <MapPin size={18} color={colors.primary} style={styles.resultIcon} />
                <View style={styles.resultTextContainer}>
                  <Text style={styles.resultTitle}>{result.name}</Text>
                  <Text style={styles.resultSubtitle}>{result.fullName}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}
        
        {/* Map View */}
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={region}
            onPress={handleMapPress}
          >
            {coordinates && (
              <Marker coordinate={coordinates}>
                <MapPin size={30} color={colors.primary} />
              </Marker>
            )}
          </MapView>
        </View>
        
        {/* Selected Location */}
        <View style={styles.selectedLocationContainer}>
          <MapPin size={20} color={colors.primary} style={styles.locationIcon} />
          <Text style={styles.selectedLocationText} numberOfLines={2}>
            {selectedLocation || 'No location selected'}
          </Text>
        </View>
        
        {/* Confirmation Button */}
        <TouchableOpacity
          style={[
            styles.confirmButton,
            !selectedLocation && styles.confirmButtonDisabled
          ]}
          onPress={handleConfirm}
          disabled={!selectedLocation}
        >
          <Text style={styles.confirmButtonText}>Confirm Location</Text>
          <CheckCircle size={20} color={colors.white} style={styles.confirmIcon} />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    padding: spacing.small,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginRight: spacing.large, // To offset the back button and center the title
  },
  searchContainer: {
    flexDirection: 'row',
    padding: spacing.medium,
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    borderRadius: 8,
    paddingHorizontal: spacing.medium,
    height: 44,
  },
  searchIcon: {
    marginRight: spacing.small,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: colors.text,
    fontSize: 16,
  },
  clearButton: {
    padding: spacing.small,
  },
  searchButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: spacing.medium,
    height: 44,
    justifyContent: 'center',
    marginLeft: spacing.small,
  },
  searchButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: spacing.large,
    alignItems: 'center',
  },
  resultsContainer: {
    maxHeight: 200,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  resultIcon: {
    marginRight: spacing.medium,
  },
  resultTextContainer: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  resultSubtitle: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 2,
  },
  mapContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  selectedLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    padding: spacing.medium,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  locationIcon: {
    marginRight: spacing.medium,
  },
  selectedLocationText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  confirmButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    margin: spacing.medium,
    padding: spacing.medium,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: colors.textLight,
  },
  confirmButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginRight: spacing.small,
  },
  confirmIcon: {
    marginLeft: spacing.small,
  },
});

export default MapSelector;