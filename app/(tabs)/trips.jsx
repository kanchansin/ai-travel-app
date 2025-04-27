//app/trips.jsx

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../../contexts/ThemeContext';
import TripCard from '../../components/trip/TripCard';
import Button from '../../components/ui/Button';
import { getUserTrips } from '../../services/trips';
import { useAuth } from '../../hooks/useAuth';
import EmptyState from '../../components/ui/EmptyState';

export default function Trips() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useTheme();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'upcoming', 'past'

  useEffect(() => {
    loadTrips();
  }, [user, filter]);

  const loadTrips = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userTrips = await getUserTrips(user.uid, filter);
      setTrips(userTrips);
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadTrips();
  };

  const navigateToCreateTrip = () => {
    router.push('/trip/create');
  };

  const navigateToTripDetails = (tripId) => {
    router.push(`/trip/${tripId}`);
  };

  const renderTripItem = ({ item }) => (
    <TripCard 
      trip={item} 
      onPress={() => navigateToTripDetails(item.id)}
    />
  );

  const renderEmptyState = () => (
    <EmptyState
      title="No trips found"
      description={
        filter === 'all' 
          ? "You haven't created any trips yet. Start planning your next adventure!"
          : filter === 'upcoming'
            ? "You don't have any upcoming trips. Time to plan one!"
            : "You don't have any past trips."
      }
      icon="map"
      action={
        <Button 
          title="Create Trip" 
          onPress={navigateToCreateTrip}
          icon={<Ionicons name="add" size={20} color="#fff" />}
        />
      }
    />
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>My Trips</Text>
        
        <Button
          variant="primary"
          size="small"
          icon={<Ionicons name="add" size={20} color="#fff" />}
          iconPosition="left"
          title="New Trip"
          onPress={navigateToCreateTrip}
        />
      </View>
      
      <View style={styles.filterContainer}>
        <Pressable 
          style={[
            styles.filterButton, 
            filter === 'all' && styles.activeFilterButton,
            { borderColor: colors.neutral }
          ]}
          onPress={() => setFilter('all')}
        >
          <Text style={[
            styles.filterText,
            filter === 'all' && styles.activeFilterText,
            { color: filter === 'all' ? colors.white : colors.text }
          ]}>
            All
          </Text>
        </Pressable>
        
        <Pressable 
          style={[
            styles.filterButton, 
            filter === 'upcoming' && styles.activeFilterButton,
            { borderColor: colors.neutral }
          ]}
          onPress={() => setFilter('upcoming')}
        >
          <Text style={[
            styles.filterText,
            filter === 'upcoming' && styles.activeFilterText,
            { color: filter === 'upcoming' ? colors.white : colors.text }
          ]}>
            Upcoming
          </Text>
        </Pressable>
        
        <Pressable 
          style={[
            styles.filterButton, 
            filter === 'past' && styles.activeFilterButton,
            { borderColor: colors.neutral }
          ]}
          onPress={() => setFilter('past')}
        >
          <Text style={[
            styles.filterText,
            filter === 'past' && styles.activeFilterText,
            { color: filter === 'past' ? colors.white : colors.text }
          ]}>
            Past
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={trips}
        renderItem={renderTripItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accent}
          />
        }
        ListEmptyComponent={!loading && renderEmptyState()}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  activeFilterButton: {
    backgroundColor: '#191970', // Will be overridden by colors.accent
  },
  filterText: {
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  separator: {
    height: 12,
  }
});