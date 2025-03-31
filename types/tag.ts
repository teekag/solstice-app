/**
 * Types related to tags for personalization and discovery
 */

export interface Tag {
  id: string;
  name: string;
  category: string;
  color: string;
  created_at?: Date;
}

// These are the standard tag categories used in the app
export type TagCategory = 
  | 'bodyPart' 
  | 'equipment' 
  | 'goal' 
  | 'difficulty' 
  | 'focus' 
  | 'custom'; 