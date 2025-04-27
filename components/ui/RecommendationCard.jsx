import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const RecommendationCard = ({ 
  place, 
  onPress, 
  onSaveToTrip 
}) => {
  const { colors } = useTheme();
  
  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: colors.cardBackground }]} 
      onPress={() => onPress(place)}
    >
      <Image 
        source={{ uri: place.imageUrl || 'https://via.placeholder.com/150' }} 
        style={styles.image} 
      />
      <View style={styles.infoContainer}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {place.name}
        </Text>
        <Text style={[styles.category, { color: colors.secondary }]} numberOfLines={1}>
          {place.category}
        </Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color={colors.accent} />
          <Text style={[styles.rating, { color: colors.text }]}>
            {place.rating} ({place.reviewCount})
          </Text>
        </View>
        <Text style={[styles.address, { color: colors.textLight }]} numberOfLines={2}>
          {place.address}
        </Text>
      </View>
      <TouchableOpacity 
        style={[styles.saveButton, { backgroundColor: colors.accent }]}
        onPress={() => onSaveToTrip(place)}
      >
        <Ionicons name="bookmark-outline" size={20} color="#fff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: 100,
    height: 120,
  },
  infoContainer: {
    flex: 1,
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  category: {
    fontSize: 12,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  rating: {
    fontSize: 14,
    marginLeft: 4,
  },
  address: {
    fontSize: 12,
  },
  saveButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
});

export default RecommendationCard;