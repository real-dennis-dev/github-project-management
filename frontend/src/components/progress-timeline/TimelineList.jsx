// src/components/progress-timeline/TimelineList.jsx
import React, { useState, useEffect } from "react";
import { useProgress } from "../../hooks/useProgress";
import { useToast } from "../../hooks/useToast";
import {
  Table,
  Badge,
  Button,
  LoadingSpinner,
  Alert,
  EmptyState,
  Pagination,
  Modal,
} from "../common";
import {
  Edit,
  Trash2,
  RefreshCw,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import TimelineFilters from "./TimelineFilters";
import TimelineForm from "./TimelineForm";

const TimelineList = ({ projectId }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);

  const {
    getTimeline,
    deleteTimelineEntry,
    timelineEntries,
    pagination,
    isLoading,
    error,
    clearError,
    filters,
    setFilters,
  } = useProgress();

  const { toast } = useToast();

  useEffect(() => {
    if (projectId) {
      getTimeline(projectId, { page, limit, ...filters });
    }
  }, [projectId, page, limit, filters]);

  const handleRefresh = () => {
    getTimeline(projectId, { page, limit, ...filters });
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleEdit = (entry) => {
    setSelectedEntry(entry);
    setShowEditModal(true);
  };

  const handleDelete = (entry) => {
    setEntryToDelete(entry);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (entryToDelete) {
      try {
        await deleteTimelineEntry(entryToDelete.id);
        toast.success("Timeline entry deleted successfully");
        setShowDeleteModal(false);
        setEntryToDelete(null);
      } catch (err) {
        toast.error(err.message || "Failed to delete entry");
      }
    }
  };

  const getStatusBadge = (progress) => {
    if (progress >= 100) {
      return (
        <Badge variant="success">
          <CheckCircle className="w-3 h-3 mr-1" /> Completed
        </Badge>
      );
    } else if (progress >= 75) {
      return (
        <Badge variant="info">
          <TrendingUp className="w-3 h-3 mr-1" /> On Track
        </Badge>
      );
    } else if (progress >= 50) {
      return (
        <Badge variant="warning">
          <Clock className="w-3 h-3 mr-1" /> In Progress
        </Badge>
      );
    } else if (progress > 0) {
      return (
        <Badge variant="warning">
          <AlertCircle className="w-3 h-3 mr-1" /> Started
        </Badge>
      );
    } else {
      return (
        <Badge variant="neutral">
          <Clock className="w-3 h-3 mr-1" /> Not Started
        </Badge>
      );
    }
  };

  const formatMonth = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleString("default", { month: "long", year: "numeric" });
  };

  const headers = [
    "Month",
    "Feature",
    "Progress",
    "Status",
    "Created At",
    "Actions",
  ];

  if (isLoading && timelineEntries.length === 0) {
    return <LoadingSpinner size="lg" className="my-8" />;
  }

  if (error) {
    return (
      <Alert variant="error" onClose={clearError}>
        {error}
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-neutral-900">Timeline</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCw
            className={`w-4 h-4 mr-1 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      <TimelineFilters
        filters={filters}
        onFilterChange={setFilters}
        isLoading={isLoading}
      />

      {timelineEntries.length === 0 ? (
        <EmptyState
          title="No timeline entries"
          description="Add your first progress entry to track your project's progress over time."
        />
      ) : (
        <>
          <Table
            headers={headers}
            data={timelineEntries}
            variant="striped"
            renderRow={(entry) => (
              <tr key={entry.id} className="border-b border-neutral-300">
                <td className="px-4 py-3 text-neutral-700">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-neutral-500" />
                    <span>{formatMonth(entry.month_year)}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-neutral-700 font-medium">
                  {entry.feature_name}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-24 h-2 bg-neutral-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full transition-all"
                        style={{ width: `${entry.progress_percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-neutral-600">
                      {entry.progress_percentage}%
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {getStatusBadge(entry.progress_percentage)}
                </td>
                <td className="px-4 py-3 text-sm text-neutral-500">
                  {new Date(entry.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(entry)}
                      className="p-1.5"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(entry)}
                      className="p-1.5 text-error hover:text-error"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            )}
          />

          {pagination.totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedEntry(null);
        }}
        title="Edit Timeline Entry"
        size="lg"
      >
        {selectedEntry && (
          <TimelineForm
            projectId={projectId}
            initialData={selectedEntry}
            onSuccess={() => {
              setShowEditModal(false);
              setSelectedEntry(null);
            }}
            onCancel={() => {
              setShowEditModal(false);
              setSelectedEntry(null);
            }}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setEntryToDelete(null);
        }}
        title="Delete Timeline Entry"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-neutral-700">
            Are you sure you want to delete the entry for{" "}
            <strong>{entryToDelete?.feature_name}</strong> in{" "}
            {entryToDelete && formatMonth(entryToDelete.month_year)}?
          </p>
          <p className="text-sm text-neutral-500">
            This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="ghost"
              onClick={() => {
                setShowDeleteModal(false);
                setEntryToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              disabled={isLoading}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TimelineList;
