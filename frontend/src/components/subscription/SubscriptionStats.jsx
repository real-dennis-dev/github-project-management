// src/components/subscription/SubscriptionStats.jsx
import React from "react";
import { useSubscription } from "../../hooks/useSubscription";
import { LoadingSpinner, Alert, Badge } from "../common";
import {
  Users,
  CreditCard,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";

const SubscriptionStats = () => {
  const { getSubscriptions, subscriptionStats, isLoading, error, clearError } =
    useSubscription();

  React.useEffect(() => {
    getSubscriptions({ page: 1, limit: 1 });
  }, []);

  if (isLoading && !subscriptionStats) {
    return <LoadingSpinner size="md" className="my-4" />;
  }

  if (error) {
    return (
      <Alert variant="error" onClose={clearError}>
        {error}
      </Alert>
    );
  }

  if (!subscriptionStats) {
    return null;
  }

  const { total, byStatus, activeCount, revenue } = subscriptionStats;

  const statusConfig = {
    active: { icon: CheckCircle, color: "success", label: "Active" },
    trialing: { icon: CheckCircle, color: "info", label: "Trialing" },
    past_due: { icon: AlertCircle, color: "warning", label: "Past Due" },
    canceled: { icon: XCircle, color: "neutral", label: "Canceled" },
    expired: { icon: XCircle, color: "error", label: "Expired" },
    inactive: { icon: AlertCircle, color: "neutral", label: "Inactive" },
  };

  const statsCards = [
    {
      label: "Total Subscriptions",
      value: total,
      icon: Users,
      color: "primary",
    },
    {
      label: "Active Subscriptions",
      value: activeCount,
      icon: CheckCircle,
      color: "success",
    },
    {
      label: "Monthly Revenue",
      value: `$${revenue?.monthly?.toFixed(2) || "0.00"}`,
      icon: CreditCard,
      color: "info",
    },
    {
      label: "Yearly Revenue",
      value: `$${revenue?.yearly?.toFixed(2) || "0.00"}`,
      icon: CreditCard,
      color: "warning",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-neutral-100 border border-neutral-300 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-neutral-900">
                    {stat.value}
                  </p>
                </div>
                <Icon className={`w-8 h-8 text-${stat.color}-500 opacity-50`} />
              </div>
            </div>
          );
        })}
      </div>

      {byStatus && Object.keys(byStatus).length > 0 && (
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
          <h4 className="text-sm font-medium text-neutral-700 mb-3">
            Status Breakdown
          </h4>
          <div className="flex flex-wrap gap-3">
            {Object.entries(byStatus).map(([status, count]) => {
              const config = statusConfig[status] || statusConfig.inactive;
              const Icon = config.icon;
              return (
                <Badge
                  key={status}
                  variant={config.color}
                  className="flex items-center space-x-1"
                >
                  <Icon className="w-3 h-3" />
                  <span>
                    {config.label}: {count}
                  </span>
                </Badge>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionStats;
