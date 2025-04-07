import { useState, useEffect, memo, useCallback } from 'react';
import { UserCheck, UserMinus, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUsers } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';
import { User } from '../types';

interface FollowListProps {
  userId: string;
  type: 'followers' | 'following';
}

const USERS_PER_PAGE = 15;

const FollowListComponent = ({ userId, type }: FollowListProps) => {
  const { getFollowers, getFollowing, getUserByUsername, followUser, unfollowUser, isFollowing } = useUsers();
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [displayedUsers, setDisplayedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // Get the list of users based on type (followers or following)
  useEffect(() => {
    setLoading(true);
    try {
      const userList = type === 'followers' 
        ? getFollowers(userId)  // Get all followers
        : getFollowing(userId); // Get all following
      
      setUsers(userList);
      // Initialize with first page
      setDisplayedUsers(userList.slice(0, USERS_PER_PAGE));
      setPage(1);
    } catch (error) {
      console.error(`Error loading ${type}:`, error);
    } finally {
      setLoading(false);
    }
  }, [userId, type, getFollowers, getFollowing]);

  // Handle following/unfollowing a user
  const handleFollowToggle = useCallback((targetUserId: string) => {
    if (!currentUser) return;
    
    if (isFollowing(targetUserId)) {
      unfollowUser(targetUserId);
    } else {
      followUser(targetUserId);
    }
  }, [currentUser, isFollowing, unfollowUser, followUser]);

  // Load more users
  const loadMore = useCallback(() => {
    const nextPage = page + 1;
    const newDisplayedUsers = users.slice(0, nextPage * USERS_PER_PAGE);
    setDisplayedUsers(newDisplayedUsers);
    setPage(nextPage);
  }, [page, users]);

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-pulse flex flex-col space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-12 w-12"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
        {type === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
      </div>
    );
  }

  const hasMore = displayedUsers.length < users.length;

  return (
    <div>
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {displayedUsers.map(user => {
          const isCurrentUser = currentUser?.id === user.id;
          const isFollowingUser = currentUser ? isFollowing(user.id) : false;
          
          return (
            <li key={user.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <div className="flex items-center justify-between">
                <Link 
                  to={`/profile/${user.username}`}
                  className="flex items-center flex-1 min-w-0"
                >
                  <img 
                    src={user.avatar} 
                    alt={user.displayName} 
                    className="w-12 h-12 rounded-full mr-3"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://mocha-cdn.com/0195fd7e-1b9e-7cbc-a8e0-71cf7ffa78e8/-.png';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-black dark:text-white truncate">{user.displayName}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate">@{user.username}</div>
                  </div>
                </Link>
                
                {!isCurrentUser && currentUser && (
                  <button
                    onClick={() => handleFollowToggle(user.id)}
                    className={`ml-4 flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
                      isFollowingUser 
                        ? 'bg-gray-200 text-black dark:bg-gray-800 dark:text-white' 
                        : 'bg-black text-white dark:bg-white dark:text-black'
                    }`}
                  >
                    {isFollowingUser ? (
                      <>
                        <UserCheck size={16} />
                        <span className="hidden sm:inline">Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus size={16} />
                        <span className="hidden sm:inline">Follow</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      
      {hasMore && (
        <div className="p-4 flex justify-center">
          <button 
            onClick={loadMore} 
            className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const FollowList = memo(FollowListComponent);
