// src/components/projects/ProjectList.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useProjects } from "../../hooks/useProjects";
import { useToast } from "../../hooks/useToast";
import {
  Button,
  LoadingSpinner,
  Alert,
  EmptyState,
  Pagination,
  SearchBar,
  Badge,
  Modal,
} from "../common";
import ProjectCard from "./ProjectCard";
import ProjectFilterBar from "./ProjectFilterBar";
import ProjectForm from "./ProjectForm";
import { Plus, FolderOpen } from "lucide-react";

const ProjectList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    deleteProject,
    projects,
    pagination,
    isLoading,
    error,
    clearError,
    filters,
    setFilters,
    isDeletingProject,
  } = useProjects();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const handlePageChange = (page) => {
    setFilters({ page });
  };

  const handleSearch = (value) => {
    setFilters({ search: value, page: 1 });
  };

  const handleFilterChange = (newFilters) => {
    setFilters({ ...newFilters, page: 1 });
  };

  const handleCreateSuccess = (project) => {
    setShowCreateModal(false);
    toast.success(`Project "${project.name}" created successfully`);
  };

  const handleDeleteClick = (project) => {
    setSelectedProject(project);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProject) return;
    try {
      await deleteProject(selectedProject.id);
      toast.success(`Project "${selectedProject.name}" deleted successfully`);
      setShowDeleteModal(false);
      setSelectedProject(null);
    } catch (error) {
      toast.error(error.message || "Failed to delete project");
    }
  };

  if (isLoading && projects.length === 0) {
    return <LoadingSpinner size="lg" className="my-12" />;
  }

  if (error) {
    return (
      <Alert variant="error" onClose={clearError}>
        {error}
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Projects</h1>
        <Button
          variant="primary"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </Button>
      </div>

      <ProjectFilterBar filters={filters} onFilterChange={handleFilterChange} />

      <SearchBar
        value={filters.search || ""}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search projects..."
        className="max-w-md"
      />

      {projects.length === 0 ? (
        <EmptyState
          title="No projects found"
          description="Get started by creating your first project"
          icon={<FolderOpen className="w-12 h-12" />}
          action={
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              Create Project
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={() => navigate(`/projects/${project.id}/edit`)}
                onDelete={() => handleDeleteClick(project)}
                onClick={() => navigate(`/projects/${project.id}`)}
              />
            ))}
          </div>

          {pagination.pages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Project"
        size="lg"
      >
        <ProjectForm
          onSubmit={handleCreateSuccess}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Project"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-neutral-700">
            Are you sure you want to delete{" "}
            <span className="font-semibold">{selectedProject?.name}</span>? This
            action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="ghost"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeletingProject}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
              loading={isDeletingProject}
              disabled={isDeletingProject}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectList;
