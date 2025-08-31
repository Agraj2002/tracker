import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';

// Initial state for theme
const initialState = {
  theme: localStorage.getItem('theme') || 'light',
  preferences: {
    currency: localStorage.getItem('currency') || 'USD',
    dateFormat: localStorage.getItem('dateFormat') || 'MM/DD/YYYY',
    language: localStorage.getItem('language') || 'en'
  }
};

// Action types
const THEME_ACTIONS = {
  SET_THEME: 'SET_THEME',
  SET_CURRENCY: 'SET_CURRENCY',
  SET_DATE_FORMAT: 'SET_DATE_FORMAT',
  SET_LANGUAGE: 'SET_LANGUAGE',
  RESET_PREFERENCES: 'RESET_PREFERENCES'
};

// Reducer function
const themeReducer = (state, action) => {
  switch (action.type) {
    case THEME_ACTIONS.SET_THEME:
      return {
        ...state,
        theme: action.payload
      };

    case THEME_ACTIONS.SET_CURRENCY:
      return {
        ...state,
        preferences: {
          ...state.preferences,
          currency: action.payload
        }
      };

    case THEME_ACTIONS.SET_DATE_FORMAT:
      return {
        ...state,
        preferences: {
          ...state.preferences,
          dateFormat: action.payload
        }
      };

    case THEME_ACTIONS.SET_LANGUAGE:
      return {
        ...state,
        preferences: {
          ...state.preferences,
          language: action.payload
        }
      };

    case THEME_ACTIONS.RESET_PREFERENCES:
      return {
        ...initialState
      };

    default:
      return state;
  }
};

// Create context
const ThemeContext = createContext();

// Theme provider component
export const ThemeProvider = ({ children }) => {
  const [state, dispatch] = useReducer(themeReducer, initialState);

  // Apply theme to document
  React.useEffect(() => {
    const root = document.documentElement;
    if (state.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', state.theme);
  }, [state.theme]);

  // Save preferences to localStorage
  React.useEffect(() => {
    localStorage.setItem('currency', state.preferences.currency);
    localStorage.setItem('dateFormat', state.preferences.dateFormat);
    localStorage.setItem('language', state.preferences.language);
  }, [state.preferences]);

  // Toggle theme function with useCallback for optimization
  const toggleTheme = useCallback(() => {
    dispatch({
      type: THEME_ACTIONS.SET_THEME,
      payload: state.theme === 'light' ? 'dark' : 'light'
    });
  }, [state.theme]);

  // Set specific theme
  const setTheme = useCallback((theme) => {
    dispatch({
      type: THEME_ACTIONS.SET_THEME,
      payload: theme
    });
  }, []);

  // Set currency
  const setCurrency = useCallback((currency) => {
    dispatch({
      type: THEME_ACTIONS.SET_CURRENCY,
      payload: currency
    });
  }, []);

  // Set date format
  const setDateFormat = useCallback((format) => {
    dispatch({
      type: THEME_ACTIONS.SET_DATE_FORMAT,
      payload: format
    });
  }, []);

  // Set language
  const setLanguage = useCallback((language) => {
    dispatch({
      type: THEME_ACTIONS.SET_LANGUAGE,
      payload: language
    });
  }, []);

  // Reset all preferences
  const resetPreferences = useCallback(() => {
    dispatch({ type: THEME_ACTIONS.RESET_PREFERENCES });
  }, []);

  // Format currency utility function
  const formatCurrency = useCallback((amount) => {
    const currencySymbols = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      INR: '₹',
      JPY: '¥'
    };

    const symbol = currencySymbols[state.preferences.currency] || '$';
    return `${symbol}${amount.toLocaleString()}`;
  }, [state.preferences.currency]);

  // Format date utility function
  const formatDate = useCallback((date) => {
    const dateObj = new Date(date);
    const format = state.preferences.dateFormat;

    switch (format) {
      case 'DD/MM/YYYY':
        return dateObj.toLocaleDateString('en-GB');
      case 'YYYY-MM-DD':
        return dateObj.toISOString().split('T')[0];
      case 'MM/DD/YYYY':
      default:
        return dateObj.toLocaleDateString('en-US');
    }
  }, [state.preferences.dateFormat]);

  // Get theme colors based on current theme
  const getThemeColors = useCallback(() => {
    return state.theme === 'dark' ? {
      primary: '#875cf5',
      secondary: '#6366f1',
      background: '#1f2937',
      surface: '#374151',
      text: '#f9fafb',
      textSecondary: '#d1d5db',
      border: '#4b5563'
    } : {
      primary: '#875cf5',
      secondary: '#6366f1',
      background: '#fcfbfc',
      surface: '#ffffff',
      text: '#111827',
      textSecondary: '#6b7280',
      border: '#e5e7eb'
    };
  }, [state.theme]);

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    ...state,
    toggleTheme,
    setTheme,
    setCurrency,
    setDateFormat,
    setLanguage,
    resetPreferences,
    formatCurrency,
    formatDate,
    getThemeColors,
    isDark: state.theme === 'dark'
  }), [
    state,
    toggleTheme,
    setTheme,
    setCurrency,
    setDateFormat,
    setLanguage,
    resetPreferences,
    formatCurrency,
    formatDate,
    getThemeColors
  ]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
