// src/components/releases/MilestoneList.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useReleases } from "../../hooks/useReleases";
import {
  Button,
  Badge,
  LoadingSpinner,
  Alert,
  Pagination,
  SearchBar,
  EmptyState,
  Table,
  Modal,
  ProgressBar,
} from "../common";
import { useToast } from "../../hooks/useToast";
import {
  Flag,
  Calendar,
  Plus,
  Trash2,
  Edit,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

const MilestoneList = ({ projectId }) => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState(null);
  const [sortBy, setSortBy] = useState("target_date");
  const [sortOrder, setSortOrder] = useState("ASC");

  const {
    getMilestones,
    milestones,
    pagination,
    isLoading,
    error,
    clearError,
    deleteMilestone,
    isDeletingMilestone,
  } = useReleases();

  const { toast } = useToast();

  const limit = 10;

  useEffect(() => {
    if (projectId) {
      getMilestones(projectId, {
        page,
        limit,
        status: statusFilter || undefined,
        sortBy,
        sortOrder,
      });
    }
  }, [projectId, page, statusFilter, sortBy, sortOrder]);

  const handleDelete = async () => {
    if (!selectedMilestoneId) return;
    try {
      const result = await deleteMilestone(selectedMilestoneId);
      if (result.success) {
        toast.success("Milestone deleted successfully");
        setShowDeleteModal(false);
        setSelectedMilestoneId(null);
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete milestone");
    }
  };

  const getStatusVariant = (status) => {
    const variants = {
      not_started: "secondary",
      in_progress: "warning",
      completed: "success",
      delayed: "error",
    };
    return variants[status] || "neutral";
  };

  const getStatusIcon = (status) => {
    const icons = {
      not_started: Clock,
      in_progress: TrendingUp,
      completed: CheckCircle,
      delayed: AlertTriangle,
    };
    return icons[status] || Flag;
  };

  const isOverdue = (milestone) => {
    if (milestone.status === "completed") return false;
    if (!milestone.target_date) return false;
    return new Date(milestone.target_date) < new Date();
  };

  const headers = [
    { key: "name", label: "Name" },
    { key: "status", label: "Status" },
    { key: "target_date", label: "Target Date" },
    { key: "progress", label: "Progress" },
    { key: "priority", label: "Priority" },
    { key: "actions", label: "Actions" },
  ];

  const renderRow = (milestone) => {
    const StatusIcon = getStatusIcon(milestone.status);
    const overdue = isOverdue(milestone);

    return (
      <tr
        key={milestone.id}
        className={`hover:bg-neutral-200 transition-colors ${
          overdue ? "border-l-4 border-error" : ""
        }`}
      >
        <td className="px-4 py-3">
          <div>
            <div className="flex items-center space-x-2">
              <Flag className="w-4 h-4 text-primary-500" />
              <span className="font-medium text-neutral-900">
                {milestone.name}
              </span>
            </div>
            {milestone.description && (
              <p className="text-sm text-neutral-500 mt-0.5">
                {milestone.description}
              </p>
            )}
          </div>
        </td>
        <td className="px-4 py-3">
          <Badge
            variant={getStatusVariant(milestone.status)}
            className="flex items-center space-x-1"
          >
            <StatusIcon className="w-3 h-3" />
            <span className="capitalize">
              {milestone.status.replace("_", " ")}
            </span>
          </Badge>
          {overdue && (
            <Badge variant="error" size="sm" className="ml-1">
              Overdue
            </Badge>
          )}
        </td>
        <td className="px-4 py-3 text-neutral-700">
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4 text-neutral-500" />
            <span>{new Date(milestone.target_date).toLocaleDateString()}</span>
            {milestone.days_until_target !== undefined && (
              <span className="text-xs text-neutral-400 ml-1">
                ({milestone.days_until_target} days)
              </span>
            )}
          </div>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center space-x-2">
            <div className="w-24 h-2 bg-neutral-300 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  milestone.progress_percentage >= 80
                    ? "bg-success"
                    : milestone.progress_percentage >= 50
                    ? "bg-primary-500"
                    : "bg-warning"
                }`}
                style={{ width: `${milestone.progress_percentage || 0}%` }}
              />
            </div>
            <span className="text-sm text-neutral-600">
              {milestone.progress_percentage || 0}%
            </span>
          </div>
        </td>
        <td className="px-4 py-3">
          <Badge
            variant={
              milestone.priority === "critical"
                ? "error"
                : milestone.priority === "high"
                ? "warning"
                : milestone.priority === "medium"
                ? "info"
                : "neutral"
            }
          >
            {milestone.priority || "medium"}
          </Badge>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center space-x-2">
            <Link to={`/milestones/${milestone.id}`}>
              <Button variant="ghost" size="sm" className="p-1.5">
                <Eye className="w-4 h-4" />
              </Button>
            </Link>
            <Link to={`/milestones/${milestone.id}/edit`}>
              <Button variant="ghost" size="sm" className="p-1.5">
                <Edit className="w-4 h-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="p-1.5 text-error hover:bg-error/10"
              onClick={() => {
                setSelectedMilestoneId(milestone.id);
                setShowDeleteModal(true);
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </td>
      </tr>
    );
  };

  if (isLoading && milestones.length === 0) {
    return <LoadingSpinner size="lg" className="my-8" />;
  }

  if (error) {
    return (
      <Alert variant="error" onClose={clearError}>
        {error}
      </Alert>
    );
  }

  if (milestones.length === 0) {
    return (
      <EmptyState
        title="No milestones yet"
        description="Create your first milestone to track project progress"
        action={
          <Link to={`/projects/${projectId}/milestones/create`}>
            <Button variant="primary">
              <Plus className="w-4 h-4 mr-2" />
              Create Milestone
            </Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-4 flex-wrap gap-2">
          <SearchBar
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            placeholder="Filter by status..."
            className="w-48"
          />
          <div className="flex items-center space-x-2">
            <label className="text-sm text-neutral-600">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2 py-1 bg-neutral-200 border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="target_date">Target Date</option>
              <option value="created_at">Created</option>
              <option value="status">Status</option>
              <option value="progress_percentage">Progress</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-2 py-1 bg-neutral-200 border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="ASC">Ascending</option>
              <option value="DESC">Descending</option>
            </select>
          </div>
        </div>
        <Link to={`/projects/${projectId}/milestones/create`}>
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Create Milestone
          </Button>
        </Link>
      </div>

      <div className="bg-neutral-100 border border-neutral-300 rounded-lg overflow-hidden">
        <Table
          headers={headers}
          data={milestones}
          renderRow={renderRow}
          variant="striped"
        />
      </div>

      {pagination.pages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={pagination.pages}
          onPageChange={setPage}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedMilestoneId(null);
        }}
        title="Delete Milestone"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-neutral-700">
            Are you sure you want to delete this milestone? This action cannot
            be undone. Only non-completed milestones can be deleted.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="ghost"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedMilestoneId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={isDeletingMilestone}
            >
              Delete Milestone
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MilestoneList;
