// src/services/journalService.js
import axiosInstance from "./axiosInstance";

class JournalService {
  // Get all journal entries for a project
  async getEntries(projectId, params = {}) {
    const response = await axiosInstance.get(`/projects/${projectId}/journal`, {
      params,
    });
    return response.data;
  }

  // Get a single journal entry by ID
  async getEntry(id) {
    const response = await axiosInstance.get(`/journal/${id}`);
    return response.data;
  }

  // Get journal entry by date
  async getEntryByDate(projectId, date) {
    const response = await axiosInstance.get(
      `/projects/${projectId}/journal/date/${date}`
    );
    return response.data;
  }

  // Get or create today's entry
  async getTodayEntry(projectId) {
    const response = await axiosInstance.get(
      `/projects/${projectId}/journal/today`
    );
    return response.data;
  }

  // Create a new journal entry
  async createEntry(projectId, data) {
    const response = await axiosInstance.post(
      `/projects/${projectId}/journal`,
      data
    );
    return response.data;
  }

  // Update a journal entry
  async updateEntry(id, data) {
    const response = await axiosInstance.put(`/journal/${id}`, data);
    return response.data;
  }

  // Delete a journal entry
  async deleteEntry(id) {
    const response = await axiosInstance.delete(`/journal/${id}`);
    return response.data;
  }

  // Get monthly entries
  async getMonthEntries(projectId, year, month) {
    const response = await axiosInstance.get(
      `/projects/${projectId}/journal/month`,
      {
        params: { year, month },
      }
    );
    return response.data;
  }

  // Get journal statistics
  async getStats(projectId) {
    const response = await axiosInstance.get(
      `/projects/${projectId}/journal/stats`
    );
    return response.data;
  }

  // Export journal entries
  async exportEntries(projectId, params = {}) {
    const response = await axiosInstance.get(
      `/projects/${projectId}/journal/export`,
      {
        params,
        responseType: "blob",
      }
    );
    return response.data;
  }
}

export const journalService = new JournalService();
export default journalService;
