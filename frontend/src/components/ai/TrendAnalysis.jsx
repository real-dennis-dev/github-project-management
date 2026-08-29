// src/components/ai/TrendAnalysis.jsx
import React from "react";
import { LoadingSpinner, Alert, Badge } from "../common";
import { useAI } from "../../hooks/useAI";
import { TrendingUp, TrendingDown, Minus, Zap } from "lucide-react";

const TrendAnalysis = ({ projectId }) => {
  const { getTrends, currentTrends, isTrendsLoading, error, clearError } =
    useAI();

  React.useEffect(() => {
    if (projectId) {
      getTrends(projectId);
    }
  }, [projectId]);

  if (isTrendsLoading) {
    return <LoadingSpinner size="md" className="my-4" />;
  }

  if (error) {
    return (
      <Alert variant="error" onClose={clearError}>
        {error}
      </Alert>
    );
  }

  if (!currentTrends) {
    return (
      <div className="text-center py-8 text-neutral-500">
        No trend data available. The project may not have enough historical
        data.
      </div>
    );
  }

  const trendCategories = [
    { key: "positive", label: "Positive", icon: TrendingUp, color: "success" },
    { key: "negative", label: "Negative", icon: TrendingDown, color: "error" },
    { key: "neutral", label: "Neutral", icon: Minus, color: "neutral" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-neutral-900">Trend Analysis</h2>
        {currentTrends.summary && (
          <Badge variant="info" size="lg">
            {currentTrends.summary}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {trendCategories.map((category) => {
          const items = currentTrends.trends?.[category.key] || [];
          if (items.length === 0) return null;

          const Icon = category.icon;
          return (
            <div
              key={category.key}
              className={`bg-neutral-100 border border-neutral-300 rounded-lg p-4`}
            >
              <div className="flex items-center space-x-2 mb-3">
                <Icon className={`w-5 h-5 text-${category.color}-500`} />
                <h3 className="font-semibold text-neutral-900">
                  {category.label}
                </h3>
                <Badge variant={category.color} size="sm">
                  {items.length}
                </Badge>
              </div>
              <ul className="space-y-1">
                {items.map((item, index) => (
                  <li key={index} className="text-sm text-neutral-700">
                    {typeof item === "string" ? item : JSON.stringify(item)}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Predictions */}
      {currentTrends.predictions && currentTrends.predictions.length > 0 && (
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-3">
            <Zap className="w-5 h-5 text-primary-500" />
            <h3 className="font-semibold text-neutral-900">Predictions</h3>
          </div>
          <ul className="space-y-1">
            {currentTrends.predictions.map((prediction, index) => (
              <li key={index} className="text-sm text-neutral-700">
                • {prediction}
              </li>
            ))}
          </ul>
        </div>
      )}

      {currentTrends.timestamp && (
        <p className="text-xs text-neutral-500 text-right">
          Analyzed: {new Date(currentTrends.timestamp).toLocaleString()}
        </p>
      )}
    </div>
  );
};

export default TrendAnalysis;
