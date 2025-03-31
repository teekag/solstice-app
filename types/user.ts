/**
 * Types related to users and user profiles
 */

import { Tag } from './tag';

export interface User {
  id: string;
  email: string;
  profile?: UserProfile;
  // Supabase auth fields
  app_metadata?: any;
  user_metadata?: any;
  aud?: string;
  created_at?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  display_name?: string;
  bio?: string;
  profile_image_url?: string;
  interests?: string[]; // User's interests/preferences for content
  routines_created: number;
  routines_completed: number;
  created_at: Date;
  updated_at: Date;
}

export interface UserStats {
  routines_created: number;
  routines_completed: number;
  total_workout_time?: number; // in seconds
  streak?: number; // consecutive days with completed routines
  last_active?: Date;
} 