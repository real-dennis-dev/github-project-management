// src/components/releases/ReleaseList.jsx
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
} from "../common";
import { useToast } from "../../hooks/useToast";
import {
  Tag,
  Calendar,
  Plus,
  Trash2,
  Edit,
  Eye,
  GitBranch,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";

const ReleaseList = ({ projectId }) => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedReleaseId, setSelectedReleaseId] = useState(null);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("DESC");

  const {
    getReleases,
    releases,
    pagination,
    isLoading,
    error,
    clearError,
    deleteRelease,
    filters,
    setFilters,
  } = useReleases();

  const { toast } = useToast();

  const limit = 10;

  useEffect(() => {
    if (projectId) {
      getReleases(projectId, {
        page,
        limit,
        status: statusFilter || undefined,
        sortBy,
        sortOrder,
      });
    }
  }, [projectId, page, statusFilter, sortBy, sortOrder]);

  const handleDelete = async () => {
    if (!selectedReleaseId) return;
    try {
      const result = await deleteRelease(selectedReleaseId);
      if (result.success) {
        toast.success("Release deleted successfully");
        setShowDeleteModal(false);
        setSelectedReleaseId(null);
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete release");
    }
  };

  const getStatusVariant = (status) => {
    const variants = {
      planned: "secondary",
      in_progress: "warning",
      testing: "info",
      released: "success",
      cancelled: "error",
    };
    return variants[status] || "neutral";
  };

  const getStatusIcon = (status) => {
    const icons = {
      planned: Clock,
      in_progress: GitBranch,
      testing: AlertTriangle,
      released: CheckCircle,
      cancelled: Trash2,
    };
    return icons[status] || Tag;
  };

  const headers = [
    { key: "version", label: "Version" },
    { key: "description", label: "Description" },
    { key: "status", label: "Status" },
    { key: "release_date", label: "Release Date" },
    { key: "progress", label: "Progress" },
    { key: "actions", label: "Actions" },
  ];

  const renderRow = (release) => {
    const StatusIcon = getStatusIcon(release.status);
    const progress = release.readiness?.percentage || 0;

    return (
      <tr key={release.id} className="hover:bg-neutral-200 transition-colors">
        <td className="px-4 py-3">
          <div className="flex items-center space-x-2">
            <Tag className="w-4 h-4 text-primary-500" />
            <span className="font-medium text-neutral-900">
              {release.version}
            </span>
          </div>
        </td>
        <td className="px-4 py-3 text-neutral-700 truncate max-w-xs">
          {release.description || "-"}
        </td>
        <td className="px-4 py-3">
          <Badge
            variant={getStatusVariant(release.status)}
            className="flex items-center space-x-1"
          >
            <StatusIcon className="w-3 h-3" />
            <span className="capitalize">
              {release.status.replace("_", " ")}
            </span>
          </Badge>
        </td>
        <td className="px-4 py-3 text-neutral-700">
          {release.release_date ? (
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4 text-neutral-500" />
              <span>{new Date(release.release_date).toLocaleDateString()}</span>
            </div>
          ) : (
            "-"
          )}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center space-x-2">
            <div className="w-24 h-2 bg-neutral-300 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm text-neutral-600">{progress}%</span>
          </div>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center space-x-2">
            <Link to={`/releases/${release.id}`}>
              <Button variant="ghost" size="sm" className="p-1.5">
                <Eye className="w-4 h-4" />
              </Button>
            </Link>
            <Link to={`/releases/${release.id}/edit`}>
              <Button variant="ghost" size="sm" className="p-1.5">
                <Edit className="w-4 h-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="p-1.5 text-error hover:bg-error/10"
              onClick={() => {
                setSelectedReleaseId(release.id);
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

  if (isLoading && releases.length === 0) {
    return <LoadingSpinner size="lg" className="my-8" />;
  }

  if (error) {
    return (
      <Alert variant="error" onClose={clearError}>
        {error}
      </Alert>
    );
  }

  if (releases.length === 0) {
    return (
      <EmptyState
        title="No releases yet"
        description="Create your first release to start tracking versions"
        action={
          <Link to={`/projects/${projectId}/releases/create`}>
            <Button variant="primary">
              <Plus className="w-4 h-4 mr-2" />
              Create Release
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
              <option value="created_at">Created</option>
              <option value="release_date">Release Date</option>
              <option value="version">Version</option>
              <option value="status">Status</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-2 py-1 bg-neutral-200 border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="DESC">Descending</option>
              <option value="ASC">Ascending</option>
            </select>
          </div>
        </div>
        <Link to={`/projects/${projectId}/releases/create`}>
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Create Release
          </Button>
        </Link>
      </div>

      <div className="bg-neutral-100 border border-neutral-300 rounded-lg overflow-hidden">
        <Table
          headers={headers}
          data={releases}
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
          setSelectedReleaseId(null);
        }}
        title="Delete Release"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-neutral-700">
            Are you sure you want to delete this release? This action cannot be
            undone. Only releases with no assigned features can be deleted.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="ghost"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedReleaseId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={useReleases().isDeletingRelease}
            >
              Delete Release
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ReleaseList;
