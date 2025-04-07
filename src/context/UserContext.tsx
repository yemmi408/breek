import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '../types';
import { useAuth } from './AuthContext';

interface UserContextType {
  users: User[];
  getUser: (userId: string) => User | undefined;
  getUserByUsername: (username: string) => User | undefined;
  followUser: (userId: string) => void;
  unfollowUser: (userId: string) => void;
  isFollowing: (userId: string) => boolean;
  getFollowers: (userId: string, limit?: number) => User[];
  getFollowing: (userId: string, limit?: number) => User[];
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const { currentUser, updateProfile } = useAuth();

  useEffect(() => {
    // Load users from localStorage
    try {
      const savedUsers = localStorage.getItem('users');
      if (savedUsers) {
        setUsers(JSON.parse(savedUsers));
      } else {
        // Initialize with empty users array - removed demo users
        const emptyUsers: User[] = [];
        setUsers(emptyUsers);
        localStorage.setItem('users', JSON.stringify(emptyUsers));
      }
    } catch (error) {
      console.error("Error loading users:", error);
      setUsers([]);
    }
  }, []);

  const getUser = (userId: string) => {
    return users.find(user => user.id === userId);
  };

  const getUserByUsername = (username: string) => {
    return users.find(user => user.username === username);
  };

  const followUser = (userId: string) => {
    if (!currentUser || userId === currentUser.id) return;
    
    try {
      if (!currentUser.following.includes(userId)) {
        const updatedFollowing = [...currentUser.following, userId];
        updateProfile({ following: updatedFollowing });
      }
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  const unfollowUser = (userId: string) => {
    if (!currentUser) return;
    
    try {
      const updatedFollowing = currentUser.following.filter(id => id !== userId);
      updateProfile({ following: updatedFollowing });
    } catch (error) {
      console.error("Error unfollowing user:", error);
    }
  };

  const isFollowing = (userId: string) => {
    if (!currentUser) return false;
    return currentUser.following.includes(userId);
  };

  /**
   * Get users who are following the specified user
   * @param userId The ID of the user to get followers for
   * @param limit Optional limit to the number of followers to return (most recent first)
   * @returns Array of users who follow the specified user
   */
  const getFollowers = (userId: string, limit?: number): User[] => {
    if (!userId) return [];
    
    try {
      // Find users who have this userId in their following array
      const followers = users.filter(user => user.following.includes(userId));
      
      // Sort by most recently followed (placeholder since we don't track follow dates)
      // In a real app, we would sort by actual follow date
      // For now, we'll return in reverse order as a proxy for "most recent"
      const sortedFollowers = [...followers].reverse();
      
      // Limit to the specified number if provided
      return limit ? sortedFollowers.slice(0, limit) : sortedFollowers;
    } catch (error) {
      console.error("Error getting followers:", error);
      return [];
    }
  };

  /**
   * Get users that the specified user is following
   * @param userId The ID of the user to get following list for
   * @param limit Optional limit to the number of following to return (most recent first)
   * @returns Array of users that the specified user follows
   */
  const getFollowing = (userId: string, limit?: number): User[] => {
    if (!userId) return [];
    
    try {
      // Get the user
      const user = getUser(userId);
      if (!user) return [];
      
      // Get the IDs of users they're following
      const followingIds = user.following;
      
      // Map IDs to user objects, filtering out any that don't exist
      const followingUsers = followingIds
        .map(id => getUser(id))
        .filter((user): user is User => user !== undefined);
      
      // Reverse the order as a proxy for "most recent first"
      // In a real app, we would sort by actual follow date
      const sortedFollowing = [...followingUsers].reverse();
      
      // Limit to the specified number if provided
      return limit ? sortedFollowing.slice(0, limit) : sortedFollowing;
    } catch (error) {
      console.error("Error getting following:", error);
      return [];
    }
  };

  return (
    <UserContext.Provider value={{ 
      users,
      getUser,
      getUserByUsername,
      followUser,
      unfollowUser,
      isFollowing,
      getFollowers,
      getFollowing,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUsers() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUsers must be used within a UserProvider');
  }
  return context;
}
