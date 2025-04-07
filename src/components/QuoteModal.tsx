import { useState, useRef, useEffect } from 'react';
import { Hand, X } from 'lucide-react';
import { Post, Comment } from '../types';
import { PostItem } from './PostItem';
import { CommentItem } from './CommentItem';
import { usePosts } from '../context/PostContext';
import { useComments } from '../context/CommentContext';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: 'post';
  contentId: string;
  stopPropagation?: boolean; // Add this to prevent post click propagation
}

export function QuoteModal({ 
  isOpen, 
  onClose, 
  contentType, 
  contentId,
  stopPropagation = false
}: QuoteModalProps) {
  const [quoteText, setQuoteText] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { getPost, createQuoteRepost } = usePosts();
  const { getComment } = useComments();
  const [error, setError] = useState('');
  
  // Get the content being quoted
  const originalContent = contentType === 'post' 
    ? getPost(contentId) 
    : null;
  
  const MAX_QUOTE_LENGTH = 67;
  const charactersLeft = MAX_QUOTE_LENGTH - quoteText.length;
  const isOverLimit = charactersLeft < 0;
  
  // Focus on textarea when modal opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);
  
  // Close modal when clicking outside
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

  // Reset quote text when modal is opened
  useEffect(() => {
    if (isOpen) {
      setQuoteText('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = () => {
    try {
      if (isOverLimit) {
        setError(`Quote exceeds maximum length of ${MAX_QUOTE_LENGTH} characters`);
        return;
      }
      
      if (contentType === 'post' && originalContent) {
        createQuoteRepost(contentId, quoteText);
      }
      
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create quote');
    }
  };

  if (!isOpen || !originalContent) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={(e) => stopPropagation && e.stopPropagation()}
    >
      <div 
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-lg w-full mx-4 p-4"
        onClick={(e) => e.stopPropagation()} // Always stop propagation on the modal itself
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-black dark:text-white">Quote post</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X size={20} />
          </button>
        </div>
        
        <div className="mb-4">
          <textarea
            ref={textareaRef}
            value={quoteText}
            onChange={(e) => setQuoteText(e.target.value)}
            placeholder={`Add your quote (${MAX_QUOTE_LENGTH} characters max)`}
            className={`w-full p-3 border ${isOverLimit ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-lg bg-white dark:bg-gray-900 text-black dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500`}
            rows={2}
          />
          
          <div className={`mt-1 text-sm flex justify-between ${isOverLimit ? 'text-red-500' : 'text-gray-500'}`}>
            <span>{charactersLeft} characters left</span>
          </div>
          
          {error && (
            <div className="mt-2 text-sm text-red-500">{error}</div>
          )}
        </div>
        
        <div className="mb-4 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="p-2 bg-gray-50 dark:bg-gray-850 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
            Original content
          </div>
          <div className="pointer-events-none">
            <PostItem post={originalContent as Post} isPreview={true} />
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={quoteText.length === 0 || isOverLimit}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Quote
          </button>
        </div>
      </div>
    </div>
  );
}
