// src/components/projects/SubtaskList.jsx
import React, { useState, useEffect } from "react";
import { useProjects } from "../../hooks/useProjects";
import { useToast } from "../../hooks/useToast";
import { Button, LoadingSpinner, Alert, EmptyState, Checkbox } from "../common";
import SubtaskForm from "./SubtaskForm";
import { Plus, CheckCircle, Circle } from "lucide-react";

const SubtaskList = ({ featureId }) => {
  const { toast } = useToast();
  const {
    getSubtasks,
    subtasks,
    isLoading,
    error,
    clearError,
    updateSubtask,
    deleteSubtask,
    isUpdatingSubtask,
    isDeletingSubtask,
  } = useProjects();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSubtask, setEditingSubtask] = useState(null);

  useEffect(() => {
    if (featureId) {
      getSubtasks(featureId);
    }
  }, [featureId]);

  const handleToggleComplete = async (subtask) => {
    try {
      await updateSubtask(subtask.id, {
        ...subtask,
        is_completed: !subtask.is_completed,
      });
      toast.success(
        subtask.is_completed
          ? "Subtask marked as incomplete"
          : "Subtask completed!"
      );
      getSubtasks(featureId);
    } catch (error) {
      toast.error(error.message || "Failed to update subtask");
    }
  };

  const handleDelete = async (subtaskId) => {
    try {
      await deleteSubtask(subtaskId);
      toast.success("Subtask deleted successfully");
      getSubtasks(featureId);
    } catch (error) {
      toast.error(error.message || "Failed to delete subtask");
    }
  };

  const handleCreateSuccess = (subtask) => {
    setShowCreateModal(false);
    toast.success("Subtask added successfully");
    getSubtasks(featureId);
  };

  const handleUpdateSuccess = (subtask) => {
    setEditingSubtask(null);
    toast.success("Subtask updated successfully");
    getSubtasks(featureId);
  };

  if (isLoading && subtasks.length === 0) {
    return <LoadingSpinner size="sm" className="my-4" />;
  }

  if (error) {
    return (
      <Alert variant="error" onClose={clearError}>
        {error}
      </Alert>
    );
  }

  const completedSubtasks = subtasks.filter((s) => s.is_completed);
  const incompleteSubtasks = subtasks.filter((s) => !s.is_completed);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h3 className="text-sm font-medium text-neutral-700">Subtasks</h3>
          {subtasks.length > 0 && (
            <span className="text-xs text-neutral-500">
              {completedSubtasks.length}/{subtasks.length} completed
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowCreateModal(true)}
          className="text-primary-500 hover:text-primary-600"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add Subtask
        </Button>
      </div>

      {subtasks.length === 0 ? (
        <EmptyState
          title="No subtasks"
          description="Add subtasks to break down this feature"
          className="py-4"
          size="sm"
        />
      ) : (
        <div className="space-y-2">
          {incompleteSubtasks.map((subtask) => (
            <div
              key={subtask.id}
              className="flex items-center justify-between p-2 bg-neutral-200 rounded-lg hover:bg-neutral-300 transition-colors group"
            >
              <div className="flex items-center space-x-3 flex-1">
                <Checkbox
                  checked={subtask.is_completed}
                  onChange={() => handleToggleComplete(subtask)}
                  className="text-primary-500"
                />
                <span className="text-sm text-neutral-800">
                  {subtask.title}
                </span>
              </div>
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingSubtask(subtask)}
                  className="text-xs"
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(subtask.id)}
                  className="text-xs text-error hover:text-error"
                  disabled={isDeletingSubtask}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
          {completedSubtasks.map((subtask) => (
            <div
              key={subtask.id}
              className="flex items-center justify-between p-2 bg-neutral-200 rounded-lg opacity-60 hover:opacity-100 transition-opacity group"
            >
              <div className="flex items-center space-x-3 flex-1">
                <Checkbox
                  checked={subtask.is_completed}
                  onChange={() => handleToggleComplete(subtask)}
                  className="text-success"
                />
                <span className="text-sm text-neutral-500 line-through">
                  {subtask.title}
                </span>
                <CheckCircle className="w-3 h-3 text-success" />
              </div>
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingSubtask(subtask)}
                  className="text-xs"
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(subtask.id)}
                  className="text-xs text-error hover:text-error"
                  disabled={isDeletingSubtask}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add Subtask"
        size="sm"
      >
        <SubtaskForm
          featureId={featureId}
          onSubmit={handleCreateSuccess}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      <Modal
        isOpen={!!editingSubtask}
        onClose={() => setEditingSubtask(null)}
        title="Edit Subtask"
        size="sm"
      >
        <SubtaskForm
          featureId={featureId}
          initialData={editingSubtask}
          onSubmit={handleUpdateSuccess}
          onCancel={() => setEditingSubtask(null)}
          isEditing
        />
      </Modal>
    </div>
  );
};

export default SubtaskList;
