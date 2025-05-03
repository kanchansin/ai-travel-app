import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  RefreshControl, 
  Alert 
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { 
  Settings, 
  LogOut, 
  MapPin, 
  Edit2, 
  Camera, 
  User, 
  Mail, 
  Phone,
  Globe
} from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { getUserProfile, updateUserProfile, uploadProfileImage } from '../../services/users';
import Button from '../../components/ui/Button';
import TripCard from '../../components/trip/TripCard';
import StoryCard from '../../components/story/StoryCard';
import { getUserTrips } from '../../services/trips';
import { getUserStories } from '../../services/stories';

const Profile = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [trips, setTrips] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('trips');
  const { theme } = useTheme();
    
  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      router.replace('/login');
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch user profile data
      const userData = await getUserProfile(user.uid);
      setProfile(userData);
      
      // Fetch user trips
      const userTrips = await getUserTrips(user.uid);
      setTrips(userTrips);
      
      // Fetch user stories
      const userStories = await getUserStories(user.uid);
      setStories(userStories);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadUserData();
  };

  const handleLogout = async () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Log Out', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/login');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to log out. Please try again.');
            }
          }
        },
      ]
    );
  };

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  const handleChangeProfileImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'You need to allow access to your photos to change your profile picture.');
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!pickerResult.canceled) {
      try {
        // Upload the image and get the URL
        const imageUrl = await uploadProfileImage(user.uid, pickerResult.assets[0].uri);
        
        // Update the profile with the new image URL
        await updateUserProfile(user.uid, { photoURL: imageUrl });
        
        // Update local state
        setProfile({
          ...profile,
          photoURL: imageUrl
        });
      } catch (error) {
        console.error('Error updating profile image:', error);
        Alert.alert('Error', 'Failed to update profile picture. Please try again.');
      }
    }
  };

  const navigateToTrip = (tripId) => {
    router.push(`/trip/${tripId}`);
  };

  const navigateToStory = (storyId) => {
    router.push(`/story/${storyId}`);
  };

  const navigateToSettings = () => {
    router.push('/settings');
  };

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.colors.gray[800],
    },
    headerActions: {
      flexDirection: 'row',
    },
    headerButton: {
      marginLeft: theme.spacing.md,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.gray[100],
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollContent: {
      paddingBottom: 40,
    },
    profileHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
    },
    avatarContainer: {
      position: 'relative',
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: theme.colors.gray[200],
    },
    editAvatarButton: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: theme.colors.primary,
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.colors.white,
    },
    profileInfo: {
      flex: 1,
      marginLeft: theme.spacing.md,
    },
    profileName: {
      fontSize: 22,
      fontWeight: '700',
      color: theme.colors.gray[800],
      marginBottom: theme.spacing.xs,
    },
    locationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    locationText: {
      color: theme.colors.gray[600],
      marginLeft: 4,
      fontSize: 14,
    },
    editProfileButton: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    editProfileText: {
      color: theme.colors.primary,
      fontWeight: '600',
      marginLeft: 4,
    },
    bioContainer: {
      paddingHorizontal: theme.spacing.lg,
      marginTop: theme.spacing.xs,
      marginBottom: theme.spacing.md,
    },
    bioText: {
      fontSize: 14,
      lineHeight: 20,
      color: theme.colors.gray[700],
    },
    statsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      paddingVertical: theme.spacing.md,
      marginHorizontal: theme.spacing.lg,
      backgroundColor: theme.colors.white,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.primary,
    },
    statLabel: {
      fontSize: 14,
      color: theme.colors.gray[600],
      marginTop: 2,
    },
    statDivider: {
      height: 24,
      width: 1,
      backgroundColor: theme.colors.gray[200],
    },
    detailsContainer: {
      marginHorizontal: theme.spacing.lg,
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      padding: theme.spacing.md,
      backgroundColor: theme.colors.white,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    detailItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.xs,
    },
    detailText: {
      fontSize: 14,
      color: theme.colors.gray[700],
      marginLeft: theme.spacing.sm,
    },
    tabContainer: {
      flexDirection: 'row',
      marginHorizontal: theme.spacing.lg,
      marginTop: theme.spacing.md,
      borderRadius: 8,
      backgroundColor: theme.colors.gray[100],
      padding: 4,
    },
    tabButton: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      alignItems: 'center',
      borderRadius: 6,
    },
    activeTabButton: {
      backgroundColor: theme.colors.white,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    tabButtonText: {
      fontWeight: '500',
      color: theme.colors.gray[600],
    },
    activeTabButtonText: {
      color: theme.colors.gray[800],
    },
    tabContent: {
      marginTop: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
    },
    cardWrapper: {
      marginBottom: theme.spacing.md,
    },
    emptyStateContainer: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xl,
    },
    emptyStateText: {
      fontSize: 16,
      color: theme.colors.gray[600],
      marginBottom: theme.spacing.md,
    },
    emptyStateButton: {
      width: '80%',
    },
  }), [theme]);

  if (!user || !profile) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          {/* Loading state */}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.title}>My Profile</Text>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={navigateToSettings}
          >
            <Settings size={24} color={theme.colors.gray[700]} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleLogout}
          >
            <LogOut size={24} color={theme.colors.gray[700]} />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ 
                uri: profile.photoURL || 'https://via.placeholder.com/120'
              }} 
              style={styles.avatar} 
            />
            <TouchableOpacity 
              style={styles.editAvatarButton}
              onPress={handleChangeProfileImage}
            >
              <Camera size={16} color={theme.colors.white} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {profile.firstName} {profile.lastName}
            </Text>
            
            {profile.location && (
              <View style={styles.locationContainer}>
                <MapPin size={16} color={theme.colors.primary} />
                <Text style={styles.locationText}>{profile.location}</Text>
              </View>
            )}
            
            <TouchableOpacity 
              style={styles.editProfileButton}
              onPress={handleEditProfile}
            >
              <Edit2 size={16} color={theme.colors.primary} />
              <Text style={styles.editProfileText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {profile.bio && (
          <View style={styles.bioContainer}>
            <Text style={styles.bioText}>{profile.bio}</Text>
          </View>
        )}
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{trips.length}</Text>
            <Text style={styles.statLabel}>Trips</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stories.length}</Text>
            <Text style={styles.statLabel}>Stories</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.countriesVisited?.length || 0}</Text>
            <Text style={styles.statLabel}>Countries</Text>
          </View>
        </View>
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <User size={20} color={theme.colors.gray[600]} />
            <Text style={styles.detailText}>
              {profile.firstName} {profile.lastName}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Mail size={20} color={theme.colors.gray[600]} />
            <Text style={styles.detailText}>{profile.email}</Text>
          </View>
          
          {profile.phone && (
            <View style={styles.detailItem}>
              <Phone size={20} color={theme.colors.gray[600]} />
              <Text style={styles.detailText}>{profile.phone}</Text>
            </View>
          )}
          
          {profile.website && (
            <View style={styles.detailItem}>
              <Globe size={20} color={theme.colors.gray[600]} />
              <Text style={styles.detailText}>{profile.website}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[
              styles.tabButton, 
              activeTab === 'trips' && styles.activeTabButton
            ]}
            onPress={() => setActiveTab('trips')}
          >
            <Text style={[
              styles.tabButtonText,
              activeTab === 'trips' && styles.activeTabButtonText
            ]}>
              My Trips
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.tabButton, 
              activeTab === 'stories' && styles.activeTabButton
            ]}
            onPress={() => setActiveTab('stories')}
          >
            <Text style={[
              styles.tabButtonText,
              activeTab === 'stories' && styles.activeTabButtonText
            ]}>
              My Stories
            </Text>
          </TouchableOpacity>
        </View>
        
        {activeTab === 'trips' && (
          <View style={styles.tabContent}>
            {trips.length > 0 ? (
              trips.map((trip) => (
                <View key={trip.id} style={styles.cardWrapper}>
                  <TripCard 
                    trip={trip}
                    onPress={() => navigateToTrip(trip.id)}
                  />
                </View>
              ))
            ) : (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateText}>
                  You haven't created any trips yet
                </Text>
                <Button
                  title="Create New Trip"
                  onPress={() => router.push('/trip/create')}
                  style={styles.emptyStateButton}
                />
              </View>
            )}
          </View>
        )}
        
        {activeTab === 'stories' && (
          <View style={styles.tabContent}>
            {stories.length > 0 ? (
              stories.map((story) => (
                <View key={story.id} style={styles.cardWrapper}>
                  <StoryCard 
                    story={story}
                    onPress={() => navigateToStory(story.id)}
                    hideUserInfo
                  />
                </View>
              ))
            ) : (
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateText}>
                  You haven't shared any stories yet
                </Text>
                <Button
                  title="Create New Story"
                  onPress={() => router.push('/story/create')}
                  style={styles.emptyStateButton}
                />
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

export default Profile;