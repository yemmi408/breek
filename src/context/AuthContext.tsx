import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../utils/supabase';
import { User } from '../types';
import { isDevelopment } from '../utils/env';
import { supabaseService } from '../services/supabase';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Debug Supabase auth state
    if (isDevelopment()) {
      console.log('Setting up auth state listener');
    }

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (isDevelopment()) {
        console.log('Initial session:', session);
      }
      if (session?.user) {
        // Get or create user profile
        let user = await supabaseService.getUser(session.user.id);
        if (!user) {
          const newUser = {
            username: session.user.user_metadata.username || session.user.email?.split('@')[0] || '',
            displayName: session.user.user_metadata.display_name || session.user.email?.split('@')[0] || '',
            bio: '',
            avatar: session.user.user_metadata.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${session.user.email}`,
            email: session.user.email || '',
            createdAt: new Date().toISOString(),
            following: []
          };
          user = await supabaseService.createUser(newUser);
        }
        setCurrentUser(user);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (isDevelopment()) {
        console.log('Auth state changed:', event, session);
      }

      if (session?.user) {
        // Get or create user profile
        let user = await supabaseService.getUser(session.user.id);
        if (!user) {
          const newUser = {
            username: session.user.user_metadata.username || session.user.email?.split('@')[0] || '',
            displayName: session.user.user_metadata.display_name || session.user.email?.split('@')[0] || '',
            bio: '',
            avatar: session.user.user_metadata.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${session.user.email}`,
            email: session.user.email || '',
            createdAt: new Date().toISOString(),
            following: []
          };
          user = await supabaseService.createUser(newUser);
        }
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    if (isDevelopment()) {
      console.log('Attempting login with:', email);
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signup = async (email: string, password: string, username: string, displayName: string) => {
    if (isDevelopment()) {
      console.log('Attempting signup with:', email, username);
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          display_name: displayName
        }
      }
    });
    if (error) throw error;
  };

  const logout = async () => {
    if (isDevelopment()) {
      console.log('Attempting logout');
    }
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!currentUser) throw new Error('Not logged in');
    if (isDevelopment()) {
      console.log('Updating profile:', updates);
    }
    const { error } = await supabase.auth.updateUser({
      data: updates
    });
    if (error) throw error;
    // Also update the user profile in our database
    const updatedUser = await supabaseService.updateUser(currentUser.id, updates);
    setCurrentUser(updatedUser);
  };

  const signInWithGoogle = async () => {
    if (isDevelopment()) {
      console.log('Attempting Google sign in');
    }
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
    login,
    signup,
    logout,
    updateProfile,
    signInWithGoogle
  };

  if (loading) {
    return <div>Loading...</div>;
  }

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
