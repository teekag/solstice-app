/**
 * RepositoryScreen Component
 * Screen for viewing and managing saved content from various sources
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Modal,
  Image,
  ScrollView,
  RefreshControl
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Colors from '../../constants/colors';
import ContentCard from '../../components/Card/ContentCard';
import { getUserRepository } from '../../services/supabaseService';
import { 
  saveFromSocialMedia,
  captureImage,
  pickImage,
  pickDocument,
  connectToPlatform,
  disconnectFromPlatform,
  getPlatformConnections,
  PlatformConnection,
  syncFromPlatform,
  saveFromWebUrl
} from '../../services/repositoryService';
import { Card } from '../../types/card';
import { Tag } from '../../types/tag';
import { Ionicons } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  simulateShareFromBrowser,
  simulateShareFromInstagram,
  simulateShareFromYouTube,
  simulateShareFromTwitter,
  simulateShareFromMessaging,
  handleDeepLinkImport
} from '../../services/shareExtensionService';

// Mock UUID generation
const generateMockId = () => Math.random().toString(36).substring(2, 15);

// Create mock tags with proper category
const createMockTag = (name: string, category: 'bodyPart' | 'equipment' | 'goal' | 'difficulty' | 'focus' | 'custom' = 'custom'): Tag => ({
  id: generateMockId(),
  name,
  category
});

const RepositoryScreen = ({ navigation }: any) => {
  // State
  const [repositoryItems, setRepositoryItems] = useState<Card[]>([]);
  const [filteredItems, setFilteredItems] = useState<Card[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [socialMediaId, setSocialMediaId] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<'instagram' | 'youtube' | 'twitter' | 'facebook'>('instagram');
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [platformConnections, setPlatformConnections] = useState<PlatformConnection[]>([]);
  const [syncingPlatform, setSyncingPlatform] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Load repository content
  useEffect(() => {
    loadRepositoryContent();
    loadPlatformConnections();
  }, []);

  // Filter items when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredItems(repositoryItems);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = repositoryItems.filter(item => 
      item.title.toLowerCase().includes(query) || 
      item.description.toLowerCase().includes(query) ||
      (item.tags && item.tags.some(tag => tag.name.toLowerCase().includes(query)))
    );
    
    setFilteredItems(filtered);
  }, [searchQuery, repositoryItems]);

  // Load repository content from database
  const loadRepositoryContent = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would fetch from Supabase
      // For now, use mock data directly
      const mockData: Card[] = [
        {
          id: generateMockId(),
          title: 'Morning Yoga Flow',
          description: 'Gentle yoga sequence to start your day',
          sourceType: 'video',
          thumbnail: 'https://via.placeholder.com/300x200',
          sourceUrl: 'https://youtube.com/watch?v=mockId1',
          duration: 600,
          tags: [
            createMockTag('yoga', 'focus'),
            createMockTag('morning', 'custom')
          ],
          cues: [],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: generateMockId(),
          title: 'HIIT Workout',
          description: '20-minute high intensity workout',
          sourceType: 'video',
          thumbnail: 'https://via.placeholder.com/300x200',
          sourceUrl: 'https://youtube.com/watch?v=mockId2',
          duration: 1200,
          tags: [
            createMockTag('hiit', 'focus'),
            createMockTag('cardio', 'focus')
          ],
          cues: [],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: generateMockId(),
          title: 'Meditation Practice',
          description: 'Mindfulness meditation guide',
          sourceType: 'article',
          sourceUrl: 'https://medium.com/mockId3',
          tags: [
            createMockTag('meditation', 'focus'),
            createMockTag('mindfulness', 'focus')
          ],
          cues: [],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      setRepositoryItems(mockData);
      setFilteredItems(mockData);
    } catch (error) {
      console.error('Error loading repository:', error);
      Alert.alert('Error', 'Failed to load your content repository');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPlatformConnections = () => {
    const connections = getPlatformConnections();
    setPlatformConnections(connections);
  };

  // Handle adding content from social media
  const handleSocialMediaAdd = async () => {
    if (!socialMediaId.trim()) {
      Alert.alert('Please enter a valid ID or URL');
      return;
    }

    setIsLoading(true);
    setIsAddModalVisible(false);

    try {
      const newCard = await saveFromSocialMedia(selectedPlatform, socialMediaId);
      setRepositoryItems(prev => [newCard, ...prev]);
      Alert.alert('Success', 'Content saved to your repository');
      setSocialMediaId('');
    } catch (error) {
      console.error('Error adding from social media:', error);
      Alert.alert('Error', 'Failed to save content from social media');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle image capture
  const handleCaptureImage = async () => {
    setIsAddModalVisible(false);
    setIsLoading(true);

    try {
      const card = await captureImage();
      if (card) {
        setRepositoryItems(prev => [card, ...prev]);
        Alert.alert('Success', 'Image captured and saved to repository');
      }
    } catch (error) {
      console.error('Error capturing image:', error);
      Alert.alert('Error', 'Failed to capture and process image');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle image picker
  const handlePickImage = async () => {
    setIsAddModalVisible(false);
    setIsLoading(true);

    try {
      const card = await pickImage();
      if (card) {
        setRepositoryItems(prev => [card, ...prev]);
        Alert.alert('Success', 'Image saved to repository');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to process selected image');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle document picker
  const handlePickDocument = async () => {
    setIsAddModalVisible(false);
    setIsLoading(true);

    try {
      const card = await pickDocument();
      if (card) {
        setRepositoryItems(prev => [card, ...prev]);
        Alert.alert('Success', 'Document saved to repository');
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to process selected document');
    } finally {
      setIsLoading(false);
    }
  };

  // Create a routine from selected items
  const handleCreateRoutine = () => {
    navigation.navigate('Builder', { fromRepository: true });
  };

  const handleCardSelect = (cardId: string) => {
    setSelectedCards(prevSelected => {
      if (prevSelected.includes(cardId)) {
        return prevSelected.filter(id => id !== cardId);
      } else {
        return [...prevSelected, cardId];
      }
    });
  };

  const handleDeleteSelected = () => {
    if (selectedCards.length === 0) return;
    
    Alert.alert(
      'Delete Selected',
      `Are you sure you want to delete ${selectedCards.length} item(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            // Filter out selected cards
            setRepositoryItems(prevCards => 
              prevCards.filter(card => !selectedCards.includes(card.id))
            );
            setSelectedCards([]);
            Alert.alert('Success', 'Items deleted successfully');
          }
        }
      ]
    );
  };

  const handleConnectPlatform = async (platform: 'instagram' | 'twitter' | 'facebook' | 'youtube') => {
    try {
      setIsLoading(true);
      await connectToPlatform(platform);
      loadPlatformConnections();
      Alert.alert('Success', `Connected to ${platform}!`);
    } catch (error) {
      Alert.alert('Error', `Failed to connect to ${platform}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnectPlatform = async (platform: 'instagram' | 'twitter' | 'facebook' | 'youtube') => {
    try {
      setIsLoading(true);
      await disconnectFromPlatform(platform);
      loadPlatformConnections();
      Alert.alert('Success', `Disconnected from ${platform}`);
    } catch (error) {
      Alert.alert('Error', `Failed to disconnect from ${platform}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncContent = async (platform: 'instagram' | 'twitter' | 'facebook' | 'youtube') => {
    try {
      setSyncingPlatform(platform);
      const newCards = await syncFromPlatform(platform);
      setRepositoryItems(prevCards => [...newCards, ...prevCards]);
      Alert.alert('Success', `Synced ${newCards.length} items from ${platform}`);
    } catch (error) {
      Alert.alert('Error', `Failed to sync content from ${platform}`);
    } finally {
      setSyncingPlatform(null);
    }
  };

  const handleAddFromWebUrl = async () => {
    const url = 'https://www.example.com/fitness-article';
    try {
      setIsLoading(true);
      const newCard = await saveFromWebUrl(url);
      setRepositoryItems(prevCards => [newCard, ...prevCards]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save content from URL');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    loadPlatformConnections();
    setRefreshing(false);
  };

  // Render repository item
  const renderItem = ({ item }: { item: Card }) => (
    <ContentCard 
      card={item}
      onPress={() => {
        // View item details or add to routine
        Alert.alert(
          'Content Options',
          'What would you like to do with this content?',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'View Details', 
              onPress: () => {
                // Navigate to details screen (to be implemented)
                Alert.alert('Details', `Viewing details for: ${item.title}`);
              }
            },
            {
              text: 'Add to Routine',
              onPress: () => {
                navigation.navigate('Builder', { selectedCard: item });
              }
            }
          ]
        );
      }}
      onDelete={() => {
        Alert.alert(
          'Delete Content',
          `Are you sure you want to remove "${item.title}" from your repository?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Delete', 
              style: 'destructive',
              onPress: () => {
                // In a real app, this would call to Supabase
                // For now, just update local state
                setRepositoryItems(prev => prev.filter(i => i.id !== item.id));
                Alert.alert('Success', 'Content removed from repository');
              }
            }
          ]
        );
      }}
    />
  );

  // Add Content Modal
  const renderAddContentModal = () => (
    <Modal
      visible={isAddModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setIsAddModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add to Repository</Text>
          
          <View style={styles.socialMediaContainer}>
            <Text style={styles.modalSectionTitle}>From Social Media</Text>
            
            <View style={styles.platformSelector}>
              {(['instagram', 'youtube', 'twitter', 'facebook'] as const).map(platform => (
                <TouchableOpacity
                  key={platform}
                  style={[
                    styles.platformButton,
                    selectedPlatform === platform && styles.selectedPlatform
                  ]}
                  onPress={() => setSelectedPlatform(platform)}
                >
                  <Text 
                    style={[
                      styles.platformButtonText,
                      selectedPlatform === platform && styles.selectedPlatformText
                    ]}
                  >
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TextInput
              style={styles.input}
              placeholder={`Enter ${selectedPlatform} post ID or URL`}
              value={socialMediaId}
              onChangeText={setSocialMediaId}
              autoCapitalize="none"
            />
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleSocialMediaAdd}
            >
              <Text style={styles.actionButtonText}>Save from {selectedPlatform}</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.divider} />
          
          <Text style={styles.modalSectionTitle}>From Device</Text>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={styles.optionButton}
              onPress={handleCaptureImage}
            >
              <Text style={styles.optionButtonText}>Take Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.optionButton}
              onPress={handlePickImage}
            >
              <Text style={styles.optionButtonText}>Choose Image</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={[styles.optionButton, styles.fullWidthButton]}
            onPress={handlePickDocument}
          >
            <Text style={styles.optionButtonText}>Upload Document</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setIsAddModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderPlatformItem = ({ item }: { item: PlatformConnection }) => {
    const isSyncing = syncingPlatform === item.platform;
    const platformIcons = {
      instagram: 'instagram',
      twitter: 'twitter',
      facebook: 'facebook',
      youtube: 'youtube',
    };
    
    const platformColors = {
      instagram: '#C13584',
      twitter: '#1DA1F2',
      facebook: '#4267B2',
      youtube: '#FF0000',
    };

    return (
      <View style={styles.platformItem}>
        <View style={styles.platformHeader}>
          <Icon name={platformIcons[item.platform]} size={24} color={platformColors[item.platform]} />
          <Text style={styles.platformName}>{item.platform.charAt(0).toUpperCase() + item.platform.slice(1)}</Text>
          <View style={[styles.connectionStatus, { backgroundColor: item.isConnected ? '#34A853' : '#BBBBBB' }]} />
        </View>
        
        <View style={styles.platformDetails}>
          {item.isConnected && (
            <>
              <Text style={styles.platformDetailsText}>
                {item.username}
                {item.lastSynced && ` · Last synced: ${item.lastSynced.toLocaleDateString()}`}
              </Text>
              
              <View style={styles.platformActions}>
                <TouchableOpacity 
                  style={[styles.platformButton, styles.syncButton]} 
                  onPress={() => handleSyncContent(item.platform)}
                  disabled={isSyncing}
                >
                  {isSyncing ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.platformButtonText}>Sync Content</Text>
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.platformButton, styles.disconnectButton]} 
                  onPress={() => handleDisconnectPlatform(item.platform)}
                  disabled={isLoading}
                >
                  <Text style={styles.platformButtonText}>Disconnect</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
          
          {!item.isConnected && (
            <TouchableOpacity 
              style={[styles.platformButton, styles.connectButton]} 
              onPress={() => handleConnectPlatform(item.platform)}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.platformButtonText}>Connect</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // Simulate share extension functionality
  const handleSimulateShareFromBrowser = async () => {
    try {
      setIsLoading(true);
      const newCard = await simulateShareFromBrowser('https://www.healthline.com/nutrition/best-workout-plans');
      setRepositoryItems(prevCards => [newCard, ...prevCards]);
      Alert.alert('Success', 'Content shared from browser added to your repository');
    } catch (error) {
      Alert.alert('Error', 'Failed to handle shared content');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulateShareFromInstagram = async () => {
    try {
      setIsLoading(true);
      const newCard = await simulateShareFromInstagram();
      setRepositoryItems(prevCards => [newCard, ...prevCards]);
      Alert.alert('Success', 'Instagram post added to your repository');
    } catch (error) {
      Alert.alert('Error', 'Failed to handle shared content');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulateShareFromYouTube = async () => {
    try {
      setIsLoading(true);
      const newCard = await simulateShareFromYouTube();
      setRepositoryItems(prevCards => [newCard, ...prevCards]);
      Alert.alert('Success', 'YouTube video added to your repository');
    } catch (error) {
      Alert.alert('Error', 'Failed to handle shared content');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulateShareFromTwitter = async () => {
    try {
      setIsLoading(true);
      const newCard = await simulateShareFromTwitter();
      setRepositoryItems(prevCards => [newCard, ...prevCards]);
      Alert.alert('Success', 'Tweet added to your repository');
    } catch (error) {
      Alert.alert('Error', 'Failed to handle shared content');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulateDeepLink = async () => {
    try {
      setIsLoading(true);
      const newCard = await handleDeepLinkImport('solstice://import?url=https://www.fitnessblender.com/videos/hiit-workout');
      if (newCard) {
        setRepositoryItems(prevCards => [newCard, ...prevCards]);
        Alert.alert('Success', 'Content from deep link added to your repository');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to handle deep link');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.title}>Your Content Repository</Text>
        
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search your content..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.PRIMARY} />
          <Text style={styles.loadingText}>Loading your content...</Text>
        </View>
      ) : (
        <>
          {filteredItems.length > 0 ? (
            <FlatList
              data={filteredItems}
              renderItem={renderItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery.trim() 
                  ? `No results found for "${searchQuery}"`
                  : "Your repository is empty. Add content to get started."}
              </Text>
            </View>
          )}
        </>
      )}
      
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setIsAddModalVisible(true)}
        >
          <Text style={styles.addButtonText}>Add Content</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.createButton, filteredItems.length === 0 && styles.disabledButton]}
          onPress={handleCreateRoutine}
          disabled={filteredItems.length === 0}
        >
          <Text style={styles.createButtonText}>Create Routine</Text>
        </TouchableOpacity>
      </View>
      
      {renderAddContentModal()}
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Platforms</Text>
        <FlatList
          data={platformConnections}
          renderItem={renderPlatformItem}
          keyExtractor={(item) => item.platform}
          contentContainerStyle={styles.platformList}
          horizontal={false}
        />
      </View>
      
      <View style={styles.quickAddContainer}>
        <Text style={styles.sectionTitle}>Quick Add</Text>
        <View style={styles.quickAddActions}>
          <TouchableOpacity style={styles.quickAddButton} onPress={handleAddFromWebUrl}>
            <Icon name="web" size={24} color="#4285F4" />
            <Text style={styles.quickAddText}>Web URL</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickAddButton} onPress={handleCaptureImage}>
            <Icon name="camera" size={24} color="#EA4335" />
            <Text style={styles.quickAddText}>Camera</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickAddButton} onPress={handlePickImage}>
            <Icon name="image" size={24} color="#FBBC05" />
            <Text style={styles.quickAddText}>Gallery</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickAddButton} onPress={handlePickDocument}>
            <Icon name="file-document" size={24} color="#0F9D58" />
            <Text style={styles.quickAddText}>Document</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.shareSimulationContainer}>
        <Text style={styles.sectionTitle}>Demo: Sharing from Apps</Text>
        <Text style={styles.sectionSubtitle}>These demonstrate how content would be added when shared from other apps</Text>
        
        <View style={styles.shareSimulationList}>
          <TouchableOpacity 
            style={styles.shareSimulationItem} 
            onPress={handleSimulateShareFromBrowser}
            disabled={isLoading}
          >
            <Icon name="web" size={28} color="#4285F4" />
            <Text style={styles.shareSimulationText}>Share from Browser</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.shareSimulationItem} 
            onPress={handleSimulateShareFromInstagram}
            disabled={isLoading}
          >
            <Icon name="instagram" size={28} color="#C13584" />
            <Text style={styles.shareSimulationText}>Share from Instagram</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.shareSimulationItem} 
            onPress={handleSimulateShareFromYouTube}
            disabled={isLoading}
          >
            <Icon name="youtube" size={28} color="#FF0000" />
            <Text style={styles.shareSimulationText}>Share from YouTube</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.shareSimulationItem} 
            onPress={handleSimulateShareFromTwitter}
            disabled={isLoading}
          >
            <Icon name="twitter" size={28} color="#1DA1F2" />
            <Text style={styles.shareSimulationText}>Share from Twitter</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.shareSimulationItem} 
            onPress={handleSimulateDeepLink}
            disabled={isLoading}
          >
            <Icon name="link-variant" size={28} color="#673AB7" />
            <Text style={styles.shareSimulationText}>Open Deep Link</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.contentSection}>
        <Text style={styles.sectionTitle}>Your Content</Text>
        {repositoryItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="folder-open" size={48} color="#BBBBBB" />
            <Text style={styles.emptyStateText}>
              Connect to a platform and sync content to get started
            </Text>
          </View>
        ) : (
          <FlatList
            data={repositoryItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.cardList}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER,
    backgroundColor: Colors.WHITE,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.BLACK,
  },
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: Colors.BACKGROUND_LIGHT,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.GRAY_DARK,
  },
  searchContainer: {
    padding: 12,
    backgroundColor: Colors.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER,
  },
  searchInput: {
    height: 40,
    backgroundColor: Colors.BACKGROUND_LIGHT,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  listContent: {
    padding: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.GRAY_DARK,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.GRAY,
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.BORDER,
    backgroundColor: Colors.WHITE,
  },
  addButton: {
    flex: 1,
    backgroundColor: Colors.ACCENT,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  addButtonText: {
    color: Colors.WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
  createButton: {
    flex: 1,
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  createButtonText: {
    color: Colors.WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: Colors.GRAY_LIGHT,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.WHITE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    color: Colors.BLACK,
    textAlign: 'center',
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: Colors.BLACK,
  },
  socialMediaContainer: {
    marginBottom: 16,
  },
  platformSelector: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  platformButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: Colors.GRAY_LIGHT,
  },
  selectedPlatform: {
    borderBottomColor: Colors.PRIMARY,
  },
  platformButtonText: {
    color: Colors.GRAY_DARK,
    fontSize: 14,
  },
  selectedPlatformText: {
    color: Colors.PRIMARY,
    fontWeight: '600',
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  actionButton: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: Colors.WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.BORDER,
    marginVertical: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  optionButton: {
    flex: 1,
    backgroundColor: Colors.ACCENT,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  optionButtonText: {
    color: Colors.WHITE,
    fontSize: 14,
    fontWeight: '600',
  },
  fullWidthButton: {
    marginTop: 4,
    marginBottom: 16,
  },
  closeButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  closeButtonText: {
    color: Colors.GRAY_DARK,
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333333',
  },
  platformList: {
    paddingBottom: 8,
  },
  platformItem: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  platformHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  platformName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    flex: 1,
  },
  connectionStatus: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  platformDetails: {
    marginTop: 8,
  },
  platformDetailsText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
  platformActions: {
    flexDirection: 'row',
  },
  connectButton: {
    backgroundColor: '#4CAF50',
  },
  disconnectButton: {
    backgroundColor: '#F44336',
  },
  syncButton: {
    backgroundColor: '#2196F3',
  },
  quickAddContainer: {
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  quickAddActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  quickAddButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    width: '22%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickAddText: {
    fontSize: 12,
    marginTop: 4,
    color: '#555555',
    textAlign: 'center',
  },
  shareSimulationContainer: {
    padding: 16,
    backgroundColor: '#E8F5E9',
  },
  shareSimulationList: {
    marginTop: 8,
  },
  shareSimulationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  shareSimulationText: {
    fontSize: 16,
    marginLeft: 16,
    color: '#333333',
    fontWeight: '500',
  },
  contentSection: {
    flex: 1,
    padding: 16,
  },
  cardList: {
    paddingBottom: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyStateText: {
    textAlign: 'center',
    marginTop: 16,
    color: '#888888',
    fontSize: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
});

export default RepositoryScreen; 