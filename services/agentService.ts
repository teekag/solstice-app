/**
 * Agent Services for Solstice App
 * These functions handle AI-powered operations like content parsing, cue generation, and recommendations
 */

import { Card, Cue } from '../types/card';
import { Routine } from '../types/routine';
import { UserProfile } from '../types/user';
import { supabase } from './supabaseService';
import { env, devLog } from '../utils/environment';
import { handleError } from '../utils/errorHandling';

// Base URL for the agent API
const AGENT_API_BASE_URL = env.AGENT_API_URL || 'https://api.solstice-app.com/agent';

/**
 * Parses content from a URL into structured cards
 * @param url URL to a video, blog post, or other content
 * @returns Array of structured Card objects
 */
export const intakeAgent = async (url: string): Promise<Card[]> => {
  try {
    console.log(`Processing URL: ${url}`);
    
    // Check if we should use mock data for development
    if (env.ENABLE_MOCK_DATA === 'true') {
      // Return mock data based on URL type
      return getMockCards(url);
    }
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Make API call to the agent service
    const response = await fetch(`${AGENT_API_BASE_URL}/parse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.id}`
      },
      body: JSON.stringify({ url })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to process URL');
    }
    
    const data = await response.json();
    
    // Process and return the cards
    return data.cards.map((card: any) => ({
      ...card,
      id: card.id || `card-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      created_at: new Date(),
      updated_at: new Date(),
      user_id: user.id,
      createdBy: 'agent'
    }));
  } catch (error) {
    console.error('Error in intakeAgent:', error);
    handleError(error, {
      context: { url },
      showAlert: true
    });
    // Fallback to mock data if API fails
    return getMockCards(url);
  }
};

/**
 * Generates suggested cues for a card based on its content
 * @param card Card object to analyze
 * @returns Array of suggested Cue objects
 */
export const cueAgent = async (card: Card): Promise<Cue[]> => {
  try {
    // Check if we should use mock data for development
    if (env.ENABLE_MOCK_DATA === 'true') {
      return getMockCues(card);
    }
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Make API call to the agent service
    const response = await fetch(`${AGENT_API_BASE_URL}/cue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.id}`
      },
      body: JSON.stringify({ card })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to generate cues');
    }
    
    const data = await response.json();
    return data.cues;
  } catch (error) {
    console.error('Error in cueAgent:', error);
    handleError(error, {
      context: { cardId: card.id },
      showAlert: true
    });
    // Fallback to mock data if API fails
    return getMockCues(card);
  }
};

/**
 * Recommends content based on user profile
 * @param profile User profile with preferences
 * @returns Array of recommended content
 */
export const recommendAgent = async (profile: UserProfile): Promise<any[]> => {
  try {
    // Check if we should use mock data for development
    if (env.ENABLE_MOCK_DATA === 'true') {
      return getMockRecommendations(profile);
    }
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Make API call to the agent service
    const response = await fetch(`${AGENT_API_BASE_URL}/recommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.id}`
      },
      body: JSON.stringify({ 
        userId: user.id,
        tags: profile.interests // Use tags from user profile
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get recommendations');
    }
    
    const data = await response.json();
    return data.routines;
  } catch (error) {
    console.error('Error in recommendAgent:', error);
    handleError(error, {
      context: { profileId: profile.id },
      showAlert: true
    });
    // Fallback to mock data if API fails
    return getMockRecommendations(profile);
  }
};

/**
 * Optimizes a routine based on fitness principles
 * @param routine Routine to optimize
 * @returns Optimized routine
 */
export const optimizeRoutine = async (routine: Routine): Promise<Routine> => {
  try {
    // Check if we should use mock data for development
    if (env.ENABLE_MOCK_DATA === 'true') {
      return { ...routine }; // Just return the same routine for now
    }
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Make API call to the agent service
    const response = await fetch(`${AGENT_API_BASE_URL}/optimize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.id}`
      },
      body: JSON.stringify({ routine })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to optimize routine');
    }
    
    const data = await response.json();
    return data.routine;
  } catch (error) {
    console.error('Error in optimizeRoutine:', error);
    // Fallback to original routine if API fails
    return { ...routine };
  }
};

// Helper function to save content object to database
const saveContentObject = async (url: string, platform: string, mediaUrl?: string, thumbnailUrl?: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data, error } = await supabase
      .from('content_objects')
      .insert({
        user_id: user.id,
        url,
        platform,
        media_url: mediaUrl,
        thumbnail_url: thumbnailUrl,
        timestamp_saved: new Date()
      });
      
    if (error) {
      console.error('Error saving content object:', error);
    }
    
    return data;
  } catch (error) {
    console.error('Error in saveContentObject:', error);
  }
};

// Mock data functions for development and fallback
const getMockCards = (url: string): Card[] => {
  if (url.includes('youtube') || url.includes('youtu.be')) {
    return [
      {
        id: '1',
        title: 'Warm-up Routine',
        description: 'A gentle 5-minute warm-up before the main workout',
        source_url: url,
        source_type: 'youtube',
        thumbnail_url: 'https://via.placeholder.com/300x200',
        media_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        startTime: 0,
        endTime: 300,
        duration: 300, // 5 minutes
        tags: [],
        cues: [
          { id: 'c1', label: 'Keep your back straight', type: 'form' },
          { id: 'c2', label: 'Breathe deeply', type: 'breathing', timestamp: 120 }
        ],
        created_at: new Date(),
        updated_at: new Date(),
        user_id: 'mock-user',
        createdBy: 'agent'
      },
      {
        id: '2',
        title: 'Core Exercise 1',
        description: 'First core strengthening exercise',
        source_url: url,
        source_type: 'youtube',
        thumbnail_url: 'https://via.placeholder.com/300x200',
        media_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        startTime: 310,
        endTime: 490,
        duration: 180, // 3 minutes
        sets: 3,
        reps: 12,
        tags: [],
        cues: [
          { id: 'c3', label: 'Engage your core', type: 'focus', timestamp: 330 },
          { id: 'c4', label: 'Slow controlled movement', type: 'tempo', timestamp: 400 }
        ],
        created_at: new Date(),
        updated_at: new Date(),
        user_id: 'mock-user',
        createdBy: 'agent'
      },
      // Additional cards...
    ];
  } else if (url.includes('tiktok')) {
    // TikTok mock response
    return [
      {
        id: '5',
        title: 'Quick HIIT Workout',
        description: 'High-intensity interval training in 60 seconds',
        source_url: url,
        source_type: 'tiktok',
        thumbnail_url: 'https://via.placeholder.com/300x200',
        media_url: url,
        startTime: 0,
        endTime: 60,
        duration: 60,
        sets: 3,
        reps: 20,
        tags: [],
        cues: [
          { id: 'c9', label: 'Maximum effort', type: 'intensity', timestamp: 10 },
          { id: 'c10', label: 'Control your breathing', type: 'breathing', timestamp: 30 }
        ],
        created_at: new Date(),
        updated_at: new Date(),
        user_id: 'mock-user',
        createdBy: 'agent'
      }
    ];
  } else {
    // Default mock response for other URLs
    return [
      {
        id: '7',
        title: 'General Exercise',
        description: 'Exercise from web content',
        source_url: url,
        source_type: 'web',
        thumbnail_url: 'https://via.placeholder.com/300x200',
        startTime: 0,
        endTime: 120,
        duration: 120,
        tags: [],
        cues: [],
        created_at: new Date(),
        updated_at: new Date(),
        user_id: 'mock-user',
        createdBy: 'agent'
      }
    ];
  }
};

const getMockCues = (card: Card): Cue[] => {
  // Generate different cues based on card title/content
  if (card.title.toLowerCase().includes('core')) {
    return [
      { id: `suggested-${Date.now()}-1`, label: 'Keep your core engaged', type: 'form' },
      { id: `suggested-${Date.now()}-2`, label: 'Breathe through the movement', type: 'breathing' },
      { id: `suggested-${Date.now()}-3`, label: 'Focus on slow, controlled motion', type: 'tempo' }
    ];
  } else if (card.title.toLowerCase().includes('warm')) {
    return [
      { id: `suggested-${Date.now()}-1`, label: 'Keep movements fluid', type: 'form' },
      { id: `suggested-${Date.now()}-2`, label: 'Gradually increase intensity', type: 'intensity' },
      { id: `suggested-${Date.now()}-3`, label: 'Focus on mobility', type: 'focus' }
    ];
  } else {
    return [
      { id: `suggested-${Date.now()}-1`, label: 'Maintain proper form', type: 'form' },
      { id: `suggested-${Date.now()}-2`, label: 'Stay hydrated', type: 'general' },
      { id: `suggested-${Date.now()}-3`, label: 'Focus on the target muscles', type: 'focus' }
    ];
  }
};

const getMockRecommendations = (profile: UserProfile): any[] => {
  return [
    {
      id: 'rec1',
      title: '15-Minute Morning Yoga',
      description: 'Start your day with this energizing yoga routine',
      thumbnail: 'https://via.placeholder.com/300x200',
      type: 'routine',
      tags: ['yoga', 'morning', 'beginner']
    },
    {
      id: 'rec2',
      title: 'HIIT Cardio Blast',
      description: 'Intense cardio workout to burn calories fast',
      thumbnail: 'https://via.placeholder.com/300x200',
      type: 'routine',
      tags: ['hiit', 'cardio', 'intermediate']
    },
    {
      id: 'rec3',
      title: 'Full Body Strength',
      description: 'Complete strength training routine for all major muscle groups',
      thumbnail: 'https://via.placeholder.com/300x200',
      type: 'routine',
      tags: ['strength', 'full-body', 'advanced']
    }
  ];
};