import React, { useState, useMemo } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Feather } from '@expo/vector-icons';

const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  error = null,
  disabled = false,
  multiline = false,
  maxLength,
  leftIcon = null,
  rightIcon = null,
  style = {},
  inputStyle = {},
  onBlur = () => {},
  onFocus = () => {},
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur();
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  // Add fallbacks for theme colors
  const colors = {
    text: theme.colors?.text || '#1F2937',
    accent: theme.colors?.accent || '#EF4444',
    primary: theme.colors?.primary || '#191970',
    border: theme.colors?.border || '#D1D5DB',
    background: theme.colors?.background || '#FFFFFF',
    neutral: theme.colors?.neutral || '#6B7280',
    white: theme.colors?.white || '#FFFFFF',
  };

  const styles = useMemo(() => StyleSheet.create({
    container: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 6,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 8,
      overflow: 'hidden',
    },
    input: {
      flex: 1,
      height: 48,
      paddingHorizontal: 12,
      fontSize: 16,
    },
    multilineInput: {
      height: 100,
      textAlignVertical: 'top',
      paddingTop: 12,
    },
    iconContainer: {
      paddingHorizontal: 12,
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorText: {
      fontSize: 12,
      marginTop: 4,
    },
  }), []);

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>
          {label}
        </Text>
      )}
      
      <View 
        style={[
          styles.inputContainer, 
          { 
            borderColor: error ? colors.accent : isFocused ? colors.primary : colors.border,
            borderWidth: isFocused ? 2 : 1,
            backgroundColor: disabled ? colors.border : colors.background,
          }
        ]}
      >
        {leftIcon && (
          <View style={styles.iconContainer}>
            {leftIcon}
          </View>
        )}
        
        <TextInput
          style={[
            styles.input,
            { color: colors.text },
            multiline && styles.multilineInput,
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.neutral}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={!disabled}
          multiline={multiline}
          maxLength={maxLength}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        
        {secureTextEntry && (
          <TouchableOpacity onPress={togglePasswordVisibility} style={styles.iconContainer}>
            <Feather 
              name={isPasswordVisible ? 'eye-off' : 'eye'} 
              size={20} 
              color={colors.neutral} 
            />
          </TouchableOpacity>
        )}
        
        {rightIcon && !secureTextEntry && (
          <View style={styles.iconContainer}>
            {rightIcon}
          </View>
        )}
      </View>
      
      {error && (
        <Text style={[styles.errorText, { color: colors.accent }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

export default Input;