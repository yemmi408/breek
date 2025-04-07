import { memo, useState, useCallback, useMemo } from 'react';
import { useComments } from '../context/CommentContext';
import { CommentItem } from './CommentItem';
import { Pagination } from './Pagination';
import { ChevronDown } from 'lucide-react';

interface CommentListProps {
  postId: string;
  initialCount?: number;
  usePagination?: boolean;
}

const COMMENTS_PER_PAGE = 10;
const INITIAL_LOAD_COUNT = 10;

const CommentListComponent = ({ 
  postId, 
  initialCount = INITIAL_LOAD_COUNT,
  usePagination = false
}: CommentListProps) => {
  const { getPostComments } = useComments();
  const [visibleCount, setVisibleCount] = useState(initialCount);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Get comments for this specific post ID
  const allComments = useMemo(() => getPostComments(postId), [getPostComments, postId]);
  
  // Use pagination or infinite scroll based on prop
  const displayPagination = usePagination && allComments.length > COMMENTS_PER_PAGE;
  
  // Calculate total pages for pagination
  const totalPages = useMemo(() => 
    Math.ceil(allComments.length / COMMENTS_PER_PAGE),
    [allComments.length]
  );
  
  // Get comments for current page when using pagination
  const paginatedComments = useMemo(() => {
    if (!displayPagination) return allComments;
    
    const startIndex = (currentPage - 1) * COMMENTS_PER_PAGE;
    return allComments.slice(startIndex, startIndex + COMMENTS_PER_PAGE);
  }, [allComments, currentPage, displayPagination]);
  
  // Get comments for infinite scroll
  const infiniteScrollComments = useMemo(() => 
    allComments.slice(0, visibleCount),
    [allComments, visibleCount]
  );
  
  // Comments to display based on pagination mode
  const comments = displayPagination ? paginatedComments : infiniteScrollComments;
  
  // Handler for page changes in pagination
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    // Scroll to top of comments when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  
  // Handle load more button click
  const handleLoadMore = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + COMMENTS_PER_PAGE, allComments.length));
  }, [allComments.length]);
  
  // Calculate if there are more comments to load in infinite scroll
  const hasMoreComments = !displayPagination && visibleCount < allComments.length;
  
  if (allComments.length === 0) {
    return (
      <div className="text-center text-gray-500 text-sm py-2">
        No comments yet. Be the first to comment!
      </div>
    );
  }
  
  return (
    <div className="space-y-1">
      {comments.map(comment => (
        <div key={comment.id} className="border-b border-gray-200 dark:border-gray-800">
          <CommentItem comment={comment} />
        </div>
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
      ) : hasMoreComments ? (
        <div className="flex justify-center p-4">
          <button 
            onClick={handleLoadMore}
            className="flex items-center px-4 py-2 text-sm text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <ChevronDown size={16} className="mr-1" />
            Load more comments
          </button>
        </div>
      ) : null}
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const CommentList = memo(CommentListComponent);
