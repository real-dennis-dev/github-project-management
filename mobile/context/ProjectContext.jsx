import React, { createContext, useState, useContext, useCallback } from "react";
import projectService from "../services/projectService";

// Create context
const ProjectContext = createContext(null);

/**
 * Project Provider Component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.ReactElement}
 */
export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Load all projects
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Array>}
   */
  const loadProjects = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await projectService.getAll(filters);
      setProjects(response.data);
      return response.data;
    } catch (err) {
      setError(err.message || "Failed to load projects");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load a single project by ID
   * @param {string} projectId - Project ID
   * @returns {Promise<Object>}
   */
  const loadProject = useCallback(async (projectId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await projectService.getById(projectId);
      setCurrentProject(response.data);
      return response.data;
    } catch (err) {
      setError(err.message || "Failed to load project");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new project
   * @param {Object} projectData - Project data
   * @returns {Promise<Object>}
   */
  const createProject = useCallback(async (projectData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await projectService.create(projectData);
      setProjects((prev) => [response.data, ...prev]);
      return response.data;
    } catch (err) {
      setError(err.message || "Failed to create project");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update a project
   * @param {string} projectId - Project ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>}
   */
  const updateProject = useCallback(
    async (projectId, updateData) => {
      setLoading(true);
      setError(null);

      try {
        const response = await projectService.update(projectId, updateData);

        setProjects((prev) =>
          prev.map((p) => (p.id === projectId ? response.data : p))
        );

        if (currentProject?.id === projectId) {
          setCurrentProject(response.data);
        }

        return response.data;
      } catch (err) {
        setError(err.message || "Failed to update project");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentProject]
  );

  /**
   * Delete a project
   * @param {string} projectId - Project ID
   * @returns {Promise<boolean>}
   */
  const deleteProject = useCallback(
    async (projectId) => {
      setLoading(true);
      setError(null);

      try {
        await projectService.delete(projectId);

        setProjects((prev) => prev.filter((p) => p.id !== projectId));

        if (currentProject?.id === projectId) {
          setCurrentProject(null);
        }

        return true;
      } catch (err) {
        setError(err.message || "Failed to delete project");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentProject]
  );

  /**
   * Update project status
   * @param {string} projectId - Project ID
   * @param {string} status - New status
   * @returns {Promise<Object>}
   */
  const updateProjectStatus = useCallback(
    async (projectId, status) => {
      setLoading(true);
      setError(null);

      try {
        const response = await projectService.updateStatus(projectId, status);

        setProjects((prev) =>
          prev.map((p) => (p.id === projectId ? response.data : p))
        );

        if (currentProject?.id === projectId) {
          setCurrentProject(response.data);
        }

        return response.data;
      } catch (err) {
        setError(err.message || "Failed to update project status");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentProject]
  );

  /**
   * Refresh project data
   * @param {string} projectId - Project ID
   * @returns {Promise<Object>}
   */
  const refreshProject = useCallback(
    async (projectId) => {
      if (projectId) {
        return await loadProject(projectId);
      } else if (currentProject) {
        return await loadProject(currentProject.id);
      }
      return null;
    },
    [currentProject, loadProject]
  );

  const value = {
    projects,
    currentProject,
    loading,
    error,
    setCurrentProject,
    loadProjects,
    loadProject,
    createProject,
    updateProject,
    deleteProject,
    updateProjectStatus,
    refreshProject,
  };

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
};

/**
 * useProject hook
 * @returns {Object} Project context value
 */
export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
};

export default ProjectContext;
