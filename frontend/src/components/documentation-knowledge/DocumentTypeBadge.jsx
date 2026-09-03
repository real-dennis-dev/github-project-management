// src/components/documentation-knowledge/DocumentTypeBadge.jsx
import React from "react";
import { Badge } from "../common";
import {
  Code,
  GitBranch,
  GitMerge,
  FileText,
  Users,
  MoreHorizontal,
} from "lucide-react";

const DocumentTypeBadge = ({ type, size = "md" }) => {
  const configs = {
    api: {
      label: "API",
      icon: Code,
      variant: "primary",
    },
    erd: {
      label: "ERD",
      icon: GitBranch,
      variant: "info",
    },
    flowchart: {
      label: "Flowchart",
      icon: GitMerge,
      variant: "warning",
    },
    user_manual: {
      label: "User Manual",
      icon: Users,
      variant: "success",
    },
    technical: {
      label: "Technical",
      icon: FileText,
      variant: "secondary",
    },
    other: {
      label: "Other",
      icon: MoreHorizontal,
      variant: "neutral",
    },
  };

  const config = configs[type] || configs.other;
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      size={size}
      className="flex items-center space-x-1"
    >
      <Icon className="w-3 h-3" />
      <span>{config.label}</span>
    </Badge>
  );
};

export default DocumentTypeBadge;
