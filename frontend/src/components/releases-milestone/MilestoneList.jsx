// src/components/releases-milestone/MilestoneList.jsx

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
import useReleasesMilestone from "./useReleasesMilestone";
import {
  MILESTONE_STATUSES,
  MILESTONE_PRIORITIES,
  getMilestoneStatus,
  getMilestonePriority,
} from "./ReleasesMilestoneConstants";

const MilestoneList = () => {
  const {
    milestones,
    milestonesLoading,
    milestonesError,
    milestonePagination,
    milestoneFilters,
    milestoneSortBy,
    milestoneSortOrder,
    milestoneStatistics,
    overdueMilestones,
    deleteMilestone,
    updateMilestoneStatus,
    updateMilestoneFilters,
    resetMilestoneFilters,
    changeMilestonePage,
    changeMilestoneLimit,
    changeMilestoneSort,
    navigateToMilestoneDetail,
    navigateToNewMilestone,
    bulkUpdateMilestones,
  } = useReleasesMilestone();

  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [bulkProgress, setBulkProgress] = useState(0);

  // Table headers
  const headers = [
    { key: "name", label: "Name", sortable: true },
    { key: "status", label: "Status", sortable: true },
    { key: "priority", label: "Priority", sortable: false },
    { key: "target_date", label: "Target Date", sortable: true },
    { key: "progress", label: "Progress", sortable: true },
    { key: "days_until_target", label: "Days Left", sortable: false },
    { key: "actions", label: "Actions", sortable: false },
  ];

  // Handle search
  const handleSearch = (value) => {
    setSearchQuery(value);
    updateMilestoneFilters({ search: value });
  };

  // Handle delete
  const handleDelete = async () => {
    if (selectedMilestone) {
      try {
        await deleteMilestone(selectedMilestone.id);
        setShowDeleteModal(false);
        setSelectedMilestone(null);
      } catch (err) {
        // Error is handled by the hook
      }
    }
  };

  // Handle status update
  const handleStatusUpdate = async () => {
    if (selectedMilestone && newStatus) {
      try {
        await updateMilestoneStatus(selectedMilestone.id, newStatus);
        setShowStatusModal(false);
        setSelectedMilestone(null);
        setNewStatus("");
      } catch (err) {
        // Error is handled by the hook
      }
    }
  };

  // Handle bulk update
  const handleBulkUpdate = async () => {
    try {
      const updates = milestones
        .filter((m) => m.status !== "completed")
        .map((m) => ({
          id: m.id,
          progress_percentage: Math.min(
            m.progress_percentage + bulkProgress,
            100
          ),
        }));

      await bulkUpdateMilestones(updates);
      setShowBulkUpdateModal(false);
      setBulkProgress(0);
    } catch (err) {
      // Error is handled by the hook
    }
  };

  // Render status badge
  const renderStatusBadge = (status) => {
    const statusInfo = getMilestoneStatus(status);
    return (
      <Badge
        variant="secondary"
        style={{
          backgroundColor: statusInfo.color + "20",
          color: statusInfo.color,
        }}
        className="flex items-center gap-1"
      >
        <span>{statusInfo.icon}</span>
        <span>{statusInfo.label}</span>
      </Badge>
    );
  };

  // Render priority badge
  const renderPriorityBadge = (priority) => {
    const priorityInfo = getMilestonePriority(priority);
    return (
      <Badge
        variant="secondary"
        style={{
          backgroundColor: priorityInfo.color + "20",
          color: priorityInfo.color,
        }}
        className="text-xs"
      >
        {priorityInfo.label}
      </Badge>
    );
  };

  // Render progress
  const renderProgress = (progress) => {
    return (
      <div className="flex items-center gap-2">
        <ProgressBar
          value={progress}
          max={100}
          variant={
            progress >= 80 ? "success" : progress >= 50 ? "warning" : "primary"
          }
          size="sm"
          className="w-24"
        />
        <span className="text-xs font-medium">{progress}%</span>
      </div>
    );
  };

  // Check if milestone is overdue
  const isOverdue = (milestone) => {
    if (milestone.status === "completed") return false;
    if (!milestone.days_until_target) return false;
    return milestone.days_until_target < 0;
  };

  // Loading state
  if (milestonesLoading && !milestones.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Error state
  if (milestonesError && !milestones.length) {
    return (
      <div className="p-6">
        <Alert variant="error" title="Error loading milestones">
          {milestonesError}
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Milestones</h1>
          {milestoneStatistics && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Total: {milestoneStatistics.total} milestones · Completed:{" "}
              {milestoneStatistics.completedCount || 0} · Overdue:{" "}
              {milestoneStatistics.overdueCount || 0}
            </p>
          )}
          {overdueMilestones && overdueMilestones.length > 0 && (
            <Alert variant="warning" className="mt-2 text-sm">
              ⚠️ {overdueMilestones.length} milestone(s) are overdue!
            </Alert>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowBulkUpdateModal(true)}
          >
            <IconWrapper icon="📊" size="sm" />
            Bulk Update
          </Button>
          <Button variant="primary" onClick={navigateToNewMilestone}>
            <IconWrapper icon="➕" size="sm" />
            New Milestone
          </Button>
        </div>
      </div>

      {/* Filters */}
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
            value={milestoneFilters.status}
            onChange={(e) => updateMilestoneFilters({ status: e.target.value })}
          >
            <option value="">All Statuses</option>
            {MILESTONE_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.icon} {status.label}
              </option>
            ))}
          </select>
          <select
            className="px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={milestoneFilters.priority}
            onChange={(e) =>
              updateMilestoneFilters({ priority: e.target.value })
            }
          >
            <option value="">All Priorities</option>
            {MILESTONE_PRIORITIES.map((priority) => (
              <option key={priority.value} value={priority.value}>
                {priority.label}
              </option>
            ))}
          </select>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetMilestoneFilters}
            className="text-neutral-500"
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Table */}
      {milestones.length > 0 ? (
        <>
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
                  isOverdue(milestone) ? "bg-red-50 dark:bg-red-900/10" : ""
                }`}
                onClick={() => navigateToMilestoneDetail(milestone.id)}
              >
                <td className="px-4 py-3 text-sm font-medium">
                  {milestone.name}
                  {isOverdue(milestone) && (
                    <span className="ml-2 text-xs text-error">⚠️ Overdue</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {renderStatusBadge(milestone.status)}
                </td>
                <td className="px-4 py-3">
                  {renderPriorityBadge(milestone.priority)}
                </td>
                <td className="px-4 py-3 text-sm">
                  {milestone.target_date || "-"}
                </td>
                <td className="px-4 py-3">
                  {renderProgress(milestone.progress_percentage)}
                </td>
                <td className="px-4 py-3 text-sm">
                  {milestone.days_until_target !== undefined &&
                  milestone.days_until_target !== null
                    ? milestone.days_until_target >= 0
                      ? `${milestone.days_until_target} days`
                      : `${Math.abs(milestone.days_until_target)} days overdue`
                    : "-"}
                </td>
                <td className="px-4 py-3">
                  <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Dropdown
                      trigger={
                        <Button variant="ghost" size="sm">
                          <IconWrapper icon="⚙️" size="sm" />
                        </Button>
                      }
                      align="right"
                    >
                      <DropdownItem
                        onClick={() => {
                          setSelectedMilestone(milestone);
                          setShowStatusModal(true);
                        }}
                      >
                        Update Status
                      </DropdownItem>
                      <DropdownItem
                        onClick={() => navigateToMilestoneDetail(milestone.id)}
                      >
                        View Details
                      </DropdownItem>
                      <DropdownItem
                        onClick={() => navigateToMilestoneEdit(milestone.id)}
                      >
                        Edit
                      </DropdownItem>
                      <DropdownItem
                        className="text-error"
                        onClick={() => {
                          setSelectedMilestone(milestone);
                          setShowDeleteModal(true);
                        }}
                      >
                        Delete
                      </DropdownItem>
                    </Dropdown>
                  </div>
                </td>
              </tr>
            )}
          </Table>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-sm text-neutral-500 dark:text-neutral-400">
              Showing {milestones.length} of{" "}
              {milestonePagination.total || milestones.length} milestones
            </div>
            <Pagination
              currentPage={milestonePagination.page}
              totalPages={
                milestonePagination.totalPages ||
                Math.ceil(
                  (milestonePagination.total || 0) / milestonePagination.limit
                )
              }
              onPageChange={changeMilestonePage}
              showFirstLast
            />
          </div>
        </>
      ) : (
        <EmptyState
          title="No milestones found"
          description="Start tracking your project progress by creating your first milestone."
          action={
            <Button variant="primary" onClick={navigateToNewMilestone}>
              <IconWrapper icon="➕" size="sm" />
              New Milestone
            </Button>
          }
        />
      )}

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
                Status: {getMilestoneStatus(selectedMilestone.status).label}
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

      {/* Status Update Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Update Milestone Status"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Select the new status for this milestone.
          </p>
          {selectedMilestone && (
            <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <p className="font-medium">{selectedMilestone.name}</p>
              <p className="text-sm text-neutral-500">
                Current: {getMilestoneStatus(selectedMilestone.status).label}
              </p>
            </div>
          )}
          <select
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
          >
            <option value="">Select status...</option>
            {MILESTONE_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.icon} {status.label}
              </option>
            ))}
          </select>
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowStatusModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleStatusUpdate}
              disabled={!newStatus}
            >
              Update Status
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bulk Update Modal */}
      <Modal
        isOpen={showBulkUpdateModal}
        onClose={() => setShowBulkUpdateModal(false)}
        title="Bulk Update Progress"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Update progress for all non-completed milestones by the specified
            percentage.
          </p>
          <div>
            <label className="block text-sm font-medium mb-1">
              Progress Increase (%)
            </label>
            <Input
              type="number"
              min="0"
              max="100"
              value={bulkProgress}
              onChange={(e) => setBulkProgress(parseInt(e.target.value) || 0)}
              fullWidth
            />
            <p className="text-xs text-neutral-500 mt-1">
              Will update{" "}
              {milestones.filter((m) => m.status !== "completed").length}{" "}
              milestones
            </p>
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => setShowBulkUpdateModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleBulkUpdate}
              disabled={bulkProgress <= 0}
            >
              Update All
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MilestoneList;
