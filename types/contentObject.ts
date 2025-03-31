/**
 * Types related to saved content from external sources
 */
import { Routine } from './routine';

export interface ContentObject {
  id: string;
  platform: 'instagram' | 'tiktok' | 'youtube' | 'article';
  title?: string;
  url: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  timestampSaved: string;
  parsedRoutine?: Routine;
  userId: string;
}
