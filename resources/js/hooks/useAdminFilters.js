import { useState, useCallback, useEffect } from 'react';

const useAdminFilters = (initialFilters = {}) => {
  const [filters, setFilters] = useState(initialFilters);
  const [debouncedFilters, setDebouncedFilters] = useState(initialFilters);
  const [isFiltering, setIsFiltering] = useState(false);

  // Debounce filters to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 300);

    return () => clearTimeout(timer);
  }, [filters]);

  // Update a specific filter
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Update multiple filters at once
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  }, []);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  // Clear a specific filter
  const clearFilter = useCallback((key) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  // Get filters for API calls (remove empty values)
  const getApiFilters = useCallback(() => {
    const apiFilters = {};
    Object.entries(debouncedFilters).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        apiFilters[key] = value;
      }
    });
    return apiFilters;
  }, [debouncedFilters]);

  // Get filters for frontend filtering
  const getFrontendFilters = useCallback(() => {
    return filters;
  }, [filters]);

  // Check if any filter is active
  const hasActiveFilters = useCallback(() => {
    return Object.values(filters).some(value => 
      value !== '' && value !== null && value !== undefined
    );
  }, [filters]);

  // Get filter count
  const getFilterCount = useCallback(() => {
    return Object.values(filters).filter(value => 
      value !== '' && value !== null && value !== undefined
    ).length;
  }, [filters]);

  return {
    filters,
    debouncedFilters,
    isFiltering,
    updateFilter,
    updateFilters,
    resetFilters,
    clearFilter,
    getApiFilters,
    getFrontendFilters,
    hasActiveFilters,
    getFilterCount,
    setIsFiltering
  };
};

export default useAdminFilters; 