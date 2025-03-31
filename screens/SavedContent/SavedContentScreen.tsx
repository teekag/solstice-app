/**
 * SavedContentScreen Component
 * Displays all saved content from various platforms and allows users to review/parse them
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Colors from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContext';
import { ContentObject } from '../../types';
import { getSavedContent, deleteContent } from '../../services/contentService';
import ReviewRoutineModal from './ReviewRoutineModal';

// Helper function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
};

// Platform icon mapping
const getPlatformIcon = (platform: string): any => {
  switch (platform) {
    case 'youtube':
      return 'logo-youtube';
    case 'instagram':
      return 'logo-instagram';
    case 'tiktok':
      return 'logo-tiktok';
    case 'article':
      return 'document-text-outline';
    default:
      return 'link-outline';
  }
};

// Platform color mapping
const getPlatformColor = (platform: string): string => {
  switch (platform) {
    case 'youtube':
      return '#FF0000';
    case 'instagram':
      return '#C13584';
    case 'tiktok':
      return '#000000';
    case 'article':
      return '#0077B5';
    default:
      return '#777777';
  }
};

const SavedContentScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [savedContent, setSavedContent] = useState<ContentObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentObject | null>(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);

  // Load saved content
  const loadSavedContent = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const content = await getSavedContent(user.id);
      setSavedContent(content);
    } catch (error) {
      console.error('Error loading saved content:', error);
      Alert.alert('Error', 'Failed to load your saved content. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadSavedContent();
  }, [user]);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    loadSavedContent();
  };

  // Handle review content
  const handleReviewContent = (content: ContentObject) => {
    setSelectedContent(content);
    setReviewModalVisible(true);
  };

  // Handle delete content
  const handleDeleteContent = (contentId: string) => {
    Alert.alert(
      'Delete Content',
      'Are you sure you want to delete this saved content?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await deleteContent(contentId);
              if (success) {
                setSavedContent(prev => prev.filter(item => item.id !== contentId));
              }
            } catch (error) {
              console.error('Error deleting content:', error);
              Alert.alert('Error', 'Failed to delete content. Please try again.');
            }
          }
        }
      ]
    );
  };

  // Render content item
  const renderContentItem = ({ item }: { item: ContentObject }) => (
    <View style={styles.contentCard}>
      <View style={styles.contentHeader}>
        <View style={styles.platformBadge}>
          <Ionicons 
            name={getPlatformIcon(item.platform)} 
            size={14} 
            color="#FFFFFF" 
          />
          <Text style={styles.platformText}>{item.platform}</Text>
        </View>
        <Text style={styles.dateText}>{formatDate(item.timestampSaved)}</Text>
      </View>
      
      <View style={styles.contentBody}>
        {item.thumbnailUrl ? (
          <Image 
            source={{ uri: item.thumbnailUrl }} 
            style={styles.thumbnail} 
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.thumbnail, styles.placeholderThumbnail]}>
            <Ionicons 
              name={getPlatformIcon(item.platform)} 
              size={32} 
              color={getPlatformColor(item.platform)} 
            />
          </View>
        )}
        
        <View style={styles.contentInfo}>
          <Text style={styles.contentTitle} numberOfLines={2}>
            {item.title || 'Untitled Content'}
          </Text>
          <Text style={styles.contentUrl} numberOfLines={1}>
            {item.url}
          </Text>
          
          <View style={styles.actionsRow}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.reviewButton]} 
              onPress={() => handleReviewContent(item)}
            >
              <Ionicons name="list-outline" size={16} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Review</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => handleDeleteContent(item.id)}
            >
              <Ionicons name="trash-outline" size={16} color="#666666" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  // Empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="save-outline" size={64} color="#CCCCCC" />
      <Text style={styles.emptyStateTitle}>No Saved Content</Text>
      <Text style={styles.emptyStateText}>
        Content you save from social media and websites will appear here.
      </Text>
      <TouchableOpacity 
        style={styles.emptyStateButton}
        onPress={() => Alert.alert('Coming Soon', 'The share extension feature will be available soon!')}
      >
        <Text style={styles.emptyStateButtonText}>Learn How to Save Content</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Saved Content</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Ionicons name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
      </View>
      
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.PRIMARY} />
          <Text style={styles.loadingText}>Loading your content...</Text>
        </View>
      ) : (
        <FlatList
          data={savedContent}
          renderItem={renderContentItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.contentList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[Colors.PRIMARY]}
            />
          }
          ListEmptyComponent={renderEmptyState}
        />
      )}
      
      {/* Review Modal */}
      {selectedContent && (
        <ReviewRoutineModal
          visible={reviewModalVisible}
          content={selectedContent}
          onClose={() => {
            setReviewModalVisible(false);
            setSelectedContent(null);
          }}
          onCreateRoutine={(routineId: string) => {
            setReviewModalVisible(false);
            setSelectedContent(null);
            // Navigate to builder with the new routine
            navigation.navigate('Builder', { routineId });
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND_LIGHT,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  backButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },
  contentList: {
    padding: 16,
    paddingBottom: 32,
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  platformBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  platformText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  dateText: {
    fontSize: 12,
    color: '#999999',
  },
  contentBody: {
    flexDirection: 'row',
    padding: 12,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  placeholderThumbnail: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  contentUrl: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  },
  reviewButton: {
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: 12,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 64,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyStateButton: {
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default SavedContentScreen;
