import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface UserSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (username: string, displayName: string, password: string) => Promise<void>;
  initialEmail: string;
  initialDisplayName?: string;
  initialUsername: string;
  error: string;
}

export function UserSetupModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialEmail, 
  initialDisplayName, 
  initialUsername, 
  error 
}: UserSetupModalProps) {
  const { currentUser, updateProfile } = useAuth();
  const [username, setUsername] = useState(initialUsername);
  const [displayName, setDisplayName] = useState(initialDisplayName || '');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState(error);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      await onSubmit(username.trim(), displayName.trim(), password);
      onClose();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to update profile');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Complete Your Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border rounded-lg"
              placeholder="Choose a username"
              required
              minLength={3}
              maxLength={30}
              pattern="^[a-zA-Z0-9_]+$"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full p-2 border rounded-lg"
              placeholder="Your display name"
              required
              minLength={2}
              maxLength={50}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded-lg"
              placeholder="Create a password"
              required
              minLength={6}
            />
          </div>
          {(error || localError) && <p className="text-red-500 text-sm">{error || localError}</p>}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
