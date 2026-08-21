// src/components/releases-milestone/ReleaseList.jsx

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
} from "../common";
import useReleasesMilestone from "./useReleasesMilestone";
import {
  RELEASE_STATUSES,
  getReleaseStatus,
  getReadinessLevel,
} from "./ReleasesMilestoneConstants";

const ReleaseList = () => {
  const {
    releases,
    releasesLoading,
    releasesError,
    releasePagination,
    releaseFilters,
    releaseSortBy,
    releaseSortOrder,
    releaseStatistics,
    deleteRelease,
    updateReleaseStatus,
    updateReleaseFilters,
    resetReleaseFilters,
    changeReleasePage,
    changeReleaseLimit,
    changeReleaseSort,
    navigateToReleaseDetail,
    navigateToNewRelease,
    projectId,
  } = useReleasesMilestone();

  const [selectedRelease, setSelectedRelease] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Table headers
  const headers = [
    { key: "version", label: "Version", sortable: true },
    { key: "description", label: "Description", sortable: true },
    { key: "status", label: "Status", sortable: true },
    { key: "release_date", label: "Release Date", sortable: true },
    { key: "progress", label: "Progress", sortable: false },
    { key: "readiness", label: "Readiness", sortable: false },
    { key: "actions", label: "Actions", sortable: false },
  ];

  // Handle search
  const handleSearch = (value) => {
    setSearchQuery(value);
    updateReleaseFilters({ search: value });
  };

  // Handle delete
  const handleDelete = async () => {
    if (selectedRelease) {
      try {
        await deleteRelease(selectedRelease.id);
        setShowDeleteModal(false);
        setSelectedRelease(null);
      } catch (err) {
        // Error is handled by the hook
      }
    }
  };

  // Handle status update
  const handleStatusUpdate = async () => {
    if (selectedRelease && newStatus) {
      try {
        await updateReleaseStatus(selectedRelease.id, newStatus);
        setShowStatusModal(false);
        setSelectedRelease(null);
        setNewStatus("");
      } catch (err) {
        // Error is handled by the hook
      }
    }
  };

  // Render status badge
  const renderStatusBadge = (status) => {
    const statusInfo = getReleaseStatus(status);
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

  // Render progress bar
  const renderProgress = (progress) => {
    if (!progress) return "-";
    return (
      <div className="flex items-center gap-2">
        <div className="w-24 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 rounded-full transition-all duration-300"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
        <span className="text-xs font-medium">{progress.percentage}%</span>
      </div>
    );
  };

  // Render readiness badge
  const renderReadiness = (progress) => {
    if (!progress) return "-";
    const readiness = getReadinessLevel(progress.readiness);
    return (
      <Badge
        variant="secondary"
        style={{
          backgroundColor: readiness.color + "20",
          color: readiness.color,
        }}
        className="text-xs"
      >
        {readiness.label}
      </Badge>
    );
  };

  // Loading state
  if (releasesLoading && !releases.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Error state
  if (releasesError && !releases.length) {
    return (
      <div className="p-6">
        <Alert variant="error" title="Error loading releases">
          {releasesError}
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Releases</h1>
          {releaseStatistics && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Total: {releaseStatistics.total} releases · Released:{" "}
              {releaseStatistics.byStatus?.released || 0} · In Progress:{" "}
              {releaseStatistics.byStatus?.in_progress || 0}
            </p>
          )}
        </div>
        <Button variant="primary" onClick={navigateToNewRelease}>
          <IconWrapper icon="➕" size="sm" />
          New Release
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 w-full sm:w-auto">
          <SearchBar
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search releases..."
            fullWidth
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={releaseFilters.status}
            onChange={(e) => updateReleaseFilters({ status: e.target.value })}
          >
            <option value="">All Statuses</option>
            {RELEASE_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.icon} {status.label}
              </option>
            ))}
          </select>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetReleaseFilters}
            className="text-neutral-500"
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Table */}
      {releases.length > 0 ? (
        <>
          <Table
            headers={headers}
            data={releases}
            variant="striped"
            className="overflow-x-auto"
          >
            {(release) => (
              <tr
                key={release.id}
                className="hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer"
                onClick={() => navigateToReleaseDetail(release.id)}
              >
                <td className="px-4 py-3 text-sm font-mono font-medium">
                  v{release.version}
                </td>
                <td className="px-4 py-3 text-sm max-w-xs truncate">
                  {release.description || "-"}
                </td>
                <td className="px-4 py-3">
                  {renderStatusBadge(release.status)}
                </td>
                <td className="px-4 py-3 text-sm">
                  {release.release_date || "-"}
                </td>
                <td className="px-4 py-3">
                  {renderProgress(release.readiness)}
                </td>
                <td className="px-4 py-3">
                  {renderReadiness(release.readiness)}
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
                          setSelectedRelease(release);
                          setShowStatusModal(true);
                        }}
                      >
                        Update Status
                      </DropdownItem>
                      <DropdownItem
                        onClick={() => navigateToReleaseDetail(release.id)}
                      >
                        View Details
                      </DropdownItem>
                      <DropdownItem
                        onClick={() => navigateToReleaseEdit(release.id)}
                      >
                        Edit
                      </DropdownItem>
                      <DropdownItem
                        className="text-error"
                        onClick={() => {
                          setSelectedRelease(release);
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
              Showing {releases.length} of{" "}
              {releasePagination.total || releases.length} releases
            </div>
            <Pagination
              currentPage={releasePagination.page}
              totalPages={
                releasePagination.totalPages ||
                Math.ceil(
                  (releasePagination.total || 0) / releasePagination.limit
                )
              }
              onPageChange={changeReleasePage}
              showFirstLast
            />
          </div>
        </>
      ) : (
        <EmptyState
          title="No releases found"
          description="Start planning your project releases by creating your first release."
          action={
            <Button variant="primary" onClick={navigateToNewRelease}>
              <IconWrapper icon="➕" size="sm" />
              New Release
            </Button>
          }
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Release"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-neutral-600 dark:text-neutral-400">
            Are you sure you want to delete this release? This action cannot be
            undone.
          </p>
          {selectedRelease && (
            <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <p className="font-medium">v{selectedRelease.version}</p>
              <p className="text-sm text-neutral-500">
                {selectedRelease.description || "No description"}
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
        title="Update Release Status"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Select the new status for this release.
          </p>
          {selectedRelease && (
            <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <p className="font-medium">v{selectedRelease.version}</p>
              <p className="text-sm text-neutral-500">
                Current: {getReleaseStatus(selectedRelease.status).label}
              </p>
            </div>
          )}
          <select
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
          >
            <option value="">Select status...</option>
            {RELEASE_STATUSES.map((status) => (
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
    </div>
  );
};

export default ReleaseList;
