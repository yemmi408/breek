import { useState, useRef, useEffect, useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import { Apple, Heart, MessageCircle, Pencil, Trash } from 'lucide-react';
import { Comment } from '../types';
import { useComments } from '../context/CommentContext';
import { useUsers } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';
import { CommentForm } from './CommentForm';
import { generateCommentUrl } from '../utils/urlUtils';
import { usePosts } from '../context/PostContext';

const MAX_CHARACTERS = 67;

interface CommentItemProps {
  comment: Comment;
  showFullReplies?: boolean;
  isDetailed?: boolean;
  isPreview?: boolean;
}

export function CommentItem({ comment, showFullReplies = false, isDetailed = false, isPreview = false }: CommentItemProps) {
  const { editComment, deleteComment, likeComment, unlikeComment, getCommentReplies, getComment, comments } = useComments();
  const { getUser } = useUsers();
  const { currentUser } = useAuth();
  const { getPost } = usePosts();
  const navigate = useNavigate();
  
  const [showReplies, setShowReplies] = useState(showFullReplies);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [error, setError] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  
  const author = getUser(comment.authorId);
  const isLiked = currentUser ? comment.likes.includes(currentUser.id) : false;
  const isOwnComment = currentUser?.id === comment.authorId;
  const replies = getCommentReplies(comment.id);
  
  const originalComment = comment.isRepost && comment.originalCommentId 
    ? getComment(comment.originalCommentId) 
    : null;
  const originalAuthor = originalComment ? getUser(originalComment.authorId) : null;

  // Get the post this comment belongs to
  const post = getPost(comment.postId);
  
  // Check if current user is the author of the post
  const isPostAuthor = currentUser && post ? currentUser.id === post.authorId : false;
  
  // Check if this comment already has a reply from the post author
  const hasPostAuthorReply = replies.some(reply => reply.authorId === post?.authorId);

  // Generate URL for this comment
  const commentUrlId = generateCommentUrl(comment.id);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLike = () => {
    if (!currentUser) return;
    
    try {
      if (isLiked) {
        unlikeComment(comment.id);
      } else {
        likeComment(comment.id);
      }
    } catch (err) {
      console.error('Error liking/unliking comment:', err);
    }
  };

  const handleDelete = () => {
    if (!currentUser || !isOwnComment) return;
    
    try {
      if (window.confirm('Are you sure you want to delete this?')) {
        deleteComment(comment.id);
        setShowMenu(false);
        if (isDetailed) {
          navigate(-1); // Go back if we're on comment detail page
        }
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError('Failed to delete comment. Please try again.');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setShowMenu(false);
    setError('');
  };

  const handleSaveEdit = () => {
    if (!editedContent.trim()) {
      setError('Comment cannot be empty');
      return;
    }
    
    if (isOverLimit) {
      setError(`Comment exceeds maximum length of ${MAX_CHARACTERS} characters`);
      return;
    }
    
    try {
      editComment(comment.id, editedContent);
      setIsEditing(false);
      setError('');
    } catch (err) {
      console.error('Error editing comment:', err);
      setError('Failed to edit comment. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditedContent(comment.content);
    setIsEditing(false);
    setError('');
  };

  const toggleReplies = () => {
    setShowReplies(!showReplies);
  };

  const toggleReplyForm = () => {
    setShowReplyForm(!showReplyForm);
  };

  const handleCommentClick = (e: React.MouseEvent) => {
    // Only navigate if not in detail view, not a preview, and if the click wasn't on an interactive element
    if (isDetailed || isPreview) return;
    
    const target = e.target as HTMLElement;
    const isInteractive = 
      target.tagName === 'BUTTON' || 
      target.tagName === 'A' || 
      target.closest('button') || 
      target.closest('a');
      
    if (!isInteractive) {
      // If this is a reposted comment, navigate to the original comment
      if (comment.isRepost && comment.originalCommentId) {
        const originalCommentUrlId = generateCommentUrl(comment.originalCommentId);
        navigate(`/comment/${originalCommentUrlId}`);
      } else {
        navigate(`/comment/${commentUrlId}`);
      }
    }
  };

  // Calculate characters left for edited content
  const charactersLeft = MAX_CHARACTERS - editedContent.length;
  const isOverLimit = charactersLeft < 0;

  if (!author) {
    return (
      <div className="my-3 text-gray-500">
        [Comment from deleted user]
      </div>
    );
  }

  return (
    <div className="my-3">
      {comment.isRepost && (
        <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs mb-1 ml-10">
          <span>Reposted by {currentUser?.id === comment.authorId ? 'you' : author.displayName}</span>
        </div>
      )}
      
      <div className="flex space-x-2">
        <Link to={`/profile/${comment.isRepost && originalAuthor ? originalAuthor.username : author.username}`} className="flex-shrink-0">
          <img 
            src={comment.isRepost && originalAuthor ? originalAuthor.avatar : author.avatar} 
            alt={comment.isRepost && originalAuthor ? originalAuthor.displayName : author.displayName} 
            className="w-8 h-8 rounded-full"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://mocha-cdn.com/0195fd7e-1b9e-7cbc-a8e0-71cf7ffa78e8/-.png';
            }}
          />
        </Link>
        
        <div 
          className={`flex-1 rounded-lg p-3 ${!isPreview ? 'hover:bg-gray-100 dark:hover:bg-gray-800/50 cursor-pointer' : ''} transition-colors`} 
          onClick={!isPreview ? handleCommentClick : undefined}
        >
          <div className="flex justify-between">
            <div className="flex items-center space-x-1">
              <Link to={`/profile/${comment.isRepost && originalAuthor ? originalAuthor.username : author.username}`} className="font-medium text-black dark:text-white hover:underline" onClick={(e) => e.stopPropagation()}>
                {comment.isRepost && originalAuthor ? originalAuthor.displayName : author.displayName}
              </Link>
              <span className="text-gray-500 dark:text-gray-400 text-xs">
                @{comment.isRepost && originalAuthor ? originalAuthor.username : author.username}
              </span>
            </div>
            
            <div className="flex items-center">
              <span className="text-gray-500 dark:text-gray-400 text-xs">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
              
              {isOwnComment && (
                <div className="relative ml-2" ref={menuRef}>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(!showMenu);
                    }}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 p-1"
                  >
                    <Apple size={14} />
                  </button>
                  
                  {showMenu && (
                    <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit();
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Pencil size={14} className="mr-2" />
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete();
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Trash size={14} className="mr-2" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {isEditing ? (
            <div className="mt-2" onClick={(e) => e.stopPropagation()}>
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none text-black dark:text-white resize-none"
                rows={2}
              />
              {error && (
                <div className="mt-1 text-xs text-red-500">{error}</div>
              )}
              <div className="flex justify-between items-center mt-2">
                <span className={`text-sm ${isOverLimit ? 'text-red-500' : 'text-gray-500'}`}>
                  {charactersLeft} characters left
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={handleCancelEdit}
                    className="px-3 py-1 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={!editedContent.trim() || editedContent === comment.content || isOverLimit}
                    className="px-3 py-1 text-xs text-white bg-blue-500 hover:bg-blue-600 rounded-md disabled:opacity-50"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm mt-1 text-black dark:text-white">{comment.content}</p>
          )}
          
          {error && !isEditing && (
            <div className="mt-1 text-xs text-red-500">{error}</div>
          )}
          
          {!isPreview && (
            <div className="mt-2 flex items-center space-x-4 text-xs">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleLike();
                }}
                className={`flex items-center space-x-1 ${isLiked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-500'}`}
              >
                <Heart size={14} fill={isLiked ? "currentColor" : "none"} />
                <span>{comment.likes.length > 0 ? comment.likes.length : ''}</span>
              </button>
              
              {/* Only show reply button to post author and only if they haven't replied yet */}
              {isPostAuthor && !hasPostAuthorReply && !comment.parentId && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleReplyForm();
                  }}
                  className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-500"
                >
                  <MessageCircle size={14} />
                  <span>Reply</span>
                </button>
              )}
              
              {replies.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleReplies();
                  }}
                  className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-500"
                >
                  <span>{replies.length} {replies.length === 1 ? 'reply' : 'replies'}</span>
                </button>
              )}
            </div>
          )}
          
          {/* Only show reply form to post author and if they haven't replied yet */}
          {showReplyForm && isPostAuthor && !hasPostAuthorReply && (
            <div className="mt-3" onClick={(e) => e.stopPropagation()}>
              <CommentForm postId={comment.postId} parentId={comment.id} onSubmit={() => {
                setShowReplyForm(false);
                setShowReplies(true);
              }} />
            </div>
          )}
          
          {showReplies && replies.length > 0 && (
            <div className="mt-3 pl-3 border-l border-gray-200 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
              {replies.map(reply => (
                <CommentItem key={reply.id} comment={reply} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
