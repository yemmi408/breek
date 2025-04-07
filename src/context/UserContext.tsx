import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '../types';
import { useAuth } from './AuthContext';
import { supabaseService } from '../services/supabase';

interface UserContextType {
  users: User[];
  getUser: (userId: string) => User | undefined;
  getUserByUsername: (username: string) => User | undefined;
  followUser: (userId: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
  isFollowing: (userId: string) => boolean;
  getFollowers: (userId: string) => Promise<User[]>;
  getFollowing: (userId: string) => Promise<User[]>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const { currentUser, updateProfile } = useAuth();

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const { data, error } = await supabaseService.getUsers();
        if (error) throw error;
        setUsers(data);
      } catch (error) {
        console.error('Error loading users:', error);
        setUsers([]);
      }
    };

    loadUsers();
  }, []);

  const getUser = (userId: string) => {
    return users.find(user => user.id === userId);
  };

  const getUserByUsername = (username: string) => {
    return users.find(user => user.username === username);
  };

  const followUser = async (userId: string) => {
    if (!currentUser || userId === currentUser.id) return;
    
    try {
      await supabaseService.followUser(currentUser.id, userId);
      const updatedFollowing = [...currentUser.following, userId];
      await updateProfile({ following: updatedFollowing });
    } catch (error) {
      console.error('Error following user:', error);
      throw error;
    }
  };

  const unfollowUser = async (userId: string) => {
    if (!currentUser) return;
    
    try {
      await supabaseService.unfollowUser(currentUser.id, userId);
      const updatedFollowing = currentUser.following.filter(id => id !== userId);
      await updateProfile({ following: updatedFollowing });
    } catch (error) {
      console.error('Error unfollowing user:', error);
      throw error;
    }
  };

  const isFollowing = (userId: string) => {
    if (!currentUser) return false;
    return currentUser.following.includes(userId);
  };

  const getFollowers = async (userId: string) => {
    try {
      return await supabaseService.getFollowers(userId);
    } catch (error) {
      console.error('Error getting followers:', error);
      throw error;
    }
  };

  const getFollowing = async (userId: string) => {
    try {
      return await supabaseService.getFollowing(userId);
    } catch (error) {
      console.error('Error getting following:', error);
      throw error;
    }
  };

  const value = {
    users,
    getUser,
    getUserByUsername,
    followUser,
    unfollowUser,
    isFollowing,
    getFollowers,
    getFollowing
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
