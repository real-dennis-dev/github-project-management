// src/components/documentation-knowledge/DocumentationStats.jsx
import React from "react";
import { Badge } from "../common";
import {
  FileText,
  BookOpen,
  Activity,
  BarChart3,
  Clock,
  Layers,
} from "lucide-react";

const DocumentationStats = ({ stats }) => {
  if (!stats) return null;

  const { totals, byType, recentActivity } = stats;

  const statCards = [
    {
      label: "Total Documentation",
      value: totals?.documentation || 0,
      icon: FileText,
      color: "primary",
    },
    {
      label: "Total Knowledge Entries",
      value: totals?.knowledge || 0,
      icon: BookOpen,
      color: "info",
    },
    {
      label: "Combined Total",
      value: totals?.combined || 0,
      icon: Layers,
      color: "success",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-neutral-100 border border-neutral-300 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-neutral-900">
                    {stat.value}
                  </p>
                </div>
                <Icon className={`w-8 h-8 text-${stat.color}-500 opacity-50`} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* By Type / Category */}
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
          <h4 className="text-sm font-medium text-neutral-700 mb-3">
            Documentation by Type
          </h4>
          <div className="flex flex-wrap gap-2">
            {byType?.documentation?.map((item) => (
              <Badge key={item.type} variant="primary" size="sm">
                {item.type}: {item.count}
              </Badge>
            ))}
          </div>
        </div>

        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
          <h4 className="text-sm font-medium text-neutral-700 mb-3">
            Knowledge by Category
          </h4>
          <div className="flex flex-wrap gap-2">
            {byType?.knowledge?.map((item) => (
              <Badge key={item.category} variant="info" size="sm">
                {item.category}: {item.count}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {recentActivity && (
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
          <h4 className="text-sm font-medium text-neutral-700 mb-3">
            Recent Activity
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-neutral-500">Last 7 Days</p>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="primary" size="sm">
                  Docs: {recentActivity.last7Days?.documentation || 0}
                </Badge>
                <Badge variant="info" size="sm">
                  Knowledge: {recentActivity.last7Days?.knowledge || 0}
                </Badge>
                <Badge variant="success" size="sm">
                  Total: {recentActivity.last7Days?.combined || 0}
                </Badge>
              </div>
            </div>
            <div>
              <p className="text-xs text-neutral-500">Last 30 Days</p>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="primary" size="sm">
                  Docs: {recentActivity.last30Days?.documentation || 0}
                </Badge>
                <Badge variant="info" size="sm">
                  Knowledge: {recentActivity.last30Days?.knowledge || 0}
                </Badge>
                <Badge variant="success" size="sm">
                  Total: {recentActivity.last30Days?.combined || 0}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentationStats;
