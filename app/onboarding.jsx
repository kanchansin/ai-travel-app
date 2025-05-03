import React, { useState, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Dimensions, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import Button from '../components/ui/Button';

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
  const { theme } = useTheme();

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

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    slide: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.layout,
      width,
    },
    image: {
      width: width * 0.8,
      height: width * 0.8,
      marginBottom: theme.spacing.xl,
    },
    title: {
      fontFamily: theme.fonts.bold,
      fontSize: theme.fonts.size.large,
      color: theme.colors.primary,
      marginBottom: theme.spacing.md,
      textAlign: 'center',
    },
    description: {
      fontFamily: theme.fonts.regular,
      fontSize: theme.fonts.size.medium,
      color: theme.colors.textLight,
      textAlign: 'center',
      paddingHorizontal: theme.spacing.md,
    },
    paginationContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
    },
    dot: {
      height: 8,
      borderRadius: 4,
      marginHorizontal: 4,
      backgroundColor: theme.colors.primary,
    },
    buttonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.layout,
      paddingBottom: theme.spacing.xl,
      alignItems: 'center',
    },
    skipButton: {
      width: 80,
    },
    nextButton: {
      width: 120,
    },
  }), [theme]);

  const renderOnboardingItem = ({ item }) => {
    return (
      <View style={styles.slide}>
        <Image 
          source={item.image} 
          style={styles.image} 
          resizeMode="contain" 
        />
        <Text style={styles.title}>
          {item.title}
        </Text>
        <Text style={styles.description}>
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
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
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