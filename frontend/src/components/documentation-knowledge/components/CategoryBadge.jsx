// src/components/documentation-knowledge/components/CategoryBadge.jsx

import React from "react";
import { Badge } from "../../common";

const CATEGORY_COLORS = {
  General: "neutral",
  Technical: "primary",
  Design: "secondary",
  "Project Management": "warning",
  "Best Practices": "success",
  Troubleshooting: "error",
  Development: "info",
  Operations: "primary",
  Security: "error",
  Database: "info",
  Frontend: "secondary",
  Backend: "primary",
  API: "success",
  Testing: "warning",
  DevOps: "primary",
};

const CategoryBadge = ({ category, size = "md", className = "" }) => {
  const color = CATEGORY_COLORS[category] || "neutral";

  return (
    <Badge variant={color} size={size} className={className}>
      {category}
    </Badge>
  );
};

export default CategoryBadge;
