import axiosInstance from "../../../services/axiosInstance";

/**
 * Journal Service - Handles all API calls for journal entries
 */
const journalService = {
  /**
   * Get all journal entries for a project with pagination and filters
   * @param {string} projectId - Project UUID
   * @param {Object} params - Query parameters
   * @param {string} params.fromDate - Filter from date (YYYY-MM-DD)
   * @param {string} params.toDate - Filter to date (YYYY-MM-DD)
   * @param {string} params.mood - Filter by mood emoji
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Items per page (default: 20, max: 100)
   * @param {string} params.sortBy - Sort field (entry_date, created_at, mood)
   * @param {string} params.sortOrder - Sort order (ASC, DESC)
   */
  getEntries: async (projectId, params = {}) => {
    const response = await axiosInstance.get(`/projects/${projectId}/journal`, {
      params,
    });
    return response.data;
  },

  /**
   * Get a specific journal entry by ID
   * @param {string} id - Journal entry UUID
   */
  getEntryById: async (id) => {
    const response = await axiosInstance.get(`/journal/${id}`);
    return response.data;
  },

  /**
   * Get journal entry by specific date
   * @param {string} projectId - Project UUID
   * @param {string} date - Date in YYYY-MM-DD format
   */
  getEntryByDate: async (projectId, date) => {
    const response = await axiosInstance.get(
      `/projects/${projectId}/journal/date/${date}`
    );
    return response.data;
  },

  /**
   * Get or create today's journal entry
   * @param {string} projectId - Project UUID
   */
  getTodayEntry: async (projectId) => {
    const response = await axiosInstance.get(
      `/projects/${projectId}/journal/today`
    );
    return response.data;
  },

  /**
   * Create a new journal entry
   * @param {string} projectId - Project UUID
   * @param {Object} data - Journal entry data
   */
  createEntry: async (projectId, data) => {
    const response = await axiosInstance.post(
      `/projects/${projectId}/journal`,
      data
    );
    return response.data;
  },

  /**
   * Update a journal entry
   * @param {string} id - Journal entry UUID
   * @param {Object} data - Updated journal entry data
   */
  updateEntry: async (id, data) => {
    const response = await axiosInstance.put(`/journal/${id}`, data);
    return response.data;
  },

  /**
   * Delete a journal entry
   * @param {string} id - Journal entry UUID
   */
  deleteEntry: async (id) => {
    const response = await axiosInstance.delete(`/journal/${id}`);
    return response.data;
  },

  /**
   * Get journal entries for a specific month
   * @param {string} projectId - Project UUID
   * @param {number} year - Year (e.g., 2024)
   * @param {number} month - Month (1-12)
   */
  getMonthEntries: async (projectId, year, month) => {
    const response = await axiosInstance.get(
      `/projects/${projectId}/journal/month`,
      {
        params: { year, month },
      }
    );
    return response.data;
  },

  /**
   * Get journal statistics and analytics
   * @param {string} projectId - Project UUID
   */
  getStats: async (projectId) => {
    const response = await axiosInstance.get(
      `/projects/${projectId}/journal/stats`
    );
    return response.data;
  },

  /**
   * Export journal entries
   * @param {string} projectId - Project UUID
   * @param {Object} params - Export parameters
   * @param {string} params.format - Export format (json, csv)
   * @param {string} params.fromDate - Filter from date
   * @param {string} params.toDate - Filter to date
   */
  exportEntries: async (projectId, params = {}) => {
    const response = await axiosInstance.get(
      `/projects/${projectId}/journal/export`,
      {
        params,
        responseType: params.format === "csv" ? "blob" : "json",
      }
    );
    return response.data;
  },
};

export default journalService;
