/**
 * BuilderScreen Component
 * Main screen for building routines by importing and organizing cards
 */
import React, { useState, useRef } from 'react';
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
import { useRoutine } from '../../context/RoutineContext';
import { intakeAgent } from '../../services/agentService';
import { Card } from '../../types/card';
import * as Colors from '../../constants/colors';

const BuilderScreen = ({ navigation }: any) => {
  // Local state
  const [url, setUrl] = useState('');
  const inputRef = useRef<TextInput>(null);
  
  // Global routine state from context
  const { 
    cards, 
    addCards, 
    reorderCards, 
    isLoading, 
    setIsLoading,
    processingUrl,
    setProcessingUrl,
    removeCard
  } = useRoutine();

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
      Alert.alert('Invalid URL', 'Please enter a valid URL including http:// or https://');
      return;
    }
    
    // Start loading
    setIsLoading(true);
    setProcessingUrl(url);
    
    try {
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
      console.error('Import error:', error);
      Alert.alert(
        'Import Failed', 
        'There was an error importing content from this URL. Please try again.'
      );
    } finally {
      // End loading
      setIsLoading(false);
      setProcessingUrl(null);
    }
  };

  // Handle card edit
  const handleEditCard = (card: Card) => {
    // Navigate to edit screen or show edit modal (to be implemented)
    Alert.alert('Edit Card', `Editing card: ${card.title}`);
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
    // Update the order of cards in the context
    // This will be handled by reorderCards which has the logic to handle order changes
    for (let i = 0; i < data.length; i++) {
      const currentIndex = cards.findIndex(card => card.id === data[i].id);
      if (currentIndex !== i) {
        reorderCards(currentIndex, i);
        break;
      }
    }
  };
  
  // Continue to tag screen
  const handleContinueToTag = () => {
    if (cards.length === 0) {
      Alert.alert('No Cards', 'Please add some cards to your routine before continuing.');
      return;
    }
    
    navigation.navigate('TagRoutine');
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
        
        {/* Bottom Action Bar (if needed) */}
        {cards.length > 0 && (
          <View style={styles.bottomBar}>
            <Text style={styles.cardCount}>
              {cards.length} {cards.length === 1 ? 'card' : 'cards'}
            </Text>
            
            <View style={styles.buttonGroup}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.performButton]}
                onPress={handlePerformRoutine}
              >
                <Text style={styles.actionButtonText}>Perform</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.tagButton]}
                onPress={handleContinueToTag}
              >
                <Text style={styles.actionButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER,
  },
  input: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: Colors.BACKGROUND_LIGHT,
  },
  importButton: {
    marginLeft: 12,
    height: 46,
    paddingHorizontal: 16,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  importButtonDisabled: {
    backgroundColor: Colors.PRIMARY_LIGHT,
  },
  importButtonText: {
    color: Colors.WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.GRAY,
    textAlign: 'center',
    lineHeight: 24,
  },
  listContent: {
    paddingVertical: 8,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.BORDER,
    backgroundColor: Colors.WHITE,
  },
  cardCount: {
    fontSize: 14,
    color: Colors.GRAY_DARK,
  },
  buttonGroup: {
    flexDirection: 'row',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 8,
  },
  performButton: {
    backgroundColor: Colors.ACCENT,
  },
  tagButton: {
    backgroundColor: Colors.PRIMARY,
  },
  actionButtonText: {
    color: Colors.WHITE,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default BuilderScreen; 