/**
 * Share Extension Service
 * 
 * Simulates handling content shared from other apps to Solstice
 * In a real implementation, this would integrate with native sharing APIs:
 * - iOS: Share Extension (https://developer.apple.com/documentation/uikit/uiactivityviewcontroller)
 * - Android: Intent Filters (https://developer.android.com/training/sharing/receive)
 */

import { handleSharedContent } from './repositoryService';
import { Card } from '../types/card';

// Types of content that can be shared with the app
export type SharedContentType = 'text' | 'url' | 'image' | 'video';

// Structure of content received from sharing
export interface SharedContent {
  type: SharedContentType;
  content: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  sourceApp?: string;
}

/**
 * Process content shared to the app from an external source
 * In a real implementation, this would be called by native code
 * when content is shared to the app
 */
export const processSharedContent = async (
  sharedContent: SharedContent
): Promise<Card> => {
  console.log(`Received shared content from ${sharedContent.sourceApp || 'external app'}`);
  
  // Process the shared content according to its type
  return await handleSharedContent({
    type: sharedContent.type,
    content: sharedContent.content,
    title: sharedContent.title,
    description: sharedContent.description,
    thumbnail: sharedContent.thumbnail,
  });
};

/**
 * Mock functions to simulate content being shared to the app
 * These would not exist in a real implementation, but are useful for testing
 */

// Simulate sharing a URL from a browser
export const simulateShareFromBrowser = async (url: string): Promise<Card> => {
  const sharedContent: SharedContent = {
    type: 'url',
    content: url,
    title: 'Shared from Browser',
    description: 'A web page shared from a browser',
    sourceApp: 'Chrome'
  };
  
  return await processSharedContent(sharedContent);
};

// Simulate sharing a post from Instagram
export const simulateShareFromInstagram = async (): Promise<Card> => {
  const sharedContent: SharedContent = {
    type: 'image',
    content: 'https://instagram.com/p/mockPostId',
    title: 'Yoga pose of the day',
    description: 'Try this challenging balance pose to improve your core strength',
    thumbnail: 'https://via.placeholder.com/400x400?text=Instagram+Post',
    sourceApp: 'Instagram'
  };
  
  return await processSharedContent(sharedContent);
};

// Simulate sharing a video from YouTube
export const simulateShareFromYouTube = async (): Promise<Card> => {
  const sharedContent: SharedContent = {
    type: 'video',
    content: 'https://youtube.com/watch?v=mockVideoId',
    title: '15-Minute Full Body Workout',
    description: 'No equipment needed for this quick but effective routine',
    thumbnail: 'https://via.placeholder.com/480x360?text=YouTube+Thumbnail',
    sourceApp: 'YouTube'
  };
  
  return await processSharedContent(sharedContent);
};

// Simulate sharing a tweet from Twitter
export const simulateShareFromTwitter = async (): Promise<Card> => {
  const sharedContent: SharedContent = {
    type: 'text',
    content: 'Just finished a 5K run in 25 minutes! New personal best. #fitness #running',
    title: 'Tweet from @fitness_enthusiast',
    sourceApp: 'Twitter'
  };
  
  return await processSharedContent(sharedContent);
};

// Simulate sharing a text message from a messaging app
export const simulateShareFromMessaging = async (text: string): Promise<Card> => {
  const sharedContent: SharedContent = {
    type: 'text',
    content: text,
    title: 'Shared Message',
    sourceApp: 'Messages'
  };
  
  return await processSharedContent(sharedContent);
};

/**
 * Register the app to handle specific URL schemes
 * In a real implementation, this would be configured in app.json or Info.plist/AndroidManifest.xml
 * 
 * Example URL scheme: solstice://import?url=https://example.com/workout
 */
export const handleDeepLinkImport = async (url: string): Promise<Card | null> => {
  try {
    const parsedUrl = new URL(url);
    
    // Check if this is our custom URL scheme
    if (parsedUrl.protocol !== 'solstice:') {
      return null;
    }
    
    // Handle different paths
    if (parsedUrl.pathname === '/import') {
      const importUrl = parsedUrl.searchParams.get('url');
      if (importUrl) {
        const sharedContent: SharedContent = {
          type: 'url',
          content: importUrl,
          title: 'Deep Link Import',
          sourceApp: 'External'
        };
        
        return await processSharedContent(sharedContent);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error handling deep link:', error);
    return null;
  }
}; 