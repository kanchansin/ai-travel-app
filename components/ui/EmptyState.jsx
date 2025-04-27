import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

const EmptyState = ({ 
  title, 
  description, 
  icon = 'information-circle-outline', 
  action = null 
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={64} color={colors.neutral} style={styles.icon} />
      
      <Text style={[styles.title, { color: colors.text }]}>
        {title}
      </Text>
      
      {description && (
        <Text style={[styles.description, { color: colors.textLight }]}>
          {description}
        </Text>
      )}
      
      {action && (
        <View style={styles.actionContainer}>
          {action}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  actionContainer: {
    marginTop: 8,
  }
});

export default EmptyState;