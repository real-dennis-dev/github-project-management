// src/components/project-management/SubtaskList.jsx

import React, { useState, useEffect } from "react";
import {
  Button,
  Checkbox,
  Input,
  Badge,
  Alert,
  LoadingSpinner,
  IconWrapper,
  Modal,
} from "../common";
import useProjects from "./useProjects";
import { SUBTASK_FORM_INITIAL_VALUES } from "./ProjectConstants";

const SubtaskList = ({ featureId, feature }) => {
  const {
    subtasks,
    fetchSubtasks,
    createSubtask,
    updateSubtask,
    deleteSubtask,
    reorderSubtasks,
    loading,
  } = useProjects();

  const [subtaskList, setSubtaskList] = useState([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingSubtask, setEditingSubtask] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSubtask, setSelectedSubtask] = useState(null);

  // Load subtasks when featureId changes
  useEffect(() => {
    if (featureId) {
      fetchSubtasks(featureId);
    }
  }, [featureId]);

  // Update local list when subtasks change
  useEffect(() => {
    setSubtaskList(subtasks);
  }, [subtasks]);

  // Handle add subtask
  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim()) return;

    try {
      await createSubtask(featureId, {
        title: newSubtaskTitle.trim(),
        is_completed: false,
      });
      setNewSubtaskTitle("");
      setIsAdding(false);
    } catch (err) {
      // Error handled by hook
    }
  };

  // Handle toggle subtask completion
  const handleToggleSubtask = async (subtask) => {
    try {
      await updateSubtask(subtask.id, {
        ...subtask,
        is_completed: !subtask.is_completed,
      });
    } catch (err) {
      // Error handled by hook
    }
  };

  // Handle delete subtask
  const handleDeleteSubtask = async () => {
    if (selectedSubtask) {
      try {
        await deleteSubtask(selectedSubtask.id);
        setShowDeleteModal(false);
        setSelectedSubtask(null);
      } catch (err) {
        // Error handled by hook
      }
    }
  };

  // Handle edit subtask
  const handleEditSubtask = async (subtask) => {
    if (!editingSubtask?.title?.trim()) {
      setEditingSubtask(null);
      return;
    }

    try {
      await updateSubtask(subtask.id, {
        ...subtask,
        title: editingSubtask.title.trim(),
      });
      setEditingSubtask(null);
    } catch (err) {
      // Error handled by hook
    }
  };

  // Handle key press for add
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleAddSubtask();
    }
    if (e.key === "Escape") {
      setIsAdding(false);
      setNewSubtaskTitle("");
    }
  };

  // Handle key press for edit
  const handleEditKeyPress = (e, subtask) => {
    if (e.key === "Enter") {
      handleEditSubtask(subtask);
    }
    if (e.key === "Escape") {
      setEditingSubtask(null);
    }
  };

  // Calculate completion stats
  const completedCount = subtaskList.filter((s) => s.is_completed).length;
  const totalCount = subtaskList.length;
  const completionPercentage =
    totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h4 className="font-medium">Subtasks</h4>
          <Badge variant="neutral" size="sm">
            {completedCount}/{totalCount}
          </Badge>
          {totalCount > 0 && (
            <span className="text-xs text-neutral-500">
              {completionPercentage.toFixed(0)}% complete
            </span>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={() => setIsAdding(true)}>
          <IconWrapper icon="➕" size="sm" />
          Add
        </Button>
      </div>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      )}

      {/* Add Subtask Input */}
      {isAdding && (
        <div className="flex items-center gap-2">
          <Input
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Enter subtask title..."
            className="flex-1"
            autoFocus
          />
          <Button
            variant="primary"
            size="sm"
            onClick={handleAddSubtask}
            disabled={!newSubtaskTitle.trim()}
          >
            Add
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsAdding(false);
              setNewSubtaskTitle("");
            }}
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Subtask List */}
      <div className="space-y-2">
        {subtaskList.map((subtask) => (
          <div
            key={subtask.id}
            className={`flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors ${
              subtask.is_completed ? "opacity-60" : ""
            }`}
          >
            <Checkbox
              checked={subtask.is_completed}
              onChange={() => handleToggleSubtask(subtask)}
              className="flex-shrink-0"
            />

            {editingSubtask?.id === subtask.id ? (
              <Input
                value={editingSubtask.title}
                onChange={(e) =>
                  setEditingSubtask({
                    ...editingSubtask,
                    title: e.target.value,
                  })
                }
                onKeyDown={(e) => handleEditKeyPress(e, subtask)}
                className="flex-1"
                autoFocus
              />
            ) : (
              <span
                className={`flex-1 text-sm ${
                  subtask.is_completed
                    ? "line-through text-neutral-400"
                    : "text-neutral-700 dark:text-neutral-300"
                }`}
              >
                {subtask.title}
              </span>
            )}

            <div className="flex items-center gap-1">
              {editingSubtask?.id === subtask.id ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditSubtask(subtask)}
                    disabled={!editingSubtask.title.trim()}
                  >
                    💾
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingSubtask(null)}
                  >
                    ❌
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingSubtask({ ...subtask })}
                  >
                    ✏️
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-error hover:bg-error/10"
                    onClick={() => {
                      setSelectedSubtask(subtask);
                      setShowDeleteModal(true);
                    }}
                  >
                    🗑️
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}

        {subtaskList.length === 0 && !isAdding && (
          <p className="text-sm text-neutral-400 text-center py-4">
            No subtasks yet. Click "Add" to create one.
          </p>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Subtask"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-neutral-600 dark:text-neutral-400">
            Are you sure you want to delete this subtask?
          </p>
          {selectedSubtask && (
            <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <p className="font-medium">{selectedSubtask.title}</p>
            </div>
          )}
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteSubtask}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SubtaskList;
