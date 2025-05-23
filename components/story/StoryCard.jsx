import React, { useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity 
} from 'react-native';
import { Heart, MessageCircle, Share2, MapPin, Calendar } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';

const StoryCard = ({ 
  story, 
  onPress, 
  hideUserInfo = false,
  onLike,
}) => {
  if (!story) return null;
  
  const {
    id,
    title,
    content,
    location,
    imageUrl,
    createdAt,
    likes = 0,
    comments = 0,
    user
  } = story;
  const { theme } = useTheme();

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const styles = useMemo(() => StyleSheet.create({
    container: {
      backgroundColor: theme.colors.white,
      borderRadius: 12,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    imageContainer: {
      position: 'relative',
      height: 180,
    },
    image: {
      width: '100%',
      height: '100%',
    },
    placeholderImage: {
      width: '100%',
      height: '100%',
      backgroundColor: theme.colors.gray[200],
      justifyContent: 'center',
      alignItems: 'center',
    },
    placeholderText: {
      color: theme.colors.gray[500],
      fontWeight: '500',
    },
    locationBadge: {
      position: 'absolute',
      bottom: theme.spacing.sm,
      left: theme.spacing.sm,
      backgroundColor: 'rgba(0,0,0,0.6)',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs / 2,
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center',
    },
    locationText: {
      color: theme.colors.white,
      fontSize: 12,
      marginLeft: 4,
      fontWeight: '500',
    },
    contentContainer: {
      padding: theme.spacing.md,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.gray[800],
      marginBottom: theme.spacing.xs,
    },
    excerpt: {
      fontSize: 14,
      color: theme.colors.gray[600],
      lineHeight: 20,
      marginBottom: theme.spacing.sm,
    },
    metaContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: theme.spacing.xs,
    },
    dateContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    dateText: {
      fontSize: 12,
      color: theme.colors.gray[500],
      marginLeft: 4,
    },
    interactionsContainer: {
      flexDirection: 'row',
    },
    interactionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: theme.spacing.sm,
    },
    interactionText: {
      fontSize: 12,
      color: theme.colors.gray[600],
      marginLeft: 4,
    },
    userContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.sm,
      paddingTop: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.gray[200],
    },
    userAvatar: {
      width: 24,
      height: 24,
      borderRadius: 12,
    },
    userName: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.colors.gray[700],
      marginLeft: theme.spacing.xs,
    },
  }), [theme]);

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => onPress && onPress(id)}
      activeOpacity={0.9}
    >
      {/* Story Image */}
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image 
            source={{ uri: imageUrl }} 
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}
        
        {/* Location badge */}
        {location && (
          <View style={styles.locationBadge}>
            <MapPin size={14} color={theme.colors.white} />
            <Text style={styles.locationText}>{location}</Text>
          </View>
        )}
      </View>
      
      {/* Story Content */}
      <View style={styles.contentContainer}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        
        {content && (
          <Text style={styles.excerpt} numberOfLines={2}>
            {content}
          </Text>
        )}
        
        {/* Date and Interactions */}
        <View style={styles.metaContainer}>
          <View style={styles.dateContainer}>
            <Calendar size={14} color={theme.colors.gray[500]} />
            <Text style={styles.dateText}>{formatDate(createdAt)}</Text>
          </View>
          
          <View style={styles.interactionsContainer}>
            <TouchableOpacity 
              style={styles.interactionItem}
              onPress={() => onLike && onLike(id)}
            >
              <Heart 
                size={16} 
                color={theme.colors.gray[600]} 
                fill={story.isLiked ? theme.colors.error : 'transparent'} 
              />
              <Text style={styles.interactionText}>{likes}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.interactionItem}>
              <MessageCircle size={16} color={theme.colors.gray[600]} />
              <Text style={styles.interactionText}>{comments}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.interactionItem}>
              <Share2 size={16} color={theme.colors.gray[600]} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* User info (if not hidden) */}
        {!hideUserInfo && user && (
          <View style={styles.userContainer}>
            <Image 
              source={{ 
                uri: user.photoURL || 'https://via.placeholder.com/40'
              }} 
              style={styles.userAvatar} 
            />
            <Text style={styles.userName}>
              {user.firstName} {user.lastName}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default StoryCard;