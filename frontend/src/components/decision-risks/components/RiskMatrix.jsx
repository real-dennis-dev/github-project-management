// src/components/decision-risks/components/RiskMatrix.jsx
import React from "react";
import { Badge } from "../../../components/common/Badge";
import { LoadingSpinner } from "../../../components/common/LoadingSpinner";
import { EmptyState } from "../../../components/common/EmptyState";

const RiskMatrix = ({ matrix, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!matrix) {
    return (
      <EmptyState
        title="No risk matrix data"
        description="Risk matrix data is not available"
      />
    );
  }

  const levelLabels = {
    low: "Low",
    medium: "Medium",
    high: "High",
    critical: "Critical",
  };

  const levelColors = {
    low: "success",
    medium: "warning",
    high: "warning",
    critical: "error",
  };

  const levels = ["critical", "high", "medium", "low"];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
        Risk Matrix
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {levels.map((level) => {
          const levelData = matrix[level];
          const totalRisks = Object.values(levelData || {}).reduce(
            (sum, items) => sum + (items?.length || 0),
            0
          );

          return (
            <div
              key={level}
              className="bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden"
            >
              <div
                className={`p-3 bg-${levelColors[level]}/10 border-b border-neutral-200 dark:border-neutral-700`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    {levelLabels[level]}
                  </span>
                  <Badge variant={levelColors[level]} size="sm">
                    {totalRisks} risks
                  </Badge>
                </div>
              </div>

              <div className="p-3 space-y-2 max-h-[400px] overflow-y-auto">
                {levels.map((subLevel) => {
                  const items = levelData?.[subLevel] || [];
                  if (items.length === 0) return null;

                  return (
                    <div key={subLevel} className="space-y-1">
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">
                        {levelLabels[subLevel]}:
                      </div>
                      {items.map((risk) => (
                        <div
                          key={risk.id}
                          className="text-sm p-2 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-600"
                        >
                          <div className="font-medium text-neutral-900 dark:text-neutral-100 truncate">
                            {risk.title}
                          </div>
                          {risk.status && (
                            <div className="text-xs text-neutral-500 dark:text-neutral-400">
                              Status: {risk.status}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })}

                {totalRisks === 0 && (
                  <div className="text-sm text-neutral-500 dark:text-neutral-400 text-center py-4">
                    No risks at this level
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RiskMatrix;
