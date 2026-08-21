// src/components/decision-risks/ImpactBadge.jsx
import React from "react";
import { Badge } from "../common";

const ImpactBadge = ({ impact, size = "sm", className = "" }) => {
  const colorMap = {
    low: "success",
    medium: "info",
    high: "warning",
    critical: "error",
  };

  return (
    <Badge
      variant={colorMap[impact] || "neutral"}
      size={size}
      className={className}
    >
      {impact.charAt(0).toUpperCase() + impact.slice(1)}
    </Badge>
  );
};

export default ImpactBadge;
