import { House, LogOut, Search, Settings, ThumbsUp, User, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePosts } from '../context/PostContext';
import { useUsers } from '../context/UserContext';
import { Post, User as UserType } from '../types';
import { generatePostUrl } from '../utils/urlUtils';

export function Header() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const { posts } = usePosts();
  const { users } = useUsers();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<{ users: UserType[], posts: Post[] }>({ users: [], posts: [] });
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const logoutMenuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    try {
      logout();
      setShowLogoutMenu(false);
      navigate('/login');
    } catch (error) {
      console.error("Logout error:", error);
      // Even if there's an error, still try to navigate to login
      navigate('/login');
    }
  };

  // Handle clicks outside of dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
      
      if (logoutMenuRef.current && !logoutMenuRef.current.contains(event.target as Node)) {
        setShowLogoutMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      
      try {
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearchFocused(true);
  };

  // Navigate to post when clicked from search results
  const handlePostClick = (post: Post) => {
    const postUrlId = generatePostUrl(post.id);
    navigate(`/post/${postUrlId}`);
    setIsSearchFocused(false);
    setSearchQuery('');
  };

  return (
    <header className="border-b border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 sticky top-0 z-10">
      <div className="max-w-4xl mx-auto flex justify-between items-center p-4">
        <Link to="/" className="text-xl font-bold text-black dark:text-white">
          Breek
        </Link>
        
        <div ref={searchRef} className="relative w-full max-w-md mx-4 hidden sm:block">
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="relative">
              <input
                type="text"
                placeholder="Search users or posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                className="w-full py-2 pl-10 pr-4 rounded-full bg-gray-100 dark:bg-gray-800 text-black dark:text-white border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            </div>
          </form>

          {isSearchFocused && searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto z-20">
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
                              setIsSearchFocused(false);
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
        
        {currentUser ? (
          <div className="flex items-center space-x-4 hidden sm:flex">
            <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white" aria-label="Home">
              <House size={20} />
            </Link>
            <Link to={`/profile/${currentUser.username}`} className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white" aria-label="Profile">
              <User size={20} />
            </Link>
            <Link to="/settings" className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white" aria-label="Settings">
              <Settings size={20} />
            </Link>
            <div className="relative" ref={logoutMenuRef}>
              <button 
                onClick={() => setShowLogoutMenu(!showLogoutMenu)}
                className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white"
                aria-label="Menu"
              >
                <ThumbsUp size={20} />
              </button>
              
              {showLogoutMenu && (
                <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex space-x-4">
            <Link to="/login" className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white">
              Login
            </Link>
            <Link to="/signup" className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
