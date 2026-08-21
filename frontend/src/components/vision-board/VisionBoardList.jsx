// src/components/vision-board/VisionBoardList.jsx

import React, { useState } from "react";
import {
  Table,
  Button,
  SearchBar,
  Badge,
  Pagination,
  EmptyState,
  LoadingSpinner,
  Dropdown,
  DropdownItem,
  Modal,
  Alert,
  IconWrapper,
  ProgressBar,
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
  PRIORITIES,
} from "./VisionBoardConstants";

const VisionBoardList = () => {
  const {
    goals,
    loading,
    error,
    pagination,
    filters,
    sortBy,
    sortOrder,
    statistics,
    deleteVisionGoal,
    updateFilters,
    resetFilters,
    changePage,
    changeLimit,
    changeSort,
    navigateToDetail,
    navigateToNew,
    navigateToKanban,
    navigateToStatistics,
    exportVisionGoals,
    hasGoals,
  } = useVisionBoard();

  const [selectedGoal, setSelectedGoal] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Table headers
  const headers = [
    { key: "priority", label: "Priority", sortable: true },
    { key: "goal", label: "Goal", sortable: true },
    { key: "category", label: "Category", sortable: true },
    { key: "status", label: "Status", sortable: true },
    { key: "progress", label: "Progress", sortable: true },
    { key: "actions", label: "Actions", sortable: false },
  ];

  // Handle delete
  const handleDelete = async () => {
    if (selectedGoal) {
      try {
        await deleteVisionGoal(selectedGoal.id);
        setShowDeleteModal(false);
        setSelectedGoal(null);
      } catch (err) {
        // Error is handled by the hook
      }
    }
  };

  // Handle export
  const handleExport = async (format) => {
    setExporting(true);
    try {
      const data = await exportVisionGoals(format);

      if (format === "json") {
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `vision_goals_${
          new Date().toISOString().split("T")[0]
        }.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (format === "csv") {
        const csvContent = convertToCSV(data || []);
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `vision_goals_${
          new Date().toISOString().split("T")[0]
        }.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      // Error is handled by the hook
    } finally {
      setExporting(false);
    }
  };

  // Convert goals to CSV
  const convertToCSV = (data) => {
    if (!data || data.length === 0) return "";
    const headers = [
      "Goal",
      "Description",
      "Category",
      "Status",
      "Priority",
      "Progress",
      "Target Timeline",
    ];
    const rows = data.map((goal) => [
      goal.goal,
      goal.description || "",
      goal.category || "",
      getStatusLabel(goal.status),
      getPriorityLabel(goal.priority),
      `${goal.progress || 0}%`,
      goal.target_timeline || "",
    ]);
    return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  };

  // Render status badge
  const renderStatusBadge = (status) => {
    const statusInfo = getStatus(status);
    return (
      <Badge
        variant="secondary"
        className="flex items-center gap-1"
        style={{
          backgroundColor: statusInfo?.color + "20",
          color: statusInfo?.color,
        }}
      >
        <span>{statusInfo?.icon}</span>
        <span>{statusInfo?.label}</span>
      </Badge>
    );
  };

  // Render priority indicator
  const renderPriority = (priority) => {
    const label = getPriorityLabel(priority);
    const color = getPriorityColor(priority);
    return (
      <div className="flex items-center gap-2">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="text-sm">{label}</span>
      </div>
    );
  };

  // Render progress
  const renderProgress = (progress) => {
    return (
      <div className="flex items-center gap-2">
        <ProgressBar
          value={progress || 0}
          max={100}
          size="sm"
          className="flex-1 min-w-[60px]"
          variant={
            progress >= 100 ? "success" : progress >= 50 ? "primary" : "warning"
          }
        />
        <span className="text-sm font-medium min-w-[40px] text-right">
          {progress || 0}%
        </span>
      </div>
    );
  };

  // Loading state
  if (loading && !goals.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Error state
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
          <h1 className="text-2xl font-bold">Vision Board</h1>
          {statistics && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {statistics.total} goals · {statistics.activeCount} active ·{" "}
              {statistics.completedCount} completed
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={navigateToKanban}>
            <IconWrapper icon="📋" size="sm" />
            Kanban View
          </Button>
          <Button variant="outline" size="sm" onClick={navigateToStatistics}>
            <IconWrapper icon="📊" size="sm" />
            Statistics
          </Button>
          <Dropdown
            trigger={
              <Button variant="outline" size="sm">
                <IconWrapper icon="📥" size="sm" />
                Export
              </Button>
            }
            align="right"
          >
            <DropdownItem onClick={() => handleExport("json")}>
              Export as JSON
            </DropdownItem>
            <DropdownItem onClick={() => handleExport("csv")}>
              Export as CSV
            </DropdownItem>
          </Dropdown>
          <Button variant="primary" onClick={navigateToNew}>
            <IconWrapper icon="➕" size="sm" />
            Add Goal
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={filters.status}
            onChange={(e) => updateFilters({ status: e.target.value })}
          >
            <option value="">All Statuses</option>
            {STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.icon} {status.label}
              </option>
            ))}
          </select>
          <select
            className="px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={filters.category}
            onChange={(e) => updateFilters({ category: e.target.value })}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-neutral-500"
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Table */}
      {hasGoals ? (
        <>
          <Table
            headers={headers}
            data={goals}
            variant="striped"
            className="overflow-x-auto"
          >
            {(goal) => (
              <tr
                key={goal.id}
                className="hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer"
                onClick={() => navigateToDetail(goal.id)}
              >
                <td className="px-4 py-3">{renderPriority(goal.priority)}</td>
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium">{goal.goal}</p>
                    {goal.description && (
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate max-w-xs">
                        {goal.description}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {goal.category ? (
                    <Badge variant="neutral" className="text-xs">
                      {goal.category}
                    </Badge>
                  ) : (
                    <span className="text-neutral-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3">{renderStatusBadge(goal.status)}</td>
                <td className="px-4 py-3">{renderProgress(goal.progress)}</td>
                <td className="px-4 py-3">
                  <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigateToEdit(goal.id)}
                    >
                      ✏️
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-error hover:bg-error/10"
                      onClick={() => {
                        setSelectedGoal(goal);
                        setShowDeleteModal(true);
                      }}
                    >
                      🗑️
                    </Button>
                  </div>
                </td>
              </tr>
            )}
          </Table>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-sm text-neutral-500 dark:text-neutral-400">
              Showing {goals.length} of {pagination.total || goals.length} goals
            </div>
            <Pagination
              currentPage={pagination.page}
              totalPages={
                pagination.totalPages ||
                Math.ceil((pagination.total || 0) / pagination.limit)
              }
              onPageChange={changePage}
              showFirstLast
            />
          </div>
        </>
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Goal"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-neutral-600 dark:text-neutral-400">
            Are you sure you want to delete this goal? This action cannot be
            undone.
          </p>
          {selectedGoal && (
            <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <p className="font-medium">{selectedGoal.goal}</p>
              <p className="text-sm text-neutral-500">
                {getStatusLabel(selectedGoal.status)} ·{" "}
                {getPriorityLabel(selectedGoal.priority)}
              </p>
            </div>
          )}
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Export loading overlay */}
      {exporting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-xl flex flex-col items-center gap-4">
            <LoadingSpinner size="lg" />
            <p className="text-sm font-medium">Exporting vision goals...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisionBoardList;
