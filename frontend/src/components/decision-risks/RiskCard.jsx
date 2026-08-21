// src/components/decision-risks/RiskCard.jsx
import React from "react";
import { Card, Badge, IconWrapper } from "../common";
import {
  getRiskLevelColor,
  getRiskStatusColor,
  getRiskStatusBadge,
} from "../../hooks/useDecisionRisk";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

const RiskCard = ({ risk, onEdit, onDelete }) => {
  const {
    title,
    description,
    risk_level,
    status,
    risk_score,
    reason,
    mitigation,
  } = risk;

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-neutral-900 truncate">
            {title}
          </h3>
          <p className="text-sm text-neutral-600 mt-1 line-clamp-2">
            {description}
          </p>
        </div>
        <div className="flex gap-2 ml-4">
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-1 text-neutral-400 hover:text-primary-500 transition-colors"
              aria-label="Edit risk"
            >
              <IconWrapper icon={FiEdit2} size="sm" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-1 text-neutral-400 hover:text-red-500 transition-colors"
              aria-label="Delete risk"
            >
              <IconWrapper icon={FiTrash2} size="sm" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Badge
          variant={
            risk_level === "critical"
              ? "error"
              : risk_level === "high"
              ? "warning"
              : risk_level === "medium"
              ? "info"
              : "success"
          }
          size="sm"
        >
          {risk_level}
        </Badge>
        <Badge
          variant={
            status === "realized"
              ? "error"
              : status === "mitigated" || status === "closed"
              ? "success"
              : status === "monitoring"
              ? "warning"
              : "info"
          }
          size="sm"
        >
          {getRiskStatusBadge(status)}
        </Badge>
        {risk_score && (
          <Badge variant="neutral" size="sm">
            Score: {risk_score}
          </Badge>
        )}
      </div>

      {reason && (
        <div className="mt-3 text-sm">
          <span className="text-neutral-500">Reason:</span>
          <span className="text-neutral-700 ml-1 line-clamp-1">{reason}</span>
        </div>
      )}

      {mitigation && (
        <div className="mt-2 text-sm">
          <span className="text-neutral-500">Mitigation:</span>
          <span className="text-neutral-700 ml-1 line-clamp-1">
            {mitigation}
          </span>
        </div>
      )}
    </Card>
  );
};

export default RiskCard;
