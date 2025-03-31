/**
 * Routine Context
 * Provides state management for routine creation, editing and playback
 */
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Card, Routine } from '../types';

interface RoutineContextType {
  activeRoutine: Routine | null;
  routines: Routine[];
  loadRoutine: (routineId: string) => Promise<Routine | null>;
  saveRoutine: (routine: Partial<Routine>) => Promise<Routine | null>;
  addCardToRoutine: (routineId: string, card: Card, sectionIndex?: number) => Promise<Routine | null>;
  removeCardFromRoutine: (routineId: string, cardId: string) => Promise<Routine | null>;
  reorderCards: (routineId: string, cardIds: string[]) => Promise<boolean>;
}

const RoutineContext = createContext<RoutineContextType | undefined>(undefined);

export const RoutineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeRoutine, setActiveRoutine] = useState<Routine | null>(null);
  const [routines, setRoutines] = useState<Routine[]>([]);

  // Load a specific routine by ID
  const loadRoutine = async (routineId: string): Promise<Routine | null> => {
    try {
      // Mock implementation - would fetch from service
      console.log(`Loading routine with ID: ${routineId}`);
      
      // Return the active routine if it matches the requested ID
      if (activeRoutine && activeRoutine.id === routineId) {
        return activeRoutine;
      }
      
      // Find in local state first
      const foundRoutine = routines.find(r => r.id === routineId);
      if (foundRoutine) {
        setActiveRoutine(foundRoutine);
        return foundRoutine;
      }
      
      // In a real app, fetch from API if not found locally
      // const { data, error } = await routineService.getRoutineById(routineId);
      // if (error) throw error;
      // setActiveRoutine(data);
      // return data;
      
      return null;
    } catch (error) {
      console.error('Error loading routine:', error);
      return null;
    }
  };

  // Save a routine (create or update)
  const saveRoutine = async (routine: Partial<Routine>): Promise<Routine | null> => {
    try {
      // Mock implementation - would save to service
      console.log('Saving routine:', routine);
      
      // In a real app:
      // const { data, error } = await routineService.saveRoutine(routine);
      // if (error) throw error;
      
      // For now, simulate a successful save
      const savedRoutine = {
        id: routine.id || `routine-${Date.now()}`,
        title: routine.title || 'Untitled Routine',
        description: routine.description || '',
        user_id: routine.user_id || 'current-user',
        is_public: routine.is_public || false,
        cards: routine.cards || [],
        tags: routine.tags || [],
        created_at: routine.created_at || new Date(),
        updated_at: new Date(),
      } as Routine;
      
      // Update local state
      setRoutines(prev => {
        const index = prev.findIndex(r => r.id === savedRoutine.id);
        if (index >= 0) {
          // Update existing
          const updated = [...prev];
          updated[index] = savedRoutine;
          return updated;
        } else {
          // Add new
          return [...prev, savedRoutine];
        }
      });
      
      setActiveRoutine(savedRoutine);
      return savedRoutine;
    } catch (error) {
      console.error('Error saving routine:', error);
      return null;
    }
  };

  // Add a card to a routine
  const addCardToRoutine = async (
    routineId: string, 
    card: Card, 
    sectionIndex?: number
  ): Promise<Routine | null> => {
    try {
      // Load the routine first if it's not the active one
      let targetRoutine = activeRoutine && activeRoutine.id === routineId
        ? {...activeRoutine}
        : routines.find(r => r.id === routineId);
      
      if (!targetRoutine) {
        const loaded = await loadRoutine(routineId);
        if (!loaded) throw new Error('Routine not found');
        targetRoutine = loaded;
      }
      
      // In a real app with structured sections:
      // if (sectionIndex !== undefined && targetRoutine.sections[sectionIndex]) {
      //   targetRoutine.sections[sectionIndex].cards.push(card);
      // } else {
      //   // Add to the end if no section specified
      //   targetRoutine.cards.push(card);
      // }
      
      // For now, just add to the routine's cards array
      targetRoutine.cards = [...targetRoutine.cards, card];
      
      // Save the updated routine
      return await saveRoutine(targetRoutine);
    } catch (error) {
      console.error('Error adding card to routine:', error);
      return null;
    }
  };

  // Remove a card from a routine
  const removeCardFromRoutine = async (
    routineId: string, 
    cardId: string
  ): Promise<Routine | null> => {
    try {
      // Load the routine first if it's not the active one
      let targetRoutine = activeRoutine && activeRoutine.id === routineId
        ? {...activeRoutine}
        : routines.find(r => r.id === routineId);
      
      if (!targetRoutine) {
        const loaded = await loadRoutine(routineId);
        if (!loaded) throw new Error('Routine not found');
        targetRoutine = loaded;
      }
      
      // Filter out the card to remove
      targetRoutine.cards = targetRoutine.cards.filter(c => c.id !== cardId);
      
      // Save the updated routine
      return await saveRoutine(targetRoutine);
    } catch (error) {
      console.error('Error removing card from routine:', error);
      return null;
    }
  };

  // Reorder cards in a routine
  const reorderCards = async (
    routineId: string, 
    cardIds: string[]
  ): Promise<boolean> => {
    try {
      // Load the routine first if it's not the active one
      let targetRoutine = activeRoutine && activeRoutine.id === routineId
        ? {...activeRoutine}
        : routines.find(r => r.id === routineId);
      
      if (!targetRoutine) {
        const loaded = await loadRoutine(routineId);
        if (!loaded) throw new Error('Routine not found');
        targetRoutine = loaded;
      }
      
      // Reorder cards based on the provided IDs
      const cardMap = new Map(targetRoutine.cards.map(card => [card.id, card]));
      targetRoutine.cards = cardIds
        .map(id => cardMap.get(id))
        .filter(card => card !== undefined) as Card[];
      
      // Save the updated routine
      const saved = await saveRoutine(targetRoutine);
      return !!saved;
    } catch (error) {
      console.error('Error reordering cards in routine:', error);
      return false;
    }
  };

  const value = {
    activeRoutine,
    routines,
    loadRoutine,
    saveRoutine,
    addCardToRoutine,
    removeCardFromRoutine,
    reorderCards,
  };

  return (
    <RoutineContext.Provider value={value}>
      {children}
    </RoutineContext.Provider>
  );
};

export const useRoutines = (): RoutineContextType => {
  const context = useContext(RoutineContext);
  if (context === undefined) {
    throw new Error('useRoutines must be used within a RoutineProvider');
  }
  return context;
}; 