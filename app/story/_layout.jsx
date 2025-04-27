import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Layout component for story-related screens
 */
export default function StoryLayout() {
  const { theme } = useTheme();
  
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
        name="[id]"
        options={{
          title: "Travel Story",
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          title: "Share Your Story",
        }}
      />
      <Stack.Screen
        name="edit"
        options={{
          title: "Edit Story",
        }}
      />
    </Stack>
  );
}