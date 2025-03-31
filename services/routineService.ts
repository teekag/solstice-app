/**
 * Routine Service for Solstice App
 * Handles creating, retrieving, updating, and managing routines
 */
import { Routine, Card } from '../types';
import { supabase } from './supabaseService';
import { env, devLog } from '../utils/environment';

/**
 * Get all routines for a user
 * @param userId User ID
 * @returns Array of Routines
 */
export const getRoutines = async (userId: string): Promise<Routine[]> => {
  try {
    // Use mock data for development if enabled
    if (env.ENABLE_MOCK_DATA === 'true') {
      return getMockRoutines(userId);
    }
    
    const { data, error } = await supabase
      .from('routines')
      .select('*, cards(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    return data as Routine[];
  } catch (error) {
    devLog('Error getting routines:', error);
    // Fallback to mock data if API fails
    return getMockRoutines(userId);
  }
};

/**
 * Get routine by ID
 * @param routineId Routine ID
 * @returns Routine or null if not found
 */
export const getRoutineById = async (routineId: string): Promise<Routine | null> => {
  try {
    // Use mock data for development if enabled
    if (env.ENABLE_MOCK_DATA === 'true') {
      return getMockRoutineById(routineId);
    }
    
    const { data, error } = await supabase
      .from('routines')
      .select('*, cards(*)')
      .eq('id', routineId)
      .single();
      
    if (error) {
      throw error;
    }
    
    return data as Routine;
  } catch (error) {
    devLog('Error getting routine by ID:', error);
    // Fallback to mock data if API fails
    return getMockRoutineById(routineId);
  }
};

/**
 * Create a new routine
 * @param routine Routine to create (without ID)
 * @returns Created Routine with ID
 */
export const createRoutine = async (routine: Omit<Routine, 'id'>): Promise<Routine> => {
  try {
    // Use mock data for development if enabled
    if (env.ENABLE_MOCK_DATA === 'true') {
      return createMockRoutine(routine);
    }
    
    // First create the routine
    const { data: routineData, error: routineError } = await supabase
      .from('routines')
      .insert({
        title: routine.title,
        description: routine.description,
        user_id: routine.user_id,
        tags: routine.tags || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (routineError) {
      throw routineError;
    }
    
    const createdRoutine = routineData as Routine;
    
    // Then create the cards if any
    if (routine.cards && routine.cards.length > 0) {
      const cardsWithRoutineId = routine.cards.map(card => ({
        ...card,
        routine_id: createdRoutine.id,
        user_id: routine.user_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      
      const { error: cardsError } = await supabase
        .from('cards')
        .insert(cardsWithRoutineId);
        
      if (cardsError) {
        throw cardsError;
      }
      
      // Get the full routine with cards
      return await getRoutineById(createdRoutine.id) as Routine;
    }
    
    return createdRoutine;
  } catch (error) {
    devLog('Error creating routine:', error);
    // Fallback to mock data if API fails
    return createMockRoutine(routine);
  }
};

/**
 * Update an existing routine
 * @param routineId Routine ID to update
 * @param updates Partial Routine with updates
 * @returns Updated Routine or null if not found
 */
export const updateRoutine = async (
  routineId: string, 
  updates: Partial<Routine>
): Promise<Routine | null> => {
  try {
    // Use mock data for development if enabled
    if (env.ENABLE_MOCK_DATA === 'true') {
      return updateMockRoutine(routineId, updates);
    }
    
    const { data, error } = await supabase
      .from('routines')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', routineId)
      .select()
      .single();
      
    if (error) {
      throw error;
    }
    
    return data as Routine;
  } catch (error) {
    devLog('Error updating routine:', error);
    // Fallback to mock data if API fails
    return updateMockRoutine(routineId, updates);
  }
};

/**
 * Delete a routine
 * @param routineId Routine ID to delete
 * @returns Success boolean
 */
export const deleteRoutine = async (routineId: string): Promise<boolean> => {
  try {
    // Use mock data for development if enabled
    if (env.ENABLE_MOCK_DATA === 'true') {
      return deleteMockRoutine(routineId);
    }
    
    // First delete associated cards
    const { error: cardsError } = await supabase
      .from('cards')
      .delete()
      .eq('routine_id', routineId);
      
    if (cardsError) {
      throw cardsError;
    }
    
    // Then delete the routine
    const { error } = await supabase
      .from('routines')
      .delete()
      .eq('id', routineId);
      
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    devLog('Error deleting routine:', error);
    // Fallback to mock data if API fails
    return deleteMockRoutine(routineId);
  }
};

/**
 * Add cards to a routine
 * @param routineId Routine ID
 * @param cards Cards to add
 * @returns Updated Routine or null if not found
 */
export const addCardsToRoutine = async (
  routineId: string, 
  cards: Omit<Card, 'id' | 'routine_id'>[]
): Promise<Routine | null> => {
  try {
    // Use mock data for development if enabled
    if (env.ENABLE_MOCK_DATA === 'true') {
      return addCardsMockRoutine(routineId, cards);
    }
    
    // Get the routine to ensure it exists
    const routine = await getRoutineById(routineId);
    if (!routine) {
      return null;
    }
    
    // Add routine_id to cards
    const cardsWithRoutineId = cards.map(card => ({
      ...card,
      routine_id: routineId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    
    // Insert cards
    const { error } = await supabase
      .from('cards')
      .insert(cardsWithRoutineId);
      
    if (error) {
      throw error;
    }
    
    // Update routine's updated_at
    await updateRoutine(routineId, { updated_at: new Date().toISOString() });
    
    // Get the updated routine with cards
    return await getRoutineById(routineId);
  } catch (error) {
    devLog('Error adding cards to routine:', error);
    // Fallback to mock data if API fails
    return addCardsMockRoutine(routineId, cards);
  }
};

/**
 * Remove a card from a routine
 * @param routineId Routine ID
 * @param cardId Card ID to remove
 * @returns Updated Routine or null if not found
 */
export const removeCardFromRoutine = async (
  routineId: string, 
  cardId: string
): Promise<Routine | null> => {
  try {
    // Use mock data for development if enabled
    if (env.ENABLE_MOCK_DATA === 'true') {
      return removeCardMockRoutine(routineId, cardId);
    }
    
    // Delete the card
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', cardId)
      .eq('routine_id', routineId);
      
    if (error) {
      throw error;
    }
    
    // Update routine's updated_at
    await updateRoutine(routineId, { updated_at: new Date().toISOString() });
    
    // Get the updated routine with cards
    return await getRoutineById(routineId);
  } catch (error) {
    devLog('Error removing card from routine:', error);
    // Fallback to mock data if API fails
    return removeCardMockRoutine(routineId, cardId);
  }
};

// Mock implementations for development and fallback
// ------------------------------------------------

// Mock storage for routines
let mockRoutines: Routine[] = [
  {
    id: 'routine-1',
    title: 'Morning Workout Routine',
    description: 'A quick 15-minute workout to start your day',
    user_id: 'mock-user',
    tags: ['morning', 'quick', 'energizing'],
    cards: [
      {
        id: 'card-1',
        title: 'Jumping Jacks',
        description: '30 seconds of jumping jacks to warm up',
        source_type: 'youtube',
        source_url: 'https://www.youtube.com/watch?v=example1',
        media_url: 'https://www.youtube.com/embed/example1',
        thumbnail_url: 'https://via.placeholder.com/300x200?text=Jumping+Jacks',
        duration: 30,
        user_id: 'mock-user',
        tags: ['warmup', 'cardio'],
        created_at: new Date(Date.now() - 86400000),
        updated_at: new Date(Date.now() - 86400000),
        createdBy: 'agent'
      },
      {
        id: 'card-2',
        title: 'Push-ups',
        description: '10 push-ups',
        source_type: 'youtube',
        source_url: 'https://www.youtube.com/watch?v=example2',
        media_url: 'https://www.youtube.com/embed/example2',
        thumbnail_url: 'https://via.placeholder.com/300x200?text=Push-ups',
        duration: 45,
        sets: 3,
        reps: 10,
        user_id: 'mock-user',
        tags: ['strength', 'upper-body'],
        created_at: new Date(Date.now() - 86400000),
        updated_at: new Date(Date.now() - 86400000),
        createdBy: 'agent'
      }
    ],
    created_at: new Date(Date.now() - 86400000),
    updated_at: new Date(Date.now() - 86400000)
  },
  {
    id: 'routine-2',
    title: 'Evening Meditation',
    description: 'A calming meditation to end your day',
    user_id: 'mock-user',
    tags: ['evening', 'relaxation', 'mindfulness'],
    cards: [
      {
        id: 'card-3',
        title: 'Deep Breathing',
        description: '5 minutes of deep breathing exercises',
        source_type: 'youtube',
        source_url: 'https://www.youtube.com/watch?v=example3',
        media_url: 'https://www.youtube.com/embed/example3',
        thumbnail_url: 'https://via.placeholder.com/300x200?text=Deep+Breathing',
        duration: 300,
        user_id: 'mock-user',
        tags: ['breathing', 'relaxation'],
        created_at: new Date(Date.now() - 172800000),
        updated_at: new Date(Date.now() - 172800000),
        createdBy: 'agent'
      }
    ],
    created_at: new Date(Date.now() - 172800000),
    updated_at: new Date(Date.now() - 172800000)
  }
];

const getMockRoutines = (userId: string): Routine[] => {
  return mockRoutines.filter(routine => routine.user_id === userId);
};

const getMockRoutineById = (routineId: string): Routine | null => {
  return mockRoutines.find(routine => routine.id === routineId) || null;
};

const createMockRoutine = (routine: Omit<Routine, 'id'>): Routine => {
  const newRoutine: Routine = {
    ...routine,
    id: `routine-${Date.now()}`,
    created_at: new Date(),
    updated_at: new Date()
  };
  
  mockRoutines.unshift(newRoutine);
  return newRoutine;
};

const updateMockRoutine = (
  routineId: string, 
  updates: Partial<Routine>
): Routine | null => {
  const routineIndex = mockRoutines.findIndex(routine => routine.id === routineId);
  
  if (routineIndex === -1) {
    return null;
  }
  
  const updatedRoutine = {
    ...mockRoutines[routineIndex],
    ...updates,
    updated_at: new Date()
  };
  
  mockRoutines[routineIndex] = updatedRoutine;
  return updatedRoutine;
};

const deleteMockRoutine = (routineId: string): boolean => {
  const initialLength = mockRoutines.length;
  mockRoutines = mockRoutines.filter(routine => routine.id !== routineId);
  return mockRoutines.length < initialLength;
};

const addCardsMockRoutine = (
  routineId: string, 
  cards: Omit<Card, 'id' | 'routine_id'>[]
): Routine | null => {
  const routineIndex = mockRoutines.findIndex(routine => routine.id === routineId);
  
  if (routineIndex === -1) {
    return null;
  }
  
  const newCards = cards.map(card => ({
    ...card,
    id: `card-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    routine_id: routineId,
    created_at: new Date(),
    updated_at: new Date()
  }));
  
  mockRoutines[routineIndex] = {
    ...mockRoutines[routineIndex],
    cards: [...(mockRoutines[routineIndex].cards || []), ...newCards],
    updated_at: new Date()
  };
  
  return mockRoutines[routineIndex];
};

const removeCardMockRoutine = (
  routineId: string, 
  cardId: string
): Routine | null => {
  const routineIndex = mockRoutines.findIndex(routine => routine.id === routineId);
  
  if (routineIndex === -1) {
    return null;
  }
  
  mockRoutines[routineIndex] = {
    ...mockRoutines[routineIndex],
    cards: (mockRoutines[routineIndex].cards || []).filter(card => card.id !== cardId),
    updated_at: new Date()
  };
  
  return mockRoutines[routineIndex];
};
