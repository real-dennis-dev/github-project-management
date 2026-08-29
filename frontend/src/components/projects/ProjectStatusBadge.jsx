// src/components/projects/ProjectStatusBadge.jsx
import React from "react";
import { Badge } from "../common";

const ProjectStatusBadge = ({ status, size = "md" }) => {
  const statusConfig = {
    planning: { label: "Planning", variant: "info" },
    in_progress: { label: "In Progress", variant: "warning" },
    paused: { label: "Paused", variant: "neutral" },
    completed: { label: "Completed", variant: "success" },
    archived: { label: "Archived", variant: "secondary" },
  };

  const config = statusConfig[status] || statusConfig.planning;

  return (
    <Badge variant={config.variant} size={size}>
      {config.label}
    </Badge>
  );
};

export default ProjectStatusBadge;
