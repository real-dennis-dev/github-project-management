// src/components/documentation-knowledge/services/documentationService.js

import axiosInstance from "../../../services/axiosInstance";

const API_BASE = "/api/projects";

// Get documentation list for a project
export const getDocumentationList = async (projectId, params = {}) => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE}/${projectId}/documentation`,
      { params }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get single documentation by ID
export const getDocumentationById = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/documentation/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Create documentation
export const createDocumentation = async (projectId, data) => {
  try {
    const response = await axiosInstance.post(
      `${API_BASE}/${projectId}/documentation`,
      data
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update documentation
export const updateDocumentation = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/api/documentation/${id}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Delete documentation
export const deleteDocumentation = async (id) => {
  try {
    const response = await axiosInstance.delete(`/api/documentation/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Search documentation
export const searchDocumentation = async (projectId, query, params = {}) => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE}/${projectId}/documentation/search`,
      { params: { query, ...params } }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get documentation versions
export const getDocumentationVersions = async (id) => {
  try {
    const response = await axiosInstance.get(
      `/api/documentation/${id}/versions`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Restore documentation version
export const restoreDocumentationVersion = async (id, version) => {
  try {
    const response = await axiosInstance.post(
      `/api/documentation/${id}/restore`,
      { version }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Export documentation
export const exportDocumentation = async (id, format = "pdf") => {
  try {
    const response = await axiosInstance.get(
      `/api/documentation/${id}/export?format=${format}`,
      { responseType: "blob" }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
