/**
 * Supabase Service for Solstice App
 * Provides functions for database interactions and authentication
 */
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Card, Cue } from '../types/card';
import { Routine, RoutineCard, RoutineProgress } from '../types/routine';
import { Tag } from '../types/tag';
import { User, UserProfile } from '../types/user';
import { env, devLog } from '../utils/environment';

/**
 * Initialize Supabase client with environment variables
 */
const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_KEY
);

/**
 * User authentication and management functions
 */
export const authService = {
  /**
   * Sign up a new user with email and password
   * @param email - User's email
   * @param password - User's password
   * @returns User data or error
   */
  async signUp(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      devLog('SignUp Error:', error);
      return { data: null, error };
    }
  },

  /**
   * Sign in an existing user with email and password
   * @param email - User's email
   * @param password - User's password
   * @returns User data or error
   */
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      devLog('SignIn Error:', error);
      return { data: null, error };
    }
  },

  /**
   * Sign out the current user
   * @returns Success or error
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      return { error: null };
    } catch (error) {
      devLog('SignOut Error:', error);
      return { error };
    }
  },

  /**
   * Get the currently authenticated user
   * @returns User data or null
   */
  async getCurrentUser() {
    try {
      const { data, error } = await supabase.auth.getUser();
      
      if (error) throw error;
      
      if (data?.user) {
        // Fetch user profile data
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        if (profileError) throw profileError;
        
        return { 
          user: { 
            ...data.user, 
            profile: profileData 
          } as User, 
          error: null 
        };
      }
      
      return { user: null, error: null };
    } catch (error) {
      devLog('GetCurrentUser Error:', error);
      return { user: null, error };
    }
  },

  /**
   * Send a password reset email to the user
   * @param email - User's email
   * @returns Success or error
   */
  async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) throw error;
      
      return { error: null };
    } catch (error) {
      devLog('ResetPassword Error:', error);
      return { error };
    }
  },

  /**
   * Update user profile information
   * @param userId - User's ID
   * @param profileData - Profile data to update
   * @returns Updated profile or error
   */
  async updateProfile(userId: string, profileData: Partial<User['profile']>) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(profileData)
        .eq('id', userId)
        .select()
        .single();
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      devLog('UpdateProfile Error:', error);
      return { data: null, error };
    }
  }
};

/**
 * Card management functions
 */
export const cardService = {
  /**
   * Create a new card
   * @param cardData - Card data to create
   * @returns Created card or error
   */
  async createCard(cardData: Omit<Card, 'id' | 'tags' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('cards')
        .insert(cardData)
        .select()
        .single();
      
      if (error) throw error;
      
      return { data: { ...data, tags: [] }, error: null };
    } catch (error) {
      devLog('CreateCard Error:', error);
      return { data: null, error };
    }
  },

  /**
   * Add tags to a card
   * @param cardId - Card ID
   * @param tagIds - Array of tag IDs to add
   * @returns Success or error
   */
  async addTagsToCard(cardId: string, tagIds: string[]) {
    try {
      const tagConnections = tagIds.map(tagId => ({
        card_id: cardId,
        tag_id: tagId
      }));

      const { error } = await supabase
        .from('card_tags')
        .insert(tagConnections);
      
      if (error) throw error;
      
      return { error: null };
    } catch (error) {
      devLog('AddTagsToCard Error:', error);
      return { error };
    }
  },

  /**
   * Get a card by ID with tags
   * @param cardId - Card ID
   * @returns Card with tags or error
   */
  async getCardById(cardId: string) {
    try {
      // Get card data
      const { data: cardData, error: cardError } = await supabase
        .from('cards')
        .select('*')
        .eq('id', cardId)
        .single();
      
      if (cardError) throw cardError;
      
      // Get tags for the card
      const { data: tagData, error: tagError } = await supabase
        .from('tags')
        .select('*')
        .in('id', supabase
          .from('card_tags')
          .select('tag_id')
          .eq('card_id', cardId));
      
      if (tagError) throw tagError;
      
      const card: Card = {
        ...cardData,
        tags: tagData || []
      };
      
      return { data: card, error: null };
    } catch (error) {
      devLog('GetCardById Error:', error);
      return { data: null, error };
    }
  },

  /**
   * Update a card
   * @param cardId - Card ID
   * @param cardData - Card data to update
   * @returns Updated card or error
   */
  async updateCard(cardId: string, cardData: Partial<Omit<Card, 'id' | 'tags' | 'created_at' | 'updated_at'>>) {
    try {
      const { data, error } = await supabase
        .from('cards')
        .update({ ...cardData, updated_at: new Date() })
        .eq('id', cardId)
        .select()
        .single();
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      devLog('UpdateCard Error:', error);
      return { data: null, error };
    }
  },

  /**
   * Delete a card
   * @param cardId - Card ID
   * @returns Success or error
   */
  async deleteCard(cardId: string) {
    try {
      const { error } = await supabase
        .from('cards')
        .delete()
        .eq('id', cardId);
      
      if (error) throw error;
      
      return { error: null };
    } catch (error) {
      devLog('DeleteCard Error:', error);
      return { error };
    }
  },

  /**
   * Get cards for a user
   * @param userId - User ID
   * @returns Array of cards or error
   */
  async getUserCards(userId: string) {
    try {
      // Get cards
      const { data: cardsData, error: cardsError } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', userId);
      
      if (cardsError) throw cardsError;
      
      // For each card, get its tags
      const cardsWithTags = await Promise.all(cardsData.map(async (card) => {
        const { data: tagData } = await supabase
          .from('tags')
          .select('*')
          .in('id', supabase
            .from('card_tags')
            .select('tag_id')
            .eq('card_id', card.id));
        
        return {
          ...card,
          tags: tagData || []
        };
      }));
      
      return { data: cardsWithTags, error: null };
    } catch (error) {
      devLog('GetUserCards Error:', error);
      return { data: [], error };
    }
  }
};

/**
 * Routine management functions
 */
export const routineService = {
  /**
   * Create a new routine
   * @param routineData - Routine data to create
   * @returns Created routine or error
   */
  async createRoutine(routineData: Omit<Routine, 'id' | 'tags' | 'cards' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('routines')
        .insert(routineData)
        .select()
        .single();
      
      if (error) throw error;
      
      // Increment user's routines_created count
      await supabase.rpc('increment_routines_created', {
        user_id: routineData.user_id
      });
      
      return { data: { ...data, tags: [], cards: [] }, error: null };
    } catch (error) {
      devLog('CreateRoutine Error:', error);
      return { data: null, error };
    }
  },

  /**
   * Add tags to a routine
   * @param routineId - Routine ID
   * @param tagIds - Array of tag IDs to add
   * @returns Success or error
   */
  async addTagsToRoutine(routineId: string, tagIds: string[]) {
    try {
      const tagConnections = tagIds.map(tagId => ({
        routine_id: routineId,
        tag_id: tagId
      }));

      const { error } = await supabase
        .from('routine_tags')
        .insert(tagConnections);
      
      if (error) throw error;
      
      return { error: null };
    } catch (error) {
      devLog('AddTagsToRoutine Error:', error);
      return { error };
    }
  },

  /**
   * Add cards to a routine with order
   * @param routineId - Routine ID
   * @param cardOrders - Array of card IDs with order positions
   * @returns Success or error
   */
  async addCardsToRoutine(routineId: string, cardOrders: { card_id: string, order_position: number }[]) {
    try {
      const cardConnections = cardOrders.map(({card_id, order_position}) => ({
        routine_id: routineId,
        card_id,
        order_position
      }));

      const { error } = await supabase
        .from('routine_cards')
        .insert(cardConnections);
      
      if (error) throw error;
      
      // Calculate total duration of the routine
      let totalDuration = 0;
      const cardIds = cardOrders.map(co => co.card_id);
      
      const { data: cardsData } = await supabase
        .from('cards')
        .select('duration')
        .in('id', cardIds);
        
      if (cardsData) {
        totalDuration = cardsData.reduce((sum, card) => sum + (card.duration || 0), 0);
        
        // Update routine with total duration
        await supabase
          .from('routines')
          .update({ total_duration: totalDuration })
          .eq('id', routineId);
      }
      
      return { error: null };
    } catch (error) {
      devLog('AddCardsToRoutine Error:', error);
      return { error };
    }
  },

  /**
   * Get a routine by ID with tags and cards
   * @param routineId - Routine ID
   * @returns Routine with tags and cards or error
   */
  async getRoutineById(routineId: string) {
    try {
      // Get routine data
      const { data: routineData, error: routineError } = await supabase
        .from('routines')
        .select('*')
        .eq('id', routineId)
        .single();
      
      if (routineError) throw routineError;
      
      // Get tags for the routine
      const { data: tagData, error: tagError } = await supabase
        .from('tags')
        .select('*')
        .in('id', supabase
          .from('routine_tags')
          .select('tag_id')
          .eq('routine_id', routineId));
      
      if (tagError) throw tagError;
      
      // Get ordered cards for the routine
      const { data: cardOrderData, error: cardOrderError } = await supabase
        .from('routine_cards')
        .select('card_id, order_position')
        .eq('routine_id', routineId)
        .order('order_position');
      
      if (cardOrderError) throw cardOrderError;
      
      // Get card details
      const cardIds = cardOrderData.map(co => co.card_id);
      let cardsWithTags: Card[] = [];
      
      if (cardIds.length > 0) {
        // Get all cards
        const { data: cardsData, error: cardsError } = await supabase
          .from('cards')
          .select('*')
          .in('id', cardIds);
        
        if (cardsError) throw cardsError;
        
        // For each card, get its tags
        cardsWithTags = await Promise.all(cardsData.map(async (card) => {
          const { data: cardTagData } = await supabase
            .from('tags')
            .select('*')
            .in('id', supabase
              .from('card_tags')
              .select('tag_id')
              .eq('card_id', card.id));
          
          return {
            ...card,
            tags: cardTagData || []
          };
        }));
        
        // Sort cards according to the order_position
        cardsWithTags.sort((a, b) => {
          const aOrder = cardOrderData.find(co => co.card_id === a.id)?.order_position || 0;
          const bOrder = cardOrderData.find(co => co.card_id === b.id)?.order_position || 0;
          return aOrder - bOrder;
        });
      }
      
      const routine: Routine = {
        ...routineData,
        tags: tagData || [],
        cards: cardsWithTags
      };
      
      return { data: routine, error: null };
    } catch (error) {
      devLog('GetRoutineById Error:', error);
      return { data: null, error };
    }
  },

  /**
   * Update a routine
   * @param routineId - Routine ID
   * @param routineData - Routine data to update
   * @returns Updated routine or error
   */
  async updateRoutine(routineId: string, routineData: Partial<Omit<Routine, 'id' | 'tags' | 'cards' | 'created_at' | 'updated_at'>>) {
    try {
      const { data, error } = await supabase
        .from('routines')
        .update({ ...routineData, updated_at: new Date() })
        .eq('id', routineId)
        .select()
        .single();
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      devLog('UpdateRoutine Error:', error);
      return { data: null, error };
    }
  },

  /**
   * Delete a routine
   * @param routineId - Routine ID
   * @returns Success or error
   */
  async deleteRoutine(routineId: string) {
    try {
      const { error } = await supabase
        .from('routines')
        .delete()
        .eq('id', routineId);
      
      if (error) throw error;
      
      return { error: null };
    } catch (error) {
      devLog('DeleteRoutine Error:', error);
      return { error };
    }
  },

  /**
   * Get routines for a user
   * @param userId - User ID
   * @returns Array of routines or error
   */
  async getUserRoutines(userId: string) {
    try {
      // Get routines
      const { data: routinesData, error: routinesError } = await supabase
        .from('routines')
        .select('*')
        .eq('user_id', userId);
      
      if (routinesError) throw routinesError;
      
      // For each routine, get its tags
      const routinesWithTags = await Promise.all(routinesData.map(async (routine) => {
        const { data: tagData } = await supabase
          .from('tags')
          .select('*')
          .in('id', supabase
            .from('routine_tags')
            .select('tag_id')
            .eq('routine_id', routine.id));
        
        return {
          ...routine,
          tags: tagData || [],
          cards: [] // Simplified version without cards
        };
      }));
      
      return { data: routinesWithTags, error: null };
    } catch (error) {
      devLog('GetUserRoutines Error:', error);
      return { data: [], error };
    }
  },

  /**
   * Get public routines
   * @param limit - Number of routines to get
   * @param offset - Offset for pagination
   * @returns Array of public routines or error
   */
  async getPublicRoutines(limit = 10, offset = 0) {
    try {
      // Get public routines
      const { data: routinesData, error: routinesError } = await supabase
        .from('routines')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (routinesError) throw routinesError;
      
      // For each routine, get its tags
      const routinesWithTags = await Promise.all(routinesData.map(async (routine) => {
        const { data: tagData } = await supabase
          .from('tags')
          .select('*')
          .in('id', supabase
            .from('routine_tags')
            .select('tag_id')
            .eq('routine_id', routine.id));
        
        return {
          ...routine,
          tags: tagData || [],
          cards: [] // Simplified version without cards
        };
      }));
      
      return { data: routinesWithTags, error: null };
    } catch (error) {
      devLog('GetPublicRoutines Error:', error);
      return { data: [], error };
    }
  },

  /**
   * Record completion of a routine
   * @param routineId - Routine ID
   * @param userId - User ID
   * @param duration - Duration of completion in seconds
   * @param notes - Optional notes about the completion
   * @returns Success or error
   */
  async recordRoutineCompletion(routineId: string, userId: string, duration: number, notes?: string) {
    try {
      const { error } = await supabase
        .from('routine_completions')
        .insert({
          routine_id: routineId,
          user_id: userId,
          duration,
          notes
        });
      
      if (error) throw error;
      
      // Increment user's routines_completed count
      await supabase.rpc('increment_routines_completed', {
        user_id: userId
      });
      
      return { error: null };
    } catch (error) {
      devLog('RecordRoutineCompletion Error:', error);
      return { error };
    }
  }
};

/**
 * Tag management functions
 */
export const tagService = {
  /**
   * Get all tags
   * @returns Array of tags or error
   */
  async getAllTags() {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('category')
        .order('name');
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      devLog('GetAllTags Error:', error);
      return { data: [], error };
    }
  },

  /**
   * Get tags by category
   * @param category - Tag category
   * @returns Array of tags in the category or error
   */
  async getTagsByCategory(category: string) {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('category', category)
        .order('name');
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      devLog('GetTagsByCategory Error:', error);
      return { data: [], error };
    }
  },

  /**
   * Create a new tag
   * @param tagData - Tag data to create
   * @returns Created tag or error
   */
  async createTag(tagData: Omit<Tag, 'id' | 'created_at'>) {
    try {
      const { data, error } = await supabase
        .from('tags')
        .insert(tagData)
        .select()
        .single();
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      devLog('CreateTag Error:', error);
      return { data: null, error };
    }
  }
};

/**
 * File upload and management functions
 */
export const fileService = {
  /**
   * Upload a file to storage
   * @param userId - User ID
   * @param fileData - File data to upload
   * @param filePath - Path to save the file to
   * @returns File URL or error
   */
  async uploadFile(userId: string, fileData: Blob, filePath: string) {
    try {
      const { data, error } = await supabase.storage
        .from('files')
        .upload(`${userId}/${filePath}`, fileData);
      
      if (error) throw error;
      
      // Get public URL for the file
      const { data: publicUrlData } = supabase.storage
        .from('files')
        .getPublicUrl(`${userId}/${filePath}`);
      
      return { data: publicUrlData.publicUrl, error: null };
    } catch (error) {
      devLog('UploadFile Error:', error);
      return { data: null, error };
    }
  },

  /**
   * Record file upload in database
   * @param userId - User ID
   * @param fileDetails - File details to record
   * @returns Success or error
   */
  async recordFileUpload(userId: string, fileDetails: { 
    file_path: string;
    file_type: string;
    file_name: string;
    file_size: number;
  }) {
    try {
      const { error } = await supabase
        .from('file_uploads')
        .insert({
          user_id: userId,
          ...fileDetails
        });
      
      if (error) throw error;
      
      return { error: null };
    } catch (error) {
      devLog('RecordFileUpload Error:', error);
      return { error };
    }
  },

  /**
   * Get files uploaded by a user
   * @param userId - User ID
   * @returns Array of file uploads or error
   */
  async getUserFiles(userId: string) {
    try {
      const { data, error } = await supabase
        .from('file_uploads')
        .select('*')
        .eq('user_id', userId)
        .order('uploaded_at', { ascending: false });
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      devLog('GetUserFiles Error:', error);
      return { data: [], error };
    }
  },

  /**
   * Delete a file
   * @param userId - User ID
   * @param fileId - File ID
   * @param filePath - Path to the file
   * @returns Success or error
   */
  async deleteFile(userId: string, fileId: string, filePath: string) {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('files')
        .remove([`${userId}/${filePath}`]);
      
      if (storageError) throw storageError;
      
      // Delete from database
      const { error: dbError } = await supabase
        .from('file_uploads')
        .delete()
        .eq('id', fileId)
        .eq('user_id', userId);
      
      if (dbError) throw dbError;
      
      return { error: null };
    } catch (error) {
      devLog('DeleteFile Error:', error);
      return { error };
    }
  }
};

// Export the Supabase client for direct access if needed
export { supabase }; 