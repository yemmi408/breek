import { memo, useCallback, useState, useMemo } from 'react';
import { Post } from '../types';
import { PostItem } from './PostItem';
import { Pagination } from './Pagination';
import { ChevronDown } from 'lucide-react';

const POSTS_PER_PAGE = 10;
const INITIAL_LOAD_COUNT = 10;

interface PostListProps {
  posts: Post[];
  initialCount?: number;
  usePagination?: boolean;
}

const PostListComponent = ({ 
  posts, 
  initialCount = INITIAL_LOAD_COUNT,
  usePagination = false
}: PostListProps) => {
  const [visiblePosts, setVisiblePosts] = useState(initialCount);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Use pagination or infinite scroll based on prop
  const displayPagination = usePagination && posts.length > POSTS_PER_PAGE;
  
  // Calculate total pages for pagination
  const totalPages = useMemo(() => 
    Math.ceil(posts.length / POSTS_PER_PAGE),
    [posts.length]
  );
  
  // Get posts for current page when using pagination
  const paginatedPosts = useMemo(() => {
    if (!displayPagination) return posts;
    
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    return posts.slice(startIndex, startIndex + POSTS_PER_PAGE);
  }, [posts, currentPage, displayPagination]);
  
  // Get posts for infinite scroll
  const infiniteScrollPosts = useMemo(() => 
    posts.slice(0, visiblePosts),
    [posts, visiblePosts]
  );
  
  // Posts to display based on pagination mode
  const displayedPosts = displayPagination ? paginatedPosts : infiniteScrollPosts;
  
  // Handler for page changes in pagination
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  
  // Handler for load more button in infinite scroll
  const handleLoadMore = useCallback(() => {
    setVisiblePosts(prev => Math.min(prev + POSTS_PER_PAGE, posts.length));
  }, [posts.length]);
  
  // Calculate if there are more posts to load in infinite scroll
  const hasMorePosts = !displayPagination && visiblePosts < posts.length;
  
  if (posts.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        No posts to display. Follow more users or start posting!
      </div>
    );
  }
  
  return (
    <div>
      {displayedPosts.map(post => (
        <PostItem key={post.id} post={post} />
      ))}
      
      {displayPagination ? (
        <div className="py-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            className="mt-4"
          />
        </div>
      ) : hasMorePosts ? (
        <div className="flex justify-center p-4">
          <button 
            onClick={handleLoadMore}
            className="flex items-center px-4 py-2 text-sm text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <ChevronDown size={16} className="mr-1" />
            Load more posts
          </button>
        </div>
      ) : null}
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const PostList = memo(PostListComponent);
