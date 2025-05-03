import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  ScrollView, 
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Camera, 
  X,
  Tag,
  Globe,
  DollarSign,
  Save
} from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { getTripById, updateTrip, uploadTripImage } from '../../services/trips';
import Button from '../../components/ui/Button';
import { useTheme } from '../../contexts/ThemeContext';
import MapSelector from '../../components/map/MapSelector';
import TagSelector from '../../components/ui/TagSelector';

// Constants for trip types, budget ranges and activity types
const TRIP_TYPES = ["Just Me", "Friends", "Family", "Couple"];
const BUDGET_RANGES = ["Budget", "Moderate", "Luxury"];
const ACTIVITY_TYPES = [
  "Sightseeing", "Food", "Adventure", "Relaxation", 
  "Culture", "Nightlife", "Shopping", "Nature"
];

// Fallback spacing object
const DEFAULT_SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  layout: 16,
};

export default function EditTrip() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [trip, setTrip] = useState(null);
  
  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [tripType, setTripType] = useState('Just Me');
  const [budget, setBudget] = useState('Moderate');
  const [activities, setActivities] = useState([]);
  const [notes, setNotes] = useState('');
  const { theme } = useTheme();

  // Debug theme to check its structure
  console.log('Theme in EditTrip:', JSON.stringify(theme, null, 2));
  
  // Date picker states
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  
  // Map selector visibility
  const [showMapSelector, setShowMapSelector] = useState(false);
  
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (id) {
      loadTripData();
    } else {
      setLoading(false);
    }
  }, [id, user]);
  
  const loadTripData = async () => {
    try {
      setLoading(true);
      const tripData = await getTripById(id);
      
      // Check if user is the owner of this trip
      if (tripData.userId !== user.uid) {
        Alert.alert(
          'Access Denied', 
          'You do not have permission to edit this trip.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
        return;
      }
      
      setTrip(tripData);
      
      // Populate form with trip data
      setTitle(tripData.title || '');
      setDescription(tripData.description || '');
      setLocation(tripData.location || '');
      setCoordinates(tripData.coordinates || null);
      setImageUrl(tripData.imageUrl || '');
      setStartDate(tripData.startDate ? new Date(tripData.startDate) : new Date());
      setEndDate(tripData.endDate ? new Date(tripData.endDate) : new Date());
      setTripType(tripData.tripType || 'Just Me');
      setBudget(tripData.budget || 'Moderate');
      setActivities(tripData.activities || []);
      setNotes(tripData.notes || '');
      
    } catch (error) {
      console.error('Error loading trip data:', error);
      Alert.alert(
        'Error', 
        'Failed to load trip information. Please try again.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } finally {
      setLoading(false);
    }
  };
  
  const handleSave = async () => {
    // Validate form
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a trip title');
      return;
    }
    
    if (!location.trim()) {
      Alert.alert('Error', 'Please enter a location');
      return;
    }
    
    try {
      setSaving(true);
      
      // Prepare trip data
      const updatedTripData = {
        title,
        description,
        location,
        coordinates,
        imageUrl,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        tripType,
        budget,
        activities,
        notes,
        updatedAt: new Date().toISOString()
      };
      
      // Update trip in database
      await updateTrip(id, updatedTripData);
      
      Alert.alert(
        'Success',
        'Trip updated successfully!',
        [{ text: 'OK', onPress: () => router.push(`/trip/${id}`) }]
      );
    } catch (error) {
      console.error('Error updating trip:', error);
      Alert.alert('Error', 'Failed to update trip. Please try again.');
    } finally {
      setReturning(false);
    }
  };
  
  const handleChangeImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'You need to allow access to your photos to change the trip image.');
      return;
    }
    
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    
    if (!pickerResult.canceled) {
      try {
        // Show loading state
        setSaving(true);
        
        // Upload the image and get URL
        const url = await uploadTripImage(user.uid, id, pickerResult.assets[0].uri);
        
        // Update state with new image URL
        setImageUrl(url);
      } catch (error) {
        console.error('Error uploading image:', error);
        Alert.alert('Error', 'Failed to upload image. Please try again.');
      } finally {
        setSaving(false);
      }
    }
  };
  
  const handleStartDateChange = (event, selectedDate) => {
    setShowStartDatePicker(false);
    
    if (selectedDate) {
      setStartDate(selectedDate);
      
      // If start date is after end date, update end date too
      if (selectedDate > endDate) {
        setEndDate(selectedDate);
      }
    }
  };
  
  const handleEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(false);
    
    if (selectedDate) {
      // Ensure end date is not before start date
      if (selectedDate >= startDate) {
        setEndDate(selectedDate);
      } else {
        Alert.alert('Invalid Date', 'End date cannot be before start date');
      }
    }
  };
  
  const handleLocationSelect = (selectedLocation, selectedCoordinates) => {
    setLocation(selectedLocation);
    setCoordinates(selectedCoordinates);
    setShowMapSelector(false);
  };
  
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Component for selecting trip type
  const TripTypeSelector = () => (
    <View style={styles.selectorContainer}>
      {TRIP_TYPES.map((type) => (
        <TouchableOpacity
          key={type}
          style={[
            styles.selectorItem,
            tripType === type && styles.selectorItemActive
          ]}
          onPress={() => setTripType(type)}
        >
          <Text 
            style={[
              styles.selectorText,
              tripType === type && styles.selectorTextActive
            ]}
          >
            {type}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
  
  // Component for selecting budget
  const BudgetSelector = () => (
    <View style={styles.selectorContainer}>
      {BUDGET_RANGES.map((range) => (
        <TouchableOpacity
          key={range}
          style={[
            styles.selectorItem,
            budget === range && styles.selectorItemActive
          ]}
          onPress={() => setBudget(range)}
        >
          <Text 
            style={[
              styles.selectorText,
              budget === range && styles.selectorTextActive
            ]}
          >
            {range}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const styles = useMemo(() => {
    // Ensure spacing is always defined
    const spacing = theme?.spacing || DEFAULT_SPACING;

    console.log('Spacing in useMemo:', spacing);

    return StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: theme?.colors?.background || '#FFFFFF',
      },
      loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
      header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: theme?.colors?.gray?.[200] || '#EDF2F7',
      },
      backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme?.colors?.gray?.[100] || '#F7FAFC',
      },
      headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme?.colors?.gray?.[800] || '#2D3748',
      },
      saveButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme?.colors?.primary || '#191970',
      },
      saveButtonDisabled: {
        opacity: 0.7,
      },
      scrollContent: {
        padding: spacing.lg,
        paddingBottom: spacing.xl * 2,
      },
      imageContainer: {
        position: 'relative',
        height: 200,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: spacing.lg,
      },
      tripImage: {
        width: '100%',
        height: '100%',
      },
      imagePlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: theme?.colors?.gray?.[200] || '#EDF2F7',
        justifyContent: 'center',
        alignItems: 'center',
      },
      imagePlaceholderText: {
        marginTop: spacing.xs,
        color: theme?.colors?.gray?.[500] || '#A0AEC0',
        fontWeight: '500',
      },
      editImageButton: {
        position: 'absolute',
        bottom: spacing.sm,
        right: spacing.sm,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: theme?.colors?.primary || '#191970',
        justifyContent: 'center',
        alignItems: 'center',
      },
      inputGroup: {
        marginBottom: spacing.lg,
      },
      label: {
        fontSize: 16,
        fontWeight: '600',
        color: theme?.colors?.gray?.[700] || '#4A5568',
        marginBottom: spacing.xs,
      },
      input: {
        backgroundColor: theme?.colors?.white || '#FFFFFF',
        borderWidth: 1,
        borderColor: theme?.colors?.gray?.[300] || '#E2E8F0',
        borderRadius: 8,
        padding: spacing.md,
        fontSize: 16,
        color: theme?.colors?.gray?.[800] || '#2D3748',
      },
      textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
      },
      locationSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme?.colors?.white || '#FFFFFF',
        borderWidth: 1,
        borderColor: theme?.colors?.gray?.[300] || '#E2E8F0',
        borderRadius: 8,
        padding: spacing.md,
      },
      locationText: {
        marginLeft: spacing.sm,
        fontSize: 16,
        color: theme?.colors?.gray?.[800] || '#2D3748',
      },
      dateContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.lg,
      },
      dateInputGroup: {
        width: '48%',
      },
      dateSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme?.colors?.white || '#FFFFFF',
        borderWidth: 1,
        borderColor: theme?.colors?.gray?.[300] || '#E2E8F0',
        borderRadius: 8,
        padding: spacing.md,
      },
      dateText: {
        marginLeft: spacing.sm,
        fontSize: 14,
        color: theme?.colors?.gray?.[800] || '#2D3748',
      },
      tripTypeSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
      },
      sectionText: {
        marginLeft: spacing.sm,
        fontSize: 14,
        color: theme?.colors?.gray?.[600] || '#718096',
      },
      selectorContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
      },
      selectorItem: {
        backgroundColor: theme?.colors?.gray?.[100] || '#F7FAFC',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: 20,
        marginRight: spacing.sm,
        marginBottom: spacing.sm,
      },
      selectorItemActive: {
        backgroundColor: theme?.colors?.primary || '#191970',
      },
      selectorText: {
        color: theme?.colors?.gray?.[700] || '#4A5568',
        fontWeight: '500',
      },
      selectorTextActive: {
        color: theme?.colors?.white || '#FFFFFF',
      },
      saveChangesButton: {
        marginTop: spacing.md,
      },
    });
  }, [theme, tripType, budget]);
  
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color={theme?.colors?.primary || '#191970'} />
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <Stack.Screen 
        options={{
          headerShown: false,
        }} 
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={theme?.colors?.gray?.[700] || '#4A5568'} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Edit Trip</Text>
        
        <TouchableOpacity 
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={theme?.colors?.white || '#FFFFFF'} />
          ) : (
            <Save size={20} color={theme?.colors?.white || '#FFFFFF'} />
          )}
        </TouchableOpacity>
      </View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Image Selector */}
          <TouchableOpacity 
            style={styles.imageContainer}
            onPress={handleChangeImage}
          >
            {imageUrl ? (
              <Image 
                source={{ uri: imageUrl }} 
                style={styles.tripImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Camera size={40} color={theme?.colors?.gray?.[400] || '#CBD5E0'} />
                <Text style={styles.imagePlaceholderText}>
                  Add Trip Photo
                </Text>
              </View>
            )}
            
            <View style={styles.editImageButton}>
              <Camera size={18} color={theme?.colors?.white || '#FFFFFF'} />
            </View>
          </TouchableOpacity>
          
          {/* Trip Title */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Trip Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter trip title"
              placeholderTextColor={theme?.colors?.gray?.[400] || '#CBD5E0'}
            />
          </View>
          
          {/* Trip Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe your trip (optional)"
              placeholderTextColor={theme?.colors?.gray?.[400] || '#CBD5E0'}
              multiline
              numberOfLines={4}
            />
          </View>
          
          {/* Location */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location</Text>
            <TouchableOpacity
              style={styles.locationSelector}
              onPress={() => setShowMapSelector(true)}
            >
              <MapPin size={20} color={theme?.colors?.primary || '#191970'} />
              <Text style={styles.locationText}>
                {location || 'Select location'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Date Range */}
          <View style={styles.dateContainer}>
            {/* Start Date */}
            <View style={styles.dateInputGroup}>
              <Text style={styles.label}>Start Date</Text>
              <TouchableOpacity
                style={styles.dateSelector}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Calendar size={20} color={theme?.colors?.primary || '#191970'} />
                <Text style={styles.dateText}>{formatDate(startDate)}</Text>
              </TouchableOpacity>
            </View>
            
            {/* End Date */}
            <View style={styles.dateInputGroup}>
              <Text style={styles.label}>End Date</Text>
              <TouchableOpacity
                style={styles.dateSelector}
                onPress={() => setShowEndDatePicker(true)}
              >
                <Calendar size={20} color={theme?.colors?.primary || '#191970'} />
                <Text style={styles.dateText}>{formatDate(endDate)}</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Trip Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Trip Type</Text>
            <View style={styles.tripTypeSection}>
              <Users size={20} color={theme?.colors?.primary || '#191970'} />
              <Text style={styles.sectionText}>Who's going?</Text>
            </View>
            <TripTypeSelector />
          </View>
          
          {/* Budget */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Budget</Text>
            <View style={styles.tripTypeSection}>
              <DollarSign size={20} color={theme?.colors?.primary || '#191970'} />
              <Text style={styles.sectionText}>What's your budget?</Text>
            </View>
            <BudgetSelector />
          </View>
          
          {/* Activities */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Activities</Text>
            <View style={styles.tripTypeSection}>
              <Tag size={20} color={theme?.colors?.primary || '#191970'} />
              <Text style={styles.sectionText}>What do you want to do?</Text>
            </View>
            <TagSelector
              items={ACTIVITY_TYPES}
              selectedItems={activities}
              onSelectItem={(activity) => {
                if (activities.includes(activity)) {
                  setActivities(activities.filter(a => a !== activity));
                } else {
                  setActivities([...activities, activity]);
                }
              }}
            />
          </View>
          
          {/* Notes */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Any additional notes? (optional)"
              placeholderTextColor={theme?.colors?.gray?.[400] || '#CBD5E0'}
              multiline
              numberOfLines={4}
            />
          </View>
          
          {/* Save Button */}
          <Button
            title="Save Changes"
            onPress={handleSave}
            style={styles.saveChangesButton}
            loading={saving}
          />
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* Date Pickers */}
      {showStartDatePicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={handleStartDateChange}
          minimumDate={new Date()}
        />
      )}
      
      {showEndDatePicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={handleEndDateChange}
          minimumDate={startDate}
        />
      )}
      
      {/* Map Location Selector Modal */}
      {showMapSelector && (
        <MapSelector
          visible={showMapSelector}
          onClose={() => setShowMapSelector(false)}
          onSelect={handleLocationSelect}
          initialLocation={location}
          initialCoordinates={coordinates}
        />
      )}
    </SafeAreaView>
  );
}