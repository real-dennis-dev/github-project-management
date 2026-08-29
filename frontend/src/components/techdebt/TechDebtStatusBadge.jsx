// src/components/techdebt/TechDebtStatusBadge.jsx
import React from "react";
import { Badge } from "../common";

const TechDebtStatusBadge = ({ status, size = "md" }) => {
  const configs = {
    identified: {
      label: "Identified",
      variant: "neutral",
    },
    planned: {
      label: "Planned",
      variant: "info",
    },
    in_progress: {
      label: "In Progress",
      variant: "warning",
    },
    resolved: {
      label: "Resolved",
      variant: "success",
    },
    ignored: {
      label: "Ignored",
      variant: "neutral",
    },
  };

  const config = configs[status] || configs.identified;

  return (
    <Badge variant={config.variant} size={size}>
      {config.label}
    </Badge>
  );
};

export default TechDebtStatusBadge;
