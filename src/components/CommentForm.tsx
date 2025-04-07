import { useState, useRef, useEffect } from 'react';
import { CircleHelp } from 'lucide-react';
import { useComments } from '../context/CommentContext';
import { useAuth } from '../context/AuthContext';
import { usePosts } from '../context/PostContext';
import { detectLinks } from '../utils/linkDetector';

interface CommentFormProps {
  postId: string;
  parentId?: string;
  onSubmit?: () => void;
}

const MAX_CHARACTERS = 67;

export function CommentForm({ postId, parentId, onSubmit }: CommentFormProps) {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [containsLinks, setContainsLinks] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const { createComment, getCommentReplies } = useComments();
  const { currentUser } = useAuth();
  const { getPost } = usePosts();

  // Get the post
  const post = getPost(postId);
  
  // Check if current user is post author
  const isPostAuthor = currentUser && post ? currentUser.id === post.authorId : false;
  
  // If there's a parentId, check if post author has already replied to this comment
  const hasPostAuthorReply = parentId ? 
    getCommentReplies(parentId).some(reply => reply.authorId === post?.authorId) : 
    false;

  // If not post author or author already replied, don't show the form
  if (parentId && (!isPostAuthor || hasPostAuthorReply)) {
    return null;
  }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!content.trim()) {
      setError('Comment cannot be empty');
      return;
    }
    
    if (isOverLimit) {
      setError(`Comment exceeds maximum length of ${MAX_CHARACTERS} characters`);
      return;
    }
    
    if (!currentUser) {
      setError('You must be logged in to comment');
      return;
    }
    
    // If this is a reply and the user is not the post author, don't allow it
    if (parentId && !isPostAuthor) {
      setError('Only the post author can reply to comments');
      return;
    }
    
    try {
      setIsSubmitting(true);
      createComment(postId, content, parentId);
      setContent('');
      setError('');
      
      if (onSubmit) {
        onSubmit();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const placeholder = parentId ? "Write a reply..." : "Write a comment...";
  const buttonText = parentId ? "Reply" : "Comment";

  return (
    <form onSubmit={handleSubmit} className="mb-2">
      <textarea
        placeholder={placeholder}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full p-2 resize-none bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none text-black dark:text-white"
        rows={2}
      />
      
      {error && (
        <div className="mt-1 text-xs text-red-500">{error}</div>
      )}
      
      {containsLinks && (
        <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-center">
          <p className="text-sm text-amber-700 dark:text-amber-300 flex-grow flex items-center justify-between">
            <span>To keep your profile healthy, we recommend avoiding links in conversations.</span>
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
                  Having a history of sharing links may limit your conversation's reach in the future.
                </div>
              )}
            </button>
          </p>
        </div>
      )}
      
      <div className="flex justify-between items-center mt-2">
        <div className={`text-sm ${isOverLimit ? 'text-red-500' : 'text-gray-500'}`}>
          {charactersLeft} characters left
        </div>
        <button 
          type="submit"
          disabled={isSubmitting || content.trim().length === 0 || isOverLimit}
          className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : buttonText}
        </button>
      </div>
    </form>
  );
}
