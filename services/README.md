# Solstice Services

This directory contains service modules that handle external integrations and data processing for the Solstice app.

## Repository Service

The repository service (`repositoryService.ts`) handles integration with social media platforms and file management.

### Current Implementation

The current implementation is a **mock version for testing and UI development**. It simulates:

- Platform connections and authentication
- Content syncing from connected platforms
- File management operations
- Share extensions interaction

### Production Implementation Requirements

For a production implementation, you'll need to replace the mock functions with actual API calls:

#### 1. Platform Authentication

Each platform requires OAuth authentication:

- **Instagram**: Use [Instagram Basic Display API](https://developers.facebook.com/docs/instagram-basic-display-api)
  - Required scopes: `user_profile`, `user_media`
  - Additional permissions needed for saved posts

- **Twitter**: Use [Twitter API v2](https://developer.twitter.com/en/docs/twitter-api)
  - Required scopes: `bookmark.read`
  - Store tokens securely using Keychain/Keystore

- **YouTube**: Use [YouTube Data API v3](https://developers.google.com/youtube/v3)
  - Required scopes: `https://www.googleapis.com/auth/youtube.readonly`
  - Focus on watch later playlists and saved videos

- **Facebook**: Use [Facebook Graph API](https://developers.facebook.com/docs/graph-api)
  - Required permissions: `user_posts`, `user_likes`
  - Access saved items through appropriate endpoints

#### 2. Content Syncing

Implement real API calls to fetch content from each platform:

```typescript
// Example for Instagram API
async function fetchInstagramSavedContent(token: string): Promise<any[]> {
  // Fetch user's saved posts
  const response = await fetch(
    'https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url&access_token=' + token
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch Instagram content');
  }
  
  return await response.json();
}
```

#### 3. Local Storage

- Use `expo-file-system` for storing media files locally
- Implement a caching strategy for media content
- Handle offline access to previously synced content

#### 4. Share Extension Implementation

For iOS:
- Create a Share Extension target in Xcode
- Set up App Groups for data sharing between the extension and main app
- Implement the Share Extension UI and data handling

For Android:
- Set up Intent Filters in AndroidManifest.xml
- Handle incoming intents in MainActivity.java
- Process shared content and save to repository

#### 5. Deep Link Handling

- Configure universal links/app links
- Set up URL scheme handlers
- Process incoming data from deep links

## Share Extension Service

The share extension service (`shareExtensionService.ts`) handles content shared from other apps.

### Integration with Native Code

The mock implementation will need to be connected to native modules:

```typescript
// Example connection to native module
import { NativeModules } from 'react-native';

const { ShareExtensionModule } = NativeModules;

// In real implementation, this would be called by native code
export const receiveSharedContent = (nativeSharedData: string): Promise<Card> => {
  // Parse the data from native side
  const parsedData = JSON.parse(nativeSharedData);
  
  // Process using our existing handler
  return processSharedContent(parsedData);
};
```

## Security Considerations

- Never store API keys in the codebase
- Use environment variables for sensitive values
- Store tokens securely using expo-secure-store
- Implement token refresh procedures
- Add rate limiting for API calls

## Testing

- Create unit tests for each platform API
- Mock API responses for testing
- Test error handling scenarios
- Verify content sync functionality
- Test the app in offline mode

## Resources

- [Instagram API Documentation](https://developers.facebook.com/docs/instagram-api)
- [Twitter API Documentation](https://developer.twitter.com/en/docs/twitter-api)
- [YouTube API Documentation](https://developers.google.com/youtube/v3)
- [Facebook API Documentation](https://developers.facebook.com/docs/graph-api)
- [React Native Share Extension Guide](https://medium.com/@amanmittal/how-to-implement-share-extension-in-react-native-ios-application-1ced1c9dc302)
- [Android Intent Filters Guide](https://developer.android.com/training/sharing/receive) 