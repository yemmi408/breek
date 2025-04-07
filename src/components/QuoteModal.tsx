import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { usePosts } from '../context/PostContext';
import { useAuth } from '../context/AuthContext';
import { Post } from '../types';
import { PostItem } from './PostItem';

interface QuoteModalProps {
  post: Post;
  onClose: () => void;
}

export function QuoteModal({ post, onClose }: QuoteModalProps) {
  const { createQuoteRepost } = usePosts();
  const { currentUser } = useAuth();
  const [quoteContent, setQuoteContent] = useState('');
  const [error, setError] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const MAX_QUOTE_LENGTH = 67;
  const charactersLeft = MAX_QUOTE_LENGTH - quoteContent.length;
  const isOverLimit = charactersLeft < 0;

  useEffect(() => {
    setQuoteContent('');
    setError('');
  }, [post]);

  const handleSubmit = () => {
    if (!currentUser) {
      setError('You must be logged in to quote a post');
      return;
    }

    if (quoteContent.length === 0) {
      setError('Quote cannot be empty');
      return;
    }

    if (isOverLimit) {
      setError(`Quote exceeds ${MAX_QUOTE_LENGTH} characters`);
      return;
    }

    createQuoteRepost(post.id, quoteContent);
    onClose();
  };

  if (!post) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={(e) => e.stopPropagation()}
    >
      <div 
        ref={modalRef}
        className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Quote Post</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <textarea
              ref={textareaRef}
              value={quoteContent}
              onChange={(e) => setQuoteContent(e.target.value)}
              placeholder={`Add your quote (${MAX_QUOTE_LENGTH} characters max)`}
              className={`w-full p-3 border ${isOverLimit ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-lg bg-white dark:bg-gray-900 text-black dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500`}
              rows={4}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            <p className={`text-sm mt-1 ${isOverLimit ? 'text-red-500' : 'text-gray-500'}`}>
              {charactersLeft} characters left
            </p>
          </div>
          <div className="pointer-events-none">
            <PostItem post={post} isPreview={true} />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={quoteContent.length === 0 || isOverLimit}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Quote
          </button>
        </div>
      </div>
    </div>
  );
}
