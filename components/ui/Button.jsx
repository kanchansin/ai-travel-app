// components/ui/Button.jsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon = null,
  iconPosition = 'left',
  style = {},
  textStyle = {},
}) => {
  const { colors } = useTheme();
  
  // Define sizes
  const sizeStyles = {
    small: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 6,
      fontSize: 14,
    },
    medium: {
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      fontSize: 16,
    },
    large: {
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 10,
      fontSize: 18,
    },
  };
  
  // Define variants
  const variantStyles = {
    primary: {
      backgroundColor: disabled ? colors.neutral : colors.primary,
      borderWidth: 0,
      textColor: colors.background,
    },
    secondary: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.primary,
      textColor: colors.primary,
    },
    accent: {
      backgroundColor: disabled ? colors.neutral : colors.accent,
      borderWidth: 0,
      textColor: colors.background,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.neutral,
      textColor: colors.text,
    },
    text: {
      backgroundColor: 'transparent',
      borderWidth: 0,
      textColor: colors.primary,
      paddingVertical: 4,
      paddingHorizontal: 8,
    },
  };

  const buttonStyles = [
    styles.button,
    { paddingVertical: sizeStyles[size].paddingVertical },
    { paddingHorizontal: sizeStyles[size].paddingHorizontal },
    { borderRadius: sizeStyles[size].borderRadius },
    { backgroundColor: variantStyles[variant].backgroundColor },
    { borderWidth: variantStyles[variant].borderWidth },
    variantStyles[variant].borderColor && { borderColor: variantStyles[variant].borderColor },
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    { color: variantStyles[variant].textColor },
    { fontSize: sizeStyles[size].fontSize },
    textStyle,
  ];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={buttonStyles}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variantStyles[variant].textColor} size="small" />
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          <Text style={textStyles}>{title}</Text>
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.6,
  },
});

export default Button;