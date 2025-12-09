import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (!isDarkMode) {
        // Only auto-switch if user hasn't manually set a preference
        setIsDarkMode(colorScheme === 'dark');
      }
    });

    return () => subscription.remove();
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const theme = {
    isDarkMode,
    toggleTheme,
    colors: isDarkMode ? darkColors : lightColors,
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

const lightColors = {
  // Background colors
  background: '#F8F9FA',
  surface: '#FFFFFF',
  surfaceVariant: '#F8F9FA',
  
  // Text colors
  text: '#000000',
  textSecondary: '#8E8E93',
  textTertiary: '#C7C7CC',
  
  // Primary colors
  primary: '#6200ee',
  primaryLight: '#A78BFA',
  primaryDark: '#3700B3',
  
  // Status colors
  error: '#FF3B30',
  errorLight: '#FFE5E5',
  success: '#4CAF50',
  successLight: '#E8F5E9',
  warning: '#FF9800',
  info: '#2196F3',
  
  // Border colors
  border: '#F0F0F0',
  borderLight: '#E5E5EA',
  
  // Card colors
  cardBackground: '#FFFFFF',
  
  // Specific feature colors
  steps: '#FF6B6B',
  activeTime: '#4ECDC4',
  heartRate: '#FF6B6B',
  water: '#4A90E2',
  sleep: '#9B59B6',
  calories: '#F39C12',
  
  // Category backgrounds
  activityBg: '#FFE5E5',
  nutritionBg: '#E8F5E9',
  bodyBg: '#FFF3E0',
  mindfulnessBg: '#F3E5F5',
  reportsBg: '#E3F2FD',
  goalsBg: '#E0F7FA',
};

const darkColors = {
  // Background colors
  background: '#000000',
  surface: '#1C1C1E',
  surfaceVariant: '#2C2C2E',
  
  // Text colors
  text: '#FFFFFF',
  textSecondary: '#EBEBF5',
  textTertiary: '#8E8E93',
  
  // Primary colors
  primary: '#A78BFA',
  primaryLight: '#C4B5FD',
  primaryDark: '#7C3AED',
  
  // Status colors
  error: '#FF453A',
  errorLight: '#3A1A1A',
  success: '#66BB6A',
  successLight: '#1A3A1A',
  warning: '#FFB74D',
  info: '#42A5F5',
  
  // Border colors
  border: '#38383A',
  borderLight: '#48484A',
  
  // Card colors
  cardBackground: '#1C1C1E',
  
  // Specific feature colors
  steps: '#FF6B6B',
  activeTime: '#4ECDC4',
  heartRate: '#FF6B6B',
  water: '#64B5F6',
  sleep: '#BA68C8',
  calories: '#FFA726',
  
  // Category backgrounds
  activityBg: '#3A2828',
  nutritionBg: '#2A3A2A',
  bodyBg: '#3A3228',
  mindfulnessBg: '#3A2A3A',
  reportsBg: '#2A3238',
  goalsBg: '#2A3A3A',
};
