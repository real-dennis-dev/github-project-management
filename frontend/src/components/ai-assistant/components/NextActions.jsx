// src/components/ai-assistant/components/NextActions.jsx
import React from "react";
import { Button, Badge, LoadingSpinner, EmptyState } from "../../common";
import {
  ClockIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

const NextActions = ({ actions, loading = false, onRefresh }) => {
  const getPriorityColor = (priority) => {
    const colors = {
      high: "error",
      medium: "warning",
      low: "info",
      immediate: "error",
      shortTerm: "warning",
      mediumTerm: "info",
      longTerm: "neutral",
    };
    return colors[priority] || "neutral";
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      high: "High Priority",
      medium: "Medium Priority",
      low: "Low Priority",
      immediate: "Immediate",
      shortTerm: "Short Term",
      mediumTerm: "Medium Term",
      longTerm: "Long Term",
    };
    return labels[priority] || priority;
  };

  const renderActionItems = (items, title) => {
    if (!items || items.length === 0) return null;

    return (
      <div className="mb-4">
        <h4 className="font-medium text-sm text-neutral-600 mb-2">{title}</h4>
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li
              key={index}
              className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              {item.priority && (
                <Badge
                  variant={getPriorityColor(item.priority)}
                  size="sm"
                  className="mt-0.5"
                >
                  {getPriorityLabel(item.priority)}
                </Badge>
              )}
              <span className="text-sm">
                {typeof item === "string" ? item : item.text || item.action}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="py-8 flex flex-col items-center gap-4">
        <LoadingSpinner size="md" />
        <p className="text-neutral-500">Loading actions...</p>
      </div>
    );
  }

  if (!actions) {
    return (
      <EmptyState
        title="No Actions Available"
        description="Click refresh to get AI-suggested actions for your project."
        icon={<ClockIcon className="w-12 h-12 text-neutral-400" />}
        action={
          onRefresh && (
            <Button
              onClick={onRefresh}
              icon={<ArrowPathIcon className="w-4 h-4" />}
            >
              Refresh
            </Button>
          )
        }
      />
    );
  }

  const { actions: actionItems, summary, timestamp } = actions;

  return (
    <div className="next-actions space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium flex items-center gap-2">
          <ClockIcon className="w-5 h-5 text-primary-500" />
          Suggested Next Actions
        </h3>
        {onRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            icon={<ArrowPathIcon className="w-4 h-4" />}
          >
            Refresh
          </Button>
        )}
      </div>

      {summary && (
        <div className="p-3 bg-primary-50 rounded-lg text-sm text-primary-700">
          {summary}
        </div>
      )}

      <div className="space-y-2">
        {actionItems && (
          <>
            {renderActionItems(actionItems.immediate, "⚠️ Immediate Actions")}
            {renderActionItems(
              actionItems.shortTerm,
              "📋 Short Term (1-2 weeks)"
            )}
            {renderActionItems(
              actionItems.mediumTerm,
              "📊 Medium Term (1-3 months)"
            )}
            {renderActionItems(
              actionItems.longTerm,
              "🎯 Long Term (3+ months)"
            )}
          </>
        )}
      </div>

      {timestamp && (
        <div className="text-xs text-neutral-400 text-right">
          Generated: {new Date(timestamp).toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default NextActions;
