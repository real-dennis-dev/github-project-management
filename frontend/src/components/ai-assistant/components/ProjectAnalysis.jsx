// src/components/ai-assistant/components/ProjectAnalysis.jsx
import React, { useState } from "react";
import {
  Button,
  Select,
  LoadingSpinner,
  Alert,
  ProgressBar,
  Badge,
} from "../../common";
import {
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  UsersIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

const ProjectAnalysis = ({ onAnalyze, analysis, loading = false }) => {
  const [focus, setFocus] = useState("overall");
  const [depth, setDepth] = useState("standard");

  const focusOptions = [
    { value: "overall", label: "Overall Project Health" },
    { value: "risks", label: "Risk Assessment" },
    { value: "performance", label: "Performance" },
    { value: "quality", label: "Quality" },
    { value: "resources", label: "Resources" },
    { value: "timeline", label: "Timeline" },
  ];

  const depthOptions = [
    { value: "quick", label: "Quick Overview" },
    { value: "standard", label: "Standard Analysis" },
    { value: "deep", label: "Deep Analysis" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onAnalyze(focus, depth);
  };

  const renderMetrics = (metrics) => {
    if (!metrics) return null;

    const metricItems = [
      {
        key: "features",
        label: "Features",
        icon: <DocumentTextIcon className="w-4 h-4" />,
      },
      {
        key: "bugs",
        label: "Bugs",
        icon: <ExclamationTriangleIcon className="w-4 h-4" />,
      },
      {
        key: "decisions",
        label: "Decisions",
        icon: <CheckCircleIcon className="w-4 h-4" />,
      },
      {
        key: "risks",
        label: "Risks",
        icon: <ExclamationTriangleIcon className="w-4 h-4" />,
      },
      {
        key: "milestones",
        label: "Milestones",
        icon: <ClockIcon className="w-4 h-4" />,
      },
    ];

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {metricItems.map((item) => (
          <div
            key={item.key}
            className="bg-neutral-50 p-4 rounded-lg text-center"
          >
            <div className="flex justify-center text-neutral-400 mb-1">
              {item.icon}
            </div>
            <div className="text-2xl font-bold text-neutral-900">
              {metrics[item.key] ?? 0}
            </div>
            <div className="text-xs text-neutral-500">{item.label}</div>
          </div>
        ))}
      </div>
    );
  };

  const renderActions = (actions) => {
    if (!actions || actions.length === 0) return null;

    const priorityColors = {
      high: "error",
      medium: "warning",
      low: "info",
    };

    return (
      <div className="mt-4">
        <h4 className="font-medium mb-2">Recommended Actions</h4>
        <ul className="space-y-2">
          {actions.map((action, index) => (
            <li
              key={index}
              className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg"
            >
              <Badge
                variant={priorityColors[action.priority] || "neutral"}
                size="sm"
              >
                {action.priority || "normal"}
              </Badge>
              <span className="text-sm">{action.text || action}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="project-analysis space-y-6">
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end">
        <Select
          label="Analysis Focus"
          value={focus}
          onChange={setFocus}
          options={focusOptions}
          className="min-w-[180px]"
        />
        <Select
          label="Analysis Depth"
          value={depth}
          onChange={setDepth}
          options={depthOptions}
          className="min-w-[160px]"
        />
        <Button type="submit" loading={loading} disabled={loading}>
          {loading ? "Analyzing..." : "Analyze Project"}
        </Button>
      </form>

      {loading && (
        <div className="py-8 flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" />
          <p className="text-neutral-500">Analyzing project data...</p>
        </div>
      )}

      {analysis && !loading && (
        <div className="space-y-6">
          {/* Summary */}
          {analysis.summary && (
            <div className="p-4 bg-primary-50 rounded-lg border border-primary-100">
              <h3 className="font-medium text-primary-800 mb-1">
                Analysis Summary
              </h3>
              <p className="text-primary-700">{analysis.summary}</p>
            </div>
          )}

          {/* Metrics */}
          {analysis.metrics && (
            <div>
              <h3 className="font-medium mb-3">Project Metrics</h3>
              {renderMetrics(analysis.metrics)}
            </div>
          )}

          {/* Detailed Analysis */}
          {analysis.analysis && (
            <div>
              <h3 className="font-medium mb-3">Detailed Analysis</h3>
              <div className="bg-neutral-50 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm">
                  {typeof analysis.analysis === "string"
                    ? analysis.analysis
                    : JSON.stringify(analysis.analysis, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Actions */}
          {analysis.actions && renderActions(analysis.actions)}

          {/* Footer */}
          {analysis.timestamp && (
            <div className="text-xs text-neutral-400 text-right">
              Analyzed at: {new Date(analysis.timestamp).toLocaleString()}
            </div>
          )}
        </div>
      )}

      {!analysis && !loading && (
        <div className="text-center py-12 text-neutral-400">
          <ChartBarIcon className="w-12 h-12 mx-auto mb-3" />
          <p>Select analysis options and click "Analyze Project"</p>
        </div>
      )}
    </div>
  );
};

export default ProjectAnalysis;
