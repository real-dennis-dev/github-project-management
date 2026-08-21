// src/components/subscriptions/ReleaseList.jsx

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
} from "../common";
import useSubscriptions from "./useSubscriptions";
import {
  RELEASE_STATUSES,
  getReleaseStatus,
  getStatusBadgeVariant,
  formatDate,
  formatVersion,
} from "./SubscriptionsConstants";

const ReleaseList = () => {
  const {
    releases,
    loading,
    error,
    pagination,
    filters,
    deleteRelease,
    updateReleaseStatus,
    updateFilters,
    resetFilters,
    changePage,
    changeLimit,
    navigateToRelease,
    navigateToReleaseEdit,
    navigateToReleaseProgress,
    navigateToNewRelease,
    generateChangelog,
  } = useSubscriptions();

  const [selectedRelease, setSelectedRelease] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [generatingChangelog, setGeneratingChangelog] = useState(false);

  // Table headers
  const headers = [
    { key: "version", label: "Version", sortable: true },
    { key: "description", label: "Description", sortable: true },
    { key: "status", label: "Status", sortable: true },
    { key: "release_date", label: "Release Date", sortable: true },
    { key: "features", label: "Features", sortable: false },
    { key: "actions", label: "Actions", sortable: false },
  ];

  // Handle search
  const handleSearch = (value) => {
    setSearchQuery(value);
    updateFilters({ search: value });
  };

  // Handle status change
  const handleStatusChange = async (releaseId, status) => {
    try {
      await updateReleaseStatus(releaseId, status);
      setShowStatusModal(false);
      setSelectedRelease(null);
    } catch (err) {
      // Error handled by hook
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (selectedRelease) {
      try {
        await deleteRelease(selectedRelease.id);
        setShowDeleteModal(false);
        setSelectedRelease(null);
      } catch (err) {
        // Error handled by hook
      }
    }
  };

  // Handle changelog generation
  const handleGenerateChangelog = async (releaseId) => {
    setGeneratingChangelog(true);
    try {
      const data = await generateChangelog(releaseId);
      // Display changelog in a modal or download
      alert("Changelog generated:\n\n" + data.changelog);
    } catch (err) {
      // Error handled by hook
    } finally {
      setGeneratingChangelog(false);
    }
  };

  // Render status badge
  const renderStatusBadge = (status) => {
    const statusInfo = getReleaseStatus(status);
    return (
      <Badge variant={getStatusBadgeVariant(status)} size="sm">
        <span className="flex items-center gap-1">
          <span>{statusInfo.icon}</span>
          <span>{statusInfo.label}</span>
        </span>
      </Badge>
    );
  };

  // Render actions dropdown
  const renderActions = (release) => {
    return (
      <Dropdown
        trigger={
          <Button variant="ghost" size="sm">
            ⋮
          </Button>
        }
        align="right"
      >
        <DropdownItem onClick={() => navigateToRelease(release.id)}>
          <IconWrapper icon="👁️" size="sm" /> View
        </DropdownItem>
        <DropdownItem onClick={() => navigateToReleaseEdit(release.id)}>
          <IconWrapper icon="✏️" size="sm" /> Edit
        </DropdownItem>
        <DropdownItem onClick={() => navigateToReleaseProgress(release.id)}>
          <IconWrapper icon="📊" size="sm" /> Progress
        </DropdownItem>
        <DropdownItem
          onClick={() => {
            setSelectedRelease(release);
            setShowStatusModal(true);
          }}
        >
          <IconWrapper icon="🔄" size="sm" /> Change Status
        </DropdownItem>
        <DropdownItem onClick={() => handleGenerateChangelog(release.id)}>
          <IconWrapper icon="📝" size="sm" /> Generate Changelog
        </DropdownItem>
        <DropdownItem
          onClick={() => {
            setSelectedRelease(release);
            setShowDeleteModal(true);
          }}
          className="text-error hover:bg-error/10"
        >
          <IconWrapper icon="🗑️" size="sm" /> Delete
        </DropdownItem>
      </Dropdown>
    );
  };

  if (loading && !releases.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error && !releases.length) {
    return (
      <div className="p-6">
        <Alert variant="error" title="Error loading releases">
          {error}
        </Alert>
      </div>
    );
  }

  if (!releases.length) {
    return (
      <div className="p-6">
        <EmptyState
          title="No releases found"
          description="Create your first release to track versions and features for your project."
          icon="📦"
          action={
            <Button variant="primary" onClick={navigateToNewRelease}>
              <IconWrapper icon="➕" size="sm" />
              Create Release
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
          <h1 className="text-2xl font-bold">Releases</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {releases.length} releases found
          </p>
        </div>
        <Button variant="primary" onClick={navigateToNewRelease}>
          <IconWrapper icon="➕" size="sm" />
          Create Release
        </Button>
      </div>

      {/* Search and Filters */}
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
            value={filters.status}
            onChange={(e) => updateFilters({ status: e.target.value })}
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
        data={releases}
        variant="striped"
        className="overflow-x-auto"
      >
        {(release) => (
          <tr
            key={release.id}
            className="hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer"
            onClick={() => navigateToRelease(release.id)}
          >
            <td className="px-4 py-3">
              <span className="font-mono font-medium text-primary-500">
                {formatVersion(release.version)}
              </span>
            </td>
            <td className="px-4 py-3">
              <p className="truncate max-w-xs">{release.description || "-"}</p>
            </td>
            <td className="px-4 py-3">{renderStatusBadge(release.status)}</td>
            <td className="px-4 py-3 text-sm text-neutral-500">
              {release.release_date ? formatDate(release.release_date) : "-"}
            </td>
            <td className="px-4 py-3">
              <span className="text-sm text-neutral-500">
                {release.features?.length || 0} features
              </span>
            </td>
            <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
              {renderActions(release)}
            </td>
          </tr>
        )}
      </Table>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-sm text-neutral-500 dark:text-neutral-400">
            Showing {releases.length} of {pagination.total || releases.length}{" "}
            releases
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
        title="Change Release Status"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Select a new status for {selectedRelease?.version}:
          </p>
          <div className="grid grid-cols-2 gap-2">
            {RELEASE_STATUSES.map((status) => (
              <button
                key={status.value}
                className={`p-3 rounded-lg border-2 text-sm transition-all ${
                  selectedRelease?.status === status.value
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                    : "border-neutral-200 dark:border-neutral-700 hover:border-primary-300"
                }`}
                onClick={() =>
                  handleStatusChange(selectedRelease?.id, status.value)
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
              <p className="font-medium">
                {formatVersion(selectedRelease.version)}
              </p>
              <p className="text-sm text-neutral-500">
                {selectedRelease.description}
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

      {/* Changelog generating indicator */}
      {generatingChangelog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-xl flex flex-col items-center gap-4">
            <LoadingSpinner size="lg" />
            <p className="text-sm font-medium">Generating changelog...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReleaseList;
