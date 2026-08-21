// src/components/vision-board/VisionBoardKanban.jsx

import React, { useState } from "react";
import {
  Card,
  Button,
  Badge,
  LoadingSpinner,
  Alert,
  IconWrapper,
  EmptyState,
} from "../common";
import useVisionBoard from "./useVisionBoard";
import {
  STATUSES,
  getStatus,
  getStatusLabel,
  getStatusColor,
  getStatusIcon,
  getPriorityLabel,
  getPriorityColor,
} from "./VisionBoardConstants";

const VisionBoardKanban = () => {
  const {
    goals,
    loading,
    error,
    navigateToDetail,
    navigateToNew,
    hasGoals,
    updateVisionGoal,
  } = useVisionBoard();

  const [draggedGoal, setDraggedGoal] = useState(null);
  const [dragOverStatus, setDragOverStatus] = useState(null);

  // Group goals by status
  const goalsByStatus = STATUSES.reduce((acc, status) => {
    acc[status.value] = goals.filter((goal) => goal.status === status.value);
    return acc;
  }, {});

  // Handle drag start
  const handleDragStart = (e, goal) => {
    setDraggedGoal(goal);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", goal.id);
  };

  // Handle drag over
  const handleDragOver = (e, status) => {
    e.preventDefault();
    setDragOverStatus(status);
  };

  // Handle drag leave
  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOverStatus(null);
  };

  // Handle drop
  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    setDragOverStatus(null);

    if (!draggedGoal) return;

    // Don't update if status is the same
    if (draggedGoal.status === targetStatus) {
      setDraggedGoal(null);
      return;
    }

    try {
      await updateVisionGoal(draggedGoal.id, {
        ...draggedGoal,
        status: targetStatus,
      });
    } catch (err) {
      // Error is handled by the hook
    } finally {
      setDraggedGoal(null);
    }
  };

  // Render goal card
  const renderGoalCard = (goal) => {
    const priorityColor = getPriorityColor(goal.priority);
    const statusInfo = getStatus(goal.status);

    return (
      <div
        key={goal.id}
        draggable
        onDragStart={(e) => handleDragStart(e, goal)}
        className="bg-white dark:bg-neutral-800 rounded-lg p-4 shadow-sm border border-neutral-200 dark:border-neutral-700 cursor-grab hover:shadow-md transition-shadow"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{goal.goal}</p>
            {goal.description && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">
                {goal.description}
              </p>
            )}
          </div>
          <Badge
            variant="neutral"
            size="sm"
            className="flex-shrink-0"
            style={{ borderColor: priorityColor, color: priorityColor }}
          >
            ⭐ {getPriorityLabel(goal.priority)}
          </Badge>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            {goal.category && (
              <Badge variant="neutral" size="sm" className="text-xs">
                {goal.category}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {goal.progress > 0 && (
              <span className="text-xs text-neutral-500">{goal.progress}%</span>
            )}
            <span className="text-xs text-neutral-400">
              {goal.linked_projects?.length || 0} projects
            </span>
          </div>
        </div>

        {/* Progress bar */}
        {goal.progress > 0 && goal.progress < 100 && (
          <div className="mt-2 h-1 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all"
              style={{ width: `${goal.progress}%` }}
            />
          </div>
        )}
      </div>
    );
  };

  if (loading && !goals.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error && !goals.length) {
    return (
      <div className="p-6">
        <Alert variant="error" title="Error loading vision goals">
          {error}
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Kanban View</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Drag and drop goals to update their status
          </p>
        </div>
        <Button variant="primary" onClick={navigateToNew}>
          <IconWrapper icon="➕" size="sm" />
          Add Goal
        </Button>
      </div>

      {/* Kanban Board */}
      {hasGoals ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STATUSES.map((status) => {
            const items = goalsByStatus[status.value] || [];
            const isDragOver = dragOverStatus === status.value;

            return (
              <div
                key={status.value}
                className={`bg-neutral-50 dark:bg-neutral-900 rounded-xl p-4 min-h-[300px] transition-colors ${
                  isDragOver
                    ? "ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20"
                    : ""
                }`}
                onDragOver={(e) => handleDragOver(e, status.value)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, status.value)}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span>{status.icon}</span>
                    <h2 className="font-semibold">{status.label}</h2>
                    <Badge variant="neutral" size="sm">
                      {items.length}
                    </Badge>
                  </div>
                </div>

                {/* Column Content */}
                <div className="space-y-2">
                  {items.length > 0 ? (
                    items.map((goal) => renderGoalCard(goal))
                  ) : (
                    <div className="text-center py-8 text-sm text-neutral-400 border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-lg">
                      <p>No goals</p>
                      <p className="text-xs mt-1">Drop goals here</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No vision goals yet"
          description="Start planning your future by creating your first vision goal."
          action={
            <Button variant="primary" onClick={navigateToNew}>
              <IconWrapper icon="➕" size="sm" />
              Add Goal
            </Button>
          }
        />
      )}
    </div>
  );
};

export default VisionBoardKanban;
