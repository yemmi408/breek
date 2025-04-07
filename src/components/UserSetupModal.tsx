import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { UsernameValidator, DisplayNameValidator, validateUsername, validateDisplayName } from './UsernameValidator';

interface UserSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (username: string, displayName: string, password: string) => void;
  initialEmail?: string;
  initialDisplayName?: string;
  initialUsername?: string;
  error?: string;
}

export function UserSetupModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialEmail = '', 
  initialDisplayName = '',
  initialUsername = '',
  error 
}: UserSetupModalProps) {
  const [username, setUsername] = useState(initialUsername || '');
  const [displayName, setDisplayName] = useState(initialDisplayName || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isUsernameValid, setIsUsernameValid] = useState(false);
  const [isDisplayNameValid, setIsDisplayNameValid] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const usernameInputRef = useRef<HTMLInputElement>(null);
  
  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setUsername(initialUsername || '');
      setDisplayName(initialDisplayName || '');
      setPassword('');
      setConfirmPassword('');
      setPasswordError('');
      setShowValidation(false);
      
      // Focus on username input when modal opens
      setTimeout(() => {
        usernameInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, initialUsername, initialDisplayName]);
  
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowValidation(true);
    
    // Validate username and display name
    if (!validateUsername(username) || !validateDisplayName(displayName)) {
      return;
    }
    
    // Validate password
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    setPasswordError('');
    onSubmit(username, displayName, password);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div 
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full mx-4 p-6"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-black dark:text-white">Complete Your Profile</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>
        
        <p className="mb-4 text-gray-600 dark:text-gray-300">
          Choose a username, display name, and password to complete your account setup.
        </p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {initialEmail && (
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                type="text"
                value={initialEmail}
                disabled
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
              />
            </div>
          )}
          
          <div>
            <label htmlFor="username" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Username <span className="text-gray-500 text-xs">(4-15 characters, letters, numbers, underscores only)</span>
            </label>
            <input
              type="text"
              id="username"
              ref={usernameInputRef}
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-black dark:text-white"
              placeholder="Choose a username"
              required
            />
            <UsernameValidator 
              username={username} 
              setIsValid={setIsUsernameValid} 
              showErrors={showValidation}
            />
          </div>
          
          <div>
            <label htmlFor="displayName" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Display Name <span className="text-gray-500 text-xs">(max 50 characters)</span>
            </label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-black dark:text-white"
              placeholder="Your display name"
              required
            />
            <DisplayNameValidator 
              displayName={displayName} 
              setIsValid={setIsDisplayNameValid}
              showErrors={showValidation}
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-black dark:text-white"
              placeholder="Create a password (min 6 characters)"
              required
              minLength={6}
            />
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-black dark:text-white"
              placeholder="Confirm your password"
              required
            />
            {passwordError && (
              <p className="mt-1 text-xs text-red-500">{passwordError}</p>
            )}
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-600"
          >
            Save Profile
          </button>
        </form>
      </div>
    </div>
  );
}
