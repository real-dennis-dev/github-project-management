// src/components/ai/ProjectAnalysis.jsx
import React, { useState } from "react";
import { Button, Select, LoadingSpinner, Alert, Badge } from "../common";
import { useAI } from "../../hooks/useAI";
import { useToast } from "../../hooks/useToast";
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

const ProjectAnalysis = ({ projectId }) => {
  const [focus, setFocus] = useState("overall");
  const [depth, setDepth] = useState("standard");
  const { analyzeProject, currentAnalysis, isAnalyzing, error, clearError } =
    useAI();
  const { toast } = useToast();

  const focusOptions = [
    { value: "overall", label: "Overall" },
    { value: "risks", label: "Risks" },
    { value: "performance", label: "Performance" },
    { value: "quality", label: "Quality" },
    { value: "resources", label: "Resources" },
    { value: "timeline", label: "Timeline" },
  ];

  const depthOptions = [
    { value: "quick", label: "Quick" },
    { value: "standard", label: "Standard" },
    { value: "deep", label: "Deep" },
  ];

  const handleAnalyze = async () => {
    try {
      const result = await analyzeProject(projectId, { focus, depth });
      if (result.success) {
        toast.success("Analysis completed successfully");
      }
    } catch (err) {
      toast.error(err.message || "Failed to analyze project");
    }
  };

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-neutral-900">Project Analysis</h2>
        <div className="flex items-center space-x-3">
          <Select
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
            options={focusOptions}
            className="w-40"
          />
          <Select
            value={depth}
            onChange={(e) => setDepth(e.target.value)}
            options={depthOptions}
            className="w-36"
          />
          <Button
            onClick={handleAnalyze}
            loading={isAnalyzing}
            disabled={isAnalyzing}
            variant="primary"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Analyze
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="error" onClose={clearError}>
          {error}
        </Alert>
      )}

      {isAnalyzing && <LoadingSpinner size="lg" className="my-8" />}

      {currentAnalysis && !isAnalyzing && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-3">
              Summary
            </h3>
            <p className="text-neutral-700">{currentAnalysis.summary}</p>
          </div>

          {/* Metrics */}
          {currentAnalysis.metrics && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(currentAnalysis.metrics).map(([key, value]) => (
                <div
                  key={key}
                  className="bg-neutral-100 border border-neutral-300 rounded-lg p-4 text-center"
                >
                  <p className="text-2xl font-bold text-primary-500">{value}</p>
                  <p className="text-sm text-neutral-500 capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          {currentAnalysis.actions && currentAnalysis.actions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-3">
                Suggested Actions
              </h3>
              <div className="space-y-2">
                {currentAnalysis.actions.map((action, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-neutral-100 border border-neutral-300 rounded-lg"
                  >
                    <span className="text-neutral-700">{action.text}</span>
                    <div className="flex items-center space-x-2">
                      {action.priority && (
                        <Badge variant={getPriorityColor(action.priority)}>
                          {action.priority}
                        </Badge>
                      )}
                      {action.source && (
                        <Badge variant="info" size="sm">
                          {action.source}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timestamp */}
          {currentAnalysis.timestamp && (
            <p className="text-xs text-neutral-500">
              Analyzed: {new Date(currentAnalysis.timestamp).toLocaleString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectAnalysis;
