import React, { useState, useEffect, useRef, useMemo } from 'react';
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
import { useTheme } from '../../contexts/ThemeContext';
import { MapPin, X, Search, CheckCircle } from 'lucide-react-native';

// Mock search function (unchanged)
const searchLocations = async (query) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  if (!query.trim()) return [];
  
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
  const { theme } = useTheme();
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
    
    mapRef.current?.animateToRegion({
      ...location.coordinates,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    }, 500);
  };
  
  const handleMapPress = (event) => {
    const newCoordinates = event.nativeEvent.coordinate;
    setCoordinates(newCoordinates);
    setSelectedLocation('Selected Location');
  };
  
  const handleConfirm = () => {
    onSelect(selectedLocation, coordinates);
  };

  const { width } = Dimensions.get('window');

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.white,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    closeButton: {
      padding: theme.spacing.sm,
    },
    headerTitle: {
      flex: 1,
      textAlign: 'center',
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginRight: theme.spacing.lg, // To offset the back button and center the title
    },
    searchContainer: {
      flexDirection: 'row',
      padding: theme.spacing.md,
      alignItems: 'center',
    },
    searchInputContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.gray[100], // Replaced backgroundLight
      borderRadius: 8,
      paddingHorizontal: theme.spacing.md,
      height: 44,
    },
    searchIcon: {
      marginRight: theme.spacing.sm,
    },
    searchInput: {
      flex: 1,
      height: '100%',
      color: theme.colors.text,
      fontSize: 16,
    },
    clearButton: {
      padding: theme.spacing.sm,
    },
    searchButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 8,
      paddingHorizontal: theme.spacing.md,
      height: 44,
      justifyContent: 'center',
      marginLeft: theme.spacing.sm,
    },
    searchButtonText: {
      color: theme.colors.white,
      fontWeight: '600',
    },
    loadingContainer: {
      padding: theme.spacing.lg,
      alignItems: 'center',
    },
    resultsContainer: {
      maxHeight: 200,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    resultItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.gray[200], // Replaced borderLight
    },
    resultIcon: {
      marginRight: theme.spacing.md,
    },
    resultTextContainer: {
      flex: 1,
    },
    resultTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.text,
    },
    resultSubtitle: {
      fontSize: 14,
      color: theme.colors.textLight,
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
      backgroundColor: theme.colors.gray[100], // Replaced backgroundLight
      padding: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    locationIcon: {
      marginRight: theme.spacing.md,
    },
    selectedLocationText: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.text,
    },
    confirmButton: {
      flexDirection: 'row',
      backgroundColor: theme.colors.primary,
      margin: theme.spacing.md,
      padding: theme.spacing.md,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    confirmButtonDisabled: {
      backgroundColor: theme.colors.textLight,
    },
    confirmButtonText: {
      color: theme.colors.white,
      fontSize: 16,
      fontWeight: '600',
      marginRight: theme.spacing.sm,
    },
    confirmIcon: {
      marginLeft: theme.spacing.sm,
    },
  }), [theme, width]);
  
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
            <X size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Location</Text>
        </View>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color={theme.colors.textLight} style={styles.searchIcon} />
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
                <X size={18} color={theme.colors.textLight} />
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
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : searchResults.length > 0 ? (
          <View style={styles.resultsContainer}>
            {searchResults.map(result => (
              <TouchableOpacity
                key={result.id}
                style={styles.resultItem}
                onPress={() => handleSelectLocation(result)}
              >
                <MapPin size={18} color={theme.colors.primary} style={styles.resultIcon} />
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
                <MapPin size={30} color={theme.colors.primary} />
              </Marker>
            )}
          </MapView>
        </View>
        
        {/* Selected Location */}
        <View style={styles.selectedLocationContainer}>
          <MapPin size={20} color={theme.colors.primary} style={styles.locationIcon} />
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
          <CheckCircle size={20} color={theme.colors.white} style={styles.confirmIcon} />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default MapSelector;