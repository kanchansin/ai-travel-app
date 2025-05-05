import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Plus, Heart, MessageCircle, Bookmark, Share2 } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { getStories, likeStory, saveStory } from '../../services/stories';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';

const Stories = () => {
  const { theme } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    loadStories();
  }, [user]);

  const loadStories = async () => {
    try {
      setLoading(true);
      const fetchedStories = await getStories();
      setStories(fetchedStories);
    } catch (error) {
      console.error('Error loading stories:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadStories();
  };

  const handleLike = async (storyId) => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    try {
      await likeStory(storyId, user.uid);
      // Update the UI optimistically
      setStories(stories.map(story => {
        if (story.id === storyId) {
          const isLiked = story.likes?.includes(user.uid);
          return {
            ...story,
            likes: isLiked 
              ? story.likes.filter(uid => uid !== user.uid) 
              : [...(story.likes || []), user.uid],
            likeCount: isLiked ? story.likeCount - 1 : story.likeCount + 1
          };
        }
        return story;
      }));
    } catch (error) {
      console.error('Error liking story:', error);
    }
  };

  const handleSave = async (storyId) => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    try {
      await saveStory(storyId, user.uid);
      // Update the UI optimistically
      setStories(stories.map(story => {
        if (story.id === storyId) {
          const isSaved = story.saved?.includes(user.uid);
          return {
            ...story,
            saved: isSaved 
              ? story.saved.filter(uid => uid !== user.uid) 
              : [...(story.saved || []), user.uid]
          };
        }
        return story;
      }));
    } catch (error) {
      console.error('Error saving story:', error);
    }
  };

  const navigateToCreateStory = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    router.push('/story/create');
  };

  const navigateToStoryDetails = (storyId) => {
    router.push(`/story/${storyId}`);
  };

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
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
    listContent: {
      padding: theme.spacing.lg,
      paddingTop: theme.spacing.sm,
    },
    storyCard: {
      backgroundColor: theme.colors.white,
      borderRadius: 12,
      padding: theme.spacing.md,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    userInfoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.gray[200],
      marginRight: theme.spacing.sm,
    },
    userName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.gray[800],
    },
    timestamp: {
      fontSize: 12,
      color: theme.colors.gray[500],
      marginTop: 2,
    },
    storyTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.gray[800],
      marginBottom: theme.spacing.sm,
    },
    storyImage: {
      width: '100%',
      height: 200,
      borderRadius: 8,
      marginBottom: theme.spacing.md,
    },
    storyExcerpt: {
      fontSize: 14,
      lineHeight: 20,
      color: theme.colors.gray[700],
      marginBottom: theme.spacing.md,
    },
    locationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    location: {
      fontSize: 14,
      color: theme.colors.primary,
      fontWeight: '500',
    },
    actionsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderTopWidth: 1,
      borderTopColor: theme.colors.gray[100],
      paddingTop: theme.spacing.sm,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.xs,
    },
    actionText: {
      fontSize: 14,
      color: theme.colors.gray[600],
      marginLeft: 4,
    },
    separator: {
      height: theme.spacing.md,
    }
  }), [theme]);

  const renderStoryItem = ({ item }) => {
    const isLiked = user && item.likes?.includes(user.uid);
    const isSaved = user && item.saved?.includes(user.uid);
    
    return (
      <View style={styles.storyCard}>
        <TouchableOpacity 
          style={styles.userInfoContainer}
          onPress={() => router.push(`/profile/${item.author.id}`)}
        >
          <Image 
            source={{ uri: item.author.avatar || 'https://via.placeholder.com/40' }} 
            style={styles.avatar} 
          />
          <View>
            <Text style={styles.userName}>{item.author.name}</Text>
            <Text style={styles.timestamp}>{formatDate(item.createdAt)}</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => navigateToStoryDetails(item.id)}>
          <Text style={styles.storyTitle}>{item.title}</Text>
          
          {item.image && (
            <Image 
              source={{ uri: item.image }} 
              style={styles.storyImage} 
              resizeMode="cover"
            />
          )}
          
          <Text style={styles.storyExcerpt} numberOfLines={3}>
            {item.content}
          </Text>
          
          <View style={styles.locationContainer}>
            <Text style={styles.location}>{item.location}</Text>
          </View>
        </TouchableOpacity>
        
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleLike(item.id)}
          >
            <Heart 
              size={20} 
              color={isLiked ? theme.colors.error : theme.colors.gray[500]} 
              fill={isLiked ? theme.colors.error : 'transparent'}
            />
            <Text style={styles.actionText}>{item.likeCount || 0}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigateToStoryDetails(item.id)}
          >
            <MessageCircle size={20} color={theme.colors.gray[500]} />
            <Text style={styles.actionText}>{item.commentCount || 0}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleSave(item.id)}
          >
            <Bookmark 
              size={20} 
              color={theme.colors.gray[500]} 
              fill={isSaved ? theme.colors.gray[500] : 'transparent'}
            />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Share2 size={20} color={theme.colors.gray[500]} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <EmptyState
      title="No stories yet"
      description="Be the first to share your travel adventures with the community!"
      icon="book-open"
      action={
        <Button 
          title="Create Story" 
          onPress={navigateToCreateStory}
          icon={<Plus size={20} color="FFFFFF" />}
        />
      }
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Travel Stories</Text>
        
        <Button
          variant="primary"
          size="small"
          icon={<Plus size={20} color={theme.colors.white} />}
          iconPosition="left"
          title="New Story"
          onPress={navigateToCreateStory}
        />
      </View>

      <FlatList
        data={stories}
        renderItem={renderStoryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={!loading && renderEmptyState()}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

export default Stories;