// src/components/subscriptions/MilestoneList.jsx

import React, { useState } from "react";
import {
  Table,
  Button,
  SearchBar,
  Badge,
  Pagination,
  EmptyState,
  LoadingSpinner,
  Modal,
  Alert,
  IconWrapper,
  Dropdown,
  DropdownItem,
  ProgressBar,
} from "../common";
import useSubscriptions from "./useSubscriptions";
import {
  MILESTONE_STATUSES,
  getMilestoneStatus,
  getStatusBadgeVariant,
  formatDate,
} from "./SubscriptionsConstants";

const MilestoneList = () => {
  const {
    milestones,
    loading,
    error,
    pagination,
    filters,
    deleteMilestone,
    updateMilestoneStatus,
    updateFilters,
    resetFilters,
    changePage,
    changeLimit,
    navigateToMilestone,
    navigateToMilestoneEdit,
    navigateToMilestoneProgress,
    navigateToNewMilestone,
  } = useSubscriptions();

  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Table headers
  const headers = [
    { key: "name", label: "Name", sortable: true },
    { key: "description", label: "Description", sortable: true },
    { key: "status", label: "Status", sortable: true },
    { key: "progress", label: "Progress", sortable: true },
    { key: "target_date", label: "Target Date", sortable: true },
    { key: "actions", label: "Actions", sortable: false },
  ];

  // Handle search
  const handleSearch = (value) => {
    setSearchQuery(value);
    updateFilters({ search: value });
  };

  // Handle status change
  const handleStatusChange = async (milestoneId, status) => {
    try {
      await updateMilestoneStatus(milestoneId, status);
      setShowStatusModal(false);
      setSelectedMilestone(null);
    } catch (err) {
      // Error handled by hook
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (selectedMilestone) {
      try {
        await deleteMilestone(selectedMilestone.id);
        setShowDeleteModal(false);
        setSelectedMilestone(null);
      } catch (err) {
        // Error handled by hook
      }
    }
  };

  // Render status badge
  const renderStatusBadge = (status) => {
    const statusInfo = getMilestoneStatus(status);
    return (
      <Badge variant={getStatusBadgeVariant(status, "milestone")} size="sm">
        <span className="flex items-center gap-1">
          <span>{statusInfo.icon}</span>
          <span>{statusInfo.label}</span>
        </span>
      </Badge>
    );
  };

  // Render progress
  const renderProgress = (progress) => {
    return (
      <div className="w-32">
        <ProgressBar
          value={progress || 0}
          max={100}
          variant={
            progress === 100
              ? "success"
              : progress >= 50
              ? "primary"
              : "neutral"
          }
          size="sm"
          showLabel
        />
      </div>
    );
  };

  // Render actions dropdown
  const renderActions = (milestone) => {
    return (
      <Dropdown
        trigger={
          <Button variant="ghost" size="sm">
            ⋮
          </Button>
        }
        align="right"
      >
        <DropdownItem onClick={() => navigateToMilestone(milestone.id)}>
          <IconWrapper icon="👁️" size="sm" /> View
        </DropdownItem>
        <DropdownItem onClick={() => navigateToMilestoneEdit(milestone.id)}>
          <IconWrapper icon="✏️" size="sm" /> Edit
        </DropdownItem>
        <DropdownItem onClick={() => navigateToMilestoneProgress(milestone.id)}>
          <IconWrapper icon="📊" size="sm" /> Progress
        </DropdownItem>
        <DropdownItem
          onClick={() => {
            setSelectedMilestone(milestone);
            setShowStatusModal(true);
          }}
        >
          <IconWrapper icon="🔄" size="sm" /> Change Status
        </DropdownItem>
        <DropdownItem
          onClick={() => {
            setSelectedMilestone(milestone);
            setShowDeleteModal(true);
          }}
          className="text-error hover:bg-error/10"
        >
          <IconWrapper icon="🗑️" size="sm" /> Delete
        </DropdownItem>
      </Dropdown>
    );
  };

  // Check if milestone is overdue
  const isOverdue = (milestone) => {
    if (milestone.status === "completed") return false;
    if (!milestone.target_date) return false;
    return new Date(milestone.target_date) < new Date();
  };

  if (loading && !milestones.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error && !milestones.length) {
    return (
      <div className="p-6">
        <Alert variant="error" title="Error loading milestones">
          {error}
        </Alert>
      </div>
    );
  }

  if (!milestones.length) {
    return (
      <div className="p-6">
        <EmptyState
          title="No milestones found"
          description="Create your first milestone to track important project goals and deadlines."
          icon="🎯"
          action={
            <Button variant="primary" onClick={navigateToNewMilestone}>
              <IconWrapper icon="➕" size="sm" />
              Create Milestone
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Milestones</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {milestones.length} milestones found
          </p>
        </div>
        <Button variant="primary" onClick={navigateToNewMilestone}>
          <IconWrapper icon="➕" size="sm" />
          Create Milestone
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 w-full sm:w-auto">
          <SearchBar
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search milestones..."
            fullWidth
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={filters.status}
            onChange={(e) => updateFilters({ status: e.target.value })}
          >
            <option value="">All Statuses</option>
            {MILESTONE_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.icon} {status.label}
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
      <Table
        headers={headers}
        data={milestones}
        variant="striped"
        className="overflow-x-auto"
      >
        {(milestone) => (
          <tr
            key={milestone.id}
            className={`hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer ${
              isOverdue(milestone) ? "bg-error/5" : ""
            }`}
            onClick={() => navigateToMilestone(milestone.id)}
          >
            <td className="px-4 py-3">
              <div>
                <p className="font-medium">{milestone.name}</p>
                {isOverdue(milestone) && (
                  <Badge variant="error" size="sm" className="mt-1">
                    ⚠️ Overdue
                  </Badge>
                )}
              </div>
            </td>
            <td className="px-4 py-3">
              <p className="truncate max-w-xs text-sm text-neutral-600 dark:text-neutral-400">
                {milestone.description || "-"}
              </p>
            </td>
            <td className="px-4 py-3">{renderStatusBadge(milestone.status)}</td>
            <td className="px-4 py-3">
              {renderProgress(milestone.progress_percentage)}
            </td>
            <td className="px-4 py-3 text-sm text-neutral-500">
              {milestone.target_date ? formatDate(milestone.target_date) : "-"}
            </td>
            <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
              {renderActions(milestone)}
            </td>
          </tr>
        )}
      </Table>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-sm text-neutral-500 dark:text-neutral-400">
            Showing {milestones.length} of{" "}
            {pagination.total || milestones.length} milestones
          </div>
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages || 1}
            onPageChange={changePage}
            showFirstLast
          />
        </div>
      )}

      {/* Status Change Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Change Milestone Status"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Select a new status for {selectedMilestone?.name}:
          </p>
          <div className="grid grid-cols-2 gap-2">
            {MILESTONE_STATUSES.map((status) => (
              <button
                key={status.value}
                className={`p-3 rounded-lg border-2 text-sm transition-all ${
                  selectedMilestone?.status === status.value
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                    : "border-neutral-200 dark:border-neutral-700 hover:border-primary-300"
                }`}
                onClick={() =>
                  handleStatusChange(selectedMilestone?.id, status.value)
                }
              >
                <span className="text-lg block">{status.icon}</span>
                <span>{status.label}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center justify-end">
            <Button variant="ghost" onClick={() => setShowStatusModal(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Milestone"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-neutral-600 dark:text-neutral-400">
            Are you sure you want to delete this milestone? This action cannot
            be undone.
          </p>
          {selectedMilestone && (
            <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <p className="font-medium">{selectedMilestone.name}</p>
              <p className="text-sm text-neutral-500">
                {selectedMilestone.description}
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
    </div>
  );
};

export default MilestoneList;
