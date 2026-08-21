// src/components/documentation-knowledge/hooks/useDocumentation.js

import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getDocumentationList,
  getDocumentationById,
  createDocumentation,
  updateDocumentation,
  deleteDocumentation,
  searchDocumentation,
  getDocumentationVersions,
  restoreDocumentationVersion,
  exportDocumentation,
} from "../services/documentationService";
import { useToast } from "../../../hooks/useToast";

export const useDocumentation = (projectId) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [documentation, setDocumentation] = useState(null);
  const [documentations, setDocumentations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 10,
    offset: 0,
    pages: 0,
  });
  const [filters, setFilters] = useState({
    doc_type: "",
    search: "",
    limit: 10,
    offset: 0,
  });
  const [versions, setVersions] = useState([]);

  // Load documentation list
  const loadDocumentations = useCallback(
    async (params = {}) => {
      if (!projectId) return;

      setLoading(true);
      setError(null);

      try {
        const response = await getDocumentationList(projectId, {
          ...filters,
          ...params,
        });

        if (response.success) {
          setDocumentations(response.data || []);
          setPagination(response.meta?.pagination || pagination);
        } else {
          setError(response.message || "Failed to load documentation");
        }
      } catch (err) {
        setError(err.message || "Failed to load documentation");
        showToast(err.message || "Failed to load documentation", "error");
      } finally {
        setLoading(false);
      }
    },
    [projectId, filters, showToast]
  );

  // Load single documentation
  const loadDocumentation = useCallback(
    async (docId) => {
      if (!docId) return;

      setLoading(true);
      setError(null);

      try {
        const response = await getDocumentationById(docId);

        if (response.success) {
          setDocumentation(response.data);
        } else {
          setError(response.message || "Failed to load documentation");
        }
      } catch (err) {
        setError(err.message || "Failed to load documentation");
        showToast(err.message || "Failed to load documentation", "error");
      } finally {
        setLoading(false);
      }
    },
    [showToast]
  );

  // Create documentation
  const create = useCallback(
    async (data) => {
      if (!projectId) return;

      setLoading(true);
      setError(null);

      try {
        const response = await createDocumentation(projectId, data);

        if (response.success) {
          showToast("Documentation created successfully", "success");
          navigate(`/projects/${projectId}/documentation/${response.data.id}`);
          return response.data;
        } else {
          setError(response.message || "Failed to create documentation");
          showToast(
            response.message || "Failed to create documentation",
            "error"
          );
          return null;
        }
      } catch (err) {
        setError(err.message || "Failed to create documentation");
        showToast(err.message || "Failed to create documentation", "error");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [projectId, navigate, showToast]
  );

  // Update documentation
  const update = useCallback(
    async (docId, data) => {
      if (!docId) return;

      setLoading(true);
      setError(null);

      try {
        const response = await updateDocumentation(docId, data);

        if (response.success) {
          setDocumentation(response.data);
          showToast("Documentation updated successfully", "success");
          return response.data;
        } else {
          setError(response.message || "Failed to update documentation");
          showToast(
            response.message || "Failed to update documentation",
            "error"
          );
          return null;
        }
      } catch (err) {
        setError(err.message || "Failed to update documentation");
        showToast(err.message || "Failed to update documentation", "error");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [showToast]
  );

  // Delete documentation
  const remove = useCallback(
    async (docId) => {
      if (!docId) return;

      setLoading(true);
      setError(null);

      try {
        const response = await deleteDocumentation(docId);

        if (response.success) {
          showToast("Documentation deleted successfully", "success");
          navigate(`/projects/${projectId}/documentation`);
          return true;
        } else {
          setError(response.message || "Failed to delete documentation");
          showToast(
            response.message || "Failed to delete documentation",
            "error"
          );
          return false;
        }
      } catch (err) {
        setError(err.message || "Failed to delete documentation");
        showToast(err.message || "Failed to delete documentation", "error");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [projectId, navigate, showToast]
  );

  // Search documentation
  const search = useCallback(
    async (query, params = {}) => {
      if (!projectId) return;

      setLoading(true);
      setError(null);

      try {
        const response = await searchDocumentation(projectId, query, {
          ...filters,
          ...params,
        });

        if (response.success) {
          setDocumentations(response.data || []);
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
    [projectId, filters, showToast]
  );

  // Load versions
  const loadVersions = useCallback(
    async (docId) => {
      if (!docId) return;

      setLoading(true);

      try {
        const response = await getDocumentationVersions(docId);

        if (response.success) {
          setVersions(response.data || []);
          return response.data;
        }
        return [];
      } catch (err) {
        showToast(err.message || "Failed to load versions", "error");
        return [];
      } finally {
        setLoading(false);
      }
    },
    [showToast]
  );

  // Restore version
  const restoreVersion = useCallback(
    async (docId, version) => {
      if (!docId) return;

      setLoading(true);

      try {
        const response = await restoreDocumentationVersion(docId, version);

        if (response.success) {
          setDocumentation(response.data);
          showToast(`Version ${version} restored successfully`, "success");
          return response.data;
        } else {
          showToast(response.message || "Failed to restore version", "error");
          return null;
        }
      } catch (err) {
        showToast(err.message || "Failed to restore version", "error");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [showToast]
  );

  // Export documentation
  const exportDoc = useCallback(
    async (docId, format = "pdf") => {
      if (!docId) return;

      setLoading(true);

      try {
        const blob = await exportDocumentation(docId, format);

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `documentation.${format}`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        showToast("Documentation exported successfully", "success");
        return true;
      } catch (err) {
        showToast(err.message || "Failed to export documentation", "error");
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
      doc_type: "",
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
      loadDocumentation(id);
    } else if (projectId) {
      loadDocumentations();
    }
  }, [id, projectId, loadDocumentation, loadDocumentations]);

  return {
    // State
    documentation,
    documentations,
    loading,
    error,
    pagination,
    filters,
    versions,

    // Actions
    loadDocumentations,
    loadDocumentation,
    create,
    update,
    remove,
    search,
    loadVersions,
    restoreVersion,
    exportDoc,

    // Filter actions
    updateFilters,
    resetFilters,
    goToPage,
    changeLimit,

    // Utils
    setDocumentation,
  };
};
