/**
 * PerformRoutineScreen Component
 * Allows users to go through a routine step-by-step
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRoutine } from '../../context/RoutineContext';
import * as Colors from '../../constants/colors';
import { Card } from '../../types/card';

const PerformRoutineScreen = ({ navigation, route }: any) => {
  // Get cards from params or context
  const { cards: contextCards } = useRoutine();
  const routineCards = route.params?.cards || contextCards;
  
  // Local state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get current card
  const currentCard = routineCards[currentIndex];
  
  // Set up timer when card changes or timer starts
  useEffect(() => {
    if (currentCard && currentCard.duration && isPlaying) {
      // Set initial time
      setTimeLeft(currentCard.duration);
      
      // Clear any existing timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Start new timer
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Move to next card when timer ends
            clearInterval(timerRef.current as NodeJS.Timeout);
            if (currentIndex < routineCards.length - 1) {
              setCurrentIndex(currentIndex + 1);
            } else {
              setIsPlaying(false);
              Alert.alert('Routine Complete', 'Great job!');
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      // Clean up timer on unmount
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentCard, isPlaying, currentIndex]);
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Handle next card
  const handleNext = () => {
    if (currentIndex < routineCards.length - 1) {
      setIsPlaying(false);
      setCurrentIndex(currentIndex + 1);
    } else {
      Alert.alert('Routine Complete', 'Great job!');
    }
  };
  
  // Handle previous card
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setIsPlaying(false);
      setCurrentIndex(currentIndex - 1);
    }
  };
  
  // Toggle timer play/pause
  const toggleTimer = () => {
    setIsPlaying(!isPlaying);
  };
  
  // Exit routine
  const handleExit = () => {
    Alert.alert(
      'Exit Routine',
      'Are you sure you want to exit? Your progress will not be saved.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Exit', onPress: () => navigation.goBack() }
      ]
    );
  };

  if (!routineCards || routineCards.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No routine cards to display</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Builder')}
          >
            <Text style={styles.buttonText}>Create a Routine</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header with progress */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Performing Routine</Text>
        <Text style={styles.progressText}>
          Step {currentIndex + 1} of {routineCards.length}
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentIndex + 1) / routineCards.length) * 100}%` }
            ]}
          />
        </View>
      </View>
      
      {/* Card content */}
      <ScrollView style={styles.content}>
        <View style={styles.cardContainer}>
          <Text style={styles.cardTitle}>{currentCard.title}</Text>
          <Text style={styles.cardDescription}>{currentCard.description}</Text>
          
          {/* Timer display */}
          {currentCard.duration ? (
            <View style={styles.timerContainer}>
              <Text style={styles.timerLabel}>Duration</Text>
              <Text style={styles.timer}>{formatTime(isPlaying ? timeLeft : currentCard.duration)}</Text>
              <TouchableOpacity 
                style={[styles.timerButton, isPlaying && styles.pauseButton]} 
                onPress={toggleTimer}
              >
                <Text style={styles.timerButtonText}>
                  {isPlaying ? 'Pause' : 'Start Timer'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}
          
          {/* Sets & Reps */}
          {(currentCard.sets || currentCard.reps) ? (
            <View style={styles.setsRepsContainer}>
              {currentCard.sets ? (
                <View style={styles.metricContainer}>
                  <Text style={styles.metricLabel}>Sets</Text>
                  <Text style={styles.metricValue}>{currentCard.sets}</Text>
                </View>
              ) : null}
              
              {currentCard.reps ? (
                <View style={styles.metricContainer}>
                  <Text style={styles.metricLabel}>Reps</Text>
                  <Text style={styles.metricValue}>{currentCard.reps}</Text>
                </View>
              ) : null}
            </View>
          ) : null}
          
          {/* Cues */}
          {currentCard.cues && currentCard.cues.length > 0 ? (
            <View style={styles.cuesContainer}>
              <Text style={styles.cuesTitle}>Cues to Remember</Text>
              {currentCard.cues.map((cue, index) => (
                <View key={cue.id} style={styles.cueItem}>
                  <Text style={styles.cueText}>• {cue.text}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      </ScrollView>
      
      {/* Bottom navigation */}
      <View style={styles.controls}>
        <TouchableOpacity 
          style={[styles.navButton, currentIndex === 0 && styles.disabledButton]} 
          onPress={handlePrevious}
          disabled={currentIndex === 0}
        >
          <Text style={styles.navButtonText}>Previous</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.exitButton} onPress={handleExit}>
          <Text style={styles.exitButtonText}>Exit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.navButton, currentIndex === routineCards.length - 1 && styles.completeButton]} 
          onPress={handleNext}
        >
          <Text style={styles.navButtonText}>
            {currentIndex === routineCards.length - 1 ? 'Complete' : 'Next'}
          </Text>
        </TouchableOpacity>
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
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: Colors.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.BLACK,
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: Colors.GRAY_DARK,
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.GRAY_LIGHT,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.PRIMARY,
  },
  content: {
    flex: 1,
  },
  cardContainer: {
    backgroundColor: Colors.WHITE,
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: Colors.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.BLACK,
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 16,
    color: Colors.GRAY_DARK,
    marginBottom: 20,
    lineHeight: 22,
  },
  timerContainer: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 20,
    backgroundColor: Colors.BACKGROUND_LIGHT,
    borderRadius: 12,
  },
  timerLabel: {
    fontSize: 14,
    color: Colors.GRAY_DARK,
    marginBottom: 8,
  },
  timer: {
    fontSize: 42,
    fontWeight: '700',
    color: Colors.PRIMARY,
    marginBottom: 16,
  },
  timerButton: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  pauseButton: {
    backgroundColor: Colors.ACCENT,
  },
  timerButtonText: {
    color: Colors.WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
  setsRepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  metricContainer: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 14,
    color: Colors.GRAY_DARK,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.BLACK,
  },
  cuesContainer: {
    backgroundColor: Colors.BACKGROUND_LIGHT,
    padding: 16,
    borderRadius: 12,
  },
  cuesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.BLACK,
    marginBottom: 12,
  },
  cueItem: {
    marginBottom: 8,
  },
  cueText: {
    fontSize: 14,
    color: Colors.GRAY_DARK,
    lineHeight: 20,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: Colors.WHITE,
    borderTopWidth: 1,
    borderTopColor: Colors.BORDER,
  },
  navButton: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  navButtonText: {
    color: Colors.WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: Colors.PRIMARY_LIGHT,
  },
  completeButton: {
    backgroundColor: Colors.SUCCESS,
  },
  exitButton: {
    backgroundColor: Colors.BACKGROUND_LIGHT,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  exitButtonText: {
    color: Colors.GRAY_DARK,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.GRAY_DARK,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: Colors.WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PerformRoutineScreen; 