import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useComments } from '../context/CommentContext';
import { usePosts } from '../context/PostContext';
import { useAuth } from '../context/AuthContext';
import { CommentItem } from '../components/CommentItem';
import { CommentForm } from '../components/CommentForm';
import { PostItem } from '../components/PostItem';
import { Comment } from '../types';
import { ArrowLeft } from 'lucide-react';
import { generatePostUrl } from '../utils/urlUtils';

export function CommentPage() {
  const { commentId } = useParams<{ commentId: string }>();
  const { getCommentByUrlId, getComment, getCommentReplies } = useComments();
  const { getPost } = usePosts();
  const { currentUser } = useAuth();
  const [comment, setComment] = useState<Comment | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [showParentContent, setShowParentContent] = useState(false);
  const parentContentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (commentId) {
      const foundComment = getCommentByUrlId(commentId);
      setComment(foundComment);
      setShowParentContent(!!foundComment); // Show parent content if comment exists
      setLoading(false);
    }
  }, [commentId, getCommentByUrlId]);
  
  // Scroll to parent content when it's displayed
  useEffect(() => {
    if (showParentContent && parentContentRef.current) {
      window.scrollTo({
        top: parentContentRef.current.offsetTop - 20,
        behavior: 'smooth'
      });
    }
  }, [showParentContent]);
  
  const handleBack = () => {
    // Navigate back to the previous page
    navigate(-1);
  };

  const handleNavigateToPost = (postId: string) => {
    if (postId) {
      const postUrlId = generatePostUrl(postId);
      navigate(`/post/${postUrlId}`);
    }
  };
  
  // If the comment has a parent, get the parent comment
  const parentComment = comment?.parentId ? getComment(comment.parentId) : undefined;
  
  // Get the post this comment belongs to
  const post = comment ? getPost(comment.postId) : null;
  
  // Check if current user is the author of the post
  const isPostAuthor = currentUser && post ? currentUser.id === post.authorId : false;
  
  // Check if post author has already replied to this comment
  const hasPostAuthorReply = comment ? 
    getCommentReplies(comment.id).some(reply => reply.authorId === post?.authorId) : 
    false;
  
  // Only show reply form if:
  // 1. Current user is post author
  // 2. The comment is not a reply itself (no parentId)
  // 3. Post author hasn't already replied to this comment
  const showReplyForm = isPostAuthor && comment && !comment.parentId && !hasPostAuthorReply;
  
  // Determine if this is a reply (has a parent) to show correct title
  const isReply = comment?.parentId !== undefined;
  
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4 text-center">
        <div className="animate-pulse flex flex-col space-y-4">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4 mx-auto"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
        </div>
      </div>
    );
  }
  
  if (!comment) {
    return (
      <div className="max-w-2xl mx-auto p-4 text-center">
        <h1 className="text-xl font-bold mb-2">Comment not found</h1>
        <p className="text-gray-600 dark:text-gray-400">
          The comment you're looking for doesn't exist or has been removed.
        </p>
        <button 
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-full"
        >
          Go to Home
        </button>
      </div>
    );
  }
  
  return (
    <div className="max-w-2xl mx-auto">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center">
        <button 
          onClick={handleBack} 
          className="mr-4 text-gray-500 hover:text-black dark:hover:text-white"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-black dark:text-white">{isReply ? "Reply" : "Comment"}</h1>
      </div>
      
      {/* Parent Content Section (Post or Parent Comment) */}
      {showParentContent && (
        <div ref={parentContentRef} className="pt-4 border-b border-gray-200 dark:border-gray-800">
          {/* Show the original post */}
          {post && (
            <div className="mb-4 px-4">
              <h2 className="text-sm font-medium mb-2 text-gray-500">Original Post:</h2>
              <div className="cursor-pointer transition hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg" onClick={() => handleNavigateToPost(post.id)}>
                <PostItem post={post} isDetailView={true} isPreview={true} />
              </div>
            </div>
          )}
          
          {/* If comment is a reply, show the parent comment */}
          {parentComment && (
            <div className="p-4 opacity-90">
              <h2 className="text-sm font-medium mb-2 text-gray-500">Replying to:</h2>
              <CommentItem comment={parentComment} />
            </div>
          )}
        </div>
      )}
      
      {/* Main comment */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <CommentItem comment={comment} showFullReplies={true} isDetailed={true} />
      </div>
      
      {/* Reply form - only show to post author if they haven't replied yet */}
      {showReplyForm && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-medium mb-4 text-black dark:text-white">Add a reply</h2>
          <CommentForm postId={comment.postId} parentId={comment.id} />
        </div>
      )}
    </div>
  );
}
