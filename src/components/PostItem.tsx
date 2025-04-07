import { Heart, MessageCircle, Pencil, Quote, Repeat, Trash } from 'lucide-react';
import { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Post } from '../types';
import { usePosts } from '../context/PostContext';
import { useUsers } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';
import { useComments } from '../context/CommentContext';
import { CommentForm } from './CommentForm';
import { generatePostUrl, generateCommentUrl } from '../utils/urlUtils';
import { RepostMenu } from './RepostMenu';
import { QuoteModal } from './QuoteModal';

const MAX_CHARACTERS = 67;

interface PostItemProps {
  post: Post;
  isDetailView?: boolean;
  isPreview?: boolean;
}

export function PostItem({ post, isDetailView = false, isPreview = false }: PostItemProps) {
  const { likePost, unlikePost, repostPost, unrepostPost, unquotePost, getPost, editPost, posts, hasReposted, isUserOwnRepost, hasQuoted, isUserOwnQuote, getUserQuoteOfPost, deletePost } = usePosts();
  const { getUser } = useUsers();
  const { currentUser } = useAuth();
  const { getPostComments, getComment } = useComments();
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [error, setError] = useState('');
  const [showRepostMenu, setShowRepostMenu] = useState(false);
  const [repostMenuPosition, setRepostMenuPosition] = useState({ top: 0, left: 0 });
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const repostButtonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  
  const author = getUser(post.authorId);
  const isLiked = currentUser ? post.likes.includes(currentUser.id) : false;
  const isOwnPost = currentUser?.id === post.authorId;
  
  // Comments are now specific to the post ID, whether it's original or quoted
  const comments = getPostComments(post.id);
  
  // Check if this post is a repost of another post
  const originalPost = post.isRepost && post.originalPostId ? getPost(post.originalPostId) : null;
  const originalAuthor = originalPost ? getUser(originalPost.authorId) : null;

  // Check if this post is a reposted comment
  const isCommentRepost = post.isCommentRepost === true;
  const originalComment = isCommentRepost && post.originalCommentId ? getComment(post.originalCommentId) : null;
  const originalCommentAuthor = isCommentRepost && post.originalAuthorId ? getUser(post.originalAuthorId) : null;

  // Check if this is a quote post
  const isQuotePost = post.isQuote === true;
  const quotedPost = post.isQuote && post.originalPostId ? getPost(post.originalPostId) : null;
  const quotedComment = post.isQuote && post.originalCommentId ? getComment(post.originalCommentId) : null;

  // Generate URL for this post
  const postUrlId = generatePostUrl(post.id);

  // Check if current user has already reposted this post or if it's their own repost
  const userHasReposted = currentUser ? 
    hasReposted(post.isRepost && post.originalPostId ? post.originalPostId : post.id) || 
    isUserOwnRepost(post.id) : 
    false;

  // Check if current user has already quoted this post
  const userHasQuoted = currentUser ?
    hasQuoted(post.isRepost && post.originalPostId ? post.originalPostId : post.id) ||
    isUserOwnQuote(post.id) :
    false;

  // Get user's quote of this post (if it exists)
  const userQuote = currentUser && !post.isQuote ? 
    getUserQuoteOfPost(post.isRepost && post.originalPostId ? post.originalPostId : post.id) : 
    null;

  // Calculate repost count
  const repostCount = useMemo(() => {
    if (isCommentRepost && post.originalCommentId) {
      // For comment reposts, count posts that repost this comment
      return posts.filter(p => 
        p.isRepost && 
        p.isCommentRepost && 
        p.originalCommentId === post.originalCommentId
      ).length;
    } else {
      // For regular posts or post reposts, count based on the original post ID
      const originalPostId = post.isRepost ? post.originalPostId : post.id;
      return posts.filter(p => p.isRepost && p.originalPostId === originalPostId).length;
    }
  }, [post, posts, isCommentRepost]);

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
        unlikePost(post.id);
      } else {
        likePost(post.id);
      }
    } catch (err) {
      console.error('Error liking/unliking post:', err);
      setError('Failed to like post. Please try again.');
    }
  };
  
  const handleRepost = () => {
    if (!currentUser) return;
    
    try {
      if (isCommentRepost) {
        // We don't allow reposting comment reposts anymore
        setError("Reposting comments is no longer supported");
        return;
      }
      
      if (userHasReposted) {
        // If user already reposted, this will undo the repost
        unrepostPost(post.isRepost && post.originalPostId ? post.originalPostId : post.id);
      } else {
        repostPost(post.id);
      }
    } catch (err) {
      console.error('Error reposting post:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to repost. Please try again.');
      }
    }
  };
  
  const handleQuote = () => {
    if (!currentUser) return;
    
    try {
      if (isCommentRepost) {
        // We don't allow quoting comment reposts anymore
        setError("Quoting comments is no longer supported");
        return;
      }
      
      if (userHasQuoted) {
        // If user already quoted, this will undo the quote
        unquotePost(post.isRepost && post.originalPostId ? post.originalPostId : post.id);
      } else {
        setShowQuoteModal(true);
      }
    } catch (err) {
      console.error('Error quoting post:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to quote. Please try again.');
      }
    }
  };
  
  const handleDelete = () => {
    if (!currentUser || !isOwnPost) return;
    
    try {
      if (window.confirm('Are you sure you want to delete this?')) {
        deletePost(post.id);
        setShowMenu(false);
        if (isDetailView) {
          navigate(-1); // Go back if we're on post detail page
        }
      }
    } catch (err) {
      console.error('Error deleting post:', err);
      setError('Failed to delete post. Please try again.');
    }
  };
  
  const handleEdit = () => {
    setIsEditing(true);
    setShowMenu(false);
    setError('');
  };
  
  const handleSaveEdit = () => {
    if (!editedContent.trim()) {
      setError('Post cannot be empty');
      return;
    }
    
    if (editedContent.length > MAX_CHARACTERS) {
      setError(`Post exceeds maximum length of ${MAX_CHARACTERS} characters`);
      return;
    }
    
    try {
      editPost(post.id, editedContent);
      setIsEditing(false);
      setError('');
    } catch (err) {
      console.error('Error editing post:', err);
      setError('Failed to edit post. Please try again.');
    }
  };
  
  const handleCancelEdit = () => {
    setEditedContent(post.content);
    setIsEditing(false);
    setError('');
  };
  
  const toggleCommentForm = () => {
    setShowCommentForm(!showCommentForm);
  };
  
  const handlePostClick = (e: React.MouseEvent) => {
    // Only navigate if not in detail view, not a preview, and if the click wasn't on an interactive element
    if (isDetailView || isPreview) return;
    
    const target = e.target as HTMLElement;
    const isInteractive = 
      target.tagName === 'BUTTON' || 
      target.tagName === 'A' || 
      target.closest('button') || 
      target.closest('a');
    
    if (!isInteractive) {
      navigate(`/post/${postUrlId}`);
    }
  };

  // Calculate characters left
  const charactersLeft = MAX_CHARACTERS - editedContent.length;
  const isOverLimit = charactersLeft < 0;

  return (
    <div 
      className={`p-4 border-b border-gray-200 dark:border-gray-700 ${isPreview ? 'cursor-pointer' : ''}`}
      onClick={handlePostClick}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <img
            src={author?.avatar || '/default-avatar.png'}
            alt={author?.username || 'User'}
            className="w-10 h-10 rounded-full"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Link 
                to={`/user/${author?.username}`}
                className="font-medium text-gray-900 dark:text-white hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {author?.displayName || author?.username || 'Unknown User'}
              </Link>
              <span className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </span>
            </div>
            {isOwnPost && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {isEditing ? (
            <div className="mt-2">
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full p-2 resize-none bg-transparent border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none text-black dark:text-white"
                rows={2}
              />
              {error && (
                <div className="mt-1 text-xs text-red-500">{error}</div>
              )}
              <div className="flex justify-between items-center mt-2">
                <div className={`text-sm ${isOverLimit ? 'text-red-500' : 'text-gray-500'}`}>
                  {charactersLeft} characters left
                </div>
                <div className="space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCancelEdit();
                    }}
                    className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSaveEdit();
                    }}
                    disabled={isOverLimit || !editedContent.trim()}
                    className="px-3 py-1 text-sm text-white bg-blue-500 rounded-full disabled:opacity-50"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-1 text-gray-900 dark:text-white">
              {post.content}
            </div>
          )}
          
          <div className="flex items-center mt-3 space-x-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleLike();
              }}
              className={`flex items-center space-x-1 text-sm ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
            >
              <Heart size={16} className={isLiked ? 'fill-current' : ''} />
              <span>{post.likes.length}</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleCommentForm();
              }}
              className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-500"
            >
              <MessageCircle size={16} />
              <span>{comments.length}</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRepost();
              }}
              className={`flex items-center space-x-1 text-sm ${userHasReposted ? 'text-green-500' : 'text-gray-500 hover:text-green-500'}`}
            >
              <Repeat size={16} className={userHasReposted ? 'fill-current' : ''} />
              <span>{repostCount}</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleQuote();
              }}
              className={`flex items-center space-x-1 text-sm ${userHasQuoted ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500'}`}
            >
              <Quote size={16} className={userHasQuoted ? 'fill-current' : ''} />
              <span>{userQuote ? 1 : 0}</span>
            </button>
          </div>
          
          {showCommentForm && (
            <div className="mt-4">
              <CommentForm
                postId={post.id}
                onSubmit={() => setShowCommentForm(false)}
              />
            </div>
          )}
          
          {showQuoteModal && (
            <QuoteModal
              post={post}
              onClose={() => setShowQuoteModal(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
