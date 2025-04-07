import { User as UserIcon, UserMinus, UserPlus } from 'lucide-react';
import { useState, useCallback, memo } from 'react';
import { User } from '../types';
import { useAuth } from '../context/AuthContext';
import { useUsers } from '../context/UserContext';
import { usePosts } from '../context/PostContext';
import { useComments } from '../context/CommentContext';
import { PostList } from './PostList';
import { CommentList } from './CommentList';
import { FollowModal } from './FollowModal';

interface UserProfileProps {
  user: User;
}

const UserProfileComponent = ({ user }: UserProfileProps) => {
  const { currentUser } = useAuth();
  const { isFollowing, followUser, unfollowUser, getFollowers, getFollowing } = useUsers();
  const { getUserPosts, getLikedPosts, getRepostedPosts } = usePosts();
  const { getUserComments, getUserRepostedComments } = useComments();
  
  const [activeTab, setActiveTab] = useState('posts');
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [followModalType, setFollowModalType] = useState<'followers' | 'following'>('following');
  
  // Memoize these computed values to avoid recalculation on every render
  const isCurrentUser = currentUser?.id === user.id;
  const following = isFollowing(user.id);
  
  // Count followers and following
  const followerCount = getFollowers(user.id).length;
  const followingCount = user.following.length;
  
  const handleFollowToggle = useCallback(() => {
    if (following) {
      unfollowUser(user.id);
    } else {
      followUser(user.id);
    }
  }, [following, unfollowUser, followUser, user.id]);

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
        const posts = getUserPosts(user.id);
        return posts.length > 0 ? (
          <PostList posts={posts} />
        ) : (
          <div className="py-4 text-center text-gray-500">No posts yet</div>
        );
      }
      case 'comments': {
        const comments = getUserComments(user.id);
        const repostedComments = getUserRepostedComments(user.id);
        
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
        const likedPosts = getLikedPosts(user.id);
        return likedPosts.length > 0 ? (
          <PostList posts={likedPosts} />
        ) : (
          <div className="py-4 text-center text-gray-500">No liked posts yet</div>
        );
      }
      case 'reposts': {
        const reposts = getRepostedPosts(user.id);
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
        
        <div className="mt-3">
          <h1 className="text-xl font-bold text-black dark:text-white">{user.displayName}</h1>
          <p className="text-gray-500 dark:text-gray-400">@{user.username}</p>
        </div>
        
        {user.bio && (
          <p className="mt-3 text-black dark:text-white">{user.bio}</p>
        )}
        
        <div className="mt-3 flex space-x-4">
          <button 
            onClick={openFollowingModal} 
            className="flex items-center space-x-1 hover:underline"
          >
            <span className="font-bold text-black dark:text-white">{followingCount}</span>
            <span className="text-gray-500 dark:text-gray-400">Following</span>
          </button>
          
          <button 
            onClick={openFollowersModal} 
            className="flex items-center space-x-1 hover:underline"
          >
            <span className="font-bold text-black dark:text-white">{followerCount}</span>
            <span className="text-gray-500 dark:text-gray-400">Followers</span>
          </button>
        </div>
      </div>
      
      <div>
        <div className="flex border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => handleTabChange('posts')}
            className={`flex-1 py-3 font-medium text-center ${
              activeTab === 'posts' 
                ? 'text-blue-500 border-b-2 border-blue-500' 
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => handleTabChange('comments')}
            className={`flex-1 py-3 font-medium text-center ${
              activeTab === 'comments' 
                ? 'text-blue-500 border-b-2 border-blue-500' 
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Comments
          </button>
          {isCurrentUser && (
            <button
              onClick={() => handleTabChange('likes')}
              className={`flex-1 py-3 font-medium text-center ${
                activeTab === 'likes' 
                  ? 'text-blue-500 border-b-2 border-blue-500' 
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Likes
            </button>
          )}
          <button
            onClick={() => handleTabChange('reposts')}
            className={`flex-1 py-3 font-medium text-center ${
              activeTab === 'reposts' 
                ? 'text-blue-500 border-b-2 border-blue-500' 
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Reposts
          </button>
        </div>
        
        {renderTabContent()}
      </div>

      {/* Follow Modal for showing followers/following */}
      <FollowModal
        isOpen={showFollowModal}
        onClose={() => setShowFollowModal(false)}
        type={followModalType}
        userId={user.id}
        username={user.username}
      />
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const UserProfile = memo(UserProfileComponent);
