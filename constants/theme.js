// constants/theme.jsx
export const COLORS = {
    light: {
      primary: '#191970', // Midnight Blue
      accent: '#FF6B6B', // Coral Pink
      neutral: '#9CA3AF', // Cool Gray
      background: '#FFFFFF',
      text: '#1F2937',
      textLight: '#6B7280',
      card: '#F9FAFB',
      border: '#E5E7EB',
    },
    dark: {
      primary: '#FFFFFF', // Crisp White
      accent: '#67E8F9', // Soft Cyan
      neutral: '#78716C', // Stone Gray
      background: '#121212',
      text: '#F9FAFB',
      textLight: '#D1D5DB',
      card: '#1F2937',
      border: '#374151',
    },
  };
  
  export const SIZES = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
    layout: 16, // Consistent padding for screens
  };
  
  export const FONTS = {
    regular: {
      fontFamily: 'System',
      fontWeight: 'normal',
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500',
    },
    bold: {
      fontFamily: 'System',
      fontWeight: 'bold',
    },
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      title: 28,
    },
  };
  
  export const SHADOWS = {
    light: {
      small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      },
      medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
      },
      large: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
      },
    },
    dark: {
      small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 1,
      },
      medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 3,
      },
      large: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 5,
      },
    },
  };