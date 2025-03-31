/**
 * Agent Services for Solstice App
 * These functions handle AI-powered operations like content parsing, cue generation, and recommendations
 */

import { Card, Cue } from '../types/card';
import { Routine } from '../types/routine';
import { UserProfile } from '../types/user';

/**
 * Parses content from a URL into structured cards
 * @param url URL to a video, blog post, or other content
 * @returns Array of structured Card objects
 */
export const intakeAgent = async (url: string): Promise<Card[]> => {
  // In a production app, this would call an actual API
  // For development, return mock data
  
  console.log(`Processing URL: ${url}`);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Mock response based on URL type
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
      {
        id: '3',
        title: 'Rest Period',
        description: 'Short rest before continuing',
        source_url: url,
        source_type: 'youtube',
        media_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        startTime: 490,
        endTime: 550,
        duration: 60, // 1 minute
        tags: [],
        cues: [],
        created_at: new Date(),
        updated_at: new Date(),
        user_id: 'mock-user',
        createdBy: 'agent'
      },
      {
        id: '4',
        title: 'Core Exercise 2',
        description: 'Second core strengthening exercise',
        source_url: url,
        source_type: 'youtube',
        thumbnail_url: 'https://via.placeholder.com/300x200',
        media_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        startTime: 550,
        endTime: 790,
        duration: 240, // 4 minutes
        sets: 4,
        reps: 10,
        tags: [],
        cues: [
          { id: 'c5', label: 'Keep your hips stable', type: 'form', timestamp: 600 }
        ],
        created_at: new Date(),
        updated_at: new Date(),
        user_id: 'mock-user',
        createdBy: 'agent'
      }
    ];
  } else if (url.includes('instagram') || url.includes('insta')) {
    return [
      {
        id: '5',
        title: 'Quick HIIT Burst',
        description: 'High-intensity interval training from Instagram',
        source_url: url,
        source_type: 'instagram',
        thumbnail_url: 'https://via.placeholder.com/300x300',
        media_url: 'https://www.instagram.com/p/mock-post/',
        startTime: 0,
        endTime: 45,
        duration: 45,
        tags: [],
        cues: [
          { id: 'c6', label: 'Maximum effort!', type: 'focus', timestamp: 15 },
          { id: 'c7', label: 'Control your breathing', type: 'breathing', timestamp: 30 }
        ],
        created_at: new Date(),
        updated_at: new Date(),
        user_id: 'mock-user',
        createdBy: 'agent'
      },
      {
        id: '6',
        title: 'Recovery Stretch',
        description: 'Post-workout stretching routine',
        source_url: url,
        source_type: 'instagram',
        thumbnail_url: 'https://via.placeholder.com/300x300',
        media_url: 'https://www.instagram.com/p/mock-post/',
        startTime: 50,
        endTime: 110,
        duration: 60,
        tags: [],
        cues: [
          { id: 'c8', label: 'Hold for 10 seconds', type: 'tempo', timestamp: 60 }
        ],
        created_at: new Date(),
        updated_at: new Date(),
        user_id: 'mock-user',
        createdBy: 'agent'
      }
    ];
  } else if (url.includes('tiktok')) {
    return [
      {
        id: '7',
        title: 'Quick Abs Exercise',
        description: 'Fast and effective abs workout from TikTok',
        source_url: url,
        source_type: 'tiktok',
        thumbnail_url: 'https://via.placeholder.com/300x500',
        media_url: 'https://www.tiktok.com/@user/video/mock-video',
        startTime: 0,
        endTime: 30,
        duration: 30,
        tags: [],
        cues: [
          { id: 'c9', label: 'Tighten your core', type: 'form', timestamp: 10 }
        ],
        created_at: new Date(),
        updated_at: new Date(),
        user_id: 'mock-user',
        createdBy: 'agent'
      }
    ];
  } else if (url.includes('blog') || url.includes('article')) {
    return [
      {
        id: '8',
        title: 'Meditation Introduction',
        description: 'Introduction to mindful meditation practice',
        source_url: url,
        source_type: 'article',
        duration: 180, // 3 minutes
        tags: [],
        cues: [
          { id: 'c10', label: 'Find a comfortable seated position', type: 'form' },
          { id: 'c11', label: 'Focus on your breath', type: 'breathing', timestamp: 60 }
        ],
        created_at: new Date(),
        updated_at: new Date(),
        user_id: 'mock-user',
        createdBy: 'agent'
      },
      {
        id: '9',
        title: 'Body Scan',
        description: 'Progressive body awareness exercise',
        source_url: url,
        source_type: 'article',
        duration: 300, // 5 minutes
        tags: [],
        cues: [
          { id: 'c12', label: 'Start from your toes and move upward', type: 'focus', timestamp: 120 }
        ],
        created_at: new Date(),
        updated_at: new Date(),
        user_id: 'mock-user',
        createdBy: 'agent'
      }
    ];
  } else {
    // Default generic content
    return [
      {
        id: '10',
        title: 'Exercise from ' + new URL(url).hostname,
        description: 'Content parsed from the provided URL',
        source_url: url,
        source_type: 'custom',
        duration: 180,
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

/**
 * Suggests cues for a given video
 * @param video Video content to analyze
 * @returns Array of suggested cues
 */
export const cueAgent = async (video: string): Promise<Cue[]> => {
  // Mock implementation
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return [
    { id: 'auto1', label: 'Keep your core tight', type: 'form', timestamp: 15 },
    { id: 'auto2', label: 'Breathe with each movement', type: 'breathing', timestamp: 30 },
    { id: 'auto3', label: 'Focus on the muscle contraction', type: 'focus', timestamp: 45 }
  ];
};

/**
 * Recommends content based on user profile
 * @param profile User profile with preferences
 * @returns Array of recommended content
 */
export const recommendAgent = async (profile: UserProfile): Promise<any[]> => {
  // Mock implementation
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return [
    { type: 'routine', id: 'rec1', title: 'Morning Energizer' },
    { type: 'video', id: 'rec2', title: 'Advanced Yoga Flow' },
    { type: 'article', id: 'rec3', title: 'Nutrition for Recovery' }
  ];
};

/**
 * Optimizes a routine based on fitness principles
 * @param routine Routine to optimize
 * @returns Optimized routine
 */
export const optimizeRoutine = async (routine: Routine): Promise<Routine> => {
  // Mock implementation
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  // Return a copy of the routine with mock optimization
  return {
    ...routine,
    description: routine.description + ' (Optimized)'
  };
};