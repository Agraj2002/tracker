import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import { apiService, API_ENDPOINTS } from '../utils/apiPath';
import toast from 'react-hot-toast';

// Helper function to safely parse JSON from localStorage
const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error('Error parsing stored user data:', error);
    localStorage.removeItem('user'); // Remove corrupted data
    return null;
  }
};

// Initial state for authentication
const initialState = {
  user: getStoredUser(),
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  SIGNUP_START: 'SIGNUP_START',
  SIGNUP_SUCCESS: 'SIGNUP_SUCCESS',
  SIGNUP_FAILURE: 'SIGNUP_FAILURE',
  LOGOUT: 'LOGOUT',
  SET_USER: 'SET_USER',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.SIGNUP_START:
      return {
        ...state,
        loading: true,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.SIGNUP_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.SIGNUP_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };

    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        loading: false
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Get current user function - defined early to avoid hoisting issues
  const getCurrentUser = useCallback(async () => {
    if (!state.token) return;

    try {
      const response = await apiService.auth.getCurrentUser();
      // Check if response has nested data structure
      const user = response.data.data?.user || response.data.user || response.data.data || response.data;
      dispatch({
        type: AUTH_ACTIONS.SET_USER,
        payload: user
      });
    } catch (error) {
      console.error('Error fetching current user:', error);
      // Only logout if it's an authentication error (401/403)
      if (error.response?.status === 401 || error.response?.status === 403) {
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      }
    }
  }, [state.token]);

  // Set up token in localStorage
  React.useEffect(() => {
    if (state.token) {
      localStorage.setItem('token', state.token);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, [state.token]);

  // Save user data to localStorage when it changes
  React.useEffect(() => {
    if (state.user) {
      localStorage.setItem('user', JSON.stringify(state.user));
    } else if (!state.token) {
      localStorage.removeItem('user');
    }
  }, [state.user, state.token]);

  // Initialize user data on app load if token exists but no user data
  React.useEffect(() => {
    if (state.token && !state.user && !state.loading) {
      getCurrentUser();
    }
  }, [state.token, state.user, state.loading, getCurrentUser]);

  // Login function with useCallback for optimization
  const login = useCallback(async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    
    try {
      const response = await apiService.auth.login(credentials);
      const { user, token } = response.data.data; // Extract from response.data.data
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token }
      });
      
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage
      });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Signup function with useCallback for optimization
  const signup = useCallback(async (userData) => {
    dispatch({ type: AUTH_ACTIONS.SIGNUP_START });
    
    try {
      const response = await apiService.auth.register(userData);
      const { user, token } = response.data.data; // Extract from response.data.data
      
      dispatch({
        type: AUTH_ACTIONS.SIGNUP_SUCCESS,
        payload: { user, token }
      });
      
      toast.success('Registration successful!');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      dispatch({
        type: AUTH_ACTIONS.SIGNUP_FAILURE,
        payload: errorMessage
      });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Logout function with useCallback for optimization
  const logout = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
    toast.success('Logged out successfully');
  }, []);

  // Clear error function
  const clearError = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  }, []);

  // Check if user has specific role
  const hasRole = useCallback((role) => {
    return state.user?.role === role;
  }, [state.user?.role]);

  // Check if user can perform action based on role
  const canPerformAction = useCallback((action) => {
    if (!state.user) return false;
    
    const userRole = state.user.role;
    
    switch (action) {
      case 'create':
      case 'update':
      case 'delete':
        return userRole === 'admin' || userRole === 'user';
      case 'read':
        return true; // All authenticated users can read
      default:
        return false;
    }
  }, [state.user]);

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    ...state,
    login,
    signup,
    logout,
    getCurrentUser,
    clearError,
    hasRole,
    canPerformAction
  }), [state, login, signup, logout, getCurrentUser, clearError, hasRole, canPerformAction]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
