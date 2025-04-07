import { memo } from 'react';
import { ChevronLeft, ChevronRight, Squircle } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/**
 * A reusable pagination component with ellipsis for large page counts
 */
function PaginationComponent({
  currentPage,
  totalPages,
  onPageChange,
  className = ''
}: PaginationProps) {
  // Don't render if there's only one page
  if (totalPages <= 1) {
    return null;
  }

  // Function to render page numbers with ellipsis for large page counts
  const renderPageNumbers = () => {
    const pageNumbers = [];
    
    // Always show the first page
    pageNumbers.push(
      <button
        key={1}
        onClick={() => onPageChange(1)}
        className={`w-8 h-8 flex items-center justify-center rounded-md ${
          currentPage === 1
            ? 'bg-blue-500 text-white'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
        aria-label={`Go to page 1`}
      >
        1
      </button>
    );
    
    // Calculate range of visible pages
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);
    
    // Adjust if we're near the start
    if (currentPage <= 3) {
      endPage = Math.min(4, totalPages - 1);
    }
    
    // Adjust if we're near the end
    if (currentPage >= totalPages - 2) {
      startPage = Math.max(2, totalPages - 3);
    }
    
    // Add ellipsis if needed before the range
    if (startPage > 2) {
      pageNumbers.push(
        <span key="ellipsis-start" className="w-8 flex items-center justify-center">
          <Squircle size={18} className="text-gray-400" />
        </span>
      );
    }
    
    // Add visible page numbers
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`w-8 h-8 flex items-center justify-center rounded-md ${
            currentPage === i
              ? 'bg-blue-500 text-white'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
          aria-label={`Go to page ${i}`}
        >
          {i}
        </button>
      );
    }
    
    // Add ellipsis if needed after the range
    if (endPage < totalPages - 1) {
      pageNumbers.push(
        <span key="ellipsis-end" className="w-8 flex items-center justify-center">
          <Squircle size={18} className="text-gray-400" />
        </span>
      );
    }
    
    // Always show the last page if there's more than one page
    if (totalPages > 1) {
      pageNumbers.push(
        <button
          key={totalPages}
          onClick={() => onPageChange(totalPages)}
          className={`w-8 h-8 flex items-center justify-center rounded-md ${
            currentPage === totalPages
              ? 'bg-blue-500 text-white'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
          aria-label={`Go to page ${totalPages}`}
        >
          {totalPages}
        </button>
      );
    }
    
    return pageNumbers;
  };

  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      {/* Previous page button */}
      <button
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`p-2 rounded-md ${
          currentPage === 1
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
        aria-label="Previous page"
      >
        <ChevronLeft size={18} />
      </button>
      
      {/* Page numbers */}
      {renderPageNumbers()}
      
      {/* Next page button */}
      <button
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`p-2 rounded-md ${
          currentPage === totalPages
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
        aria-label="Next page"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export const Pagination = memo(PaginationComponent);
