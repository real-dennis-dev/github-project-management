// src/components/documentation-knowledge/hooks/useKnowledgeBase.js

import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getKnowledgeEntries,
  getKnowledgeEntryById,
  createKnowledgeEntry,
  updateKnowledgeEntry,
  deleteKnowledgeEntry,
  searchKnowledgeBase,
  getKnowledgeCategories,
  getKnowledgeByCategory,
  getRelatedKnowledge,
  exportKnowledgeEntry,
} from "../services/knowledgeBaseService";
import { useToast } from "../../../hooks/useToast";

export const useKnowledgeBase = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [entry, setEntry] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 10,
    offset: 0,
    pages: 0,
  });
  const [filters, setFilters] = useState({
    category: "",
    tags: "",
    search: "",
    limit: 10,
    offset: 0,
  });
  const [categories, setCategories] = useState([]);
  const [relatedEntries, setRelatedEntries] = useState([]);

  // Load knowledge entries list
  const loadEntries = useCallback(
    async (params = {}) => {
      setLoading(true);
      setError(null);

      try {
        const response = await getKnowledgeEntries({
          ...filters,
          ...params,
        });

        if (response.success) {
          setEntries(response.data || []);
          setPagination(response.meta?.pagination || pagination);
        } else {
          setError(response.message || "Failed to load knowledge entries");
        }
      } catch (err) {
        setError(err.message || "Failed to load knowledge entries");
        showToast(err.message || "Failed to load knowledge entries", "error");
      } finally {
        setLoading(false);
      }
    },
    [filters, showToast]
  );

  // Load single knowledge entry
  const loadEntry = useCallback(
    async (entryId) => {
      if (!entryId) return;

      setLoading(true);
      setError(null);

      try {
        const response = await getKnowledgeEntryById(entryId);

        if (response.success) {
          setEntry(response.data);
          // Load related entries
          loadRelatedEntries(entryId);
          return response.data;
        } else {
          setError(response.message || "Failed to load knowledge entry");
        }
      } catch (err) {
        setError(err.message || "Failed to load knowledge entry");
        showToast(err.message || "Failed to load knowledge entry", "error");
      } finally {
        setLoading(false);
      }
    },
    [showToast]
  );

  // Load related entries
  const loadRelatedEntries = useCallback(async (entryId) => {
    try {
      const response = await getRelatedKnowledge(entryId);
      if (response.success) {
        setRelatedEntries(response.data || []);
      }
    } catch (err) {
      console.error("Failed to load related entries:", err);
    }
  }, []);

  // Load categories
  const loadCategories = useCallback(async () => {
    try {
      const response = await getKnowledgeCategories();
      if (response.success) {
        setCategories(response.data || []);
        return response.data;
      }
      return [];
    } catch (err) {
      showToast(err.message || "Failed to load categories", "error");
      return [];
    }
  }, [showToast]);

  // Create knowledge entry
  const create = useCallback(
    async (data) => {
      setLoading(true);
      setError(null);

      try {
        const response = await createKnowledgeEntry(data);

        if (response.success) {
          showToast("Knowledge entry created successfully", "success");
          navigate(`/knowledge-base/${response.data.id}`);
          return response.data;
        } else {
          setError(response.message || "Failed to create knowledge entry");
          showToast(
            response.message || "Failed to create knowledge entry",
            "error"
          );
          return null;
        }
      } catch (err) {
        setError(err.message || "Failed to create knowledge entry");
        showToast(err.message || "Failed to create knowledge entry", "error");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [navigate, showToast]
  );

  // Update knowledge entry
  const update = useCallback(
    async (entryId, data) => {
      if (!entryId) return;

      setLoading(true);
      setError(null);

      try {
        const response = await updateKnowledgeEntry(entryId, data);

        if (response.success) {
          setEntry(response.data);
          showToast("Knowledge entry updated successfully", "success");
          return response.data;
        } else {
          setError(response.message || "Failed to update knowledge entry");
          showToast(
            response.message || "Failed to update knowledge entry",
            "error"
          );
          return null;
        }
      } catch (err) {
        setError(err.message || "Failed to update knowledge entry");
        showToast(err.message || "Failed to update knowledge entry", "error");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [showToast]
  );

  // Delete knowledge entry
  const remove = useCallback(
    async (entryId) => {
      if (!entryId) return;

      setLoading(true);
      setError(null);

      try {
        const response = await deleteKnowledgeEntry(entryId);

        if (response.success) {
          showToast("Knowledge entry deleted successfully", "success");
          navigate("/knowledge-base");
          return true;
        } else {
          setError(response.message || "Failed to delete knowledge entry");
          showToast(
            response.message || "Failed to delete knowledge entry",
            "error"
          );
          return false;
        }
      } catch (err) {
        setError(err.message || "Failed to delete knowledge entry");
        showToast(err.message || "Failed to delete knowledge entry", "error");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [navigate, showToast]
  );

  // Search knowledge base
  const search = useCallback(
    async (query, params = {}) => {
      setLoading(true);
      setError(null);

      try {
        const response = await searchKnowledgeBase(query, {
          ...filters,
          ...params,
        });

        if (response.success) {
          setEntries(response.data || []);
          setPagination(response.meta?.pagination || pagination);
          return response.data;
        } else {
          setError(response.message || "Search failed");
          return [];
        }
      } catch (err) {
        setError(err.message || "Search failed");
        showToast(err.message || "Search failed", "error");
        return [];
      } finally {
        setLoading(false);
      }
    },
    [filters, showToast]
  );

  // Load entries by category
  const loadByCategory = useCallback(
    async (category, params = {}) => {
      setLoading(true);
      setError(null);

      try {
        const response = await getKnowledgeByCategory(category, {
          ...filters,
          ...params,
        });

        if (response.success) {
          setEntries(response.data || []);
          setPagination(response.meta?.pagination || pagination);
          return response.data;
        } else {
          setError(response.message || "Failed to load category entries");
          return [];
        }
      } catch (err) {
        setError(err.message || "Failed to load category entries");
        showToast(err.message || "Failed to load category entries", "error");
        return [];
      } finally {
        setLoading(false);
      }
    },
    [filters, showToast]
  );

  // Export knowledge entry
  const exportEntry = useCallback(
    async (entryId, format = "pdf") => {
      if (!entryId) return;

      setLoading(true);

      try {
        const blob = await exportKnowledgeEntry(entryId, format);

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `knowledge-entry.${format}`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        showToast("Knowledge entry exported successfully", "success");
        return true;
      } catch (err) {
        showToast(err.message || "Failed to export knowledge entry", "error");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [showToast]
  );

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({
      category: "",
      tags: "",
      search: "",
      limit: 10,
      offset: 0,
    });
  }, []);

  // Pagination helpers
  const goToPage = useCallback(
    (page) => {
      const offset = (page - 1) * filters.limit;
      setFilters((prev) => ({ ...prev, offset }));
    },
    [filters.limit]
  );

  const changeLimit = useCallback((limit) => {
    setFilters((prev) => ({ ...prev, limit, offset: 0 }));
  }, []);

  // Load initial data
  useEffect(() => {
    if (id) {
      loadEntry(id);
    } else {
      loadEntries();
      loadCategories();
    }
  }, [id, loadEntry, loadEntries, loadCategories]);

  return {
    // State
    entry,
    entries,
    loading,
    error,
    pagination,
    filters,
    categories,
    relatedEntries,

    // Actions
    loadEntries,
    loadEntry,
    loadCategories,
    loadByCategory,
    create,
    update,
    remove,
    search,
    exportEntry,
    loadRelatedEntries,

    // Filter actions
    updateFilters,
    resetFilters,
    goToPage,
    changeLimit,

    // Utils
    setEntry,
  };
};
