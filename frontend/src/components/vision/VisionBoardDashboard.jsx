// src/components/vision/VisionBoardDashboard.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useVision } from "../../hooks/useVision";
import { useToast } from "../../hooks/useToast";
import {
  Button,
  LoadingSpinner,
  Alert,
  Badge,
  Modal,
  SearchBar,
  Select,
  ProgressBar,
} from "../common";
import VisionStatistics from "./VisionStatistics";
import VisionGoalCard from "./VisionGoalCard";
import VisionGoalForm from "./VisionGoalForm";
import VisionCategoryFilter from "./VisionCategoryFilter";
import {
  Plus,
  Eye,
  LayoutGrid,
  List,
  Filter,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Target,
  Clock,
  CheckCircle,
  FileText,
  BarChart3,
  Download,
  Trash2,
  Edit,
  MoreVertical,
  AlertCircle,
  Calendar,
  Link as LinkIcon,
  FolderKanban,
  Activity,
} from "lucide-react";

const VisionBoardDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    goals,
    statistics,
    categories,
    options,
    isLoading,
    error,
    clearError,
    pagination,
    filters,
    viewMode,
    selectedGoalIds,
    isGoalsLoading,
    isStatisticsLoading,
    getGoals,
    getStatistics,
    getCategories,
    getOptions,
    getDashboard,
    setFilters,
    setViewMode,
    toggleGoalSelection,
    clearSelection,
    deleteGoal,
    bulkDeleteGoals,
    bulkUpdateStatus,
    exportGoals,
  } = useVision();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState("json");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("priority");
  const [sortOrder, setSortOrder] = useState("DESC");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isExporting, setIsExporting] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadDashboard = async () => {
      await getDashboard();
    };
    loadDashboard();
  }, []);

  // Load goals when filters change
  useEffect(() => {
    const params = {
      ...filters,
      page,
      limit: 12,
      sortBy,
      sortOrder,
    };
    if (selectedStatus !== "all") {
      params.status = selectedStatus;
    }
    getGoals(params);
  }, [page, filters, sortBy, sortOrder, selectedStatus]);

  // Refresh statistics periodically
  useEffect(() => {
    const interval = setInterval(() => {
      getStatistics();
    }, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setFilters({ ...filters, search: value || undefined });
    setPage(1);
  };

  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "DESC" ? "ASC" : "DESC");
    } else {
      setSortBy(field);
      setSortOrder("DESC");
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleGoalCreated = () => {
    setShowCreateModal(false);
    getGoals({ ...filters, page, limit: 12 });
    getStatistics();
    toast.success("Vision goal created successfully");
  };

  const handleBulkStatusUpdate = async (status) => {
    if (selectedGoalIds.length === 0) return;
    try {
      await bulkUpdateStatus(selectedGoalIds, status);
      toast.success(`Updated ${selectedGoalIds.length} goals to ${status}`);
      clearSelection();
    } catch (err) {
      toast.error(err.message || "Failed to update status");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedGoalIds.length === 0) return;
    if (
      window.confirm(
        `Are you sure you want to delete ${selectedGoalIds.length} selected goals?`
      )
    ) {
      try {
        await bulkDeleteGoals(selectedGoalIds);
        toast.success(`Deleted ${selectedGoalIds.length} goals`);
        clearSelection();
      } catch (err) {
        toast.error(err.message || "Failed to delete selected goals");
      }
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await exportGoals(exportFormat, {
        ...filters,
        status: selectedStatus !== "all" ? selectedStatus : undefined,
      });
      // Handle download
      const blob = new Blob([JSON.stringify(result.data, null, 2)], {
        type: "application/json",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vision-goals-${
        new Date().toISOString().split("T")[0]
      }.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("Goals exported successfully");
      setShowExportModal(false);
    } catch (err) {
      toast.error(err.message || "Failed to export goals");
    } finally {
      setIsExporting(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedGoalIds.length === goals.length) {
      clearSelection();
    } else {
      setSelectedGoalIds(goals.map((g) => g.id));
    }
  };

  const getStatusCount = (status) => {
    if (!statistics?.byStatus) return 0;
    return statistics.byStatus[status] || 0;
  };

  const statusTabs = [
    { value: "all", label: "All", icon: Target, count: statistics?.total || 0 },
    {
      value: "draft",
      label: "Draft",
      icon: FileText,
      count: getStatusCount("draft"),
    },
    {
      value: "active",
      label: "Active",
      icon: Clock,
      count: getStatusCount("active"),
    },
    {
      value: "completed",
      label: "Completed",
      icon: CheckCircle,
      count: getStatusCount("completed"),
    },
    {
      value: "archived",
      label: "Archived",
      icon: Archive,
      count: getStatusCount("archived"),
    },
  ];

  if (isLoading && !goals.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-neutral-500">Loading vision board...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="error" onClose={clearError}>
          {error}
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-100 rounded-lg">
            <Eye className="w-6 h-6 text-primary-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">
              Vision Board
            </h1>
            <p className="text-sm text-neutral-500">
              {statistics?.total || 0} goals • {statistics?.activeCount || 0}{" "}
              active
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowExportModal(true)}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Goal
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <VisionStatistics />

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-neutral-300 pb-2">
        {statusTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = selectedStatus === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setSelectedStatus(tab.value)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isActive
                  ? "bg-primary-500 text-white"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <Badge
                variant={isActive ? "white" : "neutral"}
                size="sm"
                className="ml-1"
              >
                {tab.count}
              </Badge>
            </button>
          );
        })}
      </div>

      {/* Filters and Controls */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1">
          <SearchBar
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search goals..."
            className="w-full max-w-md"
          />
        </div>
        <div className="flex items-center space-x-2">
          {/* View Mode Toggle */}
          <div className="flex border border-neutral-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1.5 text-sm transition-colors ${
                viewMode === "grid"
                  ? "bg-primary-500 text-white"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 text-sm transition-colors ${
                viewMode === "list"
                  ? "bg-primary-500 text-white"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Sort Options */}
          <Select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="w-36"
            size="sm"
          >
            <option value="priority">Priority</option>
            <option value="created_at">Created</option>
            <option value="goal">Name</option>
            <option value="status">Status</option>
          </Select>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSortOrder(sortOrder === "DESC" ? "ASC" : "DESC")}
            title={sortOrder === "DESC" ? "Descending" : "Ascending"}
          >
            {sortOrder === "DESC" ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      <VisionCategoryFilter onFilterChange={handleFilterChange} />

      {/* Bulk Actions Bar */}
      {selectedGoalIds.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 p-3 bg-primary-50 border border-primary-200 rounded-lg">
          <span className="text-sm font-medium text-primary-700">
            {selectedGoalIds.length} selected
          </span>
          <div className="h-4 w-px bg-primary-200" />
          <Button variant="outline" size="sm" onClick={handleSelectAll}>
            {selectedGoalIds.length === goals.length
              ? "Deselect All"
              : "Select All"}
          </Button>
          <div className="h-4 w-px bg-primary-200" />
          <Select
            value=""
            onChange={(e) => handleBulkStatusUpdate(e.target.value)}
            placeholder="Update Status"
            className="w-40"
            size="sm"
          >
            <option value="">Update Status</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </Select>
          <Button variant="danger" size="sm" onClick={handleBulkDelete}>
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSelection}
            className="ml-auto"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Goals Grid/List */}
      {isGoalsLoading && goals.length === 0 ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : goals.length === 0 ? (
        <div className="text-center py-12 bg-neutral-100 rounded-lg border-2 border-dashed border-neutral-300">
          <Target className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-neutral-900 mb-1">
            No vision goals yet
          </h3>
          <p className="text-neutral-500 mb-4">
            Create your first vision goal to start tracking your progress.
          </p>
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Goal
          </Button>
        </div>
      ) : (
        <>
          <div
            className={`grid ${
              viewMode === "grid"
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-1"
            } gap-4`}
          >
            {goals.map((goal) => (
              <VisionGoalCard
                key={goal.id}
                goal={goal}
                viewMode={viewMode}
                isSelected={selectedGoalIds.includes(goal.id)}
                onSelect={toggleGoalSelection}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-neutral-300">
              <div className="text-sm text-neutral-500">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total} goals
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-neutral-600">
                  Page {page} of {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === pagination.pages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Create Goal Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Vision Goal"
        size="lg"
      >
        <VisionGoalForm
          onSuccess={handleGoalCreated}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* Export Modal */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Export Vision Goals"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">
            Export your vision goals in the selected format.
          </p>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Export Format
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="json"
                  checked={exportFormat === "json"}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="text-primary-500 focus:ring-primary-500"
                />
                <span>JSON</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="csv"
                  checked={exportFormat === "csv"}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="text-primary-500 focus:ring-primary-500"
                />
                <span>CSV</span>
              </label>
            </div>
          </div>
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-neutral-300">
            <Button
              variant="ghost"
              onClick={() => setShowExportModal(false)}
              disabled={isExporting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleExport}
              loading={isExporting}
              disabled={isExporting}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default VisionBoardDashboard;
