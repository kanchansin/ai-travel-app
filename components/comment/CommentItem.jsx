import React, { useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity 
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Heart } from 'lucide-react-native';

const CommentItem = ({ 
  comment, 
  onReply, 
  onLike 
}) => {
  const { theme } = useTheme();

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

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flexDirection: 'row',
      marginBottom: theme.spacing.md,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
    contentContainer: {
      flex: 1,
      marginLeft: theme.spacing.sm,
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 2,
    },
    userName: {
      fontWeight: '600',
      color: theme.colors.gray[800],
      fontSize: 14,
    },
    timestamp: {
      fontSize: 12,
      color: theme.colors.gray[500],
    },
    commentText: {
      color: theme.colors.gray[700],
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
      marginRight: theme.spacing.md,
    },
    actionText: {
      fontSize: 12,
      color: theme.colors.gray[500],
      marginLeft: 4,
    },
  }), [theme]);

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
              color={isLiked ? theme.colors.error : theme.colors.gray[500]} 
              fill={isLiked ? theme.colors.error : 'transparent'} 
            />
            {likes > 0 && (
              <Text style={[
                styles.actionText,
                isLiked && { color: theme.colors.error }
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

export default CommentItem;