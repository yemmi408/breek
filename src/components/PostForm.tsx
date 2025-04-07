import { useState, useRef, useEffect } from 'react';
import { CircleHelp, SmilePlus } from 'lucide-react';
import { usePosts } from '../context/PostContext';
import EmojiPicker from 'emoji-picker-react';
import { detectLinks } from '../utils/linkDetector';

const MAX_CHARACTERS = 67;

export function PostForm() {
  const [content, setContent] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [error, setError] = useState('');
  const [containsLinks, setContainsLinks] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const { createPost } = usePosts();

  // Calculate characters left
  const charactersLeft = MAX_CHARACTERS - content.length;
  const isOverLimit = charactersLeft < 0;

  // Check for links whenever content changes
  useEffect(() => {
    try {
      setContainsLinks(detectLinks(content));
    } catch (err) {
      console.error('Error detecting links:', err);
      // Don't set containsLinks to true on error, to avoid false positives
    }
  }, [content]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (content.trim() && !isOverLimit) {
      try {
        createPost(content);
        setContent('');
        setError('');
        setContainsLinks(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create post. Please try again.');
      }
    }
  };

  const handleEmojiClick = (emojiData: any) => {
    setContent(prevContent => prevContent + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <form onSubmit={handleSubmit} className="border-b border-gray-200 dark:border-gray-800 p-4">
      <div className="relative">
        <textarea
          placeholder="Whats breeking today?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-2 resize-none bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none text-black dark:text-white"
          rows={3}
        />
      </div>
      
      {error && (
        <div className="mt-2 text-sm text-red-500">{error}</div>
      )}
      
      {containsLinks && (
        <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-center">
          <p className="text-sm text-amber-700 dark:text-amber-300 flex-grow flex items-center justify-between">
            <span>To keep your profile healthy, we recommend avoiding links in posts.</span>
            <button
              type="button"
              className="inline-flex items-center ml-1 text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              aria-label="More information"
            >
              <CircleHelp size={16} />
              {showTooltip && (
                <div className="absolute z-10 w-64 p-2 mt-1 text-xs text-left text-white bg-gray-800 rounded-md shadow-lg -translate-x-full translate-y-2">
                  Having a history of sharing links may limit your post's reach in the future.
                </div>
              )}
            </button>
          </p>
        </div>
      )}
      
      <div className="flex justify-between items-center mt-2">
        <div className="flex space-x-2">
          <div className="relative" ref={emojiPickerRef}>
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-blue-500 p-2 rounded-full hover:bg-blue-50 dark:hover:bg-gray-800"
            >
              <SmilePlus size={20} />
            </button>
            {showEmojiPicker && (
              <div className="absolute z-10 mt-2">
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </div>
            )}
          </div>
          
          <div className={`text-sm self-center ${isOverLimit ? 'text-red-500' : 'text-gray-500'}`}>
            {charactersLeft} characters left
          </div>
        </div>
        
        <button 
          type="submit"
          disabled={content.trim().length === 0 || isOverLimit}
          className="bg-blue-500 text-white px-4 py-2 rounded-full font-medium disabled:opacity-50"
        >
          Post
        </button>
      </div>
    </form>
  );
}
