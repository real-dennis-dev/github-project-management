// src/components/decision-risks/components/RiskCard.jsx
import React from "react";
import { Badge } from "../../../components/common/Badge";
import { Button } from "../../../components/common/Button";
import {
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import RiskStatusBadge from "./RiskStatusBadge";

const riskLevelColors = {
  low: "success",
  medium: "warning",
  high: "warning",
  critical: "error",
};

const riskLevelLabels = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

const RiskCard = ({ risk, onEdit, onDelete, isDeleting = false }) => {
  const formatDate = (date) => {
    if (!date) return "N/A";
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
            {risk.title}
          </h3>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge
              variant={riskLevelColors[risk.risk_level] || "neutral"}
              size="sm"
            >
              {riskLevelLabels[risk.risk_level] || risk.risk_level}
            </Badge>
            <RiskStatusBadge status={risk.status} size="sm" />
            {risk.risk_score !== undefined && (
              <Badge variant="neutral" size="sm">
                Score: {risk.risk_score}
              </Badge>
            )}
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              Created: {formatDate(risk.created_at)}
            </span>
          </div>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(risk)}
              aria-label="Edit risk"
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(risk.id)}
              disabled={isDeleting}
              aria-label="Delete risk"
              className="text-error hover:bg-error/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {risk.description && (
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
          {risk.description}
        </p>
      )}

      <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700">
        {risk.reason && (
          <p className="text-sm">
            <span className="font-medium text-neutral-700 dark:text-neutral-300">
              Reason:
            </span>
            <span className="ml-1 text-neutral-600 dark:text-neutral-400">
              {risk.reason}
            </span>
          </p>
        )}
        {risk.mitigation && (
          <p className="text-sm mt-1">
            <span className="font-medium text-neutral-700 dark:text-neutral-300">
              Mitigation:
            </span>
            <span className="ml-1 text-neutral-600 dark:text-neutral-400">
              {risk.mitigation}
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default RiskCard;
