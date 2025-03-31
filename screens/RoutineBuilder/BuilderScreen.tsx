/**
 * BuilderScreen Component
 * Main screen for building routines by importing and organizing cards
 */
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView
} from 'react-native';
import DraggableFlatList, { 
  RenderItemParams,
  ScaleDecorator
} from 'react-native-draggable-flatlist';
import ContentCard from '../../components/Card/ContentCard';
import CardEditorModal from '../../components/Card/CardEditorModal';
import { useRoutines } from '../../context/RoutineContext';
import { intakeAgent } from '../../services/agentService';
import { Card } from '../../types/card';
import * as Colors from '../../constants/colors';
import { handleError, ErrorType, tryCatch } from '../../utils/errorHandling';
import { useAuth } from '../../contexts/AuthContext';
import { saveContent } from '../../services/contentService';

const BuilderScreen = ({ navigation }: any) => {
  // Local state
  const [url, setUrl] = useState('');
  const inputRef = useRef<TextInput>(null);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [showCardEditor, setShowCardEditor] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [processingUrl, setProcessingUrl] = useState<string | null>(null);
  
  // Global routine state from context
  const { 
    activeRoutine,
    saveRoutine
  } = useRoutines();

  // Get user from auth context
  const { user } = useAuth();

  // Load cards from active routine if available
  useEffect(() => {
    if (activeRoutine && activeRoutine.cards) {
      setCards(activeRoutine.cards);
    }
  }, [activeRoutine]);

  // Add cards to the routine
  const addCards = (newCards: Card[]) => {
    setCards(prevCards => [...prevCards, ...newCards]);
  };

  // Update a card in the routine
  const updateCard = (updatedCard: Card) => {
    setCards(prevCards => 
      prevCards.map(card => 
        card.id === updatedCard.id ? updatedCard : card
      )
    );
  };

  // Remove a card from the routine
  const removeCard = (cardId: string) => {
    setCards(prevCards => prevCards.filter(card => card.id !== cardId));
  };

  // Reorder cards in the routine
  const reorderCards = (fromIndex: number, toIndex: number) => {
    setCards(prevCards => {
      const result = [...prevCards];
      const [removed] = result.splice(fromIndex, 1);
      result.splice(toIndex, 0, removed);
      return result;
    });
  };

  // Handle URL import
  const handleImport = async () => {
    if (!url.trim()) {
      Alert.alert('Please enter a URL');
      return;
    }
    
    // URL validation (basic check)
    try {
      new URL(url);
    } catch (e) {
      handleError('Invalid URL. Please enter a valid URL including http:// or https://', {
        type: ErrorType.VALIDATION,
        showAlert: true
      });
      return;
    }
    
    // Start loading
    setIsLoading(true);
    setProcessingUrl(url);
    
    try {
      // First save the content to the user's library
      if (user) {
        await saveContent({
          platform: detectPlatform(url),
          url: url,
          userId: user.id,
          timestampSaved: new Date().toISOString()
        });
      }
      
      // Call intake agent to parse URL into cards
      const importedCards = await intakeAgent(url);
      
      // Add cards to routine
      addCards(importedCards);
      
      // Clear input
      setUrl('');
      inputRef.current?.blur();
      
      // Show success message
      if (importedCards.length > 0) {
        Alert.alert(
          'Import Successful', 
          `Added ${importedCards.length} cards to your routine.`
        );
      } else {
        Alert.alert(
          'No Content Found', 
          'We couldn\'t extract any cards from this URL. Try a different source.'
        );
      }
    } catch (error) {
      handleError(error, {
        type: ErrorType.SERVER,
        showAlert: true,
        context: { url }
      });
    } finally {
      // End loading
      setIsLoading(false);
      setProcessingUrl(null);
    }
  };

  // Detect platform from URL
  const detectPlatform = (url: string): 'youtube' | 'instagram' | 'tiktok' | 'article' | 'web' => {
    const urlLower = url.toLowerCase();
    
    if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
      return 'youtube';
    } else if (urlLower.includes('instagram.com')) {
      return 'instagram';
    } else if (urlLower.includes('tiktok.com')) {
      return 'tiktok';
    } else if (
      urlLower.includes('medium.com') || 
      urlLower.includes('blog.') || 
      urlLower.includes('article') ||
      urlLower.includes('.blog')
    ) {
      return 'article';
    }
    
    return 'web';
  };

  // Handle card edit
  const handleEditCard = (card: Card) => {
    setEditingCard(card);
    setShowCardEditor(true);
  };
  
  // Handle saving edited card
  const handleSaveCard = (updatedCard: Card) => {
    updateCard(updatedCard);
    setShowCardEditor(false);
    setEditingCard(null);
  };
  
  // Handle card deletion
  const handleDeleteCard = (card: Card) => {
    Alert.alert(
      'Delete Card',
      `Are you sure you want to delete "${card.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => removeCard(card.id)
        }
      ]
    );
  };

  // Render a card item in the flatlist
  const renderCard = ({ item, drag, isActive }: RenderItemParams<Card>) => {
    return (
      <ScaleDecorator>
        <TouchableOpacity 
          onLongPress={drag}
          disabled={isLoading}
          activeOpacity={1}
        >
          <ContentCard 
            card={item}
            onEdit={() => handleEditCard(item)} 
            onDelete={() => handleDeleteCard(item)}
            isDragging={isActive}
          />
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

  // Handle drag end to update order
  const handleDragEnd = ({ data }: { data: Card[] }) => {
    // Update the order of cards in the state
    setCards(data);
  };
  
  // Continue to tag screen
  const handleContinueToTag = async () => {
    if (cards.length === 0) {
      Alert.alert('No Cards', 'Please add some cards to your routine before continuing.');
      return;
    }
    
    // Save the current routine before navigating
    const result = await tryCatch(async () => {
      const routineToSave = {
        ...(activeRoutine || {}),
        title: activeRoutine?.title || 'New Routine',
        cards: cards,
        user_id: user?.id,
        updated_at: new Date()
      };
      
      const savedRoutine = await saveRoutine(routineToSave);
      
      if (savedRoutine) {
        navigation.navigate('TagRoutine', { routineId: savedRoutine.id });
        return savedRoutine;
      } else {
        throw new Error('Failed to save routine');
      }
    }, {
      type: ErrorType.SERVER,
      showAlert: true,
      context: { routineId: activeRoutine?.id }
    });
    
    if (!result) {
      // Error was already handled by tryCatch
      console.log('Failed to continue to tag screen');
    }
  };
  
  // Perform the routine
  const handlePerformRoutine = () => {
    if (cards.length === 0) {
      Alert.alert('No Cards', 'Please add some cards to your routine before performing it.');
      return;
    }
    
    navigation.navigate('PerformRoutine', { cards });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Build Your Routine</Text>
          
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        </View>
        
        {/* URL Input Section */}
        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Paste video or article URL"
            value={url}
            onChangeText={setUrl}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            returnKeyType="go"
            onSubmitEditing={handleImport}
            editable={!isLoading}
            clearButtonMode="while-editing"
          />
          
          <TouchableOpacity 
            style={[styles.importButton, isLoading && styles.importButtonDisabled]} 
            onPress={handleImport}
            disabled={isLoading || !url.trim()}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.importButtonText}>Import</Text>
            )}
          </TouchableOpacity>
        </View>
        
        {/* List of Cards with Drag and Drop */}
        {cards.length === 0 ? (
          <ScrollView 
            contentContainerStyle={styles.emptyContainer}
            bounces={true}
          >
            <Text style={styles.emptyText}>
              Start by importing content from a URL.{'\n'}
              You can add videos, articles, or blog posts.
            </Text>
          </ScrollView>
        ) : (
          <DraggableFlatList
            data={cards}
            onDragEnd={handleDragEnd}
            keyExtractor={(item) => item.id}
            renderItem={renderCard}
            contentContainerStyle={styles.listContent}
            dragItemOverflow={true}
            bounces={true}
          />
        )}
        
        {/* Bottom Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.performButton]}
            onPress={handlePerformRoutine}
            disabled={cards.length === 0}
          >
            <Text style={styles.actionButtonText}>Perform</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.continueButton]}
            onPress={handleContinueToTag}
            disabled={cards.length === 0}
          >
            <Text style={styles.actionButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      
      {/* Card Editor Modal */}
      {editingCard && (
        <CardEditorModal
          visible={showCardEditor}
          card={editingCard}
          onSave={handleSaveCard}
          onCancel={() => {
            setShowCardEditor(false);
            setEditingCard(null);
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER_LIGHT,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.TEXT_DARK,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: Colors.PRIMARY,
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER_LIGHT,
  },
  input: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: Colors.BORDER_MEDIUM,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  importButton: {
    backgroundColor: Colors.PRIMARY,
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  importButtonDisabled: {
    backgroundColor: Colors.PRIMARY_LIGHT,
  },
  importButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.TEXT_MEDIUM,
    fontSize: 16,
    lineHeight: 24,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100, // Extra space at bottom for action buttons
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.BORDER_LIGHT,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  actionButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  performButton: {
    backgroundColor: Colors.SECONDARY,
  },
  continueButton: {
    backgroundColor: Colors.PRIMARY,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});