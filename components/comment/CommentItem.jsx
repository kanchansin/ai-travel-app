import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity 
} from 'react-native';
import { colors, spacing } from '../../constants/theme';
import { Heart } from 'lucide-react-native';

const CommentItem = ({ 
  comment, 
  onReply, 
  onLike 
}) => {
  if (!comment) return null;
  
  const {
    id,
    userId,
    user,
    text,
    createdAt,
    likes = 0,
    isLiked = false
  } = comment;
  
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    
    // If less than 24 hours ago, show relative time
    const now = new Date();
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      const diffMinutes = Math.floor((now - date) / (1000 * 60));
      return `${diffMinutes} min ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      return date.toLocaleDateString('en-US');
    }
  };
  
  return (
    <View style={styles.container}>
      <Image 
        source={{ uri: user?.photoURL || 'https://via.placeholder.com/40' }} 
        style={styles.avatar} 
      />
      
      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.userName}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={styles.timestamp}>{formatDate(createdAt)}</Text>
        </View>
        
        <Text style={styles.commentText}>{text}</Text>
        
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => onLike && onLike(id)}
          >
            <Heart 
              size={16} 
              color={isLiked ? colors.error : colors.gray[500]} 
              fill={isLiked ? colors.error : 'transparent'} 
            />
            {likes > 0 && (
              <Text style={[
                styles.actionText,
                isLiked && { color: colors.error }
              ]}>
                {likes}
              </Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => onReply && onReply(id, user?.firstName)}
          >
            <Text style={styles.actionText}>Reply</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  contentContainer: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  userName: {
    fontWeight: '600',
    color: colors.gray[800],
    fontSize: 14,
  },
  timestamp: {
    fontSize: 12,
    color: colors.gray[500],
  },
  commentText: {
    color: colors.gray[700],
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    marginTop: 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  actionText: {
    fontSize: 12,
    color: colors.gray[500],
    marginLeft: 4,
  },
});

export default CommentItem;