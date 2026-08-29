// src/components/decision-risks/components/DecisionCard.jsx
import React from "react";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import {
  Edit,
  Trash2,
  Calendar,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { format } from "date-fns";

const impactColors = {
  low: "success",
  medium: "warning",
  high: "warning",
  critical: "error",
};

const impactLabels = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

const DecisionCard = ({ decision, onEdit, onDelete, isDeleting = false }) => {
  const formatDate = (date) => {
    if (!date) return "Not set";
    try {
      return format(new Date(date), "MMM dd, yyyy");
    } catch {
      return date;
    }
  };

  return (
    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-5 border border-neutral-200 dark:border-neutral-700 hover:border-primary-400 dark:hover:border-primary-500 transition-colors">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 truncate">
            {decision.title}
          </h3>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge
              variant={impactColors[decision.impact] || "neutral"}
              size="sm"
            >
              {impactLabels[decision.impact] || decision.impact}
            </Badge>
            {decision.decision_date && (
              <span className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                <Calendar className="w-3 h-3" />
                {formatDate(decision.decision_date)}
              </span>
            )}
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              Created: {formatDate(decision.created_at)}
            </span>
          </div>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(decision)}
              aria-label="Edit decision"
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(decision.id)}
              disabled={isDeleting}
              aria-label="Delete decision"
              className="text-error hover:bg-error/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {decision.description && (
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
          {decision.description}
        </p>
      )}

      <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700">
        <p className="text-sm">
          <span className="font-medium text-neutral-700 dark:text-neutral-300">
            Decision:
          </span>
          <span className="ml-1 text-neutral-600 dark:text-neutral-400">
            {decision.decision}
          </span>
        </p>
        {decision.reason && (
          <p className="text-sm mt-1">
            <span className="font-medium text-neutral-700 dark:text-neutral-300">
              Reason:
            </span>
            <span className="ml-1 text-neutral-600 dark:text-neutral-400">
              {decision.reason}
            </span>
          </p>
        )}
        {decision.alternatives && (
          <p className="text-sm mt-1">
            <span className="font-medium text-neutral-700 dark:text-neutral-300">
              Alternatives:
            </span>
            <span className="ml-1 text-neutral-600 dark:text-neutral-400">
              {decision.alternatives}
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default DecisionCard;
