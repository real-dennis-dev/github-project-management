// src/components/tech-debt/TechDebtList.jsx

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
import useTechDebt from "./useTechDebt";
import {
  PRIORITIES,
  STATUSES,
  getPriority,
  getPriorityLabel,
  getPriorityColor,
  getPriorityIcon,
  getStatus,
  getStatusLabel,
  getStatusColor,
  getStatusIcon,
} from "./TechDebtConstants";

const TechDebtList = () => {
  const {
    items,
    loading,
    error,
    pagination,
    filters,
    sortBy,
    sortOrder,
    deleteItem,
    updateStatus,
    updateFilters,
    resetFilters,
    changePage,
    changeLimit,
    changeSort,
    navigateToDetail,
    navigateToEdit,
    navigateToNew,
    navigateToDashboard,
    exportItems,
    hasItems,
    getPriorityColor,
    getPriorityIcon,
    getPriorityLabel,
    getStatusColor,
    getStatusIcon,
    getStatusLabel,
  } = useTechDebt();

  const [selectedItem, setSelectedItem] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Table headers
  const headers = [
    { key: "priority", label: "Priority", sortable: true },
    { key: "title", label: "Title", sortable: true },
    { key: "status", label: "Status", sortable: true },
    { key: "estimated_effort_hours", label: "Effort (hrs)", sortable: true },
    { key: "created_at", label: "Created", sortable: true },
    { key: "actions", label: "Actions", sortable: false },
  ];

  // Handle search
  const handleSearch = (value) => {
    setSearchQuery(value);
    updateFilters({ search: value });
  };

  // Handle delete
  const handleDelete = async () => {
    if (selectedItem) {
      try {
        await deleteItem(selectedItem.id);
        setShowDeleteModal(false);
        setSelectedItem(null);
      } catch (err) {
        // Error is handled by the hook
      }
    }
  };

  // Handle status update
  const handleStatusUpdate = async (status) => {
    if (selectedItem) {
      try {
        await updateStatus(selectedItem.id, status);
        setShowStatusModal(false);
        setSelectedItem(null);
      } catch (err) {
        // Error is handled by the hook
      }
    }
  };

  // Handle export
  const handleExport = async (format) => {
    setExporting(true);
    try {
      const data = await exportItems(format);

      if (format === "json") {
        // Download as JSON
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `tech_debt_${new Date().toISOString().split("T")[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (format === "csv") {
        // Download as CSV
        const csvContent = convertToCSV(data.items || []);
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `tech_debt_${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      // Error is handled by the hook
    } finally {
      setExporting(false);
    }
  };

  // Convert items to CSV
  const convertToCSV = (data) => {
    if (!data || data.length === 0) return "";
    const headers = [
      "Title",
      "Description",
      "Priority",
      "Status",
      "Reason",
      "Impact",
      "Estimated Effort (hrs)",
      "Created At",
    ];
    const rows = data.map((item) => [
      item.title,
      item.description,
      getPriorityLabel(item.priority),
      getStatusLabel(item.status),
      item.reason || "",
      item.impact || "",
      item.estimated_effort_hours || 0,
      new Date(item.created_at).toLocaleDateString(),
    ]);
    return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  };

  // Render priority badge
  const renderPriorityBadge = (priority) => {
    const color = getPriorityColor(priority);
    const icon = getPriorityIcon(priority);
    const label = getPriorityLabel(priority);
    return (
      <Badge
        variant="secondary"
        className="flex items-center gap-1"
        style={{ backgroundColor: color + "20", color: color }}
      >
        <span>{icon}</span>
        <span>{label}</span>
      </Badge>
    );
  };

  // Render status badge
  const renderStatusBadge = (status) => {
    const color = getStatusColor(status);
    const icon = getStatusIcon(status);
    const label = getStatusLabel(status);
    return (
      <Badge
        variant="secondary"
        className="flex items-center gap-1"
        style={{ backgroundColor: color + "20", color: color }}
      >
        <span>{icon}</span>
        <span>{label}</span>
      </Badge>
    );
  };

  // Render effort
  const renderEffort = (hours) => {
    if (!hours && hours !== 0) return "-";
    return <span className="text-sm">{hours}h</span>;
  };

  // Render date
  const renderDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Loading state
  if (loading && !items.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Error state
  if (error && !items.length) {
    return (
      <div className="p-6">
        <Alert variant="error" title="Error loading tech debt items">
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
          <h1 className="text-2xl font-bold">Technical Debt</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Track and manage technical debt items
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={navigateToDashboard}>
            <IconWrapper icon="📊" size="sm" />
            Dashboard
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
            Add Tech Debt
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 w-full sm:w-auto">
          <SearchBar
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search by title or description..."
            fullWidth
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={filters.priority}
            onChange={(e) => updateFilters({ priority: e.target.value })}
          >
            <option value="">All Priorities</option>
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.icon} {p.label}
              </option>
            ))}
          </select>
          <select
            className="px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={filters.status}
            onChange={(e) => updateFilters({ status: e.target.value })}
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.icon} {s.label}
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
      {hasItems ? (
        <>
          <Table
            headers={headers}
            data={items}
            variant="striped"
            className="overflow-x-auto"
          >
            {(item) => (
              <tr
                key={item.id}
                className="hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer"
                onClick={() => navigateToDetail(item.id)}
              >
                <td className="px-4 py-3">
                  {renderPriorityBadge(item.priority)}
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate max-w-xs">
                      {item.description}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3">{renderStatusBadge(item.status)}</td>
                <td className="px-4 py-3">
                  {renderEffort(item.estimated_effort_hours)}
                </td>
                <td className="px-4 py-3 text-sm text-neutral-500">
                  {renderDate(item.created_at)}
                </td>
                <td className="px-4 py-3">
                  <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedItem(item);
                        setShowStatusModal(true);
                      }}
                    >
                      🔄
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigateToEdit(item.id)}
                    >
                      ✏️
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-error hover:bg-error/10"
                      onClick={() => {
                        setSelectedItem(item);
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
              Showing {items.length} of {pagination.total || items.length} items
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
          title="No tech debt items found"
          description="Start tracking technical debt by adding your first item."
          action={
            <Button variant="primary" onClick={navigateToNew}>
              <IconWrapper icon="➕" size="sm" />
              Add Tech Debt
            </Button>
          }
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Tech Debt Item"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-neutral-600 dark:text-neutral-400">
            Are you sure you want to delete this tech debt item? This action
            cannot be undone.
          </p>
          {selectedItem && (
            <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <p className="font-medium">{selectedItem.title}</p>
              <div className="flex items-center gap-2 mt-1">
                {renderPriorityBadge(selectedItem.priority)}
                {renderStatusBadge(selectedItem.status)}
              </div>
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
        title="Update Status"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Select a new status for:{" "}
            <span className="font-medium">{selectedItem?.title}</span>
          </p>
          <div className="space-y-2">
            {STATUSES.map((status) => (
              <button
                key={status.value}
                className="w-full text-left px-4 py-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors flex items-center gap-2"
                onClick={() => handleStatusUpdate(status.value)}
              >
                <span>{status.icon}</span>
                <span>{status.label}</span>
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* Export loading overlay */}
      {exporting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-xl flex flex-col items-center gap-4">
            <LoadingSpinner size="lg" />
            <p className="text-sm font-medium">Exporting tech debt items...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechDebtList;
