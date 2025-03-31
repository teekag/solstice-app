/**
 * Types related to routines (collections of cards)
 */
import { Card } from './card';
import { Tag } from './tag';
import { User } from './user';

export interface Routine {
  id: string;
  title: string;
  description?: string;
  user_id: string;
  is_public: boolean;
  total_duration?: number; // in seconds
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  cards: Card[];
  tags: Tag[];
  created_at: Date;
  updated_at: Date;
}

export interface RoutineCompletion {
  id: string;
  routine_id: string;
  user_id: string;
  duration: number; // actual completion time in seconds
  completed_at: Date;
  notes?: string;
}

export interface RoutineProgress {
  routine_id: string;
  current_step: number;
  completed_steps: number[];
  is_completed: boolean;
  started_at: Date;
  completed_at?: Date;
} 