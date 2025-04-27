import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView, 
  TouchableOpacity,
  Share as RNShare,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { 
  ArrowLeft, 
  Heart, 
  MessageCircle, 
  Share2, 
  MapPin, 
  Calendar,
  Bookmark,
  MoreVertical,
  Edit,
  Trash
} from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getStoryById, 
  likeStory, 
  unlikeStory, 
  deleteStory,
  getStoryComments 
} from '../../services/stories';
import { getUserProfile } from '../../services/users';
import { colors, spacing } from '../../constants/theme';
import CommentItem from '../../components/comment/CommentItem';
import CommentInput from '../../components/comment/CommentInput';
import MapView, { Marker } from 'react-native-maps';

export default function StoryDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [story, setStory] = useState(null);
  const [author, setAuthor] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  
  useEffect(() => {
    if (id) {
      loadStoryData();
    }
  }, [id]);
  
  const loadStoryData = async () => {
    try {
      setLoading(true);
      
      // Fetch story data
      const storyData = await getStoryById(id);
      setStory(storyData);
      
      // Check if user liked the story
      if (user && storyData.likes) {
        setIsLiked(storyData.likedBy?.includes(user.uid));
      }
      
      // Check if user bookmarked the story
      if (user && storyData.bookmarkedBy) {
        setIsBookmarked(storyData.bookmarkedBy.includes(user.uid));
      }
      
      // Fetch author profile data
      if (storyData.userId) {
        const authorData = await getUserProfile(storyData.userId);
        setAuthor(authorData);
      }
      
      // Fetch comments
      loadComments();
      
    } catch (error) {
      console.error('Error loading story:', error);
      Alert.alert('Error', 'Failed to load story details. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const loadComments = async () => {
    try {
      setLoadingComments(true);
      const commentsData = await getStoryComments(id);
      setComments(commentsData);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };
  
  const handleLikeToggle = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    try {
      if (isLiked) {
        await unlikeStory(id, user.uid);
        setStory(prev => ({
          ...prev,
          likes: prev.likes - 1
        }));
      } else {
        await likeStory(id, user.uid);
        setStory(prev => ({
          ...prev,
          likes: prev.likes + 1
        }));
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };
  
  const handleBookmarkToggle = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    // Implement bookmark logic here
    setIsBookmarked(!isBookmarked);
  };
  
  const handleShare = async () => {
    try {
      await RNShare.share({
        message: `Check out this travel story: ${story.title}`,
        // You can add a URL here when you have a production app
        // url: `https://yourapp.com/story/${id}`
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };
  
  const handleCommentSubmit = async (text) => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    // Implement comment logic here
    console.log('Comment submitted:', text);
    // After submitting, reload comments
    loadComments();
  };
  
  const handleEditStory = () => {
    setShowMoreOptions(false);
    router.push(`/story/edit/${id}`);
  };
  
  const handleDeleteStory = async () => {
    setShowMoreOptions(false);
    
    Alert.alert(
      'Delete Story',
      'Are you sure you want to delete this story? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteStory(id);
              Alert.alert('Success', 'Your story has been deleted.');
              router.back();
            } catch (error) {
              console.error('Error deleting story:', error);
              Alert.alert('Error', 'Failed to delete story. Please try again.');
            }
          }
        },
      ]
    );
  };
  
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };
  
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }
  
  if (!story) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>Story not found</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  
  const isAuthor = user && story.userId === user.uid;
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <Stack.Screen 
        options={{
          headerShown: false,
        }} 
      />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Image */}
        <View style={styles.imageContainer}>
          {story.imageUrl ? (
            <Image 
              source={{ uri: story.imageUrl }} 
              style={styles.headerImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.headerImagePlaceholder}>
              <Text style={styles.placeholderText}>No Image</Text>
            </View>
          )}
          
          {/* Header Overlay */}
          <View style={styles.headerOverlay}>
            <TouchableOpacity 
              style={styles.backIconButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color={colors.white} />
            </TouchableOpacity>
            
            <View style={styles.headerRightButtons}>
              <TouchableOpacity 
                style={styles.headerIconButton}
                onPress={handleBookmarkToggle}
              >
                <Bookmark 
                  size={24} 
                  color={colors.white} 
                  fill={isBookmarked ? colors.white : 'transparent'} 
                />
              </TouchableOpacity>
              
              {isAuthor && (
                <TouchableOpacity 
                  style={styles.headerIconButton}
                  onPress={() => setShowMoreOptions(!showMoreOptions)}
                >
                  <MoreVertical size={24} color={colors.white} />
                </TouchableOpacity>
              )}
            </View>
            
            {/* More Options Menu */}
            {showMoreOptions && (
              <View style={styles.moreOptionsMenu}>
                <TouchableOpacity 
                  style={styles.moreOptionItem}
                  onPress={handleEditStory}
                >
                  <Edit size={18} color={colors.gray[700]} />
                  <Text style={styles.moreOptionText}>Edit Story</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.moreOptionItem}
                  onPress={handleDeleteStory}
                >
                  <Trash size={18} color={colors.error} />
                  <Text style={[styles.moreOptionText, { color: colors.error }]}>
                    Delete Story
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
        
        {/* Story Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{story.title}</Text>
          
          <View style={styles.metaContainer}>
            {story.location && (
              <View style={styles.metaItem}>
                <MapPin size={16} color={colors.primary} />
                <Text style={styles.metaText}>{story.location}</Text>
              </View>
            )}
            
            {story.createdAt && (
              <View style={styles.metaItem}>
                <Calendar size={16} color={colors.primary} />
                <Text style={styles.metaText}>{formatDate(story.createdAt)}</Text>
              </View>
            )}
          </View>
          
          {/* Author Info */}
          {author && (
            <TouchableOpacity 
              style={styles.authorContainer}
              onPress={() => router.push(`/profile/${author.id}`)}
            >
              <Image 
                source={{ uri: author.photoURL || 'https://via.placeholder.com/40' }} 
                style={styles.authorAvatar} 
              />
              <View style={styles.authorInfo}>
                <Text style={styles.authorName}>
                  {author.firstName} {author.lastName}
                </Text>
                {author.location && (
                  <Text style={styles.authorLocation}>{author.location}</Text>
                )}
              </View>
            </TouchableOpacity>
          )}
          
          {/* Story Body */}
          <Text style={styles.storyContent}>{story.content}</Text>
          
          {/* Map if location coordinates are available */}
          {story.coordinates && (
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: story.coordinates.latitude,
                  longitude: story.coordinates.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: story.coordinates.latitude,
                    longitude: story.coordinates.longitude,
                  }}
                  title={story.location || story.title}
                />
              </MapView>
            </View>
          )}
          
          {/* Story Images (if multiple) */}
          {story.additionalImages && story.additionalImages.length > 0 && (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.imageGalleryContainer}
            >
              {story.additionalImages.map((img, index) => (
                <Image 
                  key={index}
                  source={{ uri: img }} 
                  style={styles.galleryImage}
                />
              ))}
            </ScrollView>
          )}
          
          {/* Interaction Bar */}
          <View style={styles.interactionBar}>
            <TouchableOpacity 
              style={styles.interactionButton}
              onPress={handleLikeToggle}
            >
              <Heart 
                size={24} 
                color={isLiked ? colors.error : colors.gray[600]} 
                fill={isLiked ? colors.error : 'transparent'} 
              />
              <Text 
                style={[
                  styles.interactionText, 
                  isLiked && { color: colors.error }
                ]}
              >
                {story.likes || 0}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.interactionButton}>
              <MessageCircle size={24} color={colors.gray[600]} />
              <Text style={styles.interactionText}>
                {comments.length}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.interactionButton}
              onPress={handleShare}
            >
              <Share2 size={24} color={colors.gray[600]} />
              <Text style={styles.interactionText}>Share</Text>
            </TouchableOpacity>
          </View>
          
          {/* Comments Section */}
          <View style={styles.commentsSection}>
            <Text style={styles.sectionTitle}>
              Comments ({comments.length})
            </Text>
            
            <CommentInput onSubmit={handleCommentSubmit} />
            
            {loadingComments ? (
              <ActivityIndicator 
                style={styles.commentsLoading} 
                size="small" 
                color={colors.primary} 
              />
            ) : comments.length > 0 ? (
              comments.map(comment => (
                <CommentItem 
                  key={comment.id} 
                  comment={comment} 
                />
              ))
            ) : (
              <Text style={styles.noCommentsText}>
                No comments yet. Be the first to share your thoughts!
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  errorText: {
    fontSize: 18,
    color: colors.gray[700],
    marginBottom: spacing.md,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  backButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 300,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: colors.gray[500],
    fontWeight: '500',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.2)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  backIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRightButtons: {
    flexDirection: 'row',
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  moreOptionsMenu: {
    position: 'absolute',
    top: 60,
    right: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    width: 150,
  },
  moreOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  moreOptionText: {
    marginLeft: spacing.sm,
    color: colors.gray[700],
    fontWeight: '500',
  },
  contentContainer: {
    padding: spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.gray[800],
    marginBottom: spacing.sm,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
    marginBottom: spacing.xs,
  },
  metaText: {
    fontSize: 14,
    color: colors.gray[600],
    marginLeft: 4,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    marginBottom: spacing.md,
  },
  authorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  authorInfo: {
    marginLeft: spacing.sm,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[800],
  },
  authorLocation: {
    fontSize: 14,
    color: colors.gray[600],
  },
  storyContent: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.gray[700],
    marginBottom: spacing.lg,
  },
  mapContainer: {
    height: 200,
    marginBottom: spacing.lg,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    height: '100%',
    width: '100%',
  },
  imageGalleryContainer: {
    paddingBottom: spacing.sm,
  },
  galleryImage: {
    width: 160,
    height: 120,
    borderRadius: 8,
    marginRight: spacing.sm,
  },
  interactionBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  interactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.xl,
  },
  interactionText: {
    marginLeft: spacing.xs,
    color: colors.gray[600],
    fontWeight: '500',
  },
  commentsSection: {
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray[800],
    marginBottom: spacing.md,
  },
  commentsLoading: {
    paddingVertical: spacing.lg,
  },
  noCommentsText: {
    textAlign: 'center',
    paddingVertical: spacing.lg,
    color: colors.gray[500],
  },
});