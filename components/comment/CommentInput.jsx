import React, { useState, useMemo } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity,
  Keyboard
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Send } from 'lucide-react-native';

const CommentInput = ({ 
  onSubmit,
  placeholder = 'Add a comment...',
  replyTo = null
}) => {
  const { theme } = useTheme();
  const [text, setText] = useState('');
  
  const handleSubmit = () => {
    if (text.trim()) {
      onSubmit(text.trim());
      setText('');
      Keyboard.dismiss();
    }
  };

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      marginBottom: theme.spacing.md,
    },
    input: {
      flex: 1,
      minHeight: 40,
      maxHeight: 120,
      backgroundColor: theme.colors.gray[100],
      borderRadius: 20,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      paddingRight: 50,
      color: theme.colors.gray[800],
      fontSize: 14,
    },
    sendButton: {
      position: 'absolute',
      right: 4,
      bottom: 4,
      backgroundColor: theme.colors.primary,
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sendButtonDisabled: {
      backgroundColor: theme.colors.gray[300],
    },
  }), [theme]);
  
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={replyTo ? `Reply to ${replyTo}...` : placeholder}
        placeholderTextColor={theme.colors.gray[500]}
        value={text}
        onChangeText={setText}
        multiline
        maxLength={500}
      />
      
      <TouchableOpacity 
        style={[
          styles.sendButton,
          !text.trim() && styles.sendButtonDisabled
        ]}
        onPress={handleSubmit}
        disabled={!text.trim()}
      >
        <Send 
          size={20} 
          color={text.trim() ? theme.colors.white : theme.colors.gray[400]} 
        />
      </TouchableOpacity>
    </View>
  );
};

export default CommentInput;