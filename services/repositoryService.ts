/**
 * Repository Service for Solstice App
 * Handles content syncing from social media platforms and file management
 * 
 * NOTE: This is a mock implementation for testing purposes.
 * In a real app, you would use platform-specific APIs, auth tokens,
 * and integration with the device's sharing capabilities.
 */
import { Card } from '../types/card';

// Mock UUID generation
const generateMockId = () => Math.random().toString(36).substring(2, 15);

// Platform connection statuses
export interface PlatformConnection {
  platform: 'instagram' | 'twitter' | 'facebook' | 'youtube';
  isConnected: boolean;
  lastSynced?: Date;
  username?: string;
}

// Mock platform connections
let platformConnections: PlatformConnection[] = [
  { platform: 'instagram', isConnected: false },
  { platform: 'twitter', isConnected: false },
  { platform: 'facebook', isConnected: false },
  { platform: 'youtube', isConnected: false },
];

// Mock user ID
const MOCK_USER_ID = 'mock-user-123';

/**
 * Connect to a social media platform
 * In production, this would handle OAuth flows
 */
export const connectToPlatform = async (
  platform: 'instagram' | 'twitter' | 'facebook' | 'youtube',
  authToken?: string
): Promise<boolean> => {
  console.log(`Connecting to ${platform}...`);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // In production, we would:
  // 1. Validate the auth token with the platform's API
  // 2. Store the token securely
  // 3. Set up platform-specific collections or bookmarks
  
  // Update connection status
  platformConnections = platformConnections.map(conn => 
    conn.platform === platform 
      ? { 
          ...conn, 
          isConnected: true, 
          lastSynced: new Date(),
          username: `user_${platform}`
        } 
      : conn
  );
  
  return true;
};

/**
 * Disconnect from a platform
 */
export const disconnectFromPlatform = async (
  platform: 'instagram' | 'twitter' | 'facebook' | 'youtube'
): Promise<boolean> => {
  console.log(`Disconnecting from ${platform}...`);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Update connection status
  platformConnections = platformConnections.map(conn => 
    conn.platform === platform 
      ? { platform, isConnected: false } 
      : conn
  );
  
  return true;
};

/**
 * Get all platform connections
 */
export const getPlatformConnections = (): PlatformConnection[] => {
  return platformConnections;
};

/**
 * Sync content from a connected platform
 * In production, this would fetch saved content from the platform
 */
export const syncFromPlatform = async (
  platform: 'instagram' | 'twitter' | 'facebook' | 'youtube'
): Promise<Card[]> => {
  console.log(`Syncing content from ${platform}...`);
  
  // Check if platform is connected
  const connection = platformConnections.find(conn => conn.platform === platform);
  if (!connection || !connection.isConnected) {
    throw new Error(`Platform ${platform} is not connected`);
  }
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Mock synced content
  const mockCards: Card[] = [];
  
  // Generate different mock content based on platform
  const count = Math.floor(Math.random() * 3) + 1; // 1-3 items
  
  for (let i = 0; i < count; i++) {
    let card: Card;
    
    switch (platform) {
      case 'instagram':
        card = {
          id: generateMockId(),
          title: `Instagram Saved Post ${i+1}`,
          description: 'Automatically synced from your Instagram saved collection',
          source_url: `https://instagram.com/p/mock${i}`,
          source_type: 'image',
          thumbnail_url: `https://via.placeholder.com/300x300?text=IG+Post+${i+1}`,
          tags: [{ id: '1', name: 'instagram', category: 'source', color: '#C13584' }],
          cues: [],
          user_id: MOCK_USER_ID,
          created_at: new Date(),
          updated_at: new Date()
        };
        break;
        
      case 'twitter':
        card = {
          id: generateMockId(),
          title: `Twitter Bookmarked Tweet ${i+1}`,
          description: 'Automatically synced from your Twitter bookmarks',
          source_url: `https://twitter.com/user/status/mock${i}`,
          source_type: 'custom',
          tags: [{ id: '2', name: 'twitter', category: 'source', color: '#1DA1F2' }],
          cues: [],
          user_id: MOCK_USER_ID,
          created_at: new Date(),
          updated_at: new Date()
        };
        break;
        
      case 'youtube':
        card = {
          id: generateMockId(),
          title: `YouTube Saved Video ${i+1}`,
          description: 'Automatically synced from your YouTube watch later playlist',
          source_url: `https://youtube.com/watch?v=mock${i}`,
          source_type: 'youtube',
          thumbnail_url: `https://via.placeholder.com/300x200?text=YT+Video+${i+1}`,
          duration: Math.floor(Math.random() * 600) + 60, // 1-10 minutes
          tags: [{ id: '3', name: 'youtube', category: 'source', color: '#FF0000' }],
          cues: [],
          user_id: MOCK_USER_ID,
          created_at: new Date(),
          updated_at: new Date()
        };
        break;
        
      case 'facebook':
        card = {
          id: generateMockId(),
          title: `Facebook Saved Post ${i+1}`,
          description: 'Automatically synced from your Facebook saved items',
          source_url: `https://facebook.com/post/mock${i}`,
          source_type: 'image',
          thumbnail_url: `https://via.placeholder.com/400x300?text=FB+Post+${i+1}`,
          tags: [{ id: '4', name: 'facebook', category: 'source', color: '#4267B2' }],
          cues: [],
          user_id: MOCK_USER_ID,
          created_at: new Date(),
          updated_at: new Date()
        };
        break;
        
      default:
        throw new Error(`Platform ${platform} not supported`);
    }
    
    mockCards.push(card);
  }
  
  // Update last synced timestamp
  platformConnections = platformConnections.map(conn => 
    conn.platform === platform 
      ? { ...conn, lastSynced: new Date() } 
      : conn
  );
  
  return mockCards;
};

/**
 * Save content from a web URL
 * Parses content from the provided URL
 */
export const saveFromWebUrl = async (url: string): Promise<Card> => {
  console.log(`Parsing content from URL: ${url}`);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  // In production, this would:
  // 1. Fetch the content from the URL
  // 2. Parse the metadata (title, description, images)
  // 3. Extract relevant content
  // 4. Use ML to categorize the content
  
  // For demo, create a mock card based on URL
  let source_type: 'youtube' | 'blog' | 'custom' | 'image' = 'blog';
  
  if (url.includes('youtube.com') || url.includes('vimeo.com')) {
    source_type = 'youtube';
  } else if (url.includes('.jpg') || url.includes('.png')) {
    source_type = 'image';
  }
  
  const card: Card = {
    id: generateMockId(),
    title: `Web Content: ${new URL(url).hostname}`,
    description: `Content parsed from ${url}`,
    source_url: url,
    source_type,
    thumbnail_url: source_type !== 'blog' ? `https://via.placeholder.com/300x200?text=Web+Content` : undefined,
    tags: [{ id: '5', name: 'web', category: 'source', color: '#4285F4' }],
    cues: [],
    user_id: MOCK_USER_ID,
    created_at: new Date(),
    updated_at: new Date()
  };
  
  return card;
};

/**
 * Share content to Solstice from another app
 * This would be triggered by the share extension
 */
export const handleSharedContent = async (
  sharedData: {
    type: 'text' | 'url' | 'image' | 'video';
    content: string;
    title?: string;
    description?: string;
    thumbnail?: string;
  }
): Promise<Card> => {
  console.log(`Processing shared content of type: ${sharedData.type}`);
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Map shared content type to Card source_type
  let source_type: 'youtube' | 'blog' | 'custom' | 'image';
  if (sharedData.type === 'video' && sharedData.content.includes('youtube')) {
    source_type = 'youtube';
  } else if (sharedData.type === 'image') {
    source_type = 'image';
  } else {
    source_type = 'blog';
  }
  
  // Create a card from the shared content
  const card: Card = {
    id: generateMockId(),
    title: sharedData.title || `Shared ${sharedData.type.charAt(0).toUpperCase() + sharedData.type.slice(1)}`,
    description: sharedData.description || `Content shared via device sharing`,
    source_url: sharedData.type === 'url' ? sharedData.content : undefined,
    source_type,
    thumbnail_url: sharedData.thumbnail,
    tags: [{ id: '6', name: 'shared', category: 'source', color: '#34A853' }],
    cues: [],
    user_id: MOCK_USER_ID,
    created_at: new Date(),
    updated_at: new Date()
  };
  
  return card;
};

/**
 * File Upload and Processing
 * MOCK IMPLEMENTATIONS FOR TESTING
 */

// Pick an image from device camera
export const captureImage = async (): Promise<Card | null> => {
  // Mock implementation
  console.log('Mocking camera capture...');
  
  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Create a mock card
  const card: Card = {
    id: generateMockId(),
    title: 'Captured Image',
    description: 'Photo taken with camera',
    source_type: 'image',
    thumbnail_url: 'https://via.placeholder.com/300x300?text=Camera+Image',
    tags: [{ id: '7', name: 'camera', category: 'source', color: '#EA4335' }],
    cues: [],
    user_id: MOCK_USER_ID,
    created_at: new Date(),
    updated_at: new Date()
  };
  
  return card;
};

// Pick an image from device gallery
export const pickImage = async (): Promise<Card | null> => {
  // Mock implementation
  console.log('Mocking image picker...');
  
  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Create a mock card
  const card: Card = {
    id: generateMockId(),
    title: 'Gallery Image',
    description: 'Image from photo library',
    source_type: 'image',
    thumbnail_url: 'https://via.placeholder.com/400x300?text=Gallery+Image',
    tags: [{ id: '8', name: 'gallery', category: 'source', color: '#FBBC05' }],
    cues: [],
    user_id: MOCK_USER_ID,
    created_at: new Date(),
    updated_at: new Date()
  };
  
  return card;
};

// Pick a document from device
export const pickDocument = async (): Promise<Card | null> => {
  // Mock implementation
  console.log('Mocking document picker...');
  
  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Create a mock card
  const card: Card = {
    id: generateMockId(),
    title: 'Uploaded Document',
    description: 'PDF document with workout instructions',
    source_type: 'blog',
    tags: [{ id: '9', name: 'document', category: 'source', color: '#0F9D58' }],
    cues: [],
    user_id: MOCK_USER_ID,
    created_at: new Date(),
    updated_at: new Date()
  };
  
  return card;
}; 