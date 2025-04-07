import { useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { FollowList } from './FollowList';
import { useAuth } from '../context/AuthContext';

interface FollowModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'followers' | 'following';
  userId: string;
  username: string;
}

export function FollowModal({ isOpen, onClose, type, userId, username }: FollowModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useAuth();
  const isOwnProfile = currentUser?.id === userId;
  
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

  if (!isOpen) return null;

  // Personalized titles for your own profile, standard format for other profiles
  const title = isOwnProfile
    ? type === 'followers' 
      ? 'Your followers' 
      : 'Your followings'
    : type === 'followers' 
      ? `People following ${username}` 
      : `People ${username} follows`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div 
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[80vh] flex flex-col"
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-black dark:text-white">{title}</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <FollowList userId={userId} type={type} />
        </div>
      </div>
    </div>
  );
}
