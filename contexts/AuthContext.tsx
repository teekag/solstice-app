import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session } from '@supabase/supabase-js';
import { authService, supabase } from '../services/supabaseService';
import { User, UserProfile } from '../types';
import { devLog } from '../utils/environment';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updateProfile: (profileData: Partial<User['profile']>) => Promise<{ data: any, error: any }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initial session and user fetch
  useEffect(() => {
    // For testing purposes: Create a mock user to bypass authentication
    const mockUser: User = {
      id: 'test-user-id',
      email: 'test@example.com',
      profile: {
        id: 'test-user-id',
        display_name: 'Test User',
        avatar_url: null,
        bio: 'This is a test user for development',
        preferences: {},
      }
    };

    // Comment this section for testing with mock user
    /*
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchUser();
      } else {
        setLoading(false);
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchUser();
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
    */

    // For testing: Set mock user and session
    setUser(mockUser);
    setLoading(false);
    
  }, []);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const { user, error } = await authService.getCurrentUser();
      if (error) throw error;
      setUser(user);
    } catch (error) {
      devLog('Error fetching user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await authService.signIn(email, password);
      return { error };
    } catch (error) {
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await authService.signUp(email, password);
      return { error };
    } catch (error) {
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await authService.signOut();
      return { error };
    } catch (error) {
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await authService.resetPassword(email);
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const updateProfile = async (profileData: Partial<User['profile']>) => {
    try {
      if (!user) {
        return { data: null, error: new Error('User not authenticated') };
      }
      
      const { data, error } = await authService.updateProfile(user.id, profileData);
      if (!error && data) {
        // Refresh user data
        await refreshUser();
      }
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  };

  const value = {
    session,
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 