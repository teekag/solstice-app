/**
 * Content Service for Solstice App
 * Handles saving, retrieving, and managing content objects
 */
import { ContentObject } from '../types/contentObject';

// Mock storage for saved content
let savedContent: ContentObject[] = [
  {
    id: '1',
    platform: 'youtube',
    title: 'Full Body HIIT Workout',
    url: 'https://www.youtube.com/watch?v=example1',
    mediaUrl: 'https://www.youtube.com/embed/example1',
    thumbnailUrl: 'https://via.placeholder.com/300x200?text=HIIT+Workout',
    timestampSaved: new Date().toISOString(),
    userId: 'mock-user'
  },
  {
    id: '2',
    platform: 'instagram',
    title: 'Quick Morning Yoga Routine',
    url: 'https://www.instagram.com/p/example2',
    mediaUrl: 'https://www.instagram.com/p/example2/embed',
    thumbnailUrl: 'https://via.placeholder.com/300x300?text=Morning+Yoga',
    timestampSaved: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    userId: 'mock-user'
  },
  {
    id: '3',
    platform: 'tiktok',
    title: '60-Second Ab Challenge',
    url: 'https://www.tiktok.com/@user/video/example3',
    mediaUrl: 'https://www.tiktok.com/embed/example3',
    thumbnailUrl: 'https://via.placeholder.com/300x500?text=Ab+Challenge',
    timestampSaved: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    userId: 'mock-user'
  },
  {
    id: '4',
    platform: 'article',
    title: 'Mindfulness Meditation Guide',
    url: 'https://example.com/meditation-guide',
    thumbnailUrl: 'https://via.placeholder.com/300x200?text=Meditation+Guide',
    timestampSaved: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    userId: 'mock-user'
  }
];

/**
 * Get all saved content for a user
 * @param userId User ID
 * @returns Array of ContentObject
 */
export const getSavedContent = async (userId: string): Promise<ContentObject[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Filter by user ID
  return savedContent.filter(content => content.userId === userId);
};

/**
 * Save new content
 * @param content ContentObject to save
 * @returns Saved ContentObject with ID
 */
export const saveContent = async (content: Omit<ContentObject, 'id'>): Promise<ContentObject> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Generate ID and add timestamp if not provided
  const newContent: ContentObject = {
    ...content,
    id: `content-${Date.now()}`,
    timestampSaved: content.timestampSaved || new Date().toISOString()
  };
  
  // Add to mock storage
  savedContent = [newContent, ...savedContent];
  
  return newContent;
};

/**
 * Delete saved content
 * @param contentId Content ID to delete
 * @returns Success boolean
 */
export const deleteContent = async (contentId: string): Promise<boolean> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Filter out the content to delete
  const initialLength = savedContent.length;
  savedContent = savedContent.filter(content => content.id !== contentId);
  
  return savedContent.length < initialLength;
};

/**
 * Get content by ID
 * @param contentId Content ID
 * @returns ContentObject or null if not found
 */
export const getContentById = async (contentId: string): Promise<ContentObject | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Find content by ID
  const content = savedContent.find(c => c.id === contentId);
  
  return content || null;
};

/**
 * Update parsed routine for content
 * @param contentId Content ID
 * @param parsedRoutineId ID of the parsed routine
 * @returns Updated ContentObject or null if not found
 */
export const updateContentWithParsedRoutine = async (
  contentId: string, 
  parsedRoutineId: string
): Promise<ContentObject | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  // Find and update content
  const contentIndex = savedContent.findIndex(c => c.id === contentId);
  
  if (contentIndex === -1) {
    return null;
  }
  
  // Update with parsed routine ID (in a real app, this would be the full routine or its ID)
  savedContent[contentIndex] = {
    ...savedContent[contentIndex],
    parsedRoutine: { id: parsedRoutineId } as any
  };
  
  return savedContent[contentIndex];
};
