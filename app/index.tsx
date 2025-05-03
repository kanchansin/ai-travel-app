// app/index.tsx
import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SplashScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { user, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  const checkFirstTime = useCallback(async () => {
    try {
      if (loading) return;

      const isFirstTime = await AsyncStorage.getItem('firstTimeOpen');

      const navigate = (path: string) => {
        setTimeout(() => {
          router.replace(path);
        }, 2000);
      };

      if (!isFirstTime) {
        await AsyncStorage.setItem('firstTimeOpen', 'false');
        navigate('/onboarding');
      } else if (user) {
        navigate('/(tabs)/explore');
      } else {
        navigate('/(auth)/login');
      }
    } catch (err) {
      console.error('Error checking first time:', err);
      setError('Failed to load. Please try again.');
      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 2000);
    }
  }, [loading, user, router]);

  useEffect(() => {
    checkFirstTime();
  }, [checkFirstTime]);

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background, padding: theme.spacing.layout }]}>
        <Text
          style={[
            styles.errorText,
            {
              color: theme.colors.error,
              fontFamily: theme.fonts.regular.fontFamily,
              fontWeight: theme.fonts.regular.fontWeight,
              fontSize: theme.fonts.sizes.md,
              padding: theme.spacing.md,
            },
          ]}
        >
          {error}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background, padding: theme.spacing.layout }]}
      accessible
      accessibilityLabel="Splash screen"
      accessibilityHint="Loading the AI Travel Planner application"
    >
      {loading ? (
        <ActivityIndicator
          size="large"
          color={theme.colors.primary}
          style={[styles.loader, { marginBottom: theme.spacing.md }]}
          accessible
          accessibilityLabel="Loading"
        />
      ) : (
        <View style={styles.logoContainer}>
          {imageError ? (
            <Text
              style={[
                styles.fallbackText,
                {
                  color: theme.colors.text,
                  fontFamily: theme.fonts.bold.fontFamily,
                  fontWeight: theme.fonts.bold.fontWeight,
                  fontSize: theme.fonts.sizes.xl,
                  backgroundColor: theme.colors.gray['200'],
                  marginBottom: theme.spacing.md,
                },
              ]}
            >
              Logo
            </Text>
          ) : (
            <Image
              source={require('../assets/images/logo.png')}
              style={[styles.logo, { marginBottom: theme.spacing.md }]}
              resizeMode="contain"
              onError={() => setImageError(true)}
              accessible
              accessibilityLabel="AI Travel Planner logo"
            />
          )}
          <Text
            style={[
              styles.appName,
              {
                color: theme.colors.primary,
                fontFamily: theme.fonts.bold.fontFamily,
                fontWeight: theme.fonts.bold.fontWeight,
                fontSize: theme.fonts.sizes.title,
                marginBottom: theme.spacing.xs,
              },
            ]}
            accessible
            accessibilityRole="header"
          >
            AI Travel Planner
          </Text>
          <Text
            style={[
              styles.tagline,
              {
                color: theme.colors.textLight,
                fontFamily: theme.fonts.regular.fontFamily,
                fontWeight: theme.fonts.regular.fontWeight,
                fontSize: theme.fonts.sizes.md,
              },
            ]}
          >
            Your smart companion for local adventures
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
  },
  appName: {},
  tagline: {},
  loader: {},
  errorText: {
    textAlign: 'center',
  },
  fallbackText: {
    width: 120,
    height: 120,
    textAlign: 'center',
    lineHeight: 120,
  },
});