import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Reusable search bar component
 * @param {Object} props - Component props
 * @returns {JSX.Element} SearchBar component
 */
const SearchBar = ({
  placeholder = 'Search',
  value,
  onChangeText,
  onSubmit,
  onClear,
  onFocus,
  onBlur,
  autoFocus = false,
  style,
  leftIcon = 'search',
  rightIcon = 'close-circle',
  showRightIcon = true,
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [animation] = useState(new Animated.Value(0));
  
  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(animation, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
    if (onFocus) onFocus();
  };
  
  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(animation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    if (onBlur) onBlur();
  };
  
  const handleClear = () => {
    if (onChangeText) onChangeText('');
    if (onClear) onClear();
  };
  
  const borderColor = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.border, theme.colors.accent],
  });
  
  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.cardBackground,
      borderRadius: 12,
      paddingHorizontal: 12,
      height: 50,
      borderWidth: 1,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.text,
      paddingVertical: 8,
      paddingHorizontal: 8,
    },
    leftIconContainer: {
      marginRight: 8,
    },
    rightIconContainer: {
      marginLeft: 8,
    },
  });
  
  return (
    <Animated.View
      style={[
        styles.container,
        { borderColor },
        style,
      ]}
    >
      <View style={styles.leftIconContainer}>
        <Ionicons 
          name={leftIcon} 
          size={20} 
          color={isFocused ? theme.colors.accent : theme.colors.textSecondary} 
        />
      </View>
      
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textSecondary}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        onFocus={handleFocus}
        onBlur={handleBlur}
        autoFocus={autoFocus}
        returnKeyType="search"
        clearButtonMode="never"
        selectionColor={theme.colors.accent}
      />
      
      {showRightIcon && value && value.length > 0 && (
        <TouchableOpacity 
          style={styles.rightIconContainer}
          onPress={handleClear}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <Ionicons 
            name={rightIcon} 
            size={20} 
            color={theme.colors.textSecondary} 
          />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

export default SearchBar;