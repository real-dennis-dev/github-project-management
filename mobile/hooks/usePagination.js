import { useState, useCallback, useEffect } from "react";

/**
 * Custom hook for pagination
 * @param {Function} fetchFunction - Function to fetch data
 * @param {number} initialPage - Initial page number
 * @param {number} initialLimit - Items per page
 * @param {Array} dependencies - Dependencies for refetch
 * @returns {Object} { data, loading, error, page, setPage, refresh, loadMore, totalPages, hasMore }
 */
const usePagination = (
  fetchFunction,
  initialPage = 1,
  initialLimit = 10,
  dependencies = []
) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(
    async (pageNum, isRefresh = false) => {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const response = await fetchFunction({
          page: pageNum,
          limit: initialLimit,
        });

        const { data: newData, pagination } = response;

        if (isRefresh || pageNum === 1) {
          setData(newData);
        } else {
          setData((prev) => [...prev, ...newData]);
        }

        setTotalPages(pagination.totalPages || 1);
        setHasMore(pagination.page < pagination.totalPages);

        return newData;
      } catch (err) {
        setError(err.message || "Failed to fetch data");
        throw err;
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [fetchFunction, initialLimit]
  );

  // Load more data
  const loadMore = useCallback(() => {
    if (!loading && !isRefreshing && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchData(nextPage);
    }
  }, [loading, isRefreshing, hasMore, page, fetchData]);

  // Refresh data
  const refresh = useCallback(() => {
    setPage(1);
    return fetchData(1, true);
  }, [fetchData]);

  // Reset pagination
  const reset = useCallback(() => {
    setPage(initialPage);
    setData([]);
    setHasMore(true);
  }, [initialPage]);

  // Initial fetch
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return {
    data,
    loading,
    error,
    page,
    setPage,
    refresh,
    loadMore,
    reset,
    totalPages,
    hasMore,
    isRefreshing,
    fetchData,
  };
};

export default usePagination;
