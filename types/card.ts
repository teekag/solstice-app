/**
 * Types related to cards (exercises, movements, actions)
 */
import { Tag } from './tag';

export interface Card {
  id: string;
  title: string;
  description?: string;
  source_url?: string;
  source_type: 'youtube' | 'blog' | 'custom' | 'image' | 'instagram' | 'tiktok' | 'article';
  thumbnail_url?: string;
  media_url?: string;
  startTime?: number; // in seconds, for segment selection
  endTime?: number; // in seconds, for segment selection
  duration?: number; // in seconds
  sets?: number;
  reps?: number;
  notes?: string;
  user_id: string;
  tags: Tag[];
  cues?: Cue[];
  created_at: Date;
  updated_at: Date;
  createdBy: 'agent' | 'user';
}

export interface Cue {
  id: string;
  card_id?: string;
  label: string;
  text?: string;
  instructions?: string;
  timestamp?: number; // in seconds
  type?: 'form' | 'breathing' | 'tempo' | 'focus' | 'other';
  created_at?: Date;
}