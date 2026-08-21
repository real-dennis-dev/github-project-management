// src/components/ai-assistant/components/TrendAnalysis.jsx
import React from "react";
import { Button, LoadingSpinner, Badge, EmptyState } from "../../common";
import {
  ChartBarIcon,
  ArrowPathIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MinusIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

const TrendAnalysis = ({ trends, loading = false, onRefresh }) => {
  if (loading) {
    return (
      <div className="py-8 flex flex-col items-center gap-4">
        <LoadingSpinner size="md" />
        <p className="text-neutral-500">Analyzing trends...</p>
      </div>
    );
  }

  if (!trends) {
    return (
      <EmptyState
        title="No Trend Data Available"
        description="Click refresh to analyze project trends."
        icon={<ChartBarIcon className="w-12 h-12 text-neutral-400" />}
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

  const { trends: trendItems, summary, predictions, timestamp } = trends;

  const renderTrendGroup = (items, title, icon, variant) => {
    if (!items || items.length === 0) return null;

    const iconMap = {
      positive: <ArrowUpIcon className="w-4 h-4 text-success" />,
      negative: <ArrowDownIcon className="w-4 h-4 text-error" />,
      neutral: <MinusIcon className="w-4 h-4 text-neutral-400" />,
    };

    return (
      <div className="mb-3">
        <h4 className="font-medium text-sm text-neutral-600 mb-2 flex items-center gap-2">
          {iconMap[icon] || iconMap.neutral}
          {title}
        </h4>
        <ul className="space-y-1">
          {items.map((item, index) => (
            <li
              key={index}
              className="flex items-center gap-2 text-sm p-2 bg-neutral-50 rounded-lg"
            >
              <Badge
                variant={variant}
                size="sm"
                className="w-16 justify-center"
              >
                {icon}
              </Badge>
              <span>{typeof item === "string" ? item : item.text || item}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="trend-analysis space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium flex items-center gap-2">
          <ChartBarIcon className="w-5 h-5 text-primary-500" />
          Trend Analysis
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
        <div className="p-3 bg-neutral-50 rounded-lg text-sm">{summary}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {renderTrendGroup(
          trendItems?.positive,
          "Positive Trends",
          "positive",
          "success"
        )}
        {renderTrendGroup(
          trendItems?.negative,
          "Areas for Improvement",
          "negative",
          "error"
        )}
        {renderTrendGroup(
          trendItems?.neutral,
          "Stable Areas",
          "neutral",
          "neutral"
        )}
      </div>

      {predictions && predictions.length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium text-sm text-neutral-600 mb-2 flex items-center gap-2">
            <InformationCircleIcon className="w-4 h-4 text-info" />
            AI Predictions
          </h4>
          <ul className="space-y-1">
            {predictions.map((prediction, index) => (
              <li
                key={index}
                className="text-sm p-2 bg-blue-50 rounded-lg text-blue-700"
              >
                {prediction}
              </li>
            ))}
          </ul>
        </div>
      )}

      {timestamp && (
        <div className="text-xs text-neutral-400 text-right">
          Analyzed: {new Date(timestamp).toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default TrendAnalysis;
