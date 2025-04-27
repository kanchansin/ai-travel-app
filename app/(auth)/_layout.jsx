import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Layout component for the authentication screens
 */
export default function AuthLayout() {
  // Add a try-catch to see if the useTheme hook is causing the issue
  try {
    const { theme } = useTheme();
    
    // Add a check for theme and theme.colors
    if (!theme || !theme.colors) {
      console.error('Theme or theme.colors is undefined');
      // Return minimal UI to prevent crash
      return (
        <Stack screenOptions={{ headerStyle: { backgroundColor: '#FFFFFF' } }}>
          <Stack.Screen name="login" options={{ title: "Sign In" }} />
          <Stack.Screen name="register" options={{ title: "Create Account" }} />
        </Stack>
      );
    }
    
    return (
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerTintColor: theme.colors.text,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerBackTitleVisible: false,
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen
          name="login"
          options={{
            title: "Sign In",
          }}
        />
        <Stack.Screen
          name="register"
          options={{
            title: "Create Account",
          }}
        />
      </Stack>
    );
  } catch (error) {
    console.error('Error in AuthLayout:', error.message);
    // Fallback UI
    return (
      <Stack screenOptions={{ headerStyle: { backgroundColor: '#FFFFFF' } }}>
        <Stack.Screen name="login" options={{ title: "Sign In" }} />
        <Stack.Screen name="register" options={{ title: "Create Account" }} />
      </Stack>
    );
  }
}