// src/components/techdebt/RefactoringSuggestions.jsx
import React, { useEffect } from "react";
import { useTechDebt } from "../../hooks/useTechDebt";
import { LoadingSpinner, Alert, Badge, Button } from "../common";
import TechDebtPriorityBadge from "./TechDebtPriorityBadge";
import { Lightbulb, Clock, ArrowRight } from "lucide-react";

const RefactoringSuggestions = ({ projectId }) => {
  const { getSuggestions, suggestions, isLoading, error, clearError } =
    useTechDebt();

  useEffect(() => {
    if (projectId) {
      getSuggestions(projectId);
    }
  }, [projectId]);

  if (isLoading) {
    return <LoadingSpinner size="lg" className="my-8" />;
  }

  if (error) {
    return (
      <Alert variant="error" onClose={clearError}>
        {error}
      </Alert>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-500">
        No refactoring suggestions available.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900">
          Refactoring Suggestions
        </h3>
        <Badge variant="info" size="sm">
          {suggestions.length} suggestions
        </Badge>
      </div>

      <div className="space-y-4">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className="bg-neutral-100 border border-neutral-300 rounded-lg p-4 hover:border-primary-400 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Lightbulb className="w-5 h-5 text-warning" />
                  <h4 className="font-medium text-neutral-900">
                    {suggestion.title}
                  </h4>
                </div>

                <div className="space-y-2">
                  {suggestion.suggestion && (
                    <div>
                      <p className="text-sm font-medium text-neutral-700">
                        Recommended Action:
                      </p>
                      <p className="text-sm text-neutral-600">
                        {suggestion.suggestion.recommendedAction}
                      </p>
                    </div>
                  )}

                  {suggestion.suggestion && (
                    <div className="flex flex-wrap gap-3 text-sm">
                      {suggestion.suggestion.priority && (
                        <div className="flex items-center space-x-1">
                          <span className="text-neutral-500">Priority:</span>
                          <TechDebtPriorityBadge
                            priority={suggestion.suggestion.priority}
                            size="sm"
                          />
                        </div>
                      )}
                      {suggestion.suggestion.urgency !== undefined && (
                        <div className="flex items-center space-x-1">
                          <span className="text-neutral-500">Urgency:</span>
                          <Badge variant="warning" size="sm">
                            {suggestion.suggestion.urgency}/10
                          </Badge>
                        </div>
                      )}
                      {suggestion.suggestion.estimatedTimeframe && (
                        <div className="flex items-center space-x-1">
                          <span className="text-neutral-500">Timeframe:</span>
                          <Badge variant="info" size="sm">
                            {suggestion.suggestion.estimatedTimeframe}
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}

                  {suggestion.effort !== undefined && (
                    <div className="flex items-center space-x-1 text-sm">
                      <Clock className="w-4 h-4 text-neutral-500" />
                      <span className="text-neutral-500">
                        Estimated Effort:
                      </span>
                      <span className="text-neutral-700">
                        {suggestion.effort}h
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-1"
                onClick={() => {
                  // Navigate to the tech debt item
                  window.location.href = `/tech-debt/${projectId}/${suggestion.id}`;
                }}
              >
                <span>View</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RefactoringSuggestions;
