// src/components/subscription/SubscriptionCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Badge, Button } from "../common";
import { useSubscription } from "../../hooks/useSubscription";
import { useToast } from "../../hooks/useToast";
import {
  Calendar,
  Clock,
  CreditCard,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";

const SubscriptionCard = ({ subscription }) => {
  const { cancelSubscription } = useSubscription();
  const { toast } = useToast();

  const {
    id,
    plan,
    status,
    status_label,
    status_color,
    status_icon,
    is_active,
    is_expiring_soon,
    current_period,
    trial,
    cancel_at_period_end,
    created_at,
  } = subscription;

  const getStatusIcon = () => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4" />;
      case "trialing":
        return <Clock className="w-4 h-4" />;
      case "canceled":
        return <XCircle className="w-4 h-4" />;
      case "past_due":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleCancel = async () => {
    if (window.confirm("Are you sure you want to cancel this subscription?")) {
      try {
        const result = await cancelSubscription(id);
        if (result.success) {
          toast.success("Subscription cancelled successfully");
        }
      } catch (err) {
        toast.error(err.message || "Failed to cancel subscription");
      }
    }
  };

  return (
    <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6 hover:border-primary-400 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-neutral-900">
              {plan?.name || "Unknown Plan"}
            </h3>
            <Badge
              variant={status_color}
              className="flex items-center space-x-1"
            >
              {getStatusIcon()}
              <span>{status_label || status}</span>
            </Badge>
          </div>
          {plan?.plan_type && (
            <Badge variant="info" size="sm" className="mb-2">
              {plan.plan_type.charAt(0).toUpperCase() + plan.plan_type.slice(1)}
            </Badge>
          )}
          {cancel_at_period_end && (
            <Badge variant="warning" size="sm" className="ml-2">
              Cancels at period end
            </Badge>
          )}
          {is_expiring_soon && (
            <Badge variant="error" size="sm" className="ml-2">
              Expiring Soon
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Link to={`/subscriptions/${id}`}>
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </Link>
          {is_active && status !== "canceled" && (
            <Button variant="danger" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-neutral-500">Price</p>
          <p className="text-neutral-900 font-medium">
            ${plan?.price?.toFixed(2) || "0.00"}
            {plan?.billing_cycle && ` / ${plan.billing_cycle}`}
          </p>
        </div>
        <div>
          <p className="text-neutral-500">Status</p>
          <p className="text-neutral-900">{status_label || status}</p>
        </div>
        <div>
          <p className="text-neutral-500">Current Period</p>
          <p className="text-neutral-900">
            {formatDate(current_period?.start)} -{" "}
            {formatDate(current_period?.end)}
          </p>
          {current_period?.days_remaining !== null && (
            <p className="text-xs text-neutral-500">
              {current_period.days_remaining} days remaining
            </p>
          )}
        </div>
        <div>
          <p className="text-neutral-500">Started</p>
          <p className="text-neutral-900">{formatDate(created_at)}</p>
        </div>
        {trial && (
          <div className="col-span-2">
            <p className="text-neutral-500">Trial Period</p>
            <p className="text-neutral-900">
              {formatDate(trial.start)} - {formatDate(trial.end)}
              {trial.days_remaining !== null && trial.days_remaining > 0 && (
                <span className="ml-2 text-primary-500">
                  ({trial.days_remaining} days remaining)
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionCard;
