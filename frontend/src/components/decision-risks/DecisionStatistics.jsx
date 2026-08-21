// src/components/decision-risks/DecisionStatistics.jsx
import React from "react";
import { Card } from "../common";

const DecisionStatistics = ({ statistics }) => {
  if (!statistics) return null;

  const { total, byImpact, recentDecisions, impactDistribution } = statistics;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="text-sm text-neutral-500">Total Decisions</div>
          <div className="text-2xl font-bold text-neutral-900">
            {total || 0}
          </div>
        </Card>
        {byImpact && (
          <>
            <Card className="p-4 text-center">
              <div className="text-sm text-neutral-500">Critical</div>
              <div className="text-2xl font-bold text-red-600">
                {byImpact.critical || 0}
              </div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-sm text-neutral-500">High</div>
              <div className="text-2xl font-bold text-orange-600">
                {byImpact.high || 0}
              </div>
            </Card>
            <Card className="p-4 text-center">
              <div className="text-sm text-neutral-500">Medium</div>
              <div className="text-2xl font-bold text-yellow-600">
                {byImpact.medium || 0}
              </div>
            </Card>
          </>
        )}
      </div>

      {impactDistribution && impactDistribution.length > 0 && (
        <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
          <h4 className="text-sm font-medium text-neutral-700 mb-2">
            Impact Distribution
          </h4>
          <div className="flex gap-4 flex-wrap">
            {impactDistribution.map((item) => (
              <div key={item.impact} className="flex items-center gap-2">
                <span className="text-sm text-neutral-600 capitalize">
                  {item.impact}:
                </span>
                <span className="text-sm font-medium">{item.count}</span>
                <span className="text-xs text-neutral-400">
                  ({item.percentage})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {recentDecisions && recentDecisions.length > 0 && (
        <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
          <h4 className="text-sm font-medium text-neutral-700 mb-2">
            Recent Decisions
          </h4>
          <ul className="space-y-1">
            {recentDecisions.slice(0, 5).map((decision) => (
              <li key={decision.id} className="text-sm text-neutral-600">
                {decision.title}{" "}
                <span className="text-neutral-400">
                  ({new Date(decision.created_at).toLocaleDateString()})
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DecisionStatistics;
