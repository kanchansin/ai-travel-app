import React, { useMemo } from 'react';
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
  const { theme } = useTheme();
  const colors = theme.colors;

  // Add fallbacks for theme colors
  const safeColors = {
    primary: colors?.primary || '#191970',
    neutral: colors?.neutral || '#6B7280',
    background: colors?.background || '#FFFFFF',
    accent: colors?.accent || '#EF4444',
    text: colors?.text || '#1F2937',
  };

  // Define sizes
  const sizeStyles = useMemo(() => ({
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
  }), []);

  // Define variants
  const variantStyles = useMemo(() => ({
    primary: {
      backgroundColor: disabled ? safeColors.neutral : safeColors.primary,
      borderWidth: 0,
      textColor: safeColors.background,
    },
    secondary: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: safeColors.primary,
      textColor: safeColors.primary,
    },
    accent: {
      backgroundColor: disabled ? safeColors.neutral : safeColors.accent,
      borderWidth: 0,
      textColor: safeColors.background,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: safeColors.neutral,
      textColor: safeColors.text,
    },
    text: {
      backgroundColor: 'transparent',
      borderWidth: 0,
      textColor: safeColors.primary,
      paddingVertical: 4,
      paddingHorizontal: 8,
    },
  }), [disabled, safeColors]);

  const styles = useMemo(() => StyleSheet.create({
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
  }), []);

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

export default Button;