import { UserMinus, UserPlus } from 'lucide-react';
import { useState, useCallback, memo } from 'react';
import { User } from '../types';
import { useAuth } from '../context/AuthContext';
import { useUsers } from '../context/UserContext';
import { usePosts } from '../context/PostContext';
import { useComments } from '../context/CommentContext';
import { PostList } from './PostList';
import { CommentList } from './CommentList';
import { FollowModal } from './FollowModal';
import { Link } from 'react-router-dom';

interface UserProfileProps {
  userId: string;
}

const UserProfileComponent = ({ userId }: UserProfileProps) => {
  const { getUser, getFollowers } = useUsers();
  const { currentUser } = useAuth();
  const { getUserPosts, getLikedPosts, getRepostedPosts } = usePosts();
  const { getUserComments, getUserRepostedComments } = useComments();
  
  const [activeTab, setActiveTab] = useState('posts');
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [followModalType, setFollowModalType] = useState<'followers' | 'following'>('following');
  
  const user = getUser(userId);
  if (!user) return null;
  
  const followers = getFollowers(userId);
  
  // Memoize these computed values to avoid recalculation on every render
  const isCurrentUser = currentUser?.id === user.id;
  const following = user.following.includes(currentUser?.id || '');
  
  // Count followers and following
  const followerCount = followers.length;
  const followingCount = user.following.length;
  
  const handleFollowToggle = useCallback(() => {
    if (!currentUser) return;
    if (following) {
      // Implement unfollow logic
    } else {
      // Implement follow logic
    }
  }, [following, currentUser]);

  const openFollowersModal = useCallback(() => {
    setFollowModalType('followers');
    setShowFollowModal(true);
  }, []);

  const openFollowingModal = useCallback(() => {
    setFollowModalType('following');
    setShowFollowModal(true);
  }, []);
  
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);
  
  const renderTabContent = () => {
    // Get data only for the active tab to improve performance
    switch (activeTab) {
      case 'posts': {
        const posts = getUserPosts(userId);
        return posts.length > 0 ? (
          <PostList posts={posts} />
        ) : (
          <div className="py-4 text-center text-gray-500">No posts yet</div>
        );
      }
      case 'comments': {
        const comments = getUserComments(userId);
        const repostedComments = getUserRepostedComments(userId);
        
        const allComments = [...comments, ...repostedComments]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        return allComments.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {allComments.map(comment => (
              <div key={comment.id} className="py-4">
                <CommentList postId={comment.postId} initialCount={1} />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-4 text-center text-gray-500">No comments yet</div>
        );
      }
      case 'likes': {
        const likedPosts = getLikedPosts(userId);
        return likedPosts.length > 0 ? (
          <PostList posts={likedPosts} />
        ) : (
          <div className="py-4 text-center text-gray-500">No liked posts yet</div>
        );
      }
      case 'reposts': {
        const reposts = getRepostedPosts(userId);
        return reposts.length > 0 ? (
          <PostList posts={reposts} />
        ) : (
          <div className="py-4 text-center text-gray-500">No reposts yet</div>
        );
      }
      default:
        return null;
    }
  };
  
  return (
    <div>
      <div className="border-b border-gray-200 dark:border-gray-800 p-4">
        <div className="flex justify-between items-start">
          <img 
            src={user.avatar} 
            alt={user.displayName} 
            className="w-24 h-24 rounded-full"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://mocha-cdn.com/0195fd7e-1b9e-7cbc-a8e0-71cf7ffa78e8/-.png';
            }}
            loading="lazy"
          />
          
          {!isCurrentUser && currentUser && (
            <button
              onClick={handleFollowToggle}
              className={`flex items-center space-x-1 px-4 py-2 rounded-full font-medium ${
                following 
                  ? 'bg-gray-200 text-black dark:bg-gray-800 dark:text-white' 
                  : 'bg-black text-white dark:bg-white dark:text-black'
              }`}
            >
              {following ? (
                <>
                  <UserMinus size={16} />
                  <span>Unfollow</span>
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  <span>Follow</span>
                </>
              )}
            </button>
          )}
        </div>
        
        <div className="mt-4">
          <h1 className="text-2xl font-bold">{user.displayName}</h1>
          <p className="text-gray-500">@{user.username}</p>
        </div>
        
        <div className="mt-4 flex space-x-4">
          <button
            onClick={openFollowersModal}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <span className="font-semibold">{followerCount}</span> Followers
          </button>
          <button
            onClick={openFollowingModal}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <span className="font-semibold">{followingCount}</span> Following
          </button>
        </div>
      </div>
      
      <div className="border-b border-gray-200 dark:border-gray-800">
        <div className="flex space-x-4">
          <button
            onClick={() => handleTabChange('posts')}
            className={`px-4 py-2 ${activeTab === 'posts' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
          >
            Posts
          </button>
          <button
            onClick={() => handleTabChange('comments')}
            className={`px-4 py-2 ${activeTab === 'comments' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
          >
            Comments
          </button>
          <button
            onClick={() => handleTabChange('likes')}
            className={`px-4 py-2 ${activeTab === 'likes' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
          >
            Likes
          </button>
          <button
            onClick={() => handleTabChange('reposts')}
            className={`px-4 py-2 ${activeTab === 'reposts' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
          >
            Reposts
          </button>
        </div>
      </div>
      
      <div className="p-4">
        {renderTabContent()}
      </div>
      
      {showFollowModal && (
        <FollowModal
          isOpen={showFollowModal}
          onClose={() => setShowFollowModal(false)}
          type={followModalType}
          userId={userId}
          username={user.username}
        />
      )}
    </div>
  );
};

export const UserProfile = memo(UserProfileComponent);
