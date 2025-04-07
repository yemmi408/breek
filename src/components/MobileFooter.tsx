import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { House, Search, Settings, User, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useUsers } from '../context/UserContext';
import { usePosts } from '../context/PostContext';
import { Post, User as UserType } from '../types';
import { generatePostUrl } from '../utils/urlUtils';

export function MobileFooter() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { posts } = usePosts();
  const { users } = useUsers();
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState<{ users: UserType[], posts: Post[] }>({ users: [], posts: [] });
  const searchRef = useRef<HTMLDivElement>(null);
  
  // Handle search functionality
  useEffect(() => {
    if (searchQuery.trim()) {
      try {
        const query = searchQuery.toLowerCase();
        
        // Search users
        const filteredUsers = users.filter(user => 
          user.username.toLowerCase().includes(query) || 
          user.displayName.toLowerCase().includes(query) ||
          user.bio.toLowerCase().includes(query)
        );
        
        // Search posts
        const filteredPosts = posts.filter(post => 
          post.content.toLowerCase().includes(query)
        );
        
        setSearchResults({ users: filteredUsers, posts: filteredPosts });
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults({ users: [], posts: [] });
      }
    } else {
      setSearchResults({ users: [], posts: [] });
    }
  }, [searchQuery, users, posts]);
  
  // Handle clicks outside search area
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    }
    
    // Add/remove event listeners
    if (isSearchExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchExpanded]);
  
  // Determine active tab
  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSearchResults(true);
  };
  
  const handleSearchToggle = () => {
    setIsSearchExpanded(!isSearchExpanded);
    if (!isSearchExpanded) {
      setSearchQuery('');
      setShowSearchResults(false);
    }
  };

  // Navigate to post when clicked from search results
  const handlePostClick = (post: Post) => {
    const postUrlId = generatePostUrl(post.id);
    navigate(`/post/${postUrlId}`);
    setIsSearchExpanded(false);
    setSearchQuery('');
  };
  
  if (!currentUser) return null;
  
  return (
    <>
      {/* Expanded search overlay */}
      {isSearchExpanded && (
        <div 
          ref={searchRef}
          className="fixed inset-0 z-20 bg-white dark:bg-gray-900 pt-safe-top pb-16"
        >
          <div className="max-w-md mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-black dark:text-white">Search</h2>
              <button 
                onClick={handleSearchToggle}
                className="p-2 text-gray-500 dark:text-gray-400"
                aria-label="Close search"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSearchSubmit} className="relative mb-4">
              <input
                type="text"
                placeholder="Search users or posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSearchResults(true)}
                className="w-full py-2 pl-10 pr-4 rounded-full bg-gray-100 dark:bg-gray-800 text-black dark:text-white border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
                aria-label="Search"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-500 dark:text-gray-400" />
              </div>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  aria-label="Clear search"
                >
                  <X size={18} />
                </button>
              )}
            </form>
            
            {showSearchResults && searchQuery && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                {searchResults.users.length === 0 && searchResults.posts.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">No results found</div>
                ) : (
                  <>
                    {searchResults.users.length > 0 && (
                      <div className="p-2">
                        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-2">Users</h3>
                        <div className="space-y-2">
                          {searchResults.users.slice(0, 5).map(user => (
                            <Link
                              key={user.id}
                              to={`/profile/${user.username}`}
                              onClick={() => {
                                setIsSearchExpanded(false);
                                setSearchQuery('');
                              }}
                              className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            >
                              <img 
                                src={user.avatar} 
                                alt={user.displayName} 
                                className="w-10 h-10 rounded-full mr-3"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'https://mocha-cdn.com/0195fd7e-1b9e-7cbc-a8e0-71cf7ffa78e8/-.png';
                                }}
                              />
                              <div>
                                <div className="font-medium text-black dark:text-white">{user.displayName}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {searchResults.posts.length > 0 && (
                      <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-2">Posts</h3>
                        <div className="space-y-2">
                          {searchResults.posts.slice(0, 5).map(post => {
                            const postUser = users.find(u => u.id === post.authorId);
                            return (
                              <div 
                                key={post.id} 
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer"
                                onClick={() => handlePostClick(post)}
                              >
                                <div className="flex items-center mb-1">
                                  <img 
                                    src={postUser?.avatar || ''} 
                                    alt={postUser?.displayName || ''} 
                                    className="w-6 h-6 rounded-full mr-2"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.src = 'https://mocha-cdn.com/0195fd7e-1b9e-7cbc-a8e0-71cf7ffa78e8/-.png';
                                    }}
                                  />
                                  <span className="text-sm font-medium text-black dark:text-white">{postUser?.displayName}</span>
                                </div>
                                <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-2">{post.content}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    
      {/* Mobile footer */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-10 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pb-safe-bottom">
        <div className="flex justify-around items-center h-14">
          <Link 
            to="/" 
            className={`flex flex-col items-center justify-center w-1/4 h-full ${
              isActive('/') ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'
            }`}
            aria-label="Home"
          >
            <House size={20} />
            <span className="text-xs mt-1">Home</span>
          </Link>
          
          <button
            onClick={handleSearchToggle}
            className={`flex flex-col items-center justify-center w-1/4 h-full ${
              isSearchExpanded ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'
            }`}
            aria-label="Search"
          >
            <Search size={20} />
            <span className="text-xs mt-1">Search</span>
          </button>
          
          <Link 
            to={`/profile/${currentUser.username}`} 
            className={`flex flex-col items-center justify-center w-1/4 h-full ${
              isActive('/profile') ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'
            }`}
            aria-label="Profile"
          >
            <User size={20} />
            <span className="text-xs mt-1">Profile</span>
          </Link>
          
          <Link 
            to="/settings" 
            className={`flex flex-col items-center justify-center w-1/4 h-full ${
              isActive('/settings') ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'
            }`}
            aria-label="Settings"
          >
            <Settings size={20} />
            <span className="text-xs mt-1">Settings</span>
          </Link>
        </div>
      </div>
    </>
  );
}
