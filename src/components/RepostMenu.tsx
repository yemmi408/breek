import { useRef, useEffect } from 'react';
import { ChefHat, Repeat } from 'lucide-react';

interface RepostMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onRepost: () => void;
  onQuote: (e?: React.MouseEvent) => void; // Make event parameter optional
  onUnquote: () => void;
  hasReposted: boolean;
  hasQuoted: boolean;
  isQuotePost?: boolean;
  isUserOwnQuote?: boolean;
  position: { top: number; left: number };
}

export function RepostMenu({ 
  isOpen, 
  onClose, 
  onRepost, 
  onQuote, 
  onUnquote,
  hasReposted, 
  hasQuoted,
  isQuotePost = false,
  isUserOwnQuote = false,
  position 
}: RepostMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
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
  
  // Add escape key listener to close menu
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div 
      ref={menuRef}
      className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 w-40"
      style={{ 
        top: `${position.top + 40}px`, // Position below the button instead of above
        left: `${position.left}px`,
        transform: 'translateX(-80%)' // Position menu to the left of the button
      }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRepost();
          onClose();
        }}
        className={`flex items-center w-full px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
          hasReposted ? 'text-green-500' : ''
        }`}
      >
        <Repeat size={16} className="mr-2" />
        <span>{hasReposted ? 'Undo Repost' : 'Repost'}</span>
      </button>
      
      {hasQuoted ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            // Fixed: Pass the event object to onUnquote
            onUnquote();
            onClose();
          }}
          className="flex items-center w-full px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-green-500"
        >
          <ChefHat size={16} className="mr-2" />
          <span>Unquote</span>
        </button>
      ) : isUserOwnQuote ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            // Fixed: Pass the event object to onUnquote
            onUnquote();
            onClose();
          }}
          className="flex items-center w-full px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-green-500"
        >
          <ChefHat size={16} className="mr-2" />
          <span>Unquote</span>
        </button>
      ) : !isQuotePost ? (
        <button
          onClick={(e) => {
            // Fixed: Pass the event object to onQuote
            onQuote(e);
            onClose();
          }}
          className="flex items-center w-full px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ChefHat size={16} className="mr-2" />
          <span>Quote</span>
        </button>
      ) : null}
    </div>
  );
}
