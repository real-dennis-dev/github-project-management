// src/components/subscription/SubscriptionDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSubscription } from "../../hooks/useSubscription";
import { useToast } from "../../hooks/useToast";
import {
  LoadingSpinner,
  Alert,
  Badge,
  Button,
  Modal,
  Breadcrumb,
} from "../common";
import BillingCycleBadge from "./BillingCycleBadge";
import {
  ArrowLeft,
  Calendar,
  Clock,
  CreditCard,
  AlertCircle,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  RefreshCw,
} from "lucide-react";

const SubscriptionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    getSubscription,
    currentSubscription,
    isLoading,
    error,
    clearError,
    cancelSubscription,
  } = useSubscription();
  const { toast } = useToast();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    if (id) {
      getSubscription(id);
    }
  }, [id]);

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCancel = async () => {
    try {
      const result = await cancelSubscription(id, { reason: cancelReason });
      if (result.success) {
        toast.success("Subscription cancelled successfully");
        setShowCancelModal(false);
        getSubscription(id);
      }
    } catch (err) {
      toast.error(err.message || "Failed to cancel subscription");
    }
  };

  if (isLoading && !currentSubscription) {
    return <LoadingSpinner size="lg" className="my-8" />;
  }

  if (error) {
    return (
      <Alert variant="error" onClose={clearError}>
        {error}
      </Alert>
    );
  }

  if (!currentSubscription) {
    return <Alert variant="warning">Subscription not found</Alert>;
  }

  const {
    plan,
    status,
    status_label,
    status_color,
    status_icon,
    is_active,
    cancel_at_period_end,
  } = currentSubscription;

  const getStatusIcon = () => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-6 h-6 text-success" />;
      case "trialing":
        return <Clock className="w-6 h-6 text-info" />;
      case "canceled":
        return <XCircle className="w-6 h-6 text-neutral-500" />;
      case "past_due":
        return <AlertCircle className="w-6 h-6 text-error" />;
      default:
        return <AlertCircle className="w-6 h-6 text-neutral-500" />;
    }
  };

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Subscriptions", href: "/subscriptions" },
    { label: `Subscription #${id?.slice(0, 8)}` },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/subscriptions")}
            className="p-2 hover:bg-neutral-200 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-neutral-900">
            Subscription Details
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          {is_active && status !== "canceled" && (
            <Button
              variant="danger"
              onClick={() => setShowCancelModal(true)}
              className="flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Cancel</span>
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={() => getSubscription(id)}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Status Card */}
      <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6">
        <div className="flex items-center space-x-4">
          {getStatusIcon()}
          <div>
            <p className="text-sm text-neutral-500">Status</p>
            <p className="text-lg font-semibold text-neutral-900">
              {status_label || status}
            </p>
          </div>
          {cancel_at_period_end && (
            <Badge variant="warning" size="lg">
              Cancels at period end
            </Badge>
          )}
        </div>
      </div>

      {/* Plan Information */}
      <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">
          Plan Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-neutral-500">Plan Name</p>
            <p className="text-lg font-medium text-neutral-900">
              {plan?.name || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Plan Type</p>
            <Badge variant="info" size="lg">
              {plan?.plan_type || "N/A"}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Price</p>
            <p className="text-lg font-medium text-neutral-900">
              ${plan?.price?.toFixed(2) || "0.00"}
            </p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Billing Cycle</p>
            <BillingCycleBadge cycle={plan?.billing_cycle} size="lg" />
          </div>
        </div>
        {plan?.description && (
          <div className="mt-4">
            <p className="text-sm text-neutral-500">Description</p>
            <p className="text-neutral-700">{plan.description}</p>
          </div>
        )}
      </div>

      {/* Period Information */}
      <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">
          Period Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-neutral-500">Current Period Start</p>
            <p className="text-neutral-900">
              {formatDate(currentSubscription.current_period?.start)}
            </p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Current Period End</p>
            <p className="text-neutral-900">
              {formatDate(currentSubscription.current_period?.end)}
            </p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Days Remaining</p>
            <p className="text-lg font-medium text-neutral-900">
              {currentSubscription.current_period?.days_remaining ?? "N/A"}
            </p>
          </div>
        </div>
        {currentSubscription.trial && (
          <div className="mt-4 pt-4 border-t border-neutral-300">
            <p className="text-sm text-neutral-500">Trial Period</p>
            <p className="text-neutral-900">
              {formatDate(currentSubscription.trial.start)} -{" "}
              {formatDate(currentSubscription.trial.end)}
              {currentSubscription.trial.days_remaining !== null && (
                <span className="ml-2 text-primary-500">
                  ({currentSubscription.trial.days_remaining} days remaining)
                </span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Features */}
      {plan?.features && Object.keys(plan.features).length > 0 && (
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            Features
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(plan.features).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-2">
                {value ? (
                  <CheckCircle className="w-4 h-4 text-success" />
                ) : (
                  <XCircle className="w-4 h-4 text-neutral-400" />
                )}
                <span className="text-neutral-700">
                  {key.replace(/_/g, " ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Limits */}
      {plan?.limits && Object.keys(plan.limits).length > 0 && (
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            Limits
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(plan.limits).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-2">
                <span className="text-neutral-700">
                  {key.replace(/_/g, " ")}: <strong>{value}</strong>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">
          Additional Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-neutral-500">Subscription ID</p>
            <p className="text-neutral-900 text-sm font-mono">
              {currentSubscription.id}
            </p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Created At</p>
            <p className="text-neutral-900">
              {formatDate(currentSubscription.created_at)}
            </p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Last Updated</p>
            <p className="text-neutral-900">
              {formatDate(currentSubscription.updated_at)}
            </p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Plan ID</p>
            <p className="text-neutral-900 text-sm font-mono">{plan?.id}</p>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Subscription"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-neutral-700">
            Are you sure you want to cancel this subscription? This action can
            be undone until the end of the current billing period.
          </p>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Reason (Optional)
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Why are you cancelling?"
              className="w-full p-3 bg-neutral-200 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows="3"
            />
          </div>
          <div className="flex space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowCancelModal(false)}
            >
              Keep Subscription
            </Button>
            <Button variant="danger" onClick={handleCancel} className="flex-1">
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SubscriptionDetail;
