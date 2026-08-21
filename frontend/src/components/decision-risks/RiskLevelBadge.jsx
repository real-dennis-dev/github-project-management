// src/components/decision-risks/RiskLevelBadge.jsx
import React from "react";
import { Badge } from "../common";

const RiskLevelBadge = ({ level, size = "sm", className = "" }) => {
  const colorMap = {
    low: "success",
    medium: "info",
    high: "warning",
    critical: "error",
  };

  return (
    <Badge
      variant={colorMap[level] || "neutral"}
      size={size}
      className={className}
    >
      {level.charAt(0).toUpperCase() + level.slice(1)}
    </Badge>
  );
};

export default RiskLevelBadge;
