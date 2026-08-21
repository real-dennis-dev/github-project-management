// src/components/project-management/useProjects.js

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import projectService from "./ProjectService";
import {
  DEFAULT_PAGINATION,
  DEFAULT_PROJECT_FILTERS,
} from "./ProjectConstants";

/**
 * Custom hook for project management
 */
export const useProjects = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  // State
  const [projects, setProjects] = useState([]);
  const [project, setProject] = useState(null);
  const [features, setFeatures] = useState([]);
  const [bugs, setBugs] = useState([]);
  const [subtasks, setSubtasks] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);
  const [filters, setFilters] = useState(DEFAULT_PROJECT_FILTERS);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("DESC");

  // ============================================
  // PROJECT FETCH FUNCTIONS
  // ============================================

  /**
   * Fetch projects with current filters and pagination
   */
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        sortOrder,
      };

      // Remove empty filters
      Object.keys(params).forEach((key) => {
        if (
          params[key] === "" ||
          params[key] === null ||
          params[key] === undefined
        ) {
          delete params[key];
        }
      });

      const response = await projectService.getProjects(params);

      if (response.success) {
        setProjects(response.data || []);
        if (response.pagination) {
          setPagination((prev) => ({
            ...prev,
            ...response.pagination,
          }));
        }
      } else {
        throw new Error(response.message || "Failed to fetch projects");
      }
    } catch (err) {
      setError(err.message || "An error occurred while fetching projects");
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit, sortBy, sortOrder]);

  /**
   * Fetch a single project by ID
   */
  const fetchProject = useCallback(async () => {
    if (!projectId) return null;

    setLoading(true);
    setError(null);

    try {
      const response = await projectService.getProjectById(projectId);

      if (response.success) {
        setProject(response.data);
        return response.data;
      } else {
        throw new Error(response.message || "Failed to fetch project");
      }
    } catch (err) {
      setError(err.message || "An error occurred while fetching the project");
      return null;
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // ============================================
  // FEATURE FUNCTIONS
  // ============================================

  /**
   * Fetch features for a project
   */
  const fetchFeatures = useCallback(
    async (params = {}) => {
      if (!projectId) return;

      try {
        const response = await projectService.getFeatures(projectId, params);
        if (response.success) {
          setFeatures(response.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch features:", err);
      }
    },
    [projectId]
  );

  /**
   * Create a feature
   */
  const createFeature = useCallback(
    async (featureData) => {
      if (!projectId) {
        throw new Error("Project ID is required");
      }

      setLoading(true);
      setError(null);

      try {
        const response = await projectService.createFeature(
          projectId,
          featureData
        );
        if (response.success) {
          await fetchFeatures();
          return response.data;
        } else {
          throw new Error(response.message || "Failed to create feature");
        }
      } catch (err) {
        setError(err.message || "An error occurred while creating the feature");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [projectId, fetchFeatures]
  );

  /**
   * Update a feature
   */
  const updateFeature = useCallback(
    async (featureId, featureData) => {
      setLoading(true);
      setError(null);

      try {
        const response = await projectService.updateFeature(
          featureId,
          featureData
        );
        if (response.success) {
          await fetchFeatures();
          return response.data;
        } else {
          throw new Error(response.message || "Failed to update feature");
        }
      } catch (err) {
        setError(err.message || "An error occurred while updating the feature");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchFeatures]
  );

  /**
   * Delete a feature
   */
  const deleteFeature = useCallback(
    async (featureId) => {
      setLoading(true);
      setError(null);

      try {
        const response = await projectService.deleteFeature(featureId);
        if (response.success) {
          await fetchFeatures();
          return true;
        } else {
          throw new Error(response.message || "Failed to delete feature");
        }
      } catch (err) {
        setError(err.message || "An error occurred while deleting the feature");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchFeatures]
  );

  /**
   * Reorder features
   */
  const reorderFeatures = useCallback(
    async (featureOrders) => {
      if (!projectId) return;

      setLoading(true);
      setError(null);

      try {
        const response = await projectService.reorderFeatures(
          projectId,
          featureOrders
        );
        if (response.success) {
          await fetchFeatures();
          return true;
        } else {
          throw new Error(response.message || "Failed to reorder features");
        }
      } catch (err) {
        setError(err.message || "An error occurred while reordering features");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [projectId, fetchFeatures]
  );

  // ============================================
  // SUBTASK FUNCTIONS
  // ============================================

  /**
   * Fetch subtasks for a feature
   */
  const fetchSubtasks = useCallback(async (featureId) => {
    if (!featureId) return;

    try {
      const response = await projectService.getSubtasks(featureId);
      if (response.success) {
        setSubtasks(response.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch subtasks:", err);
    }
  }, []);

  /**
   * Create a subtask
   */
  const createSubtask = useCallback(
    async (featureId, subtaskData) => {
      setLoading(true);
      setError(null);

      try {
        const response = await projectService.createSubtask(
          featureId,
          subtaskData
        );
        if (response.success) {
          await fetchSubtasks(featureId);
          return response.data;
        } else {
          throw new Error(response.message || "Failed to create subtask");
        }
      } catch (err) {
        setError(err.message || "An error occurred while creating the subtask");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchSubtasks]
  );

  /**
   * Update a subtask
   */
  const updateSubtask = useCallback(
    async (subtaskId, subtaskData) => {
      setLoading(true);
      setError(null);

      try {
        const response = await projectService.updateSubtask(
          subtaskId,
          subtaskData
        );
        if (response.success) {
          // Refresh subtasks for the current feature
          const currentFeatureId = subtasks[0]?.feature_id;
          if (currentFeatureId) {
            await fetchSubtasks(currentFeatureId);
          }
          return response.data;
        } else {
          throw new Error(response.message || "Failed to update subtask");
        }
      } catch (err) {
        setError(err.message || "An error occurred while updating the subtask");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchSubtasks, subtasks]
  );

  /**
   * Delete a subtask
   */
  const deleteSubtask = useCallback(
    async (subtaskId) => {
      setLoading(true);
      setError(null);

      try {
        const response = await projectService.deleteSubtask(subtaskId);
        if (response.success) {
          const currentFeatureId = subtasks[0]?.feature_id;
          if (currentFeatureId) {
            await fetchSubtasks(currentFeatureId);
          }
          return true;
        } else {
          throw new Error(response.message || "Failed to delete subtask");
        }
      } catch (err) {
        setError(err.message || "An error occurred while deleting the subtask");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchSubtasks, subtasks]
  );

  /**
   * Reorder subtasks
   */
  const reorderSubtasks = useCallback(
    async (featureId, subtaskOrders) => {
      setLoading(true);
      setError(null);

      try {
        const response = await projectService.reorderSubtasks(
          featureId,
          subtaskOrders
        );
        if (response.success) {
          await fetchSubtasks(featureId);
          return true;
        } else {
          throw new Error(response.message || "Failed to reorder subtasks");
        }
      } catch (err) {
        setError(err.message || "An error occurred while reordering subtasks");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchSubtasks]
  );

  // ============================================
  // BUG FUNCTIONS
  // ============================================

  /**
   * Fetch bugs for a project
   */
  const fetchBugs = useCallback(
    async (params = {}) => {
      if (!projectId) return;

      try {
        const response = await projectService.getBugs(projectId, params);
        if (response.success) {
          setBugs(response.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch bugs:", err);
      }
    },
    [projectId]
  );

  /**
   * Create a bug
   */
  const createBug = useCallback(
    async (bugData) => {
      if (!projectId) {
        throw new Error("Project ID is required");
      }

      setLoading(true);
      setError(null);

      try {
        const response = await projectService.createBug(projectId, bugData);
        if (response.success) {
          await fetchBugs();
          return response.data;
        } else {
          throw new Error(response.message || "Failed to create bug");
        }
      } catch (err) {
        setError(err.message || "An error occurred while creating the bug");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [projectId, fetchBugs]
  );

  /**
   * Update a bug
   */
  const updateBug = useCallback(
    async (bugId, bugData) => {
      setLoading(true);
      setError(null);

      try {
        const response = await projectService.updateBug(bugId, bugData);
        if (response.success) {
          await fetchBugs();
          return response.data;
        } else {
          throw new Error(response.message || "Failed to update bug");
        }
      } catch (err) {
        setError(err.message || "An error occurred while updating the bug");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchBugs]
  );

  /**
   * Delete a bug
   */
  const deleteBug = useCallback(
    async (bugId) => {
      setLoading(true);
      setError(null);

      try {
        const response = await projectService.deleteBug(bugId);
        if (response.success) {
          await fetchBugs();
          return true;
        } else {
          throw new Error(response.message || "Failed to delete bug");
        }
      } catch (err) {
        setError(err.message || "An error occurred while deleting the bug");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchBugs]
  );

  // ============================================
  // STATISTICS FUNCTIONS
  // ============================================

  /**
   * Fetch project statistics
   */
  const fetchStatistics = useCallback(async () => {
    if (!projectId) return;

    try {
      const response = await projectService.getProjectStatistics(projectId);
      if (response.success) {
        setStatistics(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch statistics:", err);
    }
  }, [projectId]);

  /**
   * Fetch project dashboard data
   */
  const fetchDashboard = useCallback(async () => {
    if (!projectId) return;

    try {
      const response = await projectService.getProjectDashboard(projectId);
      if (response.success) {
        setDashboard(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard:", err);
    }
  }, [projectId]);

  // ============================================
  // PROJECT CRUD OPERATIONS
  // ============================================

  /**
   * Create a new project
   */
  const createProject = useCallback(
    async (projectData) => {
      setLoading(true);
      setError(null);

      try {
        const response = await projectService.createProject(projectData);
        if (response.success) {
          await fetchProjects();
          return response.data;
        } else {
          throw new Error(response.message || "Failed to create project");
        }
      } catch (err) {
        setError(err.message || "An error occurred while creating the project");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchProjects]
  );

  /**
   * Update a project
   */
  const updateProject = useCallback(
    async (projectData) => {
      if (!projectId) {
        throw new Error("Project ID is required");
      }

      setLoading(true);
      setError(null);

      try {
        const response = await projectService.updateProject(
          projectId,
          projectData
        );
        if (response.success) {
          await fetchProjects();
          setProject(response.data);
          return response.data;
        } else {
          throw new Error(response.message || "Failed to update project");
        }
      } catch (err) {
        setError(err.message || "An error occurred while updating the project");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [projectId, fetchProjects]
  );

  /**
   * Delete a project
   */
  const deleteProject = useCallback(async () => {
    if (!projectId) {
      throw new Error("Project ID is required");
    }

    setLoading(true);
    setError(null);

    try {
      const response = await projectService.deleteProject(projectId);
      if (response.success) {
        navigate("/projects");
        return true;
      } else {
        throw new Error(response.message || "Failed to delete project");
      }
    } catch (err) {
      setError(err.message || "An error occurred while deleting the project");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [projectId, navigate]);

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  /**
   * Update filters
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  /**
   * Reset filters
   */
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_PROJECT_FILTERS);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  /**
   * Change page
   */
  const changePage = useCallback((page) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  /**
   * Change limit
   */
  const changeLimit = useCallback((limit) => {
    setPagination({ page: 1, limit });
  }, []);

  /**
   * Change sort
   */
  const changeSort = useCallback((sortBy, sortOrder) => {
    setSortBy(sortBy);
    setSortOrder(sortOrder);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  // ============================================
  // NAVIGATION FUNCTIONS
  // ============================================

  const navigateToProject = useCallback(
    (id) => {
      navigate(`/projects/${id}`);
    },
    [navigate]
  );

  const navigateToEdit = useCallback(
    (id) => {
      navigate(`/projects/${id}/edit`);
    },
    [navigate]
  );

  const navigateToNew = useCallback(() => {
    navigate("/projects/new");
  }, [navigate]);

  const navigateToBoard = useCallback(
    (id) => {
      navigate(`/projects/${id}/board`);
    },
    [navigate]
  );

  const navigateToDashboard = useCallback(
    (id) => {
      navigate(`/projects/${id}/dashboard`);
    },
    [navigate]
  );

  // ============================================
  // COMPUTED VALUES
  // ============================================

  const totalProjects = useMemo(() => {
    return projects.length;
  }, [projects]);

  const featuredProjects = useMemo(() => {
    return projects.filter((p) => p.status === "in_progress");
  }, [projects]);

  const completedProjects = useMemo(() => {
    return projects.filter((p) => p.status === "completed");
  }, [projects]);

  // ============================================
  // EFFECTS
  // ============================================

  // Auto-fetch projects on dependency changes
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Auto-fetch project details when projectId changes
  useEffect(() => {
    if (projectId) {
      fetchProject();
      fetchFeatures();
      fetchBugs();
      fetchStatistics();
      fetchDashboard();
    }
  }, [projectId]);

  return {
    // State
    projects,
    project,
    features,
    bugs,
    subtasks,
    statistics,
    dashboard,
    loading,
    error,
    pagination,
    filters,
    sortBy,
    sortOrder,

    // Computed
    totalProjects,
    featuredProjects,
    completedProjects,

    // Project functions
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,

    // Feature functions
    fetchFeatures,
    createFeature,
    updateFeature,
    deleteFeature,
    reorderFeatures,

    // Subtask functions
    fetchSubtasks,
    createSubtask,
    updateSubtask,
    deleteSubtask,
    reorderSubtasks,

    // Bug functions
    fetchBugs,
    createBug,
    updateBug,
    deleteBug,

    // Statistics functions
    fetchStatistics,
    fetchDashboard,

    // Utility functions
    updateFilters,
    resetFilters,
    changePage,
    changeLimit,
    changeSort,

    // Navigation
    navigateToProject,
    navigateToEdit,
    navigateToNew,
    navigateToBoard,
    navigateToDashboard,

    // Project ID
    projectId,
  };
};

export default useProjects;
