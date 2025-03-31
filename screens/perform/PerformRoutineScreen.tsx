import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Types for the routine performance
interface RoutineExercise {
  id: string;
  title: string;
  description: string;
  image?: string;
  duration?: number; // in seconds
  sets?: { reps: string; weight: string; completed: boolean }[];
}

interface RoutineSection {
  id: string;
  title: string;
  exercises: RoutineExercise[];
}

interface RoutineData {
  id: string;
  title: string;
  sections: RoutineSection[];
}

// Mock data for the demonstration
const mockRoutine: RoutineData = {
  id: '1',
  title: 'Daily Mindful Breathing Therapy',
  sections: [
    {
      id: 's1',
      title: 'Warm Up',
      exercises: [
        {
          id: 'e1',
          title: 'Bicep Curls',
          description: 'Smooth curls with controlled movement',
          image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
          sets: [
            { reps: '8', weight: '15', completed: false },
            { reps: '8', weight: '15', completed: false },
            { reps: '8', weight: '15', completed: false },
          ],
        },
      ],
    },
    {
      id: 's2',
      title: 'Main Workout',
      exercises: [
        {
          id: 'e2',
          title: 'Relaxing Yourself',
          description: 'Focus on breathing and relaxing your muscles',
          image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
          duration: 180, // 3 minutes
        },
      ],
    },
  ],
};

const PerformRoutineScreen = ({ route, navigation }: any) => {
  // In a real app, we'd get the routine ID from route.params
  // const { routineId } = route.params;
  const [routine, setRoutine] = useState<RoutineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState(0);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Fetch the routine data - mock implementation
  useEffect(() => {
    const fetchRoutine = async () => {
      try {
        // In a real app, we'd fetch the routine from a service
        // const data = await routineService.getRoutineById(routineId);
        setRoutine(mockRoutine);
      } catch (error) {
        console.error('Error fetching routine:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutine();
  }, []);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartTimer = () => {
    setIsTimerRunning(true);
  };

  const handlePauseTimer = () => {
    setIsTimerRunning(false);
  };

  const handleCompleteSet = (sectionIndex: number, exerciseIndex: number, setIndex: number) => {
    if (!routine) return;

    const updatedRoutine = { ...routine };
    const sets = updatedRoutine.sections[sectionIndex].exercises[exerciseIndex].sets;

    if (sets && sets[setIndex]) {
      sets[setIndex].completed = true;
      setRoutine(updatedRoutine);
    }
  };

  const handleNextExercise = () => {
    if (!routine) return;

    const currentSectionData = routine.sections[currentSection];
    if (currentExercise < currentSectionData.exercises.length - 1) {
      // Next exercise in current section
      setCurrentExercise(currentExercise + 1);
    } else if (currentSection < routine.sections.length - 1) {
      // Move to next section
      setCurrentSection(currentSection + 1);
      setCurrentExercise(0);
    } else {
      // Routine completed
      setIsCompleted(true);
      setIsTimerRunning(false);
    }
  };

  const handleFinishRoutine = () => {
    // In a real app, we would save the completion data
    navigation.goBack();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading routine...</Text>
      </View>
    );
  }

  if (!routine) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
        <Text style={styles.errorText}>Failed to load routine</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isCompleted) {
    return (
      <SafeAreaView style={styles.completedContainer}>
        <View style={styles.completedContent}>
          <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
          <Text style={styles.completedTitle}>Great job!</Text>
          <Text style={styles.completedSubtitle}>You've completed the routine</Text>
          <Text style={styles.completedTime}>Total time: {formatTime(timer)}</Text>
          <TouchableOpacity
            style={styles.finishButton}
            onPress={handleFinishRoutine}
          >
            <Text style={styles.finishButtonText}>Finish</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentSectionData = routine.sections[currentSection];
  const currentExerciseData = currentSectionData.exercises[currentExercise];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <View style={styles.backButtonCircle}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </View>
        </TouchableOpacity>
        <View style={styles.timerContainer}>
          <Text style={styles.timer}>{formatTime(timer)}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.sectionInfo}>
          <Text style={styles.sectionTitle}>{currentSectionData.title}</Text>
          <Text style={styles.exerciseProgress}>
            {currentExerciseData.title} {currentExercise + 1}/{currentSectionData.exercises.length}
          </Text>
        </View>

        <View style={styles.exerciseContainer}>
          {currentExerciseData.image && (
            <View style={styles.videoContainer}>
              <Image
                source={{ uri: currentExerciseData.image }}
                style={styles.exerciseImage}
                resizeMode="cover"
              />
              <TouchableOpacity style={styles.playButton}>
                <Ionicons name="play" size={30} color="#FFF" />
              </TouchableOpacity>
            </View>
          )}

          {currentExerciseData.sets ? (
            <View style={styles.setsContainer}>
              <Text style={styles.setsTitle}>START HERE</Text>
              <Text style={styles.setsSubtitle}>Log each set as you perform</Text>

              {currentExerciseData.sets.map((set, index) => (
                <View key={index} style={styles.setRow}>
                  <View style={styles.setIndexContainer}>
                    {set.completed ? (
                      <View style={styles.completedCircle}>
                        <Ionicons name="checkmark" size={16} color="#FFF" />
                      </View>
                    ) : (
                      <Text style={styles.setIndex}>{index + 1}</Text>
                    )}
                  </View>
                  <View style={styles.setValue}>
                    <Text style={styles.setValueNumber}>{set.reps}</Text>
                    <Text style={styles.setValueLabel}>Reps</Text>
                  </View>
                  <View style={styles.setValue}>
                    <Text style={styles.setValueNumber}>{set.weight}</Text>
                    <Text style={styles.setValueLabel}>Kilos/arm</Text>
                  </View>
                  {!set.completed && (
                    <TouchableOpacity
                      style={styles.logButton}
                      onPress={() => handleCompleteSet(currentSection, currentExercise, index)}
                    >
                      <Ionicons name="checkmark" size={20} color="#FFF" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}

              <TouchableOpacity style={styles.addSetButton}>
                <Ionicons name="add" size={20} color="#4A90E2" />
                <Text style={styles.addSetText}>Add Set</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.timedExerciseContainer}>
              <Text style={styles.exerciseTitle}>{currentExerciseData.title}</Text>
              <Text style={styles.exerciseDescription}>{currentExerciseData.description}</Text>
              
              {currentExerciseData.duration && (
                <View style={styles.durationContainer}>
                  <Text style={styles.durationLabel}>Duration:</Text>
                  <Text style={styles.durationValue}>
                    {Math.floor(currentExerciseData.duration / 60)}:{(currentExerciseData.duration % 60).toString().padStart(2, '0')}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {isTimerRunning ? (
          <TouchableOpacity
            style={[styles.controlButton, styles.pauseButton]}
            onPress={handlePauseTimer}
          >
            <Ionicons name="pause" size={24} color="#FFF" />
            <Text style={styles.controlButtonText}>Pause</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.controlButton, styles.startButton]}
            onPress={handleStartTimer}
          >
            <Ionicons name="play" size={24} color="#FFF" />
            <Text style={styles.controlButtonText}>Start</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={styles.nextButton}
          onPress={handleNextExercise}
        >
          <Text style={styles.nextButtonText}>LOG SET & NEXT EXERCISE</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#333',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerContainer: {
    flex: 1,
    alignItems: 'center',
  },
  timer: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  scrollContent: {
    flexGrow: 1,
  },
  sectionInfo: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  exerciseProgress: {
    fontSize: 16,
    color: '#666',
  },
  exerciseContainer: {
    marginBottom: 24,
  },
  videoContainer: {
    width: '100%',
    height: width * 0.75,
    position: 'relative',
  },
  exerciseImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F0F0F0',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -30,
    marginTop: -30,
  },
  setsContainer: {
    padding: 16,
  },
  setsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  setsSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  setIndexContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  completedCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  setIndex: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  setValue: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 6,
  },
  setValueNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  setValueLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  logButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  addSetText: {
    color: '#4A90E2',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  timedExerciseContainer: {
    padding: 16,
  },
  exerciseTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  exerciseDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 16,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  durationLabel: {
    fontSize: 16,
    color: '#666',
    marginRight: 8,
  },
  durationValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  pauseButton: {
    backgroundColor: '#FF9800',
  },
  controlButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  nextButton: {
    backgroundColor: '#333',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  completedContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  completedContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  completedTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
  },
  completedSubtitle: {
    fontSize: 18,
    color: '#666',
    marginTop: 8,
  },
  completedTime: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginTop: 24,
    marginBottom: 40,
  },
  finishButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  finishButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default PerformRoutineScreen; 