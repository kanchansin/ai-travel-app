// story/edit.jsx

import React, { useState, useEffect, useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

// Import components
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import MapView from '../../components/map/MapView';

// Import context
import { AuthContext } from '../../contexts/AuthContext';
import { ThemeContext } from '../../contexts/ThemeContext';

// Import services
import { getStory, updateStory, uploadImage } from '../../services/firebase';
import { searchLocations } from '../../services/mapbox';

import{ useTheme } from '../../contexts/ThemeContext';

const EditStoryScreen = () => {
  const { id } = useLocalSearchParams();
  const { user } = useContext(AuthContext);
  const { theme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [storyData, setStoryData] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [newCoverImage, setNewCoverImage] = useState(null);
  const [newPhotos, setNewPhotos] = useState([]);
  const [locationSearch, setLocationSearch] = useState('');
  const [locationResults, setLocationResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      Alert.alert('Login Required', 'You need to login to edit a story', [
        { text: 'Go to Login', onPress: () => router.push('/login') }
      ]);
      return;
    }

    const loadStoryData = async () => {
      try {
        if (!id) {
          Alert.alert('Error', 'Story ID is missing');
          router.back();
          return;
        }

        const story = await getStory(id);
        if (!story) {
          Alert.alert('Error', 'Story not found');
          router.back();
          return;
        }

        // Check if user is the owner of this story
        if (story.userId !== user.uid) {
          Alert.alert('Unauthorized', 'You do not have permission to edit this story');
          router.back();
          return;
        }

        setStoryData(story);
        setCoverImage(story.coverImage);
      } catch (error) {
        console.error('Error fetching story:', error);
        Alert.alert('Error', 'Failed to load story data');
      } finally {
        setLoading(false);
      }
    };

    loadStoryData();
    
    // Request camera permissions
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Permission to access camera roll is required!');
      }
    })();
  }, [id, user]);

  const handleUpdateField = (field, value) => {
    setStoryData({
      ...storyData,
      [field]: value,
    });
  };

  const handleSearchLocation = async () => {
    if (!locationSearch.trim()) return;
    
    setSearching(true);
    try {
      const results = await searchLocations(locationSearch);
      setLocationResults(results);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Search Error', 'Failed to find locations');
    } finally {
      setSearching(false);
    }
  };

  const handleSelectLocation = (location) => {
    setStoryData({
      ...storyData,
      location: {
        name: location.name || location.placeName,
        coordinates: location.coordinates,
      }
    });
    setLocationResults([]);
    setLocationSearch('');
  };

  const handleAddPlace = (place) => {
    setStoryData({
      ...storyData,
      places: [...(storyData.places || []), place]
    });
  };

  const handleRemovePlace = (index) => {
    const updatedPlaces = [...storyData.places];
    updatedPlaces.splice(index, 1);
    setStoryData({
      ...storyData,
      places: updatedPlaces
    });
  };

  const pickCoverImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setNewCoverImage(uri);
        setCoverImage(uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setNewPhotos([...newPhotos, uri]);
        setStoryData({
          ...storyData,
          photos: [...(storyData.photos || []), uri]
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const handleRemovePhoto = (index) => {
    // Check if it's a new photo or an existing one
    const isNewPhoto = newPhotos.includes(storyData.photos[index]);
    
    const updatedPhotos = [...storyData.photos];
    updatedPhotos.splice(index, 1);
    
    setStoryData({
      ...storyData,
      photos: updatedPhotos
    });
    
    if (isNewPhoto) {
      const updatedNewPhotos = [...newPhotos];
      const newPhotoIndex = newPhotos.indexOf(storyData.photos[index]);
      updatedNewPhotos.splice(newPhotoIndex, 1);
      setNewPhotos(updatedNewPhotos);
    }
  };

  const validateStory = () => {
    if (!storyData.title.trim()) {
      Alert.alert('Missing Information', 'Please add a title for your story');
      return false;
    }
    
    if (!storyData.content.trim()) {
      Alert.alert('Missing Information', 'Please add content to your story');
      return false;
    }
    
    if (!storyData.location) {
      Alert.alert('Missing Information', 'Please select a location for your story');
      return false;
    }
    
    return true;
  };

  const handleSave = async () => {
    if (!validateStory()) return;
    
    setSaving(true);
    try {
      // Upload new cover image if selected
      let coverImageUrl = storyData.coverImage;
      if (newCoverImage) {
        coverImageUrl = await uploadImage(newCoverImage, `stories/${user.uid}/${Date.now()}-cover`);
      }
      
      // Upload new photos
      let photoUrls = [...storyData.photos];
      for (const photo of newPhotos) {
        // Check if this photo is still in the list (wasn't removed)
        if (photoUrls.includes(photo)) {
          const index = photoUrls.indexOf(photo);
          const url = await uploadImage(photo, `stories/${user.uid}/${Date.now()}-${index}`);
          photoUrls[index] = url;
        }
      }
      
      // Create updated story object
      const updatedStory = {
        ...storyData,
        coverImage: coverImageUrl,
        photos: photoUrls,
        updatedAt: new Date().toISOString(),
      };
      
      // Save to database
      await updateStory(id, updatedStory);
      
      Alert.alert('Success', 'Your travel story has been updated!', [
        { text: 'View Story', onPress: () => router.push(`/story/${id}`) }
      ]);
    } catch (error) {
      console.error('Error updating story:', error);
      Alert.alert('Error', 'Failed to update your story');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text className="mt-4 text-lg" style={{ color: theme.colors.text }}>Loading story...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: theme.colors.background }}>
      <View className="px-4 py-6">
        <Text className="text-2xl font-bold mb-6" style={{ color: theme.colors.text }}>
          Edit Travel Story
        </Text>

        {/* Basic Story Info */}
        <Card className="mb-6">
          <Text className="text-lg font-semibold mb-4" style={{ color: theme.colors.text }}>
            Story Details
          </Text>
          
          <Input
            label="Title"
            value={storyData.title}
            onChangeText={(text) => handleUpdateField('title', text)}
            placeholder="Enter a catchy title for your story"
          />
          
          <View className="mb-4">
            <Text className="mb-2 font-medium" style={{ color: theme.colors.text }}>
              Cover Image
            </Text>
            
            <TouchableOpacity
              onPress={pickCoverImage}
              className="h-40 rounded-lg justify-center items-center"
              style={{ backgroundColor: theme.colors.cardBackground }}
            >
              {coverImage ? (
                <Image source={{ uri: coverImage }} className="w-full h-full rounded-lg" resizeMode="cover" />
              ) : (
                <>
                  <MaterialIcons name="add-photo-alternate" size={36} color={theme.colors.textSecondary} />
                  <Text className="mt-2" style={{ color: theme.colors.textSecondary }}>
                    Add Cover Image
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
          
          <View className="mb-4">
            <Text className="mb-2 font-medium" style={{ color: theme.colors.text }}>
              Travel Type
            </Text>
            <View className="flex-row flex-wrap">
              {['Just Me', 'Friends', 'Family', 'Couple'].map((type) => (
                <TouchableOpacity
                  key={type}
                  className={`mr-2 mb-2 rounded-full px-4 py-2 ${
                    storyData.travelType === type ? 'bg-opacity-100' : 'bg-opacity-30'
                  }`}
                  style={{ 
                    backgroundColor: storyData.travelType === type 
                      ? theme.colors.primary 
                      : theme.colors.cardBackground
                  }}
                  onPress={() => handleUpdateField('travelType', type)}
                >
                  <Text
                    style={{ 
                      color: storyData.travelType === type 
                        ? theme.colors.buttonText 
                        : theme.colors.text
                    }}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <Input
            label="Story Content"
            value={storyData.content}
            onChangeText={(text) => handleUpdateField('content', text)}
            placeholder="Share your travel experience..."
            multiline
            numberOfLines={8}
          />
        </Card>

        {/* Location Section */}
        <Card className="mb-6">
          <Text className="text-lg font-semibold mb-4" style={{ color: theme.colors.text }}>
            Location
          </Text>
          
          {storyData.location ? (
            <View>
              <View className="h-40 rounded-lg overflow-hidden mb-2">
                <MapView
                  initialRegion={{
                    latitude: storyData.location.coordinates.latitude,
                    longitude: storyData.location.coordinates.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                  }}
                  markers={[
                    {
                      id: 'story-location',
                      coordinate: storyData.location.coordinates,
                      title: storyData.location.name,
                    }
                  ]}
                />
              </View>
              
              <View className="flex-row justify-between items-center">
                <Text className="font-medium" style={{ color: theme.colors.text }}>
                  {storyData.location.name}
                </Text>
                
                <TouchableOpacity 
                  onPress={() => handleUpdateField('location', null)}
                  className="p-2"
                >
                  <MaterialIcons name="close" size={20} color={theme.colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View>
              <View className="flex-row mb-2">
                <Input
                  containerClassName="flex-1 mr-2"
                  value={locationSearch}
                  onChangeText={setLocationSearch}
                  placeholder="Search for a location"
                />
                <Button
                  title="Search"
                  onPress={handleSearchLocation}
                  loading={searching}
                  mode="primary"
                  compact
                />
              </View>
              
              {locationResults.length > 0 && (
                <View className="mb-2">
                  {locationResults.map((location, index) => (
                    <TouchableOpacity
                      key={index}
                      className="p-2 border-b border-gray-200"
                      onPress={() => handleSelectLocation(location)}
                    >
                      <Text style={{ color: theme.colors.text }}>
                        {location.name || location.placeName}
                      </Text>
                      {location.address && (
                        <Text className="text-sm" style={{ color: theme.colors.textSecondary }}>
                          {location.address}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}
        </Card>

        {/* Places Section */}
        <Card className="mb-6">
          <Text className="text-lg font-semibold mb-4" style={{ color: theme.colors.text }}>
            Places Visited
          </Text>
          
          {storyData.places && storyData.places.length > 0 ? (
            storyData.places.map((place, index) => (
              <View key={index} className="mb-3 pb-3 border-b border-gray-200 flex-row justify-between">
                <View className="flex-1">
                  <Text className="font-medium" style={{ color: theme.colors.text }}>
                    {place.name}
                  </Text>
                  <Input
                    placeholder="Add notes about this place"
                    value={place.notes || ''}
                    onChangeText={(text) => {
                      const updatedPlaces = [...storyData.places];
                      updatedPlaces[index] = { ...place, notes: text };
                      handleUpdateField('places', updatedPlaces);
                    }}
                    multiline
                  />
                </View>
                
                <TouchableOpacity 
                  className="p-2" 
                  onPress={() => handleRemovePlace(index)}
                >
                  <MaterialIcons name="close" size={20} color={theme.colors.error} />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text className="italic" style={{ color: theme.colors.textSecondary }}>
              No places added yet. Add places to enhance your story.
            </Text>
          )}
          
          {/* Add Place Manually Button */}
          {storyData.location && (
            <Button
              title="Add Place"
              onPress={() => router.push({
                pathname: '/place/search',
                params: { 
                  latitude: storyData.location.coordinates.latitude,
                  longitude: storyData.location.coordinates.longitude,
                  onSelect: (place) => handleAddPlace(place)
                }
              })}
              mode="secondary"
            />
          )}
        </Card>

        {/* Photos Section */}
        <Card className="mb-6">
          <Text className="text-lg font-semibold mb-4" style={{ color: theme.colors.text }}>
            Photo Gallery
          </Text>
          
          <View className="flex-row flex-wrap">
            {storyData.photos && storyData.photos.map((photo, index) => (
              <View key={index} className="w-1/3 p-1 relative">
                <Image 
                  source={{ uri: photo }} 
                  className="w-full h-24 rounded-lg" 
                  resizeMode="cover" 
                />
                <TouchableOpacity
                  onPress={() => handleRemovePhoto(index)}
                  className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1"
                >
                  <MaterialIcons name="close" size={16} color="white" />
                </TouchableOpacity>
              </View>
            ))}
            
            <TouchableOpacity
              onPress={pickImage}
              className="w-1/3 p-1"
            >
              <View 
                className="w-full h-24 rounded-lg justify-center items-center"
                style={{ backgroundColor: theme.colors.cardBackground }}
              >
                <MaterialIcons name="add-photo-alternate" size={24} color={theme.colors.textSecondary} />
                <Text className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
                  Add Photo
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Action Button */}
        <Button
          title="Save Changes"
          onPress={handleSave}
          mode="primary"
          loading={saving}
          className="mt-2 mb-6"
        />
      </View>
    </ScrollView>
  );
};

export default EditStoryScreen;