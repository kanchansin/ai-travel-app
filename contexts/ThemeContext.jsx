import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { COLORS, SPACING, FONTS, SHADOWS } from '../constants/theme';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [colorScheme, setColorScheme] = useState(systemColorScheme || 'light');

  useEffect(() => {
    if (systemColorScheme && ['light', 'dark'].includes(systemColorScheme)) {
      setColorScheme(systemColorScheme);
    }
  }, [systemColorScheme]);

  const toggleTheme = () => {
    setColorScheme(colorScheme === 'light' ? 'dark' : 'light');
  };

  // Validate colorScheme
  const validColorScheme = ['light', 'dark'].includes(colorScheme) ? colorScheme : 'light';

  const theme = {
    colors: COLORS[validColorScheme] || COLORS.light || {
      background: '#FFFFFF',
      primary: '#007AFF',
      white: '#FFFFFF',
      text: '#000000',
      gray: { 100: '#F7F7F7', 200: '#E0E0E0', 500: '#999999', 600: '#666666', 700: '#333333', 800: '#1A1A1A' },
      info: { 500: '#007AFF' },
      success: { 500: '#28A745' },
    },
    spacing: SPACING || { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
    fonts: FONTS || { regular: 'System', bold: 'System' },
    shadows: SHADOWS[validColorScheme] || SHADOWS.light || {
      md: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
    },
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      colorScheme: validColorScheme, 
      toggleTheme, 
      setColorScheme 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;