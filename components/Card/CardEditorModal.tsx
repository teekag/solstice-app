/**
 * CardEditorModal Component
 * Modal for editing card details, trimming segments, and adding cues
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Colors from '../../constants/colors';
import { Card, Cue } from '../../types';
import SegmentSelector from '../../components/SegmentSelector';
import { cueAgent } from '../../services/agentService';

interface CardEditorModalProps {
  visible: boolean;
  card: Card | null;
  onClose?: () => void; 
  onCancel?: () => void; 
  onSave: (updatedCard: Card) => void;
}

const CardEditorModal: React.FC<CardEditorModalProps> = ({
  visible,
  card,
  onClose,
  onCancel,
  onSave
}) => {
  const [editedCard, setEditedCard] = useState<Card | null>(null);
  const [cues, setCues] = useState<Cue[]>([]);
  const [newCue, setNewCue] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [suggestedCues, setSuggestedCues] = useState<Cue[]>([]);

  // Initialize edited card when modal opens
  useEffect(() => {
    if (visible && card) {
      setEditedCard({ ...card });
      setCues(card.cues || []);
      
      // Get suggested cues from agent
      if (card.media_url) {
        fetchSuggestedCues(card);
      }
    }
  }, [visible, card]);

  // Fetch suggested cues from agent
  const fetchSuggestedCues = async (cardData: Card) => {
    try {
      setLoading(true);
      const suggestedCues = await cueAgent(cardData);
      setSuggestedCues(suggestedCues);
    } catch (error) {
      console.error('Error fetching suggested cues:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle title change
  const handleTitleChange = (text: string) => {
    if (editedCard) {
      setEditedCard({ ...editedCard, title: text });
    }
  };

  // Handle notes change
  const handleNotesChange = (text: string) => {
    if (editedCard) {
      setEditedCard({ ...editedCard, notes: text });
    }
  };

  // Handle segment time change
  const handleSegmentChange = (startTime: number, endTime: number) => {
    if (editedCard) {
      setEditedCard({
        ...editedCard,
        startTime,
        endTime,
        duration: endTime - startTime
      });
    }
  };

  // Add a new cue
  const addCue = () => {
    if (!newCue.trim()) return;
    
    const newCueObj: Cue = {
      id: `temp-${Date.now()}`,
      label: newCue,
      type: 'form'
    };
    
    setCues([...cues, newCueObj]);
    setNewCue('');
  };

  // Add a suggested cue
  const addSuggestedCue = (cue: Cue) => {
    const exists = cues.some(c => c.label === cue.label);
    if (!exists) {
      setCues([...cues, { ...cue, id: `temp-${Date.now()}` }]);
      
      // Remove from suggestions
      setSuggestedCues(suggestedCues.filter(c => c.label !== cue.label));
    }
  };

  // Remove a cue
  const removeCue = (id: string) => {
    setCues(cues.filter(cue => cue.id !== id));
  };

  // Format duration
  const formatDuration = (seconds?: number): string => {
    if (seconds === undefined) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Handle save
  const handleSave = () => {
    if (!editedCard) return;
    
    // Validate required fields
    if (!editedCard.title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }
    
    // Create updated card with cues
    const updatedCard: Card = {
      ...editedCard,
      cues,
      updated_at: new Date()
    };
    
    onSave(updatedCard);
  };

  // Handle close/cancel - support both prop names for flexibility
  const handleClose = () => {
    if (onCancel) {
      onCancel();
    } else if (onClose) {
      onClose();
    }
  };

  if (!editedCard) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Card</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
            >
              <Ionicons name="close" size={24} color="#333333" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.scrollContent}>
            {/* Title Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Title</Text>
              <TextInput
                style={styles.textInput}
                value={editedCard.title}
                onChangeText={handleTitleChange}
                placeholder="Enter title"
                placeholderTextColor="#999999"
              />
            </View>
            
            {/* Segment Selector */}
            {editedCard.media_url && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Segment</Text>
                <SegmentSelector
                  mediaUrl={editedCard.media_url}
                  initialStartTime={editedCard.startTime || 0}
                  initialEndTime={editedCard.endTime || 0}
                  onSegmentChange={handleSegmentChange}
                />
                <View style={styles.timeDisplay}>
                  <Text style={styles.timeText}>
                    {formatDuration(editedCard.startTime)} - {formatDuration(editedCard.endTime)}
                    {editedCard.startTime !== undefined && editedCard.endTime !== undefined && (
                      <Text style={styles.durationText}>
                        {' '}({formatDuration(editedCard.endTime - editedCard.startTime)})
                      </Text>
                    )}
                  </Text>
                </View>
              </View>
            )}
            
            {/* Cues Section */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Cues</Text>
              
              {/* Current Cues */}
              {cues.length > 0 && (
                <View style={styles.cuesList}>
                  {cues.map(cue => (
                    <View key={cue.id} style={styles.cueItem}>
                      <Text style={styles.cueText}>{cue.label}</Text>
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removeCue(cue.id)}
                      >
                        <Ionicons name="close-circle" size={18} color="#FF6B6B" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
              
              {/* Add New Cue */}
              <View style={styles.addCueContainer}>
                <TextInput
                  style={styles.cueInput}
                  value={newCue}
                  onChangeText={setNewCue}
                  placeholder="Add a cue (e.g., 'Keep back straight')"
                  placeholderTextColor="#999999"
                  returnKeyType="done"
                  onSubmitEditing={addCue}
                />
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={addCue}
                  disabled={!newCue.trim()}
                >
                  <Ionicons
                    name="add-circle"
                    size={24}
                    color={newCue.trim() ? Colors.PRIMARY : '#CCCCCC'}
                  />
                </TouchableOpacity>
              </View>
              
              {/* Suggested Cues */}
              {suggestedCues.length > 0 && (
                <View style={styles.suggestedCuesContainer}>
                  <Text style={styles.suggestedTitle}>Suggested Cues</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.suggestedCuesList}
                  >
                    {suggestedCues.map((cue, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.suggestedCueItem}
                        onPress={() => addSuggestedCue(cue)}
                      >
                        <Ionicons name="add" size={14} color="#FFFFFF" />
                        <Text style={styles.suggestedCueText}>{cue.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
            
            {/* Notes */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Notes</Text>
              <TextInput
                style={[styles.textInput, styles.notesInput]}
                value={editedCard.notes || ''}
                onChangeText={handleNotesChange}
                placeholder="Add notes about this card"
                placeholderTextColor="#999999"
                multiline
                textAlignVertical="top"
              />
            </View>
            
            {/* Source Info */}
            {editedCard.source_url && (
              <View style={styles.sourceInfo}>
                <Text style={styles.sourceLabel}>Source:</Text>
                <Text style={styles.sourceUrl} numberOfLines={1}>
                  {editedCard.source_url}
                </Text>
              </View>
            )}
          </ScrollView>
          
          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.saveButton]}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
  scrollContent: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333333',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  notesInput: {
    height: 100,
    paddingTop: 12,
  },
  timeDisplay: {
    marginTop: 8,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    color: '#666666',
  },
  durationText: {
    fontWeight: '600',
    color: Colors.PRIMARY,
  },
  cuesList: {
    marginBottom: 12,
  },
  cueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0FF',
  },
  cueText: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
  },
  removeButton: {
    padding: 4,
  },
  addCueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cueInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333333',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    marginRight: 8,
  },
  addButton: {
    padding: 4,
  },
  suggestedCuesContainer: {
    marginTop: 16,
  },
  suggestedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 8,
  },
  suggestedCuesList: {
    paddingVertical: 4,
  },
  suggestedCueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.PRIMARY,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  suggestedCueText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 4,
  },
  sourceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 12,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
  },
  sourceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginRight: 8,
  },
  sourceUrl: {
    flex: 1,
    fontSize: 14,
    color: Colors.PRIMARY,
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
  saveButton: {
    backgroundColor: Colors.PRIMARY,
    flex: 1,
    marginLeft: 12,
  },
  cancelButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CardEditorModal;
