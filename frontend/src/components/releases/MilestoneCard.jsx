// src/components/releases/MilestoneCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Button } from "../common";
import {
  Flag,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
} from "lucide-react";

const MilestoneCard = ({ milestone }) => {
  const navigate = useNavigate();

  const getStatusVariant = (status) => {
    const variants = {
      not_started: "neutral",
      in_progress: "warning",
      completed: "success",
      delayed: "error",
    };
    return variants[status] || "neutral";
  };

  const getStatusIcon = (status) => {
    const icons = {
      not_started: Clock,
      in_progress: Clock,
      completed: CheckCircle,
      delayed: AlertTriangle,
    };
    return icons[status] || Flag;
  };

  const isOverdue = () => {
    if (milestone.status === "completed") return false;
    if (!milestone.target_date) return false;
    return new Date(milestone.target_date) < new Date();
  };

  const StatusIcon = getStatusIcon(milestone.status);
  const overdue = isOverdue();

  return (
    <div
      className={`bg-neutral-100 border rounded-lg p-6 transition-all flex flex-col ${
        overdue ? "border-error" : "border-neutral-300 hover:border-primary-400"
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">
            {milestone.title || milestone.name}
          </h3>
          {milestone.description && (
            <p className="text-sm text-neutral-600 mt-1 line-clamp-2">
              {milestone.description}
            </p>
          )}
        </div>
        {overdue && (
          <Badge
            variant="error"
            size="sm"
            className="flex items-center space-x-1"
          >
            <AlertTriangle className="w-3 h-3" />
            <span>Overdue</span>
          </Badge>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <Badge
          variant={getStatusVariant(milestone.status)}
          className="flex items-center space-x-1"
        >
          <StatusIcon className="w-3 h-3" />
          <span className="capitalize">
            {milestone.status?.replace("_", " ") || "Unknown"}
          </span>
        </Badge>
        {milestone.progress !== undefined && (
          <Badge variant="neutral" size="sm">
            {milestone.progress}% complete
          </Badge>
        )}
        {milestone.priority && (
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
            size="sm"
          >
            {milestone.priority}
          </Badge>
        )}
        {milestone.target_date && (
          <Badge
            variant="neutral"
            size="sm"
            className="flex items-center space-x-1"
          >
            <Calendar className="w-3 h-3" />
            <span>
              Due: {new Date(milestone.target_date).toLocaleDateString()}
            </span>
          </Badge>
        )}
      </div>

      {milestone.progress !== undefined && (
        <div className="mt-2 w-full h-1.5 bg-neutral-300 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              milestone.progress >= 80
                ? "bg-success"
                : milestone.progress >= 50
                ? "bg-primary-500"
                : "bg-warning"
            }`}
            style={{ width: `${milestone.progress}%` }}
          />
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-neutral-300 flex items-center justify-between">
        <span className="text-xs text-neutral-500">
          {milestone.days_until_target !== undefined &&
            (milestone.days_until_target > 0
              ? `${milestone.days_until_target} days remaining`
              : milestone.days_until_target === 0
              ? "Due today"
              : `${Math.abs(milestone.days_until_target)} days overdue`)}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center space-x-1"
          onClick={() => navigate(`/milestones/${milestone.id}`)}
        >
          <Eye className="w-4 h-4" />
          <span>View</span>
        </Button>
      </div>
    </div>
  );
};

export default MilestoneCard;
