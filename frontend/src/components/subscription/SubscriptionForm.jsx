// src/components/subscription/SubscriptionForm.jsx
import React, { useState, useEffect } from "react";
import { useSubscription } from "../../hooks/useSubscription";
import { useToast } from "../../hooks/useToast";
import { Button, Input, Select, Alert } from "../common";
import PlanSelector from "./PlanSelector";

const SubscriptionForm = ({ onSuccess, initialData }) => {
  const {
    createSubscription,
    updateSubscription,
    isLoading,
    error,
    clearError,
  } = useSubscription();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    plan_id: initialData?.plan_id || "",
    interval: initialData?.interval || "monthly",
    trial_days: initialData?.trial_days || 0,
    payment_method_id: initialData?.payment_method_id || "",
  });

  const [validationErrors, setValidationErrors] = useState({});

  const intervalOptions = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "quarterly", label: "Quarterly" },
    { value: "yearly", label: "Yearly" },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePlanSelect = (plan) => {
    setFormData((prev) => ({
      ...prev,
      plan_id: plan.id,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors({});
    clearError();

    if (!formData.plan_id) {
      setValidationErrors({ plan_id: "Please select a plan" });
      return;
    }

    try {
      let result;
      if (initialData?.id) {
        result = await updateSubscription(initialData.id, formData);
      } else {
        result = await createSubscription(formData);
      }

      if (result.success) {
        toast.success(
          initialData?.id
            ? "Subscription updated successfully"
            : "Subscription created successfully"
        );
        if (onSuccess) {
          onSuccess(result.data);
        }
      }
    } catch (err) {
      // Error handled by hook
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="error" onClose={clearError}>
          {error}
        </Alert>
      )}

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Select Plan
        </label>
        <PlanSelector
          onSelect={handlePlanSelect}
          selectedPlanId={formData.plan_id}
        />
        {validationErrors.plan_id && (
          <p className="mt-1 text-sm text-error">{validationErrors.plan_id}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Select
            label="Billing Interval"
            name="interval"
            value={formData.interval}
            onChange={handleChange}
            options={intervalOptions}
            fullWidth
          />
        </div>

        <div>
          <Input
            label="Trial Days"
            name="trial_days"
            type="number"
            value={formData.trial_days}
            onChange={handleChange}
            min="0"
            helper="Number of free trial days (0 for no trial)"
            fullWidth
          />
        </div>
      </div>

      <div>
        <Input
          label="Payment Method ID (Optional)"
          name="payment_method_id"
          value={formData.payment_method_id}
          onChange={handleChange}
          placeholder="stripe_pm_123..."
          fullWidth
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        loading={isLoading}
        disabled={isLoading}
        fullWidth
      >
        {initialData?.id ? "Update Subscription" : "Create Subscription"}
      </Button>
    </form>
  );
};

export default SubscriptionForm;
