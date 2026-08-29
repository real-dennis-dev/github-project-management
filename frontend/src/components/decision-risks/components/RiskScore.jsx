// src/components/decision-risks/components/RiskScore.jsx
import React from "react";
import { Badge } from "../../../components/common/Badge";
import { ProgressBar } from "../../../components/common/ProgressBar";
import { AlertTriangle, CheckCircle, Shield, XCircle } from "lucide-react";

const RiskScore = ({ score }) => {
  if (!score) {
    return null;
  }

  const getRiskLevelColor = (level) => {
    switch (level) {
      case "critical":
        return "error";
      case "high":
        return "warning";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "neutral";
    }
  };

  const getRiskLevelIcon = (level) => {
    switch (level) {
      case "critical":
        return XCircle;
      case "high":
        return AlertTriangle;
      case "medium":
        return AlertTriangle;
      case "low":
        return CheckCircle;
      default:
        return Shield;
    }
  };

  const riskLevels = [
    { key: "critical", label: "Critical" },
    { key: "high", label: "High" },
    { key: "medium", label: "Medium" },
    { key: "low", label: "Low" },
  ];

  const Icon = getRiskLevelIcon(score.riskLevel);

  // Calculate percentage for progress bar
  const maxScore = 100;
  const avgScore = score.averageScore || 0;
  const progressPercentage = Math.min((avgScore / maxScore) * 100, 100);

  return (
    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`p-3 rounded-lg bg-${getRiskLevelColor(
              score.riskLevel
            )}/10`}
          >
            <Icon
              className={`w-6 h-6 text-${getRiskLevelColor(
                score.riskLevel
              )}-500`}
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Risk Score Summary
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Overall risk assessment for this project
            </p>
          </div>
        </div>
        <Badge variant={getRiskLevelColor(score.riskLevel)} size="lg">
          {score.riskLevel?.toUpperCase() || "UNKNOWN"}
        </Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        <div className="text-center p-3 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-600">
          <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {score.totalRisks || 0}
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400">
            Total Risks
          </div>
        </div>
        <div className="text-center p-3 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-600">
          <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {score.averageScore || 0}
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400">
            Avg Score
          </div>
        </div>
        <div className="text-center p-3 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-600">
          <div className="text-2xl font-bold text-error-500">
            {score.criticalCount || 0}
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400">
            Critical
          </div>
        </div>
        <div className="text-center p-3 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-600">
          <div className="text-2xl font-bold text-warning-500">
            {score.highCount || 0}
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400">
            High
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Overall Risk Score
          </span>
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            {avgScore} / {maxScore}
          </span>
        </div>
        <ProgressBar
          value={avgScore}
          max={maxScore}
          variant={getRiskLevelColor(score.riskLevel)}
          size="md"
        />
      </div>

      {score.totalRisks > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {riskLevels.map(({ key, label }) => {
            const count = score[`${key}Count`] || 0;
            if (count === 0) return null;
            return (
              <Badge key={key} variant={getRiskLevelColor(key)} size="sm">
                {label}: {count}
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RiskScore;
