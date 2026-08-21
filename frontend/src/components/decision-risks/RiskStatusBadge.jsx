// src/components/decision-risks/RiskStatusBadge.jsx
import React from "react";
import { Badge } from "../common";
import {
  getRiskStatusColor,
  getRiskStatusBadge,
} from "../../hooks/useDecisionRisk";

const RiskStatusBadge = ({ status, size = "sm", className = "" }) => {
  const colorMap = {
    identified: "info",
    monitoring: "warning",
    mitigated: "success",
    realized: "error",
    closed: "neutral",
  };

  return (
    <Badge
      variant={colorMap[status] || "neutral"}
      size={size}
      className={className}
    >
      {getRiskStatusBadge(status)}
    </Badge>
  );
};

export default RiskStatusBadge;
