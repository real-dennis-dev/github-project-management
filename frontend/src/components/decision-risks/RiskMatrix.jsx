// src/components/decision-risks/RiskMatrix.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { getRiskLevelColor } from "../../hooks/useDecisionRisk";

const RiskMatrix = ({ matrix }) => {
  const navigate = useNavigate();
  const levels = ["low", "medium", "high", "critical"];

  if (!matrix) return null;

  const getCellColor = (level, status) => {
    // Color by risk level primarily
    return getRiskLevelColor(level);
  };

  const getRiskCount = (level, status) => {
    const risks = matrix[level]?.[status] || [];
    return risks.length;
  };

  const getRisksInCell = (level, status) => {
    return matrix[level]?.[status] || [];
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr>
            <th className="p-2 border border-neutral-300 bg-neutral-100 text-neutral-600 font-medium text-sm">
              Risk Level / Status
            </th>
            {[
              "identified",
              "monitoring",
              "mitigated",
              "realized",
              "closed",
            ].map((status) => (
              <th
                key={status}
                className="p-2 border border-neutral-300 bg-neutral-100 text-neutral-600 font-medium text-sm capitalize"
              >
                {status}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {levels.map((level) => (
            <tr key={level}>
              <td
                className={`p-2 border border-neutral-300 font-medium capitalize text-sm text-center ${getRiskLevelColor(
                  level
                )}`}
              >
                {level}
              </td>
              {[
                "identified",
                "monitoring",
                "mitigated",
                "realized",
                "closed",
              ].map((status) => {
                const count = getRiskCount(level, status);
                const risks = getRisksInCell(level, status);
                return (
                  <td
                    key={`${level}-${status}`}
                    className={`p-2 border border-neutral-300 text-center align-top ${
                      count > 0 ? "cursor-pointer hover:bg-neutral-50" : ""
                    }`}
                    onClick={() => {
                      if (count > 0 && risks.length > 0) {
                        // Navigate to filtered risks view
                        navigate(`/risks?level=${level}&status=${status}`);
                      }
                    }}
                  >
                    <div
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        count > 0
                          ? getCellColor(level, status)
                          : "text-neutral-400"
                      }`}
                    >
                      {count}
                    </div>
                    {count > 0 && risks.length <= 3 && (
                      <div className="mt-1 text-xs text-neutral-500 space-y-1">
                        {risks.map((risk) => (
                          <div
                            key={risk.id}
                            className="truncate hover:text-primary-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/risks/${risk.id}`);
                            }}
                          >
                            {risk.title}
                          </div>
                        ))}
                      </div>
                    )}
                    {count > 3 && (
                      <div className="mt-1 text-xs text-neutral-400">
                        +{count - 3} more
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RiskMatrix;
