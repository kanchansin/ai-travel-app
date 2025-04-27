import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Calendar, MapPin, Clock } from 'lucide-react-native';
import { colors, spacing, shadows } from '../../constants/theme';
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

  const dateRange = formatDateRange(startDate, endDate);
  const isUpcoming = new Date(startDate) > new Date();
  const isPast = new Date(endDate) < new Date();
  const isOngoing = !isUpcoming && !isPast;

  const statusColors = {
    upcoming: colors.info[500],
    ongoing: colors.success[500],
    past: colors.gray[500],
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
      style={styles.container} 
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
          <Text style={styles.statusText}>{statusText}</Text>
        </View>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        
        <View style={styles.infoRow}>
          <MapPin size={16} color={colors.gray[600]} />
          <Text style={styles.infoText} numberOfLines={1}>
            {destination}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Calendar size={16} color={colors.gray[600]} />
          <Text style={styles.infoText}>
            {dateRange}
          </Text>
        </View>
        
        {places.length > 0 && (
          <View style={styles.infoRow}>
            <Clock size={16} color={colors.gray[600]} />
            <Text style={styles.infoText}>
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
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    ...shadows.md,
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
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  contentContainer: {
    padding: spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray[800],
    marginBottom: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  infoText: {
    marginLeft: spacing.xs,
    fontSize: 14,
    color: colors.gray[600],
  },
});

export default TripCard;