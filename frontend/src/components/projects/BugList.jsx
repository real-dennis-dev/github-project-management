// src/components/projects/BugList.jsx
import React, { useState, useEffect } from "react";
import { useProjects } from "../../hooks/useProjects";
import { useToast } from "../../hooks/useToast";
import {
  Button,
  LoadingSpinner,
  Alert,
  EmptyState,
  Badge,
  Modal,
  SearchBar,
} from "../common";
import BugForm from "./BugForm";
import {
  Bug,
  Plus,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

const BugList = ({ projectId }) => {
  const { toast } = useToast();
  const {
    getBugs,
    bugs,
    isLoading,
    error,
    clearError,
    deleteBug,
    isDeletingBug,
  } = useProjects();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBug, setSelectedBug] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    if (projectId) {
      getBugs(projectId);
    }
  }, [projectId]);

  const filteredBugs = bugs.filter((bug) => {
    const matchesSearch =
      bug.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bug.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || bug.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status) => {
    const icons = {
      reported: <AlertTriangle className="w-4 h-4 text-warning" />,
      investigating: <Clock className="w-4 h-4 text-info" />,
      in_progress: <Clock className="w-4 h-4 text-warning" />,
      fixed: <CheckCircle className="w-4 h-4 text-success" />,
      verified: <CheckCircle className="w-4 h-4 text-success" />,
      closed: <XCircle className="w-4 h-4 text-neutral-500" />,
    };
    return icons[status] || icons.reported;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: "neutral",
      medium: "info",
      high: "warning",
      critical: "error",
    };
    return colors[priority] || "neutral";
  };

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "reported", label: "Reported" },
    { value: "investigating", label: "Investigating" },
    { value: "in_progress", label: "In Progress" },
    { value: "fixed", label: "Fixed" },
    { value: "verified", label: "Verified" },
    { value: "closed", label: "Closed" },
  ];

  const handleCreateSuccess = (bug) => {
    setShowCreateModal(false);
    toast.success(`Bug "${bug.title}" reported successfully`);
    getBugs(projectId);
  };

  const handleDeleteClick = (bug) => {
    setSelectedBug(bug);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedBug) return;
    try {
      await deleteBug(selectedBug.id);
      toast.success(`Bug "${selectedBug.title}" deleted successfully`);
      setShowDeleteModal(false);
      setSelectedBug(null);
      getBugs(projectId);
    } catch (error) {
      toast.error(error.message || "Failed to delete bug");
    }
  };

  if (isLoading && bugs.length === 0) {
    return <LoadingSpinner size="md" className="my-8" />;
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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-4 flex-1">
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search bugs..."
            className="flex-1 max-w-xs"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-neutral-200 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-1"
        >
          <Plus className="w-4 h-4" />
          <span>Report Bug</span>
        </Button>
      </div>

      {filteredBugs.length === 0 ? (
        <EmptyState
          title={
            bugs.length === 0
              ? "No bugs reported"
              : "No bugs match your filters"
          }
          description="Keep track of bugs and issues in your project"
          icon={<Bug className="w-12 h-12" />}
          className="py-8"
        />
      ) : (
        <div className="space-y-3">
          {filteredBugs.map((bug) => (
            <div
              key={bug.id}
              className="bg-neutral-100 border border-neutral-300 rounded-lg p-4 hover:border-primary-400 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(bug.status)}
                    <span className="font-medium text-neutral-900">
                      {bug.title}
                    </span>
                    <Badge variant={getPriorityColor(bug.priority)} size="sm">
                      {bug.priority}
                    </Badge>
                    <Badge variant="info" size="sm">
                      {bug.status}
                    </Badge>
                  </div>
                  {bug.description && (
                    <p className="text-sm text-neutral-600 mt-1 line-clamp-2">
                      {bug.description}
                    </p>
                  )}
                  <div className="flex items-center space-x-4 mt-2 text-xs text-neutral-500">
                    {bug.cause && <span>Cause: {bug.cause}</span>}
                    {bug.assigned_to && (
                      <span>Assigned to: {bug.assigned_to}</span>
                    )}
                    {bug.completed_at && (
                      <span>
                        Completed:{" "}
                        {new Date(bug.completed_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      // Handle edit
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(bug)}
                    className="text-error hover:text-error"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Report Bug"
        size="lg"
      >
        <BugForm
          projectId={projectId}
          onSubmit={handleCreateSuccess}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Bug"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-neutral-700">
            Are you sure you want to delete bug{" "}
            <span className="font-semibold">{selectedBug?.title}</span>? This
            action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="ghost"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeletingBug}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
              loading={isDeletingBug}
              disabled={isDeletingBug}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BugList;
