// app/onboarding.jsx
import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Dimensions, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import Button from '../components/ui/Button';
import { SIZES, FONTS } from '../constants/theme';

const { width } = Dimensions.get('window');

// Onboarding data
const onboardingData = [
  {
    id: '1',
    title: 'Personalized Travel Planning',
    description: 'Get AI-powered recommendations based on your travel style and preferences.',
    image: require('../assets/images/onboarding1.png'),
  },
  {
    id: '2',
    title: 'Discover Local Gems',
    description: 'Explore the best attractions, restaurants, and hidden spots around you.',
    image: require('../assets/images/onboarding2.png'),
  },
  {
    id: '3',
    title: 'Create Memorable Trips',
    description: 'Plan your trips easily and share your adventures with the community.',
    image: require('../assets/images/onboarding3.png'),
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  const router = useRouter();
  const { colors } = useTheme();

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      // Last slide, navigate to login
      router.replace('/(auth)/login');
    }
  };

  const handleSkip = () => {
    router.replace('/(auth)/login');
  };

  const renderOnboardingItem = ({ item }) => {
    return (
      <View style={[styles.slide, { width }]}>
        <Image 
          source={item.image} 
          style={styles.image} 
          resizeMode="contain" 
        />
        <Text style={[styles.title, { color: colors.primary }]}>
          {item.title}
        </Text>
        <Text style={[styles.description, { color: colors.textLight }]}>
          {item.description}
        </Text>
      </View>
    );
  };

  // Indicator dots
  const renderPagination = () => {
    return (
      <View style={styles.paginationContainer}>
        {onboardingData.map((_, index) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 16, 8],
            extrapolate: 'clamp',
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index.toString()}
              style={[
                styles.dot,
                { 
                  width: dotWidth,
                  opacity,
                  backgroundColor: colors.primary 
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderOnboardingItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(
            event.nativeEvent.contentOffset.x / width
          );
          setCurrentIndex(index);
        }}
      />

      {renderPagination()}

      <View style={styles.buttonsContainer}>
        <Button
          title="Skip"
          variant="text"
          onPress={handleSkip}
          style={styles.skipButton}
        />
        <Button
          title={currentIndex === onboardingData.length - 1 ? "Get Started" : "Next"}
          onPress={handleNext}
          style={styles.nextButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.layout,
  },
  image: {
    width: width * 0.8,
    height: width * 0.8,
    marginBottom: SIZES.xl,
  },
  title: {
    ...FONTS.bold,
    fontSize: FONTS.sizes.xl,
    marginBottom: SIZES.md,
    textAlign: 'center',
  },
  description: {
    ...FONTS.regular,
    fontSize: FONTS.sizes.md,
    textAlign: 'center',
    paddingHorizontal: SIZES.md,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.xl,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.layout,
    paddingBottom: SIZES.xl,
    alignItems: 'center',
  },
  skipButton: {
    width: 80,
  },
  nextButton: {
    width: 120,
  },
});