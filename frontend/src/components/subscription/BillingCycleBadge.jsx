// src/components/subscription/BillingCycleBadge.jsx
import React from "react";
import { Badge } from "../common";
import { Calendar, Clock, CalendarDays, CalendarRange } from "lucide-react";

const BillingCycleBadge = ({ cycle, size = "md" }) => {
  const configs = {
    monthly: {
      label: "Monthly",
      icon: Calendar,
      variant: "info",
    },
    yearly: {
      label: "Yearly",
      icon: CalendarRange,
      variant: "primary",
    },
    quarterly: {
      label: "Quarterly",
      icon: CalendarDays,
      variant: "warning",
    },
    daily: {
      label: "Daily",
      icon: Clock,
      variant: "secondary",
    },
    weekly: {
      label: "Weekly",
      icon: Calendar,
      variant: "neutral",
    },
  };

  const config = configs[cycle] || configs.monthly;
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

export default BillingCycleBadge;
