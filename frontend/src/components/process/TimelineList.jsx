// src/components/process/TimelineList.jsx

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
  ProgressBar,
  IconWrapper,
  Breadcrumb,
} from "../common";
import useProcess from "./useProcess";
import {
  getProgressStatus,
  getStatusClass,
  getStatusIcon,
  getStatusLabel,
  SORT_OPTIONS,
  SORT_ORDER_OPTIONS,
} from "./ProcessConstants";

const TimelineList = () => {
  const {
    timelineEntries,
    loading,
    error,
    pagination,
    filters,
    sortBy,
    sortOrder,
    deleteTimelineEntry,
    updateFilters,
    resetFilters,
    changePage,
    changeLimit,
    changeSort,
    navigateToDetail,
    navigateToEdit,
    navigateToNew,
    hasEntries,
    totalProgress,
    averageProgress,
    completedFeatures,
    projectId,
  } = useProcess();

  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Table headers
  const headers = [
    { key: "month_year", label: "Month", sortable: true },
    { key: "feature_name", label: "Feature", sortable: true },
    { key: "progress_percentage", label: "Progress", sortable: true },
    { key: "status", label: "Status", sortable: false },
    { key: "actions", label: "Actions", sortable: false },
  ];

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Process", href: "/process" },
    { label: "Timeline", href: "" },
  ];

  // Handle search
  const handleSearch = (value) => {
    setSearchQuery(value);
    updateFilters({ feature_name: value });
  };

  // Handle delete
  const handleDelete = async () => {
    if (selectedEntry) {
      try {
        await deleteTimelineEntry(selectedEntry.id);
        setShowDeleteModal(false);
        setSelectedEntry(null);
      } catch (err) {
        // Error is handled by the hook
      }
    }
  };

  // Handle sort change
  const handleSortChange = (key) => {
    const newOrder = sortBy === key && sortOrder === "asc" ? "desc" : "asc";
    changeSort(key, newOrder);
  };

  // Format month display
  const formatMonth = (monthYear) => {
    if (!monthYear) return "";
    const date = new Date(monthYear);
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  // Render progress with bar
  const renderProgress = (percentage) => {
    const status = getProgressStatus(percentage);
    return (
      <div className="flex items-center gap-2 min-w-[120px]">
        <ProgressBar
          value={percentage}
          max={100}
          variant={status.class}
          size="sm"
          className="flex-1"
        />
        <span className="text-xs font-medium whitespace-nowrap">
          {percentage}%
        </span>
      </div>
    );
  };

  // Render status badge
  const renderStatusBadge = (percentage) => {
    const status = getProgressStatus(percentage);
    return (
      <Badge variant={status.class} className="flex items-center gap-1">
        <span>{status.icon}</span>
        <span>{status.label}</span>
      </Badge>
    );
  };

  // Loading state
  if (loading && !timelineEntries.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Error state
  if (error && !timelineEntries.length) {
    return (
      <div className="p-6">
        <Alert variant="error" title="Error loading timeline">
          {error}
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} separator="›" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Project Timeline</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Track feature progress and milestones
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="primary" onClick={navigateToNew}>
            <IconWrapper icon="➕" size="sm" />
            Add Entry
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {hasEntries && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Total Entries
            </p>
            <p className="text-2xl font-bold">{timelineEntries.length}</p>
          </div>
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Average Progress
            </p>
            <p className="text-2xl font-bold text-primary-500">
              {averageProgress}%
            </p>
          </div>
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Completed
            </p>
            <p className="text-2xl font-bold text-success">
              {completedFeatures}
            </p>
          </div>
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-4">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Completion Rate
            </p>
            <p className="text-2xl font-bold">
              {timelineEntries.length > 0
                ? Math.round((completedFeatures / timelineEntries.length) * 100)
                : 0}
              %
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 w-full sm:w-auto">
          <SearchBar
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search by feature name..."
            fullWidth
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={sortBy}
            onChange={(e) => {
              changeSort(e.target.value, sortOrder);
            }}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                Sort by {opt.label}
              </option>
            ))}
          </select>
          <select
            className="px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={sortOrder}
            onChange={(e) => {
              changeSort(sortBy, e.target.value);
            }}
          >
            {SORT_ORDER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
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
      {hasEntries ? (
        <>
          <div className="overflow-x-auto">
            <Table headers={headers} data={timelineEntries} variant="striped">
              {(entry) => (
                <tr
                  key={entry.id}
                  className="hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer"
                  onClick={() => navigateToDetail(entry.id)}
                >
                  <td className="px-4 py-3 text-sm font-medium">
                    {formatMonth(entry.month_year)}
                  </td>
                  <td className="px-4 py-3 text-sm max-w-xs truncate">
                    {entry.feature_name}
                  </td>
                  <td className="px-4 py-3">
                    {renderProgress(entry.progress_percentage)}
                  </td>
                  <td className="px-4 py-3">
                    {renderStatusBadge(entry.progress_percentage)}
                  </td>
                  <td className="px-4 py-3">
                    <div
                      className="flex items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigateToEdit(entry.id)}
                      >
                        ✏️
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-error hover:bg-error/10"
                        onClick={() => {
                          setSelectedEntry(entry);
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
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-sm text-neutral-500 dark:text-neutral-400">
              Showing {timelineEntries.length} of{" "}
              {pagination.total || timelineEntries.length} entries
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
          title="No timeline entries found"
          description="Start tracking your project progress by adding your first timeline entry."
          action={
            <Button variant="primary" onClick={navigateToNew}>
              <IconWrapper icon="➕" size="sm" />
              Add Entry
            </Button>
          }
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Timeline Entry"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-neutral-600 dark:text-neutral-400">
            Are you sure you want to delete this timeline entry? This action
            cannot be undone.
          </p>
          {selectedEntry && (
            <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <p className="font-medium">{selectedEntry.feature_name}</p>
              <p className="text-sm text-neutral-500">
                {formatMonth(selectedEntry.month_year)} ·{" "}
                {selectedEntry.progress_percentage}% complete
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

export default TimelineList;
