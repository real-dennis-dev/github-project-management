// src/components/vision/VisionGoalCard.jsx (updated)
import React from "react";
import { Link } from "react-router-dom";
import { useVision } from "../../hooks/useVision";
import { useToast } from "../../hooks/useToast";
import { Badge, Button, ProgressBar, Checkbox } from "../common";
import {
  Target,
  Calendar,
  Clock,
  Link as LinkIcon,
  Trash2,
  Edit,
  ChevronRight,
} from "lucide-react";

const VisionGoalCard = ({
  goal,
  viewMode = "grid",
  isSelected = false,
  onSelect,
}) => {
  const { deleteGoal } = useVision();
  const { toast } = useToast();

  const {
    id,
    goal: title,
    description,
    category,
    status,
    priority,
    progress,
    target_timeline,
    project_count,
    linked_projects = [],
    formatted,
  } = goal;

  const statusColors = {
    draft: "neutral",
    active: "info",
    completed: "success",
    archived: "neutral",
  };

  const getPriorityLabel = (value) => {
    if (value <= 3) return "Low";
    if (value <= 7) return "Medium";
    return "High";
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this vision goal?")) {
      try {
        await deleteGoal(id);
        toast.success("Vision goal deleted successfully");
      } catch (err) {
        toast.error(err.message || "Failed to delete vision goal");
      }
    }
  };

  const cardContent = (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-neutral-900 line-clamp-2">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-neutral-600 mt-1 line-clamp-2">
              {description}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-1 ml-2">
          <Badge variant={statusColors[status] || "neutral"} size="sm">
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-500">
        {category && (
          <Badge variant="secondary" size="sm">
            {category}
          </Badge>
        )}
        {priority !== undefined && priority !== null && (
          <Badge variant="warning" size="sm">
            Priority: {getPriorityLabel(priority)}
          </Badge>
        )}
        {target_timeline && (
          <span className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>{new Date(target_timeline).toLocaleDateString()}</span>
          </span>
        )}
        {project_count > 0 && (
          <span className="flex items-center space-x-1">
            <LinkIcon className="w-3 h-3" />
            <span>{project_count} projects</span>
          </span>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-500">Progress</span>
          <span className="text-neutral-700 font-medium">{progress || 0}%</span>
        </div>
        <ProgressBar
          value={progress || 0}
          variant={
            progress >= 80 ? "success" : progress >= 50 ? "primary" : "warning"
          }
          size="sm"
        />
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-neutral-300">
        <div className="flex items-center space-x-2">
          <Link to={`/vision/${id}`}>
            <Button variant="outline" size="sm">
              <Target className="w-4 h-4 mr-1" />
              View
            </Button>
          </Link>
          <Link to={`/vision/${id}/edit`}>
            <Button variant="secondary" size="sm">
              <Edit className="w-4 h-4" />
            </Button>
          </Link>
          <Button variant="danger" size="sm" onClick={handleDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
        <Link to={`/vision/${id}`}>
          <ChevronRight className="w-5 h-5 text-neutral-400 hover:text-neutral-600" />
        </Link>
      </div>
    </div>
  );

  if (viewMode === "list") {
    return (
      <div
        className={`bg-neutral-100 border rounded-lg p-4 transition-colors ${
          isSelected ? "border-primary-500 bg-primary-50" : "border-neutral-300"
        }`}
      >
        <div className="flex items-center gap-4">
          {onSelect && (
            <Checkbox
              checked={isSelected}
              onChange={() => onSelect(id)}
              className="flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
            <p className="text-sm text-neutral-600 mt-1">{description}</p>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Badge variant={statusColors[status] || "neutral"} size="sm">
              {status}
            </Badge>
            <Badge variant="warning" size="sm">
              {getPriorityLabel(priority)}
            </Badge>
            <span className="text-sm text-neutral-500">{progress || 0}%</span>
            <Link to={`/vision/${id}`}>
              <Button variant="ghost" size="sm">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-neutral-100 border rounded-lg p-6 transition-colors ${
        isSelected
          ? "border-primary-500 bg-primary-50"
          : "border-neutral-300 hover:border-primary-400"
      }`}
    >
      {onSelect && (
        <div className="mb-3">
          <Checkbox checked={isSelected} onChange={() => onSelect(id)} />
        </div>
      )}
      {cardContent}
    </div>
  );
};

export default VisionGoalCard;
