// components/ui/Card.jsx
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

const Card = ({
  children,
  onPress,
  style = {},
  contentStyle = {},
  elevation = 'medium',
  variant = 'filled',
  padding = 'medium',
}) => {
  const { colors, isDarkMode } = useTheme();
  
  // Define shadow styles
  const shadowStyles = {
    none: {},
    small: isDarkMode ? {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 1,
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    medium: isDarkMode ? {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
      elevation: 3,
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 3,
    },
    large: isDarkMode ? {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 5,
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
  };
  
  // Define variant styles
  const variantStyles = {
    filled: {
      backgroundColor: colors.card,
    },
    outlined: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.border,
    },
  };
  
  // Define padding styles
  const paddingStyles = {
    none: 0,
    small: 8,
    medium: 16,
    large: 24,
  };

  const cardStyles = [
    styles.card,
    variantStyles[variant],
    { borderRadius: 12 },
    shadowStyles[elevation],
    style,
  ];

  const contentStyles = [
    { padding: paddingStyles[padding] },
    contentStyle,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyles}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={contentStyles}>{children}</View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyles}>
      <View style={contentStyles}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    marginVertical: 8,
  },
});

export default Card;