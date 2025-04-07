import { useMemo } from 'react';
import { PostForm } from '../components/PostForm';
import { PostList } from '../components/PostList';
import { usePosts } from '../context/PostContext';
import { useAuth } from '../context/AuthContext';
import { CommentItem } from '../components/CommentItem';
import { PostItem } from '../components/PostItem';

export function HomePage() {
  const { getFeedPosts, posts } = usePosts();
  const { currentUser } = useAuth();
  
  const feedPosts = getFeedPosts();
  
  // Combined feed sorted by creation date
  const combinedFeed = useMemo(() => feedPosts, [feedPosts]);
  
  return (
    <div className="max-w-2xl mx-auto">
      {currentUser && <PostForm />}
      
      {combinedFeed.length > 0 ? (
        <div>
          {combinedFeed.map(item => (
            <PostItem key={item.id} post={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-500">
          <p>Your feed is empty. Follow users to see their posts here!</p>
        </div>
      )}
    </div>
  );
}
