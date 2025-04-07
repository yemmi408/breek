import { useState, useRef, useEffect } from 'react';
import { Waves, X } from 'lucide-react';

interface DeactivateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
  error?: string;
}

export function DeactivateModal({ isOpen, onClose, onConfirm, error }: DeactivateModalProps) {
  const [password, setPassword] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent scrolling
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = ''; // Restore scrolling
    };
  }, [isOpen, onClose]);

  // Reset password field when modal opens
  useEffect(() => {
    if (isOpen) {
      setPassword('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div 
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full mx-4 p-6"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400">Deactivate Account</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X size={20} />
          </button>
        </div>
        
        <div className="mb-4 flex items-start space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-800 dark:text-red-300">
          <Waves className="flex-shrink-0 mt-0.5" size={18} />
          <div>
            <p className="font-medium">Warning: This action cannot be undone</p>
            <p className="mt-1 text-sm">Deactivating your account will remove your profile and all your data from Breek.</p>
          </div>
        </div>
        
        <form onSubmit={(e) => {
          e.preventDefault();
          onConfirm(password);
        }}>
          <div className="mb-4">
            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Enter your password to confirm
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-black dark:text-white"
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />
            {error && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!password}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              Deactivate Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
