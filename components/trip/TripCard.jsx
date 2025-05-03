import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Calendar, MapPin, Clock } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { formatDateRange } from '../../utils/dateUtils';

const TripCard = ({ trip, onPress }) => {
  const { 
    title, 
    destination, 
    image, 
    startDate, 
    endDate, 
    status, 
    places = [] 
  } = trip;

  const { theme } = useTheme();

  const dateRange = formatDateRange(startDate, endDate);
  const isUpcoming = new Date(startDate) > new Date();
  const isPast = new Date(endDate) < new Date();
  const isOngoing = !isUpcoming && !isPast;

  const statusColors = {
    upcoming: theme.colors.info[500],
    ongoing: theme.colors.success[500],
    past: theme.colors.gray[500],
  };

  const statusColor = isUpcoming 
    ? statusColors.upcoming 
    : isOngoing 
      ? statusColors.ongoing 
      : statusColors.past;

  const statusText = isUpcoming 
    ? 'Upcoming' 
    : isOngoing 
      ? 'Ongoing' 
      : 'Past';

  return (
    <TouchableOpacity 
      style={[styles.container, theme.shadows.md]} 
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: image || 'https://via.placeholder.com/400x200' }} 
          style={styles.image} 
          resizeMode="cover"
        />
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={[styles.statusText, { color: theme.colors.white }]}>
            {statusText}
          </Text>
        </View>
      </View>

      <View style={[styles.contentContainer, { padding: theme.sizes.md }]}>
        <Text style={[styles.title, { color: theme.colors.gray[800] }]} numberOfLines={1}>
          {title}
        </Text>
        
        <View style={[styles.infoRow, { marginBottom: theme.sizes.xs }]}>
          <MapPin size={16} color={theme.colors.gray[600]} />
          <Text style={[styles.infoText, { color: theme.colors.gray[600] }]} numberOfLines={1}>
            {destination}
          </Text>
        </View>
        
        <View style={[styles.infoRow, { marginBottom: theme.sizes.xs }]}>
          <Calendar size={16} color={theme.colors.gray[600]} />
          <Text style={[styles.infoText, { color: theme.colors.gray[600] }]}>
            {dateRange}
          </Text>
        </View>
        
        {places.length > 0 && (
          <View style={[styles.infoRow, { marginBottom: theme.sizes.xs }]}>
            <Clock size={16} color={theme.colors.gray[600]} />
            <Text style={[styles.infoText, { color: theme.colors.gray[600] }]}>
              {places.length} {places.length === 1 ? 'Place' : 'Places'} to visit
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 140,
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  contentContainer: {},
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
  },
});

export default TripCard;