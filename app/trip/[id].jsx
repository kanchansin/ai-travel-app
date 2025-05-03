//app/trip/[id].jsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { getTrip, deleteTrip } from '../../services/firebase';
import MapView from '../../components/map/MapView';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const TripDetail = () => {
  const { id } = useLocalSearchParams();
  const theme = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('overview'); // 'overview', 'places', 'map'
  
  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const tripData = await getTrip(id);
        if (!tripData) {
          Alert.alert('Error', 'Trip not found');
          router.back();
          return;
        }
        setTrip(tripData);
      } catch (error) {
        console.error('Error fetching trip:', error);
        Alert.alert('Error', 'Could not load trip details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrip();
  }, [id]);
  
  const handleEdit = () => {
    router.push(`/trip/edit?id=${id}`);
  };
  
  const handleDelete = () => {
    Alert.alert(
      'Delete Trip',
      'Are you sure you want to delete this trip? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTrip(id);
              router.replace('/trips');
            } catch (error) {
              console.error('Error deleting trip:', error);
              Alert.alert('Error', 'Could not delete trip');
            }
          }
        }
      ]
    );
  };
  
  const handleCreateStory = () => {
    router.push(`/story/create?tripId=${id}`);
  };
  
  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Trip Header */}
      <View style={styles.header}>
        {trip.coverImage ? (
          <Image source={{ uri: trip.coverImage }} style={styles.coverImage} />
        ) : (
          <View style={[styles.coverPlaceholder, { backgroundColor: theme.colors.primary }]}>
            <Ionicons name="map-outline" size={60} color={theme.colors.background} />
          </View>
        )}
        
        <View style={styles.headerOverlay}>
          <Text style={[styles.title, { color: theme.colors.white }]}>{trip.title}</Text>
          <View style={styles.meta}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar" size={16} color={theme.colors.white} />
              <Text style={[styles.metaText, { color: theme.colors.white }]}>
                {trip.startDate && new Date(trip.startDate).toLocaleDateString()} - 
                {trip.endDate && new Date(trip.endDate).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="location" size={16} color={theme.colors.white} />
              <Text style={[styles.metaText, { color: theme.colors.white }]}>{trip.location}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="people" size={16} color={theme.colors.white} />
              <Text style={[styles.metaText, { color: theme.colors.white }]}>{trip.travelType}</Text>
            </View>
          </View>
        </View>
      </View>
      
      {/* Tab Navigation */}
      <View style={styles.tabs}>
        <TouchableOpacity 
          style={[styles.tab, currentTab === 'overview' && styles.activeTab]} 
          onPress={() => setCurrentTab('overview')}
        >
          <Text style={[
            styles.tabText, 
            { color: currentTab === 'overview' ? theme.colors.accent : theme.colors.text }
          ]}>Overview</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, currentTab === 'places' && styles.activeTab]} 
          onPress={() => setCurrentTab('places')}
        >
          <Text style={[
            styles.tabText, 
            { color: currentTab === 'places' ? theme.colors.accent : theme.colors.text }
          ]}>Places</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, currentTab === 'map' && styles.activeTab]} 
          onPress={() => setCurrentTab('map')}
        >
          <Text style={[
            styles.tabText, 
            { color: currentTab === 'map' ? theme.colors.accent : theme.colors.text }
          ]}>Map</Text>
        </TouchableOpacity>
      </View>
      
      {/* Tab Content */}
      <View style={styles.content}>
        {currentTab === 'overview' && (
          <ScrollView style={styles.scrollContent}>
            <Card style={styles.descriptionCard}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>About this trip</Text>
              <Text style={[styles.description, { color: theme.colors.text }]}>
                {trip.description || 'No description provided.'}
              </Text>
            </Card>
            
            <View style={styles.buttonContainer}>
              <Button 
                title="Edit Trip" 
                icon="create-outline" 
                onPress={handleEdit} 
                style={styles.button}
              />
              <Button 
                title="Create Story" 
                icon="book-outline" 
                onPress={handleCreateStory} 
                style={styles.button}
              />
              <Button 
                title="Delete" 
                icon="trash-outline" 
                variant="danger" 
                onPress={handleDelete} 
                style={styles.button}
              />
            </View>
          </ScrollView>
        )}
        
        {currentTab === 'places' && (
          <ScrollView style={styles.scrollContent}>
            {trip.places && trip.places.length > 0 ? (
              trip.places.map((place, index) => (
                <Card key={index} style={styles.placeCard}>
                  <View style={styles.placeHeader}>
                    <Ionicons 
                      name={place.type === 'restaurant' ? 'restaurant' : 
                             place.type === 'attraction' ? 'camera' : 
                             place.type === 'hotel' ? 'bed' : 'location'} 
                      size={24} 
                      color={theme.colors.accent} 
                    />
                    <Text style={[styles.placeName, { color: theme.colors.text }]}>{place.name}</Text>
                  </View>
                  {place.description && (
                    <Text style={[styles.placeDescription, { color: theme.colors.textSecondary }]}>
                      {place.description}
                    </Text>
                  )}
                  <View style={styles.placeFooter}>
                    <Text style={[styles.placeAddress, { color: theme.colors.textSecondary }]}>
                      {place.address}
                    </Text>
                  </View>
                </Card>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="compass-outline" size={48} color={theme.colors.textSecondary} />
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                  No places added to this trip yet
                </Text>
              </View>
            )}
          </ScrollView>
        )}
        
        {currentTab === 'map' && (
          <View style={styles.mapContainer}>
            {trip.places && trip.places.length > 0 ? (
              <MapView
                initialRegion={{
                  latitude: trip.places[0].latitude || 0,
                  longitude: trip.places[0].longitude || 0,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421
                }}
                showPOIs={false}
                customMarkers={trip.places}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="map-outline" size={48} color={theme.colors.textSecondary} />
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                  No places to show on map
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

export default TripDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    height: 200,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 14,
    marginLeft: 4,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
    padding: 16,
  },
  descriptionCard: {
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  button: {
    marginBottom: 8,
    flexBasis: '48%',
  },
  placeCard: {
    padding: 16,
    marginBottom: 12,
  },
  placeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  placeName: {
    fontSize: 18,
    fontWeight: '500',
    marginLeft: 8,
  },
  placeDescription: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  placeFooter: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 8,
    marginTop: 8,
  },
  placeAddress: {
    fontSize: 14,
  },
  mapContainer: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  }
});