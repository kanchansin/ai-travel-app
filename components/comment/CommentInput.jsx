import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity,
  Keyboard
} from 'react-native';
import { colors, spacing } from '../../constants/theme';
import { Send } from 'lucide-react-native';

const CommentInput = ({ 
  onSubmit,
  placeholder = 'Add a comment...',
  replyTo = null
}) => {
  const [text, setText] = useState('');
  
  const handleSubmit = () => {
    if (text.trim()) {
      onSubmit(text.trim());
      setText('');
      Keyboard.dismiss();
    }
  };
  
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={replyTo ? `Reply to ${replyTo}...` : placeholder}
        placeholderTextColor={colors.gray[500]}
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
          color={text.trim() ? colors.white : colors.gray[400]} 
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: spacing.md,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: colors.gray[100],
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    paddingRight: 50,
    color: colors.gray[800],
    fontSize: 14,
  },
  sendButton: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    backgroundColor: colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
});

export default CommentInput;