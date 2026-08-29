// src/components/ai/NextActions.jsx
import React from "react";
import { LoadingSpinner, Alert, Badge } from "../common";
import { useAI } from "../../hooks/useAI";
import { Clock, Zap, Calendar, CalendarDays, BarChart3 } from "lucide-react";

const NextActions = ({ projectId }) => {
  const {
    getNextActions,
    currentActions,
    isActionsLoading,
    error,
    clearError,
  } = useAI();

  // Fetch actions on mount
  React.useEffect(() => {
    if (projectId) {
      getNextActions(projectId);
    }
  }, [projectId]);

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "neutral";
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return <Clock className="w-4 h-4" />;
      case "medium":
        return <Calendar className="w-4 h-4" />;
      case "low":
        return <CalendarDays className="w-4 h-4" />;
      default:
        return <BarChart3 className="w-4 h-4" />;
    }
  };

  if (isActionsLoading) {
    return <LoadingSpinner size="md" className="my-4" />;
  }

  if (error) {
    return (
      <Alert variant="error" onClose={clearError}>
        {error}
      </Alert>
    );
  }

  if (!currentActions) {
    return (
      <div className="text-center py-8 text-neutral-500">
        No actions available. Try analyzing the project first.
      </div>
    );
  }

  const actionCategories = [
    { key: "immediate", label: "Immediate", icon: Clock, color: "error" },
    { key: "shortTerm", label: "Short Term", icon: Calendar, color: "warning" },
    {
      key: "mediumTerm",
      label: "Medium Term",
      icon: CalendarDays,
      color: "info",
    },
    { key: "longTerm", label: "Long Term", icon: BarChart3, color: "success" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-neutral-900">
          Suggested Next Actions
        </h2>
        {currentActions.summary && (
          <Badge variant="info" size="lg">
            {currentActions.summary}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {actionCategories.map((category) => {
          const actions = currentActions.actions?.[category.key] || [];
          if (actions.length === 0) return null;

          const Icon = category.icon;
          return (
            <div
              key={category.key}
              className="bg-neutral-100 border border-neutral-300 rounded-lg p-4"
            >
              <div className="flex items-center space-x-2 mb-3">
                <Icon className={`w-5 h-5 text-${category.color}-500`} />
                <h3 className="font-semibold text-neutral-900">
                  {category.label}
                </h3>
              </div>
              <div className="space-y-2">
                {actions.map((action, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-neutral-200 rounded-lg hover:bg-neutral-300 transition-colors"
                  >
                    <span className="text-neutral-700 text-sm">
                      {typeof action === "string"
                        ? action
                        : action.text || JSON.stringify(action)}
                    </span>
                    {action.priority && (
                      <Badge
                        variant={getPriorityColor(action.priority)}
                        size="sm"
                      >
                        {getPriorityIcon(action.priority)}
                        <span className="ml-1">{action.priority}</span>
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {currentActions.timestamp && (
        <p className="text-xs text-neutral-500 text-right">
          Generated: {new Date(currentActions.timestamp).toLocaleString()}
        </p>
      )}
    </div>
  );
};

export default NextActions;
