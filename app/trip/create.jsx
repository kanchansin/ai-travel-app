import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { createTrip, uploadImage } from '../../services/firebase';
import { getRecommendations } from '../../services/ai';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import DateTimePicker from '@react-native-community/datetimepicker';

const CreateTrip = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  
  const [tripData, setTripData] = useState({
    title: '',
    location: '',
    description: '',
    travelType: 'Just Me', // Default
    startDate: new Date(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 3)),
    coverImage: null,
    places: []
  });
  
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  
  const handleInputChange = (field, value) => {
    setTripData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleStartDateChange = (event, selectedDate) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setTripData(prev => ({ ...prev, startDate: selectedDate }));
      
      // If end date is before new start date, update end date
      if (tripData.endDate < selectedDate) {
        const newEndDate = new Date(selectedDate);
        newEndDate.setDate(selectedDate.getDate() + 1);
        setTripData(prev => ({ ...prev, endDate: newEndDate }));
      }
    }
  };
  
  const handleEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setTripData(prev => ({ ...prev, endDate: selectedDate }));
    }
  };
  
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access your photos');
      return;
    }
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets[0]) {
        setTripData(prev => ({ ...prev, coverImage: result.assets[0].uri }));
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };
  
  const handleGetRecommendations = async () => {
    if (!tripData.location) {
      Alert.alert('Missing Information', 'Please enter a location to get recommendations');
      return;
    }
    
    setLoadingRecommendations(true);
    
    try {
      const recommendationsData = await getRecommendations(
        tripData.location, 
        tripData.travelType
      );
      setRecommendations(recommendationsData);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      Alert.alert('Error', 'Failed to get recommendations');
    } finally {
      setLoadingRecommendations(false);
    }
  };
  
  const addRecommendedPlace = (place) => {
    setTripData(prev => ({
      ...prev,
      places: [...prev.places, place]
    }));
    
    // Remove from recommendations
    setRecommendations(prev => 
      prev.filter(rec => rec.id !== place.id)
    );
  };
  
  const removePlace = (index) => {
    setTripData(prev => ({
      ...prev,
      places: prev.places.filter((_, i) => i !== index)
    }));
  };
  
  const handleCreateTrip = async () => {
    // Validate inputs
    if (!tripData.title || !tripData.location) {
      Alert.alert('Missing Information', 'Please provide at least a title and location for your trip');
      return;
    }
    
    setLoading(true);
    
    try {
      let coverImageUrl = null;
      
      // Upload cover image if selected
      if (tripData.coverImage) {
        coverImageUrl = await uploadImage(tripData.coverImage, `trips/${user.uid}/${Date.now()}`);
      }
      
      // Create trip in database
      const newTrip = {
        ...tripData,
        coverImage: coverImageUrl,
        userId: user.uid,
        createdAt: new Date(),
      };
      
      const tripId = await createTrip(newTrip);
      
      Alert.alert(
        'Success',
        'Your trip has been created successfully!',
        [{ text: 'OK', onPress: () => router.replace(`/trip/${tripId}`) }]
      );
    } catch (error) {
      console.error('Error creating trip:', error);
      Alert.alert('Error', 'Failed to create trip. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const travelTypes = ['Just Me', 'Friends', 'Family', 'Couple'];
  
  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Create New Trip</Text>
      </View>
      
      {/* Basic Trip Info */}
      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Basic Information</Text>
        
        <Input
          label="Trip Title"
          placeholder="Enter a title for your trip"
          value={tripData.title}
          onChangeText={(text) => handleInputChange('title', text)}
        />
        
        <Input
          label="Location"
          placeholder="City, Country or Region"
          value={tripData.location}
          onChangeText={(text) => handleInputChange('location', text)}
        />
        <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Travel Type</Text>
        <View style={styles.travelTypeContainer}>
          {travelTypes.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.travelTypeButton,
                tripData.travelType === type && { backgroundColor: theme.colors.accent },
              ]}
              onPress={() => handleInputChange('travelType', type)}
            >
              <Ionicons
                name={
                  type === 'Just Me' ? 'person' :
                  type === 'Friends' ? 'people' :
                  type === 'Family' ? 'home' : 'heart'
                }
                size={18}
                color={tripData.travelType === type ? 'white' : theme.colors.text}
              />
              <Text
                style={[
                  styles.travelTypeText,
                  { color: tripData.travelType === type ? 'white' : theme.colors.text }
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.dateContainer}>
          <View style={styles.dateField}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Start Date</Text>
            <TouchableOpacity
              style={[styles.dateButton, { borderColor: theme.colors.border }]}
              onPress={() => setShowStartDatePicker(true)}
            >
              <Text style={{ color: theme.colors.text }}>
                {tripData.startDate.toLocaleDateString()}
              </Text>
              <Ionicons name="calendar-outline" size={18} color={theme.colors.accent} />
            </TouchableOpacity>
            {showStartDatePicker && (
              <DateTimePicker
                value={tripData.startDate}
                mode="date"
                display="default"
                onChange={handleStartDateChange}
                minimumDate={new Date()}
              />
            )}
          </View>
          
          <View style={styles.dateField}>
            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>End Date</Text>
            <TouchableOpacity
              style={[styles.dateButton, { borderColor: theme.colors.border }]}
              onPress={() => setShowEndDatePicker(true)}
            >
              <Text style={{ color: theme.colors.text }}>
                {tripData.endDate.toLocaleDateString()}
              </Text>
              <Ionicons name="calendar-outline" size={18} color={theme.colors.accent} />
            </TouchableOpacity>
            {showEndDatePicker && (
              <DateTimePicker
                value={tripData.endDate}
                mode="date"
                display="default"
                onChange={handleEndDateChange}
                minimumDate={tripData.startDate}
              />
            )}
          </View>
        </View>
        
        <Input
          label="Description"
          placeholder="Tell us about your trip"
          value={tripData.description}
          onChangeText={(text) => handleInputChange('description', text)}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        
        <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Cover Image</Text>
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {tripData.coverImage ? (
            <Image source={{ uri: tripData.coverImage }} style={styles.coverImage} />
          ) : (
            <View style={[styles.imagePlaceholder, { borderColor: theme.colors.border }]}>
              <Ionicons name="image-outline" size={32} color={theme.colors.textSecondary} />
              <Text style={{ color: theme.colors.textSecondary, marginTop: 8 }}>
                Tap to select cover image
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </Card>
      
      {/* Places Section */}
      <Card style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Places to Visit</Text>
          <Button 
            title="Get Recommendations" 
            icon="bulb-outline"
            onPress={handleGetRecommendations}
            loading={loadingRecommendations}
            size="small"
          />
        </View>
        
        {/* Selected Places */}
        {tripData.places.length > 0 ? (
          <View style={styles.placesList}>
            {tripData.places.map((place, index) => (
              <View key={index} style={[styles.placeItem, { borderColor: theme.colors.border }]}>
                <View style={styles.placeInfo}>
                  <View style={styles.placeIconContainer}>
                    <Ionicons 
                      name={
                        place.type === 'restaurant' ? 'restaurant' :
                        place.type === 'attraction' ? 'camera' :
                        place.type === 'hotel' ? 'bed' : 'location'
                      } 
                      size={16} 
                      color={theme.colors.accent} 
                    />
                  </View>
                  <View style={styles.placeTextContainer}>
                    <Text style={[styles.placeName, { color: theme.colors.text }]}>{place.name}</Text>
                    <Text style={[styles.placeAddress, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                      {place.address}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => removePlace(index)}>
                  <Ionicons name="close-circle" size={22} color={theme.colors.danger} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyPlaces}>
            <Ionicons name="navigate-outline" size={32} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              No places added yet. Use the AI to get recommendations based on your travel type.
            </Text>
          </View>
        )}
        
        {/* AI Recommendations */}
        {recommendations && recommendations.length > 0 && (
          <View style={styles.recommendationsContainer}>
            <Text style={[styles.recommendationsTitle, { color: theme.colors.text }]}>
              Recommended Places
            </Text>
            
            {recommendations.map((place, index) => (
              <TouchableOpacity 
                key={index} 
                style={[styles.recommendationItem, { borderColor: theme.colors.border }]}
                onPress={() => addRecommendedPlace(place)}
              >
                <View style={styles.recommendationContent}>
                  <View style={styles.placeIconContainer}>
                    <Ionicons 
                      name={
                        place.type === 'restaurant' ? 'restaurant' :
                        place.type === 'attraction' ? 'camera' :
                        place.type === 'hotel' ? 'bed' : 'location'
                      } 
                      size={16} 
                      color={theme.colors.accent} 
                    />
                  </View>
                  <View style={styles.placeTextContainer}>
                    <Text style={[styles.placeName, { color: theme.colors.text }]}>{place.name}</Text>
                    <Text style={[styles.placeDescription, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                      {place.description}
                    </Text>
                  </View>
                </View>
                <Ionicons name="add-circle" size={24} color={theme.colors.accent} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </Card>
      
      {/* Create Button */}
      <Button
        title="Create Trip"
        icon="paper-plane"
        onPress={handleCreateTrip}
        loading={loading}
        style={styles.createButton}
      />
    </ScrollView>
  );
}

export default CreateTrip;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  travelTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  travelTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
  },
  travelTypeText: {
    marginLeft: 6,
    fontSize: 14,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateField: {
    flex: 1,
    marginRight: 8,
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  imagePicker: {
    marginBottom: 16,
  },
  coverImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  imagePlaceholder: {
    width: '100%',
    height: 160,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placesList: {
    marginBottom: 16,
  },
  placeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  placeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  placeIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  placeTextContainer: {
    flex: 1,
  },
  placeName: {
    fontSize: 16,
    fontWeight: '500',
  },
  placeAddress: {
    fontSize: 14,
  },
  placeDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  emptyPlaces: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 8,
  },
  recommendationsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  recommendationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  recommendationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  createButton: {
    marginTop: 8,
  }
});