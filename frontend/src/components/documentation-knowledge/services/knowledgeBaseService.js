// src/components/documentation-knowledge/services/knowledgeBaseService.js

import axiosInstance from "../../../services/axiosInstance";

const API_BASE = "/api/knowledge-base";

// Get knowledge entries list
export const getKnowledgeEntries = async (params = {}) => {
  try {
    const response = await axiosInstance.get(API_BASE, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get single knowledge entry by ID
export const getKnowledgeEntryById = async (id) => {
  try {
    const response = await axiosInstance.get(`${API_BASE}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Create knowledge entry
export const createKnowledgeEntry = async (data) => {
  try {
    const response = await axiosInstance.post(API_BASE, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update knowledge entry
export const updateKnowledgeEntry = async (id, data) => {
  try {
    const response = await axiosInstance.put(`${API_BASE}/${id}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Delete knowledge entry
export const deleteKnowledgeEntry = async (id) => {
  try {
    const response = await axiosInstance.delete(`${API_BASE}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Search knowledge base
export const searchKnowledgeBase = async (query, params = {}) => {
  try {
    const response = await axiosInstance.get(`${API_BASE}/search`, {
      params: { query, ...params },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get all categories with counts
export const getKnowledgeCategories = async () => {
  try {
    const response = await axiosInstance.get(`${API_BASE}/categories`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get knowledge entries by category
export const getKnowledgeByCategory = async (category, params = {}) => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE}/category/${category}`,
      {
        params,
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get related knowledge entries
export const getRelatedKnowledge = async (id, limit = 5) => {
  try {
    const response = await axiosInstance.get(`${API_BASE}/${id}/related`, {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Export knowledge entry
export const exportKnowledgeEntry = async (id, format = "pdf") => {
  try {
    const response = await axiosInstance.get(
      `${API_BASE}/${id}/export?format=${format}`,
      { responseType: "blob" }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
