import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '../types';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  onAuthStateChanged,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { validateUsername, validateDisplayName } from '../components/UsernameValidator';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signup: (username: string, displayName: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  changePassword: (currentPassword: string, newPassword: string) => void;
  deactivateAccount: (password: string) => boolean;
  signInWithGoogle: () => Promise<{needsProfile: boolean, email?: string, displayName?: string}>;
  completeGoogleSignup: (username: string, displayName: string, password: string) => Promise<void>;
}

interface UserWithPassword extends User {
  password: string; // Hashed password, not plaintext
}

interface GoogleAuthData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// Simple hash function for password security
// In a real app, use a proper crypto library with salt
function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
}

// Check if username already exists
function isUsernameTaken(username: string): boolean {
  try {
    const users = JSON.parse(localStorage.getItem('users') || '[]') as User[];
    return users.some(user => user.username.toLowerCase() === username.toLowerCase());
  } catch (error) {
    console.error("Error checking username:", error);
    return false;
  }
}

// Check if email already exists
function isEmailTaken(email: string): boolean {
  try {
    const users = JSON.parse(localStorage.getItem('users') || '[]') as User[];
    return users.some(user => user.email?.toLowerCase() === email.toLowerCase());
  } catch (error) {
    console.error("Error checking email:", error);
    return false;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingGoogleAuth, setPendingGoogleAuth] = useState<GoogleAuthData | null>(null);

  // Initialize Google Auth Provider
  const googleProvider = new GoogleAuthProvider();

  useEffect(() => {
    // Check Firebase auth state
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Check if this Google user exists in our local storage
        try {
          const users = JSON.parse(localStorage.getItem('users') || '[]') as User[];
          let user = users.find(u => u.email === firebaseUser.email);
          
          if (!user && firebaseUser.email) {
            // Store Google user data for profile setup later
            setPendingGoogleAuth({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL
            });
          } else if (user) {
            setCurrentUser(user);
            localStorage.setItem('currentUser', JSON.stringify(user));
          }
        } catch (error) {
          console.error("Error processing Firebase user:", error);
        }
      } else {
        // Check for local auth
        try {
          const savedUser = localStorage.getItem('currentUser');
          if (savedUser) {
            const user = JSON.parse(savedUser);
            // Only set user from localStorage if it's not a Google user
            if (!user.authProvider || user.authProvider !== 'google') {
              setCurrentUser(user);
            } else {
              // If it's a Google user but Firebase says not authenticated, clear it
              localStorage.removeItem('currentUser');
              setCurrentUser(null);
            }
          } else {
            setCurrentUser(null);
          }
        } catch (error) {
          console.error("Error loading local user data:", error);
          localStorage.removeItem('currentUser');
          setCurrentUser(null);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      // In a real app, this would be an API call
      const users = JSON.parse(localStorage.getItem('users') || '[]') as UserWithPassword[];
      const user = users.find((u) => u.username === username);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Hash the input password and compare with stored hash
      const hashedPassword = hashPassword(password);
      if (user.password !== hashedPassword) {
        throw new Error('Invalid password');
      }
      
      // Don't include the password in the currentUser state
      const { password: _, ...userWithoutPassword } = user;
      setCurrentUser(userWithoutPassword);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    try {
      // In a real app, this would be an API call
      const users = JSON.parse(localStorage.getItem('users') || '[]') as UserWithPassword[];
      const user = users.find((u) => u.email === email);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Hash the input password and compare with stored hash
      const hashedPassword = hashPassword(password);
      if (user.password !== hashedPassword) {
        throw new Error('Invalid password');
      }
      
      // For Google-authenticated users, we'll need to handle their login differently
      if (user.authProvider === 'google') {
        // If they're using email/password login but have a Google account,
        // just log them in directly without Firebase authentication
        const { password: _, ...userWithoutPassword } = user;
        setCurrentUser(userWithoutPassword);
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      } else {
        // For regular users, proceed as normal
        const { password: _, ...userWithoutPassword } = user;
        setCurrentUser(userWithoutPassword);
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      }
    } catch (error) {
      console.error("Login with email error:", error);
      throw error;
    }
  };

  const signup = async (username: string, displayName: string, password: string) => {
    try {
      // Validate username and displayName
      if (!validateUsername(username)) {
        throw new Error('Username must be 4-15 characters and can only contain letters, numbers, and underscores');
      }
      
      if (!validateDisplayName(displayName)) {
        throw new Error('Display name is invalid. Maximum 50 characters allowed.');
      }
      
      // Validate password
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }
      
      // In a real app, this would be an API call
      const users = JSON.parse(localStorage.getItem('users') || '[]') as UserWithPassword[];
      
      if (isUsernameTaken(username)) {
        throw new Error('Username already taken');
      }
      
      // Hash the password before storing
      const hashedPassword = hashPassword(password);
      
      const newUser: UserWithPassword = {
        id: Date.now().toString(),
        username,
        displayName,
        bio: '',
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`,
        createdAt: new Date().toISOString(),
        following: [],
        password: hashedPassword,
      };
      
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      // Log in the new user but don't include the password in currentUser
      const { password: _, ...userWithoutPassword } = newUser;
      setCurrentUser(userWithoutPassword);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Clear any pending Google auth
      setPendingGoogleAuth(null);
      
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      
      if (!firebaseUser.email) {
        throw new Error('No email provided by Google');
      }
      
      // Check if this Google user already exists in our system
      const users = JSON.parse(localStorage.getItem('users') || '[]') as User[];
      const existingUser = users.find(u => u.email === firebaseUser.email);
      
      if (existingUser) {
        // User already exists, set as current user
        setCurrentUser(existingUser);
        localStorage.setItem('currentUser', JSON.stringify(existingUser));
        return { needsProfile: false };
      } else {
        // New user, needs to complete profile
        setPendingGoogleAuth({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL
        });
        
        return { 
          needsProfile: true,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || undefined
        };
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      throw error;
    }
  };

  const completeGoogleSignup = async (username: string, displayName: string, password: string) => {
    try {
      if (!pendingGoogleAuth || !pendingGoogleAuth.email) {
        throw new Error('No pending Google authentication found');
      }
      
      // Validate username and displayName
      if (!validateUsername(username)) {
        throw new Error('Username must be 4-15 characters and can only contain letters, numbers, and underscores');
      }
      
      if (!validateDisplayName(displayName)) {
        throw new Error('Display name is invalid. Maximum 50 characters allowed.');
      }
      
      // Validate password
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }
      
      // Check if username is taken
      if (isUsernameTaken(username)) {
        throw new Error('Username already taken');
      }
      
      // Hash the password
      const hashedPassword = hashPassword(password);
      
      // Create the new user
      const newUser: UserWithPassword = {
        id: pendingGoogleAuth.uid,
        username,
        displayName,
        email: pendingGoogleAuth.email,
        bio: '',
        avatar: pendingGoogleAuth.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`,
        createdAt: new Date().toISOString(),
        following: [],
        authProvider: 'google',
        password: hashedPassword
      };
      
      // Add the new user to our local storage
      const users = JSON.parse(localStorage.getItem('users') || '[]') as UserWithPassword[];
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      // Set as current user (without the password)
      const { password: _, ...userWithoutPassword } = newUser;
      setCurrentUser(userWithoutPassword);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      
      // Clear pending Google auth
      setPendingGoogleAuth(null);
    } catch (error) {
      console.error("Complete Google signup error:", error);
      throw error;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    
    // If using Firebase auth, also sign out from Firebase
    if (auth.currentUser) {
      firebaseSignOut(auth).catch(err => {
        console.error("Error signing out from Firebase:", err);
      });
    }
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!currentUser) return;
    
    try {
      // Validate username if it's being updated
      if (updates.username && updates.username !== currentUser.username) {
        if (!validateUsername(updates.username)) {
          throw new Error('Username must be 4-15 characters and can only contain letters, numbers, and underscores');
        }
        
        if (isUsernameTaken(updates.username)) {
          throw new Error('Username already taken');
        }
      }
      
      // Validate display name if it's being updated
      if (updates.displayName && updates.displayName !== currentUser.displayName) {
        if (!validateDisplayName(updates.displayName)) {
          throw new Error('Display name is invalid. Maximum 50 characters allowed.');
        }
      }
      
      const updatedUser = { ...currentUser, ...updates };
      
      // Update in local state
      setCurrentUser(updatedUser);
      
      // Update in localStorage
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      // Update in users array - preserve password
      const users = JSON.parse(localStorage.getItem('users') || '[]') as UserWithPassword[];
      const updatedUsers = users.map((u) => {
        if (u.id === currentUser.id) {
          return { ...u, ...updates };
        }
        return u;
      });
      localStorage.setItem('users', JSON.stringify(updatedUsers));
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  };

  const changePassword = (currentPassword: string, newPassword: string) => {
    if (!currentUser) {
      throw new Error('Not logged in');
    }
    
    try {
      // Validate new password
      if (newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }
      
      // Get users array including passwords
      const users = JSON.parse(localStorage.getItem('users') || '[]') as UserWithPassword[];
      
      // Find the current user with password
      const userWithPassword = users.find(user => user.id === currentUser.id);
      
      if (!userWithPassword) {
        throw new Error('User not found');
      }
      
      // Verify current password by comparing hashes
      const hashedCurrentPassword = hashPassword(currentPassword);
      if (userWithPassword.password !== hashedCurrentPassword) {
        throw new Error('Current password is incorrect');
      }
      
      // Hash and update the new password
      const hashedNewPassword = hashPassword(newPassword);
      const updatedUsers = users.map(user => {
        if (user.id === currentUser.id) {
          return { ...user, password: hashedNewPassword };
        }
        return user;
      });
      
      // Save updated users array
      localStorage.setItem('users', JSON.stringify(updatedUsers));
    } catch (error) {
      console.error("Change password error:", error);
      throw error;
    }
  };

  const deactivateAccount = (password: string): boolean => {
    if (!currentUser) {
      throw new Error('Not logged in');
    }
    
    try {
      // Get users array including passwords
      const users = JSON.parse(localStorage.getItem('users') || '[]') as UserWithPassword[];
      
      // Find the current user with password
      const userWithPassword = users.find(user => user.id === currentUser.id);
      
      if (!userWithPassword) {
        throw new Error('User not found');
      }
      
      // Verify password by comparing hashes
      const hashedPassword = hashPassword(password);
      if (userWithPassword.password !== hashedPassword) {
        return false;
      }
      
      // Remove user from users array
      const updatedUsers = users.filter(user => user.id !== currentUser.id);
      
      // Save updated users array
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      // Clean up all user data comprehensively
      try {
        // 1. Remove posts by this user
        const posts = JSON.parse(localStorage.getItem('posts') || '[]');
        const userPostIds = posts
          .filter((post: any) => post.authorId === currentUser.id)
          .map((post: any) => post.id);
        
        // Keep posts not authored by this user and not reposting this user's posts
        const updatedPosts = posts.filter((post: any) => 
          post.authorId !== currentUser.id && 
          !(post.isRepost && userPostIds.includes(post.originalPostId))
        );
        
        // 2. Remove comments by this user
        const comments = JSON.parse(localStorage.getItem('comments') || '[]');
        const userCommentIds = comments
          .filter((comment: any) => comment.authorId === currentUser.id)
          .map((comment: any) => comment.id);
        
        // Keep comments not authored by this user and not reposting this user's comments
        const updatedComments = comments.filter((comment: any) => 
          comment.authorId !== currentUser.id && 
          !(comment.isRepost && userCommentIds.includes(comment.originalCommentId))
        );
        
        // 3. Remove likes by this user from other posts
        const postsWithLikesRemoved = updatedPosts.map((post: any) => ({
          ...post,
          likes: post.likes.filter((id: string) => id !== currentUser.id)
        }));
        
        // 4. Remove likes by this user from other comments
        const commentsWithLikesRemoved = updatedComments.map((comment: any) => ({
          ...comment,
          likes: comment.likes.filter((id: string) => id !== currentUser.id)
        }));
        
        // 5. Remove user from other users' following lists
        const usersWithFollowingUpdated = updatedUsers.map((user: any) => ({
          ...user,
          following: user.following.filter((id: string) => id !== currentUser.id)
        }));
        
        // Save all updated data
        localStorage.setItem('posts', JSON.stringify(postsWithLikesRemoved));
        localStorage.setItem('comments', JSON.stringify(commentsWithLikesRemoved));
        localStorage.setItem('users', JSON.stringify(usersWithFollowingUpdated));
      } catch (err) {
        console.error("Error cleaning up user data during account deactivation:", err);
        // Continue with logout even if cleanup has errors
      }
      
      // If using Firebase auth, also delete the Firebase account
      if (auth.currentUser && currentUser.authProvider === 'google') {
        // Sign out from Firebase
        firebaseSignOut(auth).catch(err => {
          console.error("Error signing out from Firebase during account deactivation:", err);
        });
      }
      
      // Log out the user
      logout();
      
      return true;
    } catch (error) {
      console.error("Deactivate account error:", error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      isLoading, 
      login, 
      loginWithEmail,
      signup, 
      logout, 
      updateProfile,
      changePassword,
      deactivateAccount,
      signInWithGoogle,
      completeGoogleSignup
    }}>
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
