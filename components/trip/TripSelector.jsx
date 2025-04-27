import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

/**
 * Component for selecting travel type and categories
 * @param {Object} props - Component props
 * @returns {JSX.Element} TripSelector component
 */
const TripSelector = ({
  travelTypes,
  categories,
  selectedTravelType,
  selectedCategories,
  onSelectTravelType,
  onSelectCategory,
}) => {
  const { theme } = useTheme();
  
  const styles = StyleSheet.create({
    container: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 12,
      marginLeft: 4,
    },
    scrollContainer: {
      paddingBottom: 8,
    },
    typesContainer: {
      flexDirection: 'row',
      marginBottom: 24,
    },
    typeButton: {
      alignItems: 'center',
      marginRight: 16,
      width: 80,
    },
    typeIconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
      backgroundColor: theme.colors.cardBackground,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    selectedTypeIconContainer: {
      borderColor: theme.colors.accent,
      backgroundColor: theme.colors.accentLight,
    },
    typeLabel: {
      fontSize: 14,
      color: theme.colors.text,
      textAlign: 'center',
    },
    categoriesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    categoryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      marginRight: 10,
      marginBottom: 10,
      backgroundColor: theme.colors.cardBackground,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    selectedCategoryButton: {
      backgroundColor: theme.colors.accentLight,
      borderColor: theme.colors.accent,
    },
    categoryLabel: {
      marginLeft: 6,
      fontSize: 14,
      color: theme.colors.text,
    },
    selectedCategoryLabel: {
      color: theme.colors.accent,
      fontWeight: '500',
    },
  });

  return (
    <View style={styles.container}>
      {/* Travel Types Section */}
      <Text style={styles.sectionTitle}>I'm traveling with:</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <View style={styles.typesContainer}>
          {travelTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={styles.typeButton}
              onPress={() => onSelectTravelType(type.id)}
            >
              <View 
                style={[
                  styles.typeIconContainer,
                  selectedTravelType === type.id && styles.selectedTypeIconContainer,
                ]}
              >
                <Ionicons
                  name={type.icon}
                  size={32}
                  color={selectedTravelType === type.id ? theme.colors.accent : theme.colors.text}
                />
              </View>
              <Text style={styles.typeLabel}>{type.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Categories Section */}
      <Text style={styles.sectionTitle}>I'm interested in:</Text>
      <View style={styles.categoriesContainer}>
        {categories.map((category) => {
          const isSelected = selectedCategories.includes(category.id);
          return (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                isSelected && styles.selectedCategoryButton,
              ]}
              onPress={() => onSelectCategory(category.id)}
            >
              <Ionicons
                name={category.icon}
                size={18}
                color={isSelected ? theme.colors.accent : theme.colors.text}
              />
              <Text 
                style={[
                  styles.categoryLabel,
                  isSelected && styles.selectedCategoryLabel,
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default TripSelector;