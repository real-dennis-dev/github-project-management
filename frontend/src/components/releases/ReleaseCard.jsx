// src/components/releases/ReleaseCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Button } from "../common";
import { Tag, Calendar, CheckCircle, GitBranch, Eye } from "lucide-react";

const ReleaseCard = ({ release }) => {
  const navigate = useNavigate();

  const getStatusVariant = (status) => {
    const variants = {
      planned: "neutral",
      in_progress: "warning",
      testing: "info",
      released: "success",
      cancelled: "error",
    };
    return variants[status] || "neutral";
  };

  const getStatusIcon = (status) => {
    const icons = {
      planned: GitBranch,
      in_progress: GitBranch,
      testing: GitBranch,
      released: CheckCircle,
      cancelled: Tag,
    };
    return icons[status] || Tag;
  };

  const StatusIcon = getStatusIcon(release.status);

  return (
    <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6 hover:border-primary-400 transition-all flex flex-col">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">
            {release.title || `Release ${release.version}`}
          </h3>
          {release.description && (
            <p className="text-sm text-neutral-600 mt-1 line-clamp-2">
              {release.description}
            </p>
          )}
        </div>
        <Badge variant="info" size="sm">
          {release.version || "N/A"}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <Badge
          variant={getStatusVariant(release.status)}
          className="flex items-center space-x-1"
        >
          <StatusIcon className="w-3 h-3" />
          <span className="capitalize">
            {release.status?.replace("_", " ") || "Unknown"}
          </span>
        </Badge>
        {release.progress !== undefined && (
          <Badge variant="neutral" size="sm">
            {release.progress}% complete
          </Badge>
        )}
        {release.release_date && (
          <Badge
            variant="neutral"
            size="sm"
            className="flex items-center space-x-1"
          >
            <Calendar className="w-3 h-3" />
            <span>{new Date(release.release_date).toLocaleDateString()}</span>
          </Badge>
        )}
      </div>

      {release.progress !== undefined && (
        <div className="mt-2 w-full h-1.5 bg-neutral-300 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              release.progress >= 80
                ? "bg-success"
                : release.progress >= 50
                ? "bg-primary-500"
                : "bg-warning"
            }`}
            style={{ width: `${release.progress}%` }}
          />
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-neutral-300 flex items-center justify-between">
        <span className="text-xs text-neutral-500">
          {release.total_features !== undefined &&
            `${release.total_features} features`}
          {release.completed_features !== undefined &&
            ` · ${release.completed_features} completed`}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center space-x-1"
          onClick={() => navigate(`/releases/${release.id}`)}
        >
          <Eye className="w-4 h-4" />
          <span>View</span>
        </Button>
      </div>
    </div>
  );
};

export default ReleaseCard;
