// src/components/vision/ProjectLinker.jsx
import React, { useState, useEffect } from "react";
import { useVision } from "../../hooks/useVision";
import { useToast } from "../../hooks/useToast";
import { LoadingSpinner, Alert, Button, Badge } from "../common";
import { Link as LinkIcon, Unlink, Plus, Check } from "lucide-react";

const ProjectLinker = ({ goalId }) => {
  const {
    getAvailableProjects,
    getGoal,
    linkProject,
    unlinkProject,
    currentGoal,
    availableProjects,
    isLoading,
    error,
    clearError,
    isLinking,
    isUnlinking,
  } = useVision();
  const { toast } = useToast();

  const [selectedProjects, setSelectedProjects] = useState([]);

  useEffect(() => {
    if (goalId) {
      getAvailableProjects(goalId);
      getGoal(goalId);
    }
  }, [goalId]);

  const linkedProjectIds = currentGoal?.linked_projects?.map((p) => p.id) || [];

  const handleLink = async (projectId) => {
    try {
      const result = await linkProject(goalId, { project_id: projectId });
      if (result.success) {
        toast.success("Project linked successfully");
        getAvailableProjects(goalId);
        getGoal(goalId);
      }
    } catch (err) {
      toast.error(err.message || "Failed to link project");
    }
  };

  const handleUnlink = async (projectId) => {
    if (window.confirm("Are you sure you want to unlink this project?")) {
      try {
        const result = await unlinkProject(goalId, projectId);
        if (result.success) {
          toast.success("Project unlinked successfully");
          getAvailableProjects(goalId);
          getGoal(goalId);
        }
      } catch (err) {
        toast.error(err.message || "Failed to unlink project");
      }
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="md" className="my-4" />;
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
      {/* Linked Projects */}
      {linkedProjectIds.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-neutral-700 mb-3">
            Linked Projects ({linkedProjectIds.length})
          </h4>
          <div className="space-y-2">
            {currentGoal?.linked_projects?.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between p-3 bg-neutral-200 rounded-lg"
              >
                <div>
                  <span className="font-medium text-neutral-800">
                    {project.name}
                  </span>
                  {project.status && (
                    <Badge variant="info" size="sm" className="ml-2">
                      {project.status}
                    </Badge>
                  )}
                  {project.completion_percentage !== undefined && (
                    <Badge variant="secondary" size="sm" className="ml-2">
                      {project.completion_percentage}% complete
                    </Badge>
                  )}
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleUnlink(project.id)}
                  disabled={isUnlinking}
                >
                  <Unlink className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Projects */}
      {availableProjects && availableProjects.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-neutral-700 mb-3">
            Available Projects
          </h4>
          <div className="space-y-2">
            {availableProjects
              .filter((p) => !linkedProjectIds.includes(p.id))
              .map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-3 bg-neutral-200 rounded-lg"
                >
                  <div>
                    <span className="font-medium text-neutral-800">
                      {project.name}
                    </span>
                    {project.status && (
                      <Badge variant="info" size="sm" className="ml-2">
                        {project.status}
                      </Badge>
                    )}
                    {project.completion_percentage !== undefined && (
                      <Badge variant="secondary" size="sm" className="ml-2">
                        {project.completion_percentage}% complete
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleLink(project.id)}
                    disabled={isLinking}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Link
                  </Button>
                </div>
              ))}
          </div>
        </div>
      )}

      {availableProjects?.length === 0 && linkedProjectIds.length === 0 && (
        <div className="text-center py-6 text-neutral-500">
          <LinkIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No projects available</p>
          <p className="text-sm">
            Create a project first to link it to this goal
          </p>
        </div>
      )}
    </div>
  );
};

export default ProjectLinker;
