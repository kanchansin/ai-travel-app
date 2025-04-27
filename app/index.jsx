// app/index.jsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Button from '../components/ui/Button';
import { SIZES, FONTS, COLORS } from '../constants/theme';

export default function SplashScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, loading } = useAuth();

  useEffect(() => {
    const checkFirstTime = async () => {
      try {
        // Wait for auth to initialize
        if (loading) return;
        
        // Check if this is the first time launching the app
        const isFirstTime = await AsyncStorage.getItem('firstTimeOpen');
        
        if (!isFirstTime) {
          // First time opening the app
          setTimeout(() => {
            router.replace('/onboarding');
          }, 2000);
          
          // Set flag for future launches
          await AsyncStorage.setItem('firstTimeOpen', 'false');
        } else if (user) {
          // User is logged in
          setTimeout(() => {
            router.replace('/(tabs)/explore');
          }, 2000);
        } else {
          // User is not logged in but not first time
          setTimeout(() => {
            router.replace('/(auth)/login');
          }, 2000);
        }
      } catch (error) {
        console.error('Error checking first time:', error);
        // Default to login if there's an error
        setTimeout(() => {
          router.replace('/(auth)/login');
        }, 2000);
      }
    };

    checkFirstTime();
  }, [loading, user]);

  return (
    <View style={[styles.container, { backgroundColor: COLORS.background }]}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={[styles.appName, { color: COLORS.primary }]}>
          AI Travel Planner
        </Text>
        <Text style={[styles.tagline, { color: COLORS.textLight }]}>
          Your smart companion for local adventures
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.layout,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: SIZES.md,
  },
  appName: {
    ...FONTS.bold,
    fontSize: FONTS.sizes.title,
    marginBottom: SIZES.xs,
  },
  tagline: {
    ...FONTS.regular,
    fontSize: FONTS.sizes.md,
  },
});