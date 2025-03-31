/**
 * Environment configuration utility for Solstice App
 * 
 * Handles loading environment variables and providing defaults
 * for development and production environments
 */

import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Define environment variables types
interface Environment {
  SUPABASE_URL: string;
  SUPABASE_KEY: string;
  API_URL: string;
  STORAGE_URL: string;
  ENV: 'development' | 'production' | 'test';
  NODE_ENV: 'development' | 'production' | 'test';
  AGENT_API_URL: string;
  ENABLE_MOCK_DATA: string;
  YOUTUBE_API_KEY?: string;
  TIKTOK_API_KEY?: string;
  INSTAGRAM_API_KEY?: string;
}

// Get environment variables from Expo Constants
const expoConstants = Constants.expoConfig?.extra || {};

// Actual Supabase instance for development
const DEV_SUPABASE_URL = 'https://ogzmogthgwtckxtwucst.supabase.co';
const DEV_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nem1vZ3RoZ3d0Y2t4dHd1Y3N0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4NjQxMDQsImV4cCI6MjA1ODQ0MDEwNH0.uiiZtIqXhF2ws_z9U647jwVO2newwVaMoieRYYvuCLw';

// Function to get environment variables - will help with testing and different environments
export const getEnvironment = (): Environment => {
  // For testing in a local dev environment
  if (__DEV__) {
    return {
      // Try to get from environment variables first, then fall back to development credentials
      SUPABASE_URL: process.env.SUPABASE_URL || expoConstants.SUPABASE_URL || DEV_SUPABASE_URL,
      SUPABASE_KEY: process.env.SUPABASE_KEY || expoConstants.SUPABASE_KEY || DEV_SUPABASE_KEY,
      API_URL: process.env.API_URL || expoConstants.API_URL || 'http://localhost:3000',
      STORAGE_URL: process.env.STORAGE_URL || expoConstants.STORAGE_URL || `${DEV_SUPABASE_URL}/storage/v1`,
      ENV: 'development',
      NODE_ENV: 'development',
      AGENT_API_URL: process.env.AGENT_API_URL || expoConstants.AGENT_API_URL || 'http://localhost:3001/agent',
      ENABLE_MOCK_DATA: process.env.ENABLE_MOCK_DATA || expoConstants.ENABLE_MOCK_DATA || 'true',
      YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY || expoConstants.YOUTUBE_API_KEY,
      TIKTOK_API_KEY: process.env.TIKTOK_API_KEY || expoConstants.TIKTOK_API_KEY,
      INSTAGRAM_API_KEY: process.env.INSTAGRAM_API_KEY || expoConstants.INSTAGRAM_API_KEY,
    };
  }

  // For production - using the same credentials for now, but this would be different in a real production app
  return {
    SUPABASE_URL: expoConstants.SUPABASE_URL || DEV_SUPABASE_URL,
    SUPABASE_KEY: expoConstants.SUPABASE_KEY || DEV_SUPABASE_KEY,
    API_URL: expoConstants.API_URL || 'https://api.solsticeapp.com',
    STORAGE_URL: expoConstants.STORAGE_URL || `${DEV_SUPABASE_URL}/storage/v1`,
    ENV: 'production',
    NODE_ENV: 'production',
    AGENT_API_URL: expoConstants.AGENT_API_URL || 'https://api.solsticeapp.com/agent',
    ENABLE_MOCK_DATA: expoConstants.ENABLE_MOCK_DATA || 'false',
    YOUTUBE_API_KEY: expoConstants.YOUTUBE_API_KEY,
    TIKTOK_API_KEY: expoConstants.TIKTOK_API_KEY,
    INSTAGRAM_API_KEY: expoConstants.INSTAGRAM_API_KEY,
  };
};

/**
 * Use this to determine if we're in a web environment
 * Useful for conditionally implementing features that may work differently in web vs native
 */
export const isWeb = Platform.OS === 'web';

/**
 * Use this to determine if we're in a native environment
 * Useful for conditionally implementing features that may work differently in web vs native
 */
export const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

/**
 * Use this to log only in development environment
 * Automatically strips logs from production builds for security and performance
 * 
 * @param args - Arguments to log
 */
export const devLog = (...args: any[]): void => {
  if (__DEV__) {
    console.log(...args);
  }
};

/**
 * Access environment variables from anywhere in the app
 */
export const env = getEnvironment(); 