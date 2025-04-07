import { Apple, ChefHat, Heart, MessageCircle, Pencil, Quote, Repeat, Trash } from 'lucide-react';
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
  showFullComments?: boolean;
  isDetailView?: boolean;
  isPreview?: boolean;
}

export function PostItem({ post, showFullComments = false, isDetailView = false, isPreview = false }: PostItemProps) {
  const { likePost, unlikePost, repostPost, unrepostPost, unquotePost, getPost, editPost, posts, hasReposted, isUserOwnRepost, hasQuoted, isUserOwnQuote, getUserQuoteOfPost } = usePosts();
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
  
  const handleShowRepostMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Don't show repost menu for comment reposts
    if (isCommentRepost) {
      setError("Reposting comments is no longer supported");
      return;
    }
    
    // Toggle the menu - if it's already open, close it
    if (showRepostMenu) {
      setShowRepostMenu(false);
      return;
    }
    
    // Get position from the repost button
    if (repostButtonRef.current) {
      const rect = repostButtonRef.current.getBoundingClientRect();
      setRepostMenuPosition({
        top: rect.top,
        left: rect.left
      });
    }
    
    setShowRepostMenu(true);
  };

  const handleQuote = (e?: React.MouseEvent) => {
    // Fix: Add a null check for the event parameter
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation(); // Only call stopPropagation if e exists and has the method
    }
    
    if (isCommentRepost) {
      setError("Quoting comments is no longer supported");
      return;
    }
    
    setShowQuoteModal(true);
  };

  const handleUnquote = () => {
    if (!currentUser) return;
    
    try {
      // If this is a quote post and it's the user's own, unquote it directly
      if (post.isQuote && post.authorId === currentUser.id) {
        unquotePost(post.id);
      } 
      // Otherwise, try to find and remove the user's quote of this post
      else if (userQuote) {
        unquotePost(userQuote.id);
      }
      // Otherwise, try to unquote the original post
      else if (post.originalPostId) {
        unquotePost(post.originalPostId);
      }
      // Fallback to unquoting this post directly
      else {
        unquotePost(post.id);
      }
    } catch (err) {
      console.error('Error unquoting post:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to unquote. Please try again.');
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
          navigate('/');
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
      setError(`Post is too long. Maximum ${MAX_CHARACTERS} characters.`);
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
    // If quote modal is showing, prevent navigation
    if (showQuoteModal) {
      e.stopPropagation();
      return;
    }
    
    // Don't navigate if we're already on the detail view or if it's a preview
    if (isDetailView || isPreview) return;
    
    // Only navigate if the click wasn't on an interactive element
    const target = e.target as HTMLElement;
    const isInteractive = 
      target.tagName === 'BUTTON' || 
      target.tagName === 'A' || 
      target.closest('button') || 
      target.closest('a');
      
    if (!isInteractive) {
      // Navigate to this post's page directly, regardless of whether it's a repost or quote
      navigate(`/post/${postUrlId}`);
    }
  };

  // Handle click on quoted content
  const handleQuotedContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isPreview) return;
    
    if (post.isQuote && post.originalPostId) {
      const originalPostUrlId = generatePostUrl(post.originalPostId);
      navigate(`/post/${originalPostUrlId}`);
    } else if (post.isQuote && post.originalCommentId) {
      const commentUrlId = generateCommentUrl(post.originalCommentId);
      navigate(`/comment/${commentUrlId}`);
    }
  };
  
  if (!author) {
    return (
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 text-gray-500">
        [Post from deleted user]
      </div>
    );
  }
  
  return (
    <div 
      className={`p-4 ${!isDetailView ? 'border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition' : ''} ${isDetailView ? '' : 'cursor-pointer'}`} 
      onClick={handlePostClick}
    >
      {/* Repost indicator */}
      {post.isRepost && !isCommentRepost && !post.isQuote && (
        <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs mb-2 ml-12">
          <Repeat size={14} className="mr-1" />
          <span>
            Reposted by {currentUser?.id === post.authorId ? 'you' : author.displayName}
          </span>
        </div>
      )}

      {/* Comment repost indicator */}
      {isCommentRepost && !post.isQuote && (
        <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs mb-2 ml-12">
          <Repeat size={14} className="mr-1" />
          <span>
            Reposted {post.isReplyRepost ? 'reply' : 'comment'} by {currentUser?.id === post.authorId ? 'you' : author.displayName}
          </span>
        </div>
      )}
      
      {/* Quote indicator */}
      {post.isQuote && (
        <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs mb-2 ml-12">
          <ChefHat size={14} className="mr-1" />
          <span>
            Quoted by {currentUser?.id === post.authorId ? 'you' : author.displayName}
          </span>
        </div>
      )}
      
      <div className="flex space-x-3">
        {/* Avatar - link to appropriate profile based on type of post */}
        <Link 
          to={`/profile/${
            (post.isQuote || isCommentRepost) && originalCommentAuthor 
              ? originalCommentAuthor.username 
              : post.isRepost && originalAuthor 
                ? originalAuthor.username 
                : author.username
          }`} 
          className="flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <img 
            src={
              (post.isQuote || isCommentRepost) && originalCommentAuthor 
                ? originalCommentAuthor.avatar 
                : post.isRepost && originalAuthor 
                  ? originalAuthor.avatar 
                  : author.avatar
            } 
            alt={
              (post.isQuote || isCommentRepost) && originalCommentAuthor 
                ? originalCommentAuthor.displayName 
                : post.isRepost && originalAuthor 
                  ? originalAuthor.displayName 
                  : author.displayName
            } 
            className="w-10 h-10 rounded-full"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://mocha-cdn.com/0195fd7e-1b9e-7cbc-a8e0-71cf7ffa78e8/-.png';
            }}
          />
        </Link>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-1">
              {/* Display name and username - link to appropriate profile */}
              <Link 
                to={`/profile/${
                  (post.isQuote || isCommentRepost) && originalCommentAuthor 
                    ? originalCommentAuthor.username 
                    : post.isRepost && originalAuthor 
                      ? originalAuthor.username 
                      : author.username
                }`} 
                className="font-bold text-black dark:text-white hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {(post.isQuote || isCommentRepost) && originalCommentAuthor 
                  ? originalCommentAuthor.displayName 
                  : post.isRepost && originalAuthor 
                    ? originalAuthor.displayName 
                    : author.displayName}
              </Link>
              <span className="text-gray-500 dark:text-gray-400">
                @{(post.isQuote || isCommentRepost) && originalCommentAuthor 
                  ? originalCommentAuthor.username 
                  : post.isRepost && originalAuthor 
                    ? originalAuthor.username 
                    : author.username}
              </span>
              <span className="text-gray-500 dark:text-gray-400">·</span>
              <span className="text-gray-500 dark:text-gray-400 text-xs">
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
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 p-1"
                >
                  <Apple size={16} />
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
                      <Pencil size={16} className="mr-2" />
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete();
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Trash size={16} className="mr-2" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
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
                <span className={`text-sm ${
                  editedContent.length > MAX_CHARACTERS ? 'text-red-500' : 'text-gray-500'
                }`}>
                  {MAX_CHARACTERS - editedContent.length} characters left
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
                    disabled={!editedContent.trim() || editedContent === post.content || editedContent.length > MAX_CHARACTERS}
                    className="px-3 py-1 text-xs text-white bg-blue-500 hover:bg-blue-600 rounded-md disabled:opacity-50"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* If this is a quote post, show the quote content */}
              {post.isQuote && post.quoteContent && (
                <p className="mt-1 text-black dark:text-white">{post.quoteContent}</p>
              )}
              
              {/* For regular posts or reposts without quote */}
              {!post.isQuote && (
                <p className="mt-1 text-black dark:text-white">{post.content}</p>
              )}
              
              {/* For quote posts, show the quoted content in a box */}
              {post.isQuote && (quotedPost || quotedComment) && (
                <div 
                  className="mt-2 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                  onClick={handleQuotedContentClick}
                >
                  {quotedPost && (
                    <div className="p-3">
                      <div className="flex items-center space-x-1 mb-1">
                        <Link 
                          to={`/profile/${quotedPost.authorId && getUser(quotedPost.authorId)?.username}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-medium text-black dark:text-white hover:underline"
                        >
                          {getUser(quotedPost.authorId)?.displayName}
                        </Link>
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          @{getUser(quotedPost.authorId)?.username}
                        </span>
                      </div>
                      <p className="text-black dark:text-white text-sm">{quotedPost.content}</p>
                    </div>
                  )}
                  
                  {quotedComment && (
                    <div className="p-3">
                      <div className="flex items-center space-x-1 mb-1">
                        <Link 
                          to={`/profile/${quotedComment.authorId && getUser(quotedComment.authorId)?.username}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-medium text-black dark:text-white hover:underline"
                        >
                          {getUser(quotedComment.authorId)?.displayName}
                        </Link>
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          @{getUser(quotedComment.authorId)?.username}
                        </span>
                      </div>
                      <p className="text-black dark:text-white text-sm">{quotedComment.content}</p>
                    </div>
                  )}
                </div>
              )}
              
              {error && (
                <div className="mt-1 text-xs text-red-500">{error}</div>
              )}
            </>
          )}
          
          <div className="mt-2 flex items-center space-x-6">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleLike();
              }}
              className={`flex items-center space-x-1 ${isLiked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-500'}`}
            >
              <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
              <span className="text-sm">{post.likes.length}</span>
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleCommentForm();
              }}
              className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-500"
            >
              <MessageCircle size={18} />
              <span className="text-sm">{comments.length}</span>
            </button>
            
            {/* Only show repost button for posts, not for comment reposts */}
            {!isCommentRepost && (
              <button
                ref={repostButtonRef}
                onClick={(e) => {
                  e.stopPropagation();
                  handleShowRepostMenu(e);
                }}
                className={`flex items-center space-x-1 ${
                  userHasReposted || userHasQuoted
                    ? 'text-green-500' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-500'
                }`}
              >
                <Repeat size={18} />
                <span className="text-sm">{repostCount}</span>
              </button>
            )}
          </div>
          
          {showCommentForm && !isDetailView && (
            <div className="mt-4 pl-4 border-l border-gray-200 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
              <CommentForm postId={post.id} onSubmit={() => setShowCommentForm(false)} />
            </div>
          )}
        </div>
      </div>
      
      {/* Repost menu - only for posts, not for comment reposts */}
      {!isCommentRepost && (
        <RepostMenu
          isOpen={showRepostMenu}
          onClose={() => setShowRepostMenu(false)}
          onRepost={handleRepost}
          onQuote={handleQuote}
          onUnquote={handleUnquote}
          hasReposted={userHasReposted}
          hasQuoted={userHasQuoted}
          isQuotePost={isQuotePost}
          isUserOwnQuote={isUserOwnQuote(post.id)}
          position={repostMenuPosition}
        />
      )}
      
      {/* Quote modal - only for posts, not for comment reposts or quote posts */}
      {!isCommentRepost && !isQuotePost && (
        <QuoteModal
          isOpen={showQuoteModal}
          onClose={() => setShowQuoteModal(false)}
          contentType="post"
          contentId={post.isRepost && post.originalPostId ? post.originalPostId : post.id}
          stopPropagation={true} // Prevent propagation to avoid navigation
        />
      )}
    </div>
  );
}
