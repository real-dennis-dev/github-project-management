// src/components/decision-risks/components/RiskStatusBadge.jsx
import React from "react";
import { Badge } from "../../../components/common/Badge";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield,
  XCircle,
} from "lucide-react";

const statusConfig = {
  identified: {
    variant: "warning",
    icon: AlertTriangle,
    label: "Identified",
  },
  monitoring: {
    variant: "info",
    icon: Clock,
    label: "Monitoring",
  },
  mitigated: {
    variant: "success",
    icon: Shield,
    label: "Mitigated",
  },
  realized: {
    variant: "error",
    icon: XCircle,
    label: "Realized",
  },
  closed: {
    variant: "neutral",
    icon: CheckCircle,
    label: "Closed",
  },
};

const RiskStatusBadge = ({ status, size = "md", showIcon = true }) => {
  const config = statusConfig[status] || statusConfig.identified;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} size={size}>
      {showIcon && (
        <Icon className={`w-3 h-3 ${size === "sm" ? "mr-1" : "mr-1.5"}`} />
      )}
      {config.label}
    </Badge>
  );
};

export default RiskStatusBadge;
