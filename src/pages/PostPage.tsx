import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePosts } from '../context/PostContext';
import { useAuth } from '../context/AuthContext';
import { PostItem } from '../components/PostItem';
import { CommentList } from '../components/CommentList';
import { CommentForm } from '../components/CommentForm';
import { Post } from '../types';
import { ArrowLeft } from 'lucide-react';

export function PostPage() {
  const { postId } = useParams<{ postId: string }>();
  const { getPostByUrlId } = usePosts();
  const { currentUser } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (postId) {
      const foundPost = getPostByUrlId(postId);
      if (foundPost) {
        setPost(foundPost);
      } else {
        // Post not found, navigate to home
        navigate('/');
      }
      setLoading(false);
    }
  }, [postId, getPostByUrlId, navigate]);
  
  const handleBack = () => {
    // Navigate back to the previous page
    navigate(-1);
  };
  
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4 text-center">
        <div className="animate-pulse flex flex-col space-y-4">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4 mx-auto"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
        </div>
      </div>
    );
  }
  
  if (!post) {
    return (
      <div className="max-w-2xl mx-auto p-4 text-center">
        <h1 className="text-xl font-bold mb-2">Post not found</h1>
        <p className="text-gray-600 dark:text-gray-400">
          The post you're looking for doesn't exist or has been removed.
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
        <h1 className="text-xl font-bold text-black dark:text-white">Post</h1>
      </div>
      
      <div className="border-t border-b border-gray-200 dark:border-gray-800">
        <PostItem post={post} isDetailView={true} />
      </div>
      
      {/* Comment form - allow anyone to comment, but only post author can reply */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-medium mb-4 text-black dark:text-white">Add a comment</h2>
        <CommentForm postId={post.id} />
      </div>
      
      <div>
        <div className="p-4">
          <h3 className="text-lg font-medium mb-4 text-black dark:text-white">Comments</h3>
          <CommentList postId={post.id} />
        </div>
      </div>
    </div>
  );
}
