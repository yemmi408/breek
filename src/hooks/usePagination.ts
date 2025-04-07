import { useState, useCallback, useMemo } from 'react';

interface PaginationConfig {
  initialPage?: number;
  initialPageSize?: number;
}

/**
 * A custom hook for managing pagination state and logic
 */
export function usePagination<T>({ 
  initialPage = 1, 
  initialPageSize = 10 
}: PaginationConfig = {}) {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  /**
   * Get paginated data from an array
   */
  const getPaginatedData = useCallback((data: T[]): T[] => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return data.slice(startIndex, endIndex);
  }, [page, pageSize]);

  /**
   * Calculate pagination metadata
   */
  const getPaginationMetadata = useCallback((totalItems: number) => {
    const totalPages = Math.ceil(totalItems / pageSize);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    return {
      currentPage: page,
      pageSize,
      totalItems,
      totalPages,
      hasNextPage,
      hasPrevPage
    };
  }, [page, pageSize]);

  /**
   * Go to next page if available
   */
  const nextPage = useCallback((totalItems: number) => {
    const { hasNextPage } = getPaginationMetadata(totalItems);
    if (hasNextPage) {
      setPage(p => p + 1);
    }
  }, [getPaginationMetadata]);

  /**
   * Go to previous page if available
   */
  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage(p => p - 1);
    }
  }, [page]);

  /**
   * Go to a specific page
   */
  const goToPage = useCallback((newPage: number, totalItems: number) => {
    const totalPages = Math.ceil(totalItems / pageSize);
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  }, [pageSize]);

  /**
   * Change page size and adjust current page if necessary
   */
  const changePageSize = useCallback((newPageSize: number, totalItems: number) => {
    const currentFirstItemIndex = (page - 1) * pageSize;
    const newPage = Math.floor(currentFirstItemIndex / newPageSize) + 1;
    
    setPageSize(newPageSize);
    setPage(newPage);
  }, [page, pageSize]);

  return {
    page,
    pageSize,
    setPage,
    setPageSize,
    getPaginatedData,
    getPaginationMetadata,
    nextPage,
    prevPage,
    goToPage,
    changePageSize
  };
}
