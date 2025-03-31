/**
 * Types related to saved content from external sources
 */
import { Routine } from './routine';

export interface ContentObject {
  id: string;
  platform: 'instagram' | 'tiktok' | 'youtube' | 'article' | 'web';
  title?: string;
  url: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  timestampSaved: string;
  parsedRoutine?: Routine;
  parsedRoutineId?: string;
  userId: string;
  parsed?: boolean;
  metadata?: Record<string, any>;
  updated_at?: string;
}
