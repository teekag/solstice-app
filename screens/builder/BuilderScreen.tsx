import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoutines } from '../../context/RoutineContext';
import { Card } from '../../types';

// Example section and exercise data
interface Exercise {
  id: string;
  title: string;
  description: string;
  source?: string;
  image?: string;
  sets?: { reps: string; weight: string }[];
}

interface Section {
  id: string;
  title: string;
  exercises: Exercise[];
}

const initialRoutine = {
  title: 'Daily Mindful Breathing Therapy',
  sections: [
    {
      id: '1',
      title: 'Warm Up',
      exercises: [
        {
          id: '101',
          title: 'Bicep Curls Part 1',
          description: 'Some description here about curls.',
          image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
          sets: [
            { reps: '8', weight: '15' },
            { reps: '8', weight: '15' },
          ],
        },
      ],
    },
  ],
};

// Helper function to convert cards to exercises
const cardsToExercises = (cards: Card[]): Exercise[] => {
  return cards.map(card => ({
    id: card.id,
    title: card.title,
    description: card.description || '',
    image: card.thumbnail_url,
    source: card.source_type,
    sets: card.sets && card.reps ? [
      { reps: card.reps.toString(), weight: '' }
    ] : undefined
  }));
};

const BuilderScreen = ({ navigation, route }: any) => {
  const { routineId } = route.params || {};
  const { loadRoutine, activeRoutine } = useRoutines();
  const [routine, setRoutine] = useState<{
    title: string;
    sections: Section[];
  }>(initialRoutine);
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Load routine if routineId is provided
  useEffect(() => {
    const loadRoutineData = async () => {
      if (routineId) {
        setLoading(true);
        try {
          const loadedRoutine = await loadRoutine(routineId);
          if (loadedRoutine) {
            // Convert the loaded routine to our builder format
            const exercises = cardsToExercises(loadedRoutine.cards);
            setRoutine({
              title: loadedRoutine.title,
              sections: [
                {
                  id: '1',
                  title: 'Main Section',
                  exercises: exercises
                }
              ]
            });
            Alert.alert('Success', 'Routine loaded successfully!');
          }
        } catch (error) {
          console.error('Error loading routine:', error);
          Alert.alert('Error', 'Failed to load routine. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    };

    loadRoutineData();
  }, [routineId]);

  const handleAddExercise = (sectionId: string) => {
    setActiveSection(sectionId);
    setShowExerciseModal(true);
  };

  const handleSelectExercise = (exerciseId: string) => {
    if (selectedExercises.includes(exerciseId)) {
      setSelectedExercises(selectedExercises.filter(id => id !== exerciseId));
    } else {
      setSelectedExercises([...selectedExercises, exerciseId]);
    }
  };

  const handleAddToSection = () => {
    // Mock implementation - would integrate with repository
    Alert.alert('Added', `${selectedExercises.length} exercises added to section`);
    setSelectedExercises([]);
    setShowExerciseModal(false);
  };

  const handleImport = () => {
    Alert.alert('Import', 'Import content from repository');
  };

  const handleSaveRoutine = () => {
    Alert.alert('Success', 'Routine saved successfully!');
  };

  const renderExerciseCard = ({ item }: { item: Exercise }) => (
    <View style={styles.exerciseCard}>
      <View style={styles.exerciseHeader}>
        <View style={styles.exerciseImageContainer}>
          {item.image && (
            <Image source={{ uri: item.image }} style={styles.exerciseImage} />
          )}
          <View style={styles.playButton}>
            <Ionicons name="play" size={20} color="#fff" />
          </View>
        </View>
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseTitle}>{item.title}</Text>
          <Text style={styles.exerciseDescription} numberOfLines={2}>
            {item.description}
          </Text>
          {item.source && (
            <Text style={styles.exerciseSource}>@{item.source}</Text>
          )}
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {item.sets && item.sets.length > 0 && (
        <View style={styles.setsContainer}>
          <TouchableOpacity style={styles.setsButton}>
            <Ionicons name="barbell-outline" size={16} color="#4A90E2" />
            <Text style={styles.setsButtonText}>Sets & Reps</Text>
          </TouchableOpacity>
          <View style={styles.setsList}>
            {item.sets.map((set, index) => (
              <View key={index} style={styles.setRow}>
                <Text style={styles.setNumber}>{index + 1}</Text>
                <View style={styles.setInputContainer}>
                  <Text style={styles.setInputLabel}>Reps</Text>
                  <View style={styles.setInput}>
                    <Text>{set.reps}</Text>
                  </View>
                </View>
                <View style={styles.setInputContainer}>
                  <Text style={styles.setInputLabel}>Kilos/arm</Text>
                  <View style={styles.setInput}>
                    <Text>{set.weight}</Text>
                  </View>
                </View>
              </View>
            ))}
            <TouchableOpacity style={styles.addSetButton}>
              <Ionicons name="add-circle-outline" size={20} color="#4A90E2" />
              <Text style={styles.addSetText}>Add Set</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  const renderSection = ({ item }: { item: Section }) => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{item.title}</Text>
        <TouchableOpacity style={styles.sectionOptions}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {item.exercises.map(exercise => (
        <View key={exercise.id} style={styles.exerciseContainer}>
          <View style={styles.exerciseOrder}>
            <Text style={styles.orderNumber}>
              {item.exercises.indexOf(exercise) + 1}
            </Text>
          </View>
          {renderExerciseCard({ item: exercise })}
        </View>
      ))}

      <TouchableOpacity
        style={styles.addExerciseButton}
        onPress={() => handleAddExercise(item.id)}
      >
        <Text style={styles.addExerciseText}>Add Exercise Title...</Text>
        <View style={styles.addExerciseOptions}>
          <TouchableOpacity style={styles.optionButton}>
            <Ionicons name="list-outline" size={20} color="#4A90E2" />
            <Text style={styles.optionText}>Description</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionButton}>
            <Ionicons name="image-outline" size={20} color="#4A90E2" />
            <Text style={styles.optionText}>Media</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionButton}>
            <Ionicons name="barbell-outline" size={20} color="#4A90E2" />
            <Text style={styles.optionText}>Numbers</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );

  // Main builder screen content
  const builderContent = (
    <>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Routine</Text>
        <TouchableOpacity onPress={handleSaveRoutine}>
          <Ionicons name="checkmark" size={24} color="#4A90E2" />
        </TouchableOpacity>
      </View>

      <View style={styles.titleContainer}>
        <TextInput
          style={styles.titleInput}
          value={routine.title}
          onChangeText={(text) => setRoutine({ ...routine, title: text })}
          placeholder="Routine Title"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleImport}>
          <Ionicons name="cloud-download-outline" size={20} color="#4A90E2" />
          <Text style={styles.actionText}>Import</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            setRoutine({
              ...routine,
              sections: [
                ...routine.sections,
                {
                  id: `section-${Date.now()}`,
                  title: `Section ${routine.sections.length + 1}`,
                  exercises: [],
                },
              ],
            });
          }}
        >
          <Ionicons name="add-circle-outline" size={20} color="#4A90E2" />
          <Text style={styles.actionText}>Add Section</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={routine.sections}
        renderItem={renderSection}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.sectionsContainer}
      />
    </>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading routine...</Text>
        </View>
      ) : (
        builderContent
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  titleContainer: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  actionText: {
    marginLeft: 8,
    color: '#4A90E2',
    fontWeight: '500',
  },
  sectionsContainer: {
    paddingBottom: 24,
  },
  sectionContainer: {
    backgroundColor: '#fff',
    marginBottom: 16,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  sectionOptions: {
    padding: 8,
  },
  exerciseContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  exerciseOrder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 8,
  },
  orderNumber: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  exerciseCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    overflow: 'hidden',
  },
  exerciseHeader: {
    flexDirection: 'row',
    padding: 12,
  },
  exerciseImageContainer: {
    position: 'relative',
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  exerciseImage: {
    width: '100%',
    height: '100%',
  },
  playButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseInfo: {
    flex: 1,
    marginLeft: 12,
  },
  exerciseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  exerciseDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  exerciseSource: {
    fontSize: 12,
    color: '#999',
  },
  moreButton: {
    padding: 8,
  },
  setsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    padding: 12,
  },
  setsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  setsButtonText: {
    marginLeft: 8,
    color: '#4A90E2',
    fontWeight: '500',
  },
  setsList: {},
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  setNumber: {
    width: 24,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#333',
  },
  setInputContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  setInputLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  setInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#f9f9f9',
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingVertical: 8,
  },
  addSetText: {
    marginLeft: 8,
    color: '#4A90E2',
    fontWeight: '500',
  },
  addExerciseButton: {
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
  },
  addExerciseText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 16,
  },
  addExerciseOptions: {
    flexDirection: 'row',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  optionText: {
    marginLeft: 4,
    color: '#4A90E2',
    fontSize: 12,
  },
});

export default BuilderScreen;