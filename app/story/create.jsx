// app/story/create.jsx
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useState, useContext } from 'react';
import { router } from 'expo-router';
import { AuthContext } from '../../contexts/AuthContext'; // Adjust path as needed
import { useTheme } from '../../contexts/ThemeContext'; // Adjust path as needed
import { Button } from '../../components/ui/Button'; // Adjust imports as needed
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

const CreateStoryScreen = () => {
  const { user } = useContext(AuthContext);
  const { theme } = useTheme();
  const [storyData, setStoryData] = useState({
    title: '',
    content: '',
    location: null,
    photos: [],
    places: [],
    travelType: 'Just Me',
  });
  const [saving, setSaving] = useState(false);

  const handleUpdateField = (field, value) => {
    setStoryData({ ...storyData, [field]: value });
  };

  const handleSave = async () => {
    if (!user) {
      Alert.alert('Login Required', 'You need to login to create a story', [
        { text: 'Go to Login', onPress: () => router.push('/login') },
      ]);
      return;
    }

    if (!storyData.title.trim()) {
      Alert.alert('Missing Information', 'Please add a title for your story');
      return;
    }

    setSaving(true);
    try {
      // Save story to database (implement your saveStory function)
      // await saveStory({ ...storyData, userId: user.uid, createdAt: new Date().toISOString() });
      Alert.alert('Success', 'Story created!', [
        { text: 'OK', onPress: () => router.push('/stories') },
      ]);
    } catch (error) {
      console.error('Error saving story:', error);
      Alert.alert('Error', 'Failed to create story');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={{ backgroundColor: theme.colors.background }}>
      <View className="px-4 py-6">
        <Text className="text-2xl font-bold mb-6" style={{ color: theme.colors.text }}>
          Create Travel Story
        </Text>
        <Card className="mb-6">
          <Input
            label="Title"
            value={storyData.title}
            onChangeText={(text) => handleUpdateField('title', text)}
            placeholder="Enter a catchy title"
          />
          <Input
            label="Content"
            value={storyData.content}
            onChangeText={(text) => handleUpdateField('content', text)}
            placeholder="Share your travel experience..."
            multiline
            numberOfLines={8}
          />
        </Card>
        <Button
          title="Save Story"
          onPress={handleSave}
          mode="primary"
          loading={saving}
          className="mt-2 mb-6"
        />
      </View>
    </ScrollView>
  );
};

export default CreateStoryScreen;