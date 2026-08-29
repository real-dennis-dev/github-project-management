// src/components/techdebt/TechDebtCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Button, Badge } from "../common";
import TechDebtPriorityBadge from "./TechDebtPriorityBadge";
import TechDebtStatusBadge from "./TechDebtStatusBadge";
import { Clock, ArrowRight } from "lucide-react";

const TechDebtCard = ({ item, projectId }) => {
  const {
    id,
    title,
    description,
    priority,
    status,
    estimated_effort_hours,
    created_at,
  } = item;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6 hover:border-primary-400 transition-all flex flex-col">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-lg font-semibold text-neutral-900 flex-1">
          {title}
        </h3>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <TechDebtPriorityBadge priority={priority} />
        <TechDebtStatusBadge status={status} />
        {estimated_effort_hours > 0 && (
          <Badge
            variant="neutral"
            size="sm"
            className="flex items-center space-x-1"
          >
            <Clock className="w-3 h-3" />
            <span>{estimated_effort_hours}h</span>
          </Badge>
        )}
      </div>

      <p className="text-sm text-neutral-600 flex-1">
        {truncateText(description)}
      </p>

      <div className="mt-4 pt-4 border-t border-neutral-300 flex items-center justify-between">
        <span className="text-xs text-neutral-500">
          Created: {formatDate(created_at)}
        </span>
        <Link to={`/tech-debt/${projectId}/${id}`}>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center space-x-1"
          >
            <span>View</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default TechDebtCard;
