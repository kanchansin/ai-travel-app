import React from 'react';
import { View, FlatList, Text, StyleSheet, ActivityIndicator } from 'react-native';
import TripCard from './TripCard';
import { useTheme } from '../../contexts/ThemeContext';

const TripList = ({ 
  trips, 
  loading, 
  onTripPress, 
  onTripEdit, 
  onTripDelete,
  emptyMessage = "No trips found. Create your first trip!" 
}) => {
  const { theme } = useTheme();

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </View>
    );
  }

  if (!trips || trips.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={[styles.emptyText, { color: theme.colors.text }]}>
          {emptyMessage}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={trips}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TripCard
            trip={item}
            onPress={() => onTripPress(item)}
            onEdit={() => onTripEdit(item)}
            onDelete={() => onTripDelete(item.id)}
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default TripList;