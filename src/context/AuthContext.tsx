import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '../types';
import { supabase } from '../utils/supabase';
import { supabaseService } from '../services/supabase';
import { validateUsername, validateDisplayName } from '../components/UsernameValidator';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, displayName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Get or create user profile
        let user = await supabaseService.getUser(session.user.id);
        if (!user) {
          // Create new user profile
          user = await supabaseService.createUser({
            id: session.user.id,
            username: session.user.user_metadata.username || session.user.email?.split('@')[0] || '',
            displayName: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || '',
            bio: '',
            avatar: session.user.user_metadata.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${session.user.email}`,
            email: session.user.email || '',
            createdAt: new Date().toISOString(),
            following: []
          });
        }
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
  };

  const signup = async (username: string, displayName: string, email: string, password: string) => {
    // Validate username and displayName
    if (!validateUsername(username)) {
      throw new Error('Username must be 4-15 characters and can only contain letters, numbers, and underscores');
    }
    
    if (!validateDisplayName(displayName)) {
      throw new Error('Display name is invalid. Maximum 50 characters allowed.');
    }

    // Check if username is taken
    const existingUser = await supabaseService.getUserByUsername(username);
    if (existingUser) {
      throw new Error('Username already taken');
    }

    // Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          full_name: displayName
        }
      }
    });

    if (error) throw error;
    if (!data.user) throw new Error('Failed to create user');
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setCurrentUser(null);
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!currentUser) throw new Error('No user logged in');
    
    // Update user profile
    const updatedUser = await supabaseService.updateUser(currentUser.id, updates);
    setCurrentUser(updatedUser);
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    if (error) throw error;
  };

  const value = {
    currentUser,
    isLoading,
    login,
    signup,
    logout,
    updateProfile,
    signInWithGoogle
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
