/**
 * Content Service for Solstice App
 * Handles saving, retrieving, and managing content objects
 */
import { ContentObject } from '../types/contentObject';
import { supabase } from './supabaseService';
import { env, devLog } from '../utils/environment';

/**
 * Get all saved content for a user
 * @param userId User ID
 * @returns Array of ContentObject
 */
export const getSavedContent = async (userId: string): Promise<ContentObject[]> => {
  try {
    // Use mock data for development if enabled
    if (env.ENABLE_MOCK_DATA === 'true') {
      return getMockSavedContent(userId);
    }
    
    const { data, error } = await supabase
      .from('content_objects')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp_saved', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    return data as ContentObject[];
  } catch (error) {
    devLog('Error getting saved content:', error);
    // Fallback to mock data if API fails
    return getMockSavedContent(userId);
  }
};

/**
 * Save new content
 * @param content ContentObject to save
 * @returns Saved ContentObject with ID
 */
export const saveContent = async (content: Omit<ContentObject, 'id'>): Promise<ContentObject> => {
  try {
    // Use mock data for development if enabled
    if (env.ENABLE_MOCK_DATA === 'true') {
      return saveMockContent(content);
    }
    
    const { data, error } = await supabase
      .from('content_objects')
      .insert({
        platform: content.platform,
        title: content.title,
        url: content.url,
        media_url: content.mediaUrl,
        thumbnail_url: content.thumbnailUrl,
        timestamp_saved: new Date().toISOString(),
        user_id: content.userId,
        metadata: content.metadata || {}
      })
      .select()
      .single();
      
    if (error) {
      throw error;
    }
    
    return data as ContentObject;
  } catch (error) {
    devLog('Error saving content:', error);
    // Fallback to mock data if API fails
    return saveMockContent(content);
  }
};

/**
 * Delete saved content
 * @param contentId Content ID to delete
 * @returns Success boolean
 */
export const deleteContent = async (contentId: string): Promise<boolean> => {
  try {
    // Use mock data for development if enabled
    if (env.ENABLE_MOCK_DATA === 'true') {
      return deleteMockContent(contentId);
    }
    
    const { error } = await supabase
      .from('content_objects')
      .delete()
      .eq('id', contentId);
      
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    devLog('Error deleting content:', error);
    // Fallback to mock data if API fails
    return deleteMockContent(contentId);
  }
};

/**
 * Get content by ID
 * @param contentId Content ID
 * @returns ContentObject or null if not found
 */
export const getContentById = async (contentId: string): Promise<ContentObject | null> => {
  try {
    // Use mock data for development if enabled
    if (env.ENABLE_MOCK_DATA === 'true') {
      return getMockContentById(contentId);
    }
    
    const { data, error } = await supabase
      .from('content_objects')
      .select('*')
      .eq('id', contentId)
      .single();
      
    if (error) {
      throw error;
    }
    
    return data as ContentObject;
  } catch (error) {
    devLog('Error getting content by ID:', error);
    // Fallback to mock data if API fails
    return getMockContentById(contentId);
  }
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
  try {
    // Use mock data for development if enabled
    if (env.ENABLE_MOCK_DATA === 'true') {
      return updateMockContentWithParsedRoutine(contentId, parsedRoutineId);
    }
    
    const { data, error } = await supabase
      .from('content_objects')
      .update({
        parsed: true,
        parsed_routine_id: parsedRoutineId,
        updated_at: new Date().toISOString()
      })
      .eq('id', contentId)
      .select()
      .single();
      
    if (error) {
      throw error;
    }
    
    return data as ContentObject;
  } catch (error) {
    devLog('Error updating content with parsed routine:', error);
    // Fallback to mock data if API fails
    return updateMockContentWithParsedRoutine(contentId, parsedRoutineId);
  }
};

// Mock implementations for development and fallback
// ------------------------------------------------

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

const getMockSavedContent = (userId: string): ContentObject[] => {
  return savedContent.filter(content => content.userId === userId);
};

const saveMockContent = (content: Omit<ContentObject, 'id'>): ContentObject => {
  const newContent = {
    ...content,
    id: `content-${Date.now()}`,
    timestampSaved: new Date().toISOString()
  };
  
  savedContent.unshift(newContent);
  return newContent;
};

const deleteMockContent = (contentId: string): boolean => {
  const initialLength = savedContent.length;
  savedContent = savedContent.filter(content => content.id !== contentId);
  return savedContent.length < initialLength;
};

const getMockContentById = (contentId: string): ContentObject | null => {
  return savedContent.find(content => content.id === contentId) || null;
};

const updateMockContentWithParsedRoutine = (
  contentId: string, 
  parsedRoutineId: string
): ContentObject | null => {
  const contentIndex = savedContent.findIndex(content => content.id === contentId);
  
  if (contentIndex === -1) {
    return null;
  }
  
  const updatedContent = {
    ...savedContent[contentIndex],
    parsed: true,
    parsedRoutineId
  };
  
  savedContent[contentIndex] = updatedContent;
  return updatedContent;
};
