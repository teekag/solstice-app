/**
 * ReviewRoutineModal Component
 * Modal for reviewing parsed content and creating routines from it
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Colors from '../../constants/colors';
import { ContentObject, Card, Routine } from '../../types';
import { intakeAgent } from '../../services/agentService';
import { useRoutines } from '../../context/RoutineContext';

interface ReviewRoutineModalProps {
  visible: boolean;
  content: ContentObject;
  onClose: () => void;
  onCreateRoutine: (routineId: string) => void;
}

const ReviewRoutineModal: React.FC<ReviewRoutineModalProps> = ({
  visible,
  content,
  onClose,
  onCreateRoutine
}) => {
  const [loading, setLoading] = useState(false);
  const [parsedCards, setParsedCards] = useState<Card[]>([]);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const { saveRoutine } = useRoutines();

  // Parse content when modal opens
  useEffect(() => {
    if (visible) {
      parseContent();
    }
  }, [visible, content]);

  // Parse content using the intake agent
  const parseContent = async () => {
    if (!content) return;
    
    try {
      setLoading(true);
      const cards = await intakeAgent(content.url);
      setParsedCards(cards);
      
      // Select all cards by default
      setSelectedCards(cards.map(card => card.id));
    } catch (error) {
      console.error('Error parsing content:', error);
      Alert.alert('Error', 'Failed to parse content. Please try again.');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  // Toggle card selection
  const toggleCardSelection = (cardId: string) => {
    setSelectedCards(prev => {
      if (prev.includes(cardId)) {
        return prev.filter(id => id !== cardId);
      } else {
        return [...prev, cardId];
      }
    });
  };

  // Format duration
  const formatDuration = (seconds?: number): string => {
    if (!seconds) return 'N/A';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes === 0) {
      return `${remainingSeconds}s`;
    } else if (remainingSeconds === 0) {
      return `${minutes}m`;
    } else {
      return `${minutes}m ${remainingSeconds}s`;
    }
  };

  // Create routine from selected cards
  const handleCreateRoutine = async () => {
    if (selectedCards.length === 0) {
      Alert.alert('No Cards Selected', 'Please select at least one card to create a routine.');
      return;
    }
    
    try {
      // Filter cards to only include selected ones
      const filteredCards = parsedCards.filter(card => selectedCards.includes(card.id));
      
      // Create routine
      const newRoutine: Partial<Routine> = {
        title: `Routine from ${content.platform}`,
        description: `Created from ${content.url}`,
        cards: filteredCards,
        tags: [],
        is_public: false,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      const savedRoutine = await saveRoutine(newRoutine);
      
      if (savedRoutine) {
        Alert.alert('Success', 'Routine created successfully!');
        onCreateRoutine(savedRoutine.id);
      } else {
        throw new Error('Failed to save routine');
      }
    } catch (error) {
      console.error('Error creating routine:', error);
      Alert.alert('Error', 'Failed to create routine. Please try again.');
    }
  };

  // Render a card item
  const renderCardItem = ({ item }: { item: Card }) => {
    const isSelected = selectedCards.includes(item.id);
    
    return (
      <TouchableOpacity
        style={[
          styles.cardItem,
          isSelected && styles.selectedCardItem
        ]}
        onPress={() => toggleCardSelection(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.title}
            </Text>
            {item.duration && (
              <Text style={styles.cardDuration}>
                {formatDuration(item.duration)}
              </Text>
            )}
          </View>
          <View style={styles.checkboxContainer}>
            <View style={[
              styles.checkbox,
              isSelected && styles.checkboxSelected
            ]}>
              {isSelected && (
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              )}
            </View>
          </View>
        </View>
        
        {item.description && (
          <Text style={styles.cardDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        
        {item.startTime !== undefined && item.endTime !== undefined && (
          <View style={styles.segmentInfo}>
            <Ionicons name="time-outline" size={14} color="#666666" />
            <Text style={styles.segmentText}>
              Segment: {formatDuration(item.startTime)} - {formatDuration(item.endTime)}
            </Text>
          </View>
        )}
        
        {item.cues && item.cues.length > 0 && (
          <View style={styles.cuesContainer}>
            {item.cues.map((cue, index) => (
              <View key={cue.id || index} style={styles.cueItem}>
                <Ionicons name="information-circle-outline" size={14} color={Colors.PRIMARY} />
                <Text style={styles.cueText} numberOfLines={1}>
                  {cue.label}
                </Text>
              </View>
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Review Content</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color="#333333" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.contentInfo}>
            <View style={styles.platformBadge}>
              <Text style={styles.platformText}>{content?.platform}</Text>
            </View>
            <Text style={styles.contentTitle} numberOfLines={1}>
              {content?.title || content?.url}
            </Text>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.PRIMARY} />
              <Text style={styles.loadingText}>
                Analyzing content...
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {parsedCards.length} Steps Found
                </Text>
                <Text style={styles.sectionSubtitle}>
                  Select steps to include in your routine
                </Text>
              </View>
              
              <FlatList
                data={parsedCards}
                renderItem={renderCardItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.cardsList}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>
                      No steps found in this content.
                    </Text>
                  </View>
                }
              />
              
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={onClose}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.createButton,
                    selectedCards.length === 0 && styles.disabledButton
                  ]}
                  onPress={handleCreateRoutine}
                  disabled={selectedCards.length === 0}
                >
                  <Text style={styles.createButtonText}>
                    Create Routine ({selectedCards.length})
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 24,
    height: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  closeButton: {
    padding: 4,
  },
  contentInfo: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  platformBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  platformText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  sectionHeader: {
    padding: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  cardsList: {
    paddingHorizontal: 16,
  },
  cardItem: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  selectedCardItem: {
    borderColor: Colors.PRIMARY,
    backgroundColor: '#F0F8FF',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
  },
  cardDuration: {
    fontSize: 12,
    color: '#666666',
    backgroundColor: '#EEEEEE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  checkboxContainer: {
    padding: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#CCCCCC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: Colors.PRIMARY,
    borderColor: Colors.PRIMARY,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  segmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  segmentText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
  },
  cuesContainer: {
    marginTop: 8,
  },
  cueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  cueText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButton: {
    backgroundColor: Colors.PRIMARY,
    flex: 1,
    marginLeft: 12,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  cancelButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '600',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReviewRoutineModal;
