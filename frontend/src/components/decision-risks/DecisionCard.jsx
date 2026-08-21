// src/components/decision-risks/DecisionCard.jsx
import React from "react";
import { Card, Badge, IconWrapper } from "../common";
import { getImpactColor } from "../../hooks/useDecisionRisk";
import { FiEdit2, FiTrash2 } from "react-icons/fi";

const DecisionCard = ({ decision, onEdit, onDelete }) => {
  const {
    title,
    description,
    decision: decisionText,
    impact,
    reason,
    decision_date,
  } = decision;

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
              aria-label="Edit decision"
            >
              <IconWrapper icon={FiEdit2} size="sm" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-1 text-neutral-400 hover:text-red-500 transition-colors"
              aria-label="Delete decision"
            >
              <IconWrapper icon={FiTrash2} size="sm" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Badge
          variant={
            impact === "critical"
              ? "error"
              : impact === "high"
              ? "warning"
              : impact === "medium"
              ? "info"
              : "success"
          }
          size="sm"
        >
          {impact}
        </Badge>
        {decision_date && (
          <Badge variant="neutral" size="sm">
            {new Date(decision_date).toLocaleDateString()}
          </Badge>
        )}
      </div>

      {reason && (
        <div className="mt-3 text-sm">
          <span className="text-neutral-500">Reason:</span>
          <span className="text-neutral-700 ml-1 line-clamp-1">{reason}</span>
        </div>
      )}

      {decisionText && (
        <div className="mt-2 text-sm">
          <span className="text-neutral-500">Decision:</span>
          <span className="text-neutral-700 ml-1 line-clamp-1">
            {decisionText}
          </span>
        </div>
      )}
    </Card>
  );
};

export default DecisionCard;
