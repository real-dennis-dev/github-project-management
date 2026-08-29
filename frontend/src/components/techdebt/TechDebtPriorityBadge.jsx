// src/components/techdebt/TechDebtPriorityBadge.jsx
import React from "react";
import { Badge } from "../common";

const TechDebtPriorityBadge = ({ priority, size = "md" }) => {
  const configs = {
    critical: {
      label: "Critical",
      variant: "error",
    },
    high: {
      label: "High",
      variant: "warning",
    },
    medium: {
      label: "Medium",
      variant: "info",
    },
    low: {
      label: "Low",
      variant: "neutral",
    },
  };

  const config = configs[priority] || configs.low;

  return (
    <Badge variant={config.variant} size={size}>
      {config.label}
    </Badge>
  );
};

export default TechDebtPriorityBadge;
