import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { DeactivateModal } from '../components/DeactivateModal';
import { Moon, Sun } from 'lucide-react';
import { UsernameValidator, DisplayNameValidator, validateUsername, validateDisplayName } from '../components/UsernameValidator';

const MAX_IMAGE_SIZE = 8 * 1024 * 1024; // 8MB in bytes

export function SettingsPage() {
  const { currentUser, updateProfile, logout, changePassword, deactivateAccount } = useAuth();
  const { theme, setTheme } = useTheme();
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [username, setUsername] = useState(currentUser?.username || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [deactivateError, setDeactivateError] = useState('');
  const [isUsernameValid, setIsUsernameValid] = useState(true);
  const [isDisplayNameValid, setIsDisplayNameValid] = useState(true);
  const [showValidation, setShowValidation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Update form fields when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.displayName);
      setUsername(currentUser.username);
      setBio(currentUser.bio || '');
    }
  }, [currentUser]);
  
  if (!currentUser) return null;
  
  const isGoogleAccount = currentUser.authProvider === 'google';
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowValidation(true);
    setError('');
    
    if (!isUsernameValid) {
      setError('Username is invalid');
      return;
    }
    
    if (!isDisplayNameValid) {
      setError('Display name is invalid');
      return;
    }
    
    try {
      updateProfile({
        displayName,
        username,
        bio
      });
      
      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(''), 3000);
      setShowValidation(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    }
  };
  
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    
    setPasswordError('');
    setPasswordSuccess('');
    
    if (!currentPassword) {
      setPasswordError('Current password is required');
      return;
    }
    
    if (!newPassword) {
      setPasswordError('New password is required');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }
    
    try {
      changePassword(currentPassword, newPassword);
      setPasswordSuccess('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (err) {
      if (err instanceof Error) {
        setPasswordError(err.message);
      } else {
        setPasswordError('Failed to change password');
      }
    }
  };
  
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > MAX_IMAGE_SIZE) {
      setError('Image size must be less than 8MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      try {
        updateProfile({ avatar: reader.result as string });
        setSuccess('Profile picture updated successfully');
        setTimeout(() => setSuccess(''), 3000);
        setError('');
      } catch (err) {
        setError('Failed to update profile picture');
      }
    };
    reader.onerror = () => {
      setError('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  const handleDeactivateAccount = (password: string) => {
    try {
      const success = deactivateAccount(password);
      if (!success) {
        setDeactivateError('Incorrect password');
      }
      // No need to close modal on success - it will automatically close on logout
    } catch (err) {
      setDeactivateError('An error occurred while deactivating your account');
    }
  };
  
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
    }
  };
  
  // Update username to lowercase
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value.toLowerCase());
  };
  
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-black dark:text-white">Settings</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
          {success}
        </div>
      )}
      
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-4 text-black dark:text-white">Profile Picture</h2>
        <div className="flex items-center">
          <div className="mr-4">
            <img 
              src={currentUser.avatar} 
              alt={currentUser.displayName} 
              className="w-20 h-20 rounded-full"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://mocha-cdn.com/0195fd7e-1b9e-7cbc-a8e0-71cf7ffa78e8/-.png';
              }}
            />
          </div>
          <div>
            <button
              type="button"
              onClick={handleImageClick}
              className="bg-blue-500 text-white px-4 py-2 rounded-full font-medium"
            >
              Change Profile Picture
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
              accept="image/*" 
              className="hidden" 
            />
            <p className="text-sm text-gray-500 mt-1">Maximum file size: 8MB</p>
          </div>
        </div>
      </div>
      
      <div className="mb-8 border rounded-lg border-gray-200 dark:border-gray-700 p-4">
        <h2 className="text-lg font-medium mb-4 text-black dark:text-white">Profile Information</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="displayName" className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
              Display Name <span className="text-gray-500 text-xs">(max 50 characters)</span>
            </label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-black dark:text-white"
              required
            />
            <DisplayNameValidator
              displayName={displayName}
              setIsValid={setIsDisplayNameValid}
              showErrors={showValidation}
            />
          </div>
          
          <div>
            <label htmlFor="username" className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
              Username <span className="text-gray-500 text-xs">(4-15 characters, letters, numbers, underscores only)</span>
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={handleUsernameChange}
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-black dark:text-white"
              required
            />
            <UsernameValidator
              username={username}
              setIsValid={setIsUsernameValid}
              showErrors={showValidation}
            />
          </div>
          
          <div>
            <label htmlFor="bio" className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
              Bio
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-black dark:text-white"
              rows={3}
            />
          </div>
          
          {isGoogleAccount && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-700 dark:text-blue-300 flex items-center">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" 
                  fill="#4285F4" 
                />
                <path 
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" 
                  fill="#34A853" 
                />
                <path 
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" 
                  fill="#FBBC05" 
                />
                <path 
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" 
                  fill="#EA4335" 
                />
              </svg>
              <span>You're signed in with Google</span>
            </div>
          )}
          
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-full font-medium"
          >
            Save Changes
          </button>
        </form>
      </div>
      
      <div className="mb-8 border rounded-lg border-gray-200 dark:border-gray-700 p-4">
        <h2 className="text-lg font-medium mb-4 text-black dark:text-white">Appearance</h2>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-black dark:text-white">Background Theme</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Choose between light and dark background
            </p>
          </div>
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-black dark:text-white"
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
      
      {/* Only show password change for non-Google accounts */}
      {!isGoogleAccount && (
        <div className="mb-8 border rounded-lg border-gray-200 dark:border-gray-700 p-4">
          <h2 className="text-lg font-medium mb-4 text-black dark:text-white">Change Password</h2>
          
          {passwordError && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {passwordError}
            </div>
          )}
          
          {passwordSuccess && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
              {passwordSuccess}
            </div>
          )}
          
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-black dark:text-white"
                autoComplete="current-password"
              />
            </div>
            
            <div>
              <label htmlFor="newPassword" className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-black dark:text-white"
                autoComplete="new-password"
                minLength={6}
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-black dark:text-white"
                autoComplete="new-password"
              />
            </div>
            
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-full font-medium"
            >
              Change Password
            </button>
          </form>
        </div>
      )}
      
      <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-medium mb-4 text-black dark:text-white">Account</h2>
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          <button
            onClick={handleLogout}
            className="bg-gray-500 text-white px-4 py-2 rounded-full font-medium"
          >
            Sign Out
          </button>
          <button
            onClick={() => {
              setIsDeactivateModalOpen(true);
              setDeactivateError('');
            }}
            className="bg-red-500 text-white px-4 py-2 rounded-full font-medium"
          >
            Deactivate Account
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Deactivating your account will permanently remove your profile and data from Breek.
        </p>
      </div>
      
      <DeactivateModal
        isOpen={isDeactivateModalOpen}
        onClose={() => {
          setIsDeactivateModalOpen(false);
          setDeactivateError('');
        }}
        onConfirm={handleDeactivateAccount}
        error={deactivateError}
      />
    </div>
  );
}
