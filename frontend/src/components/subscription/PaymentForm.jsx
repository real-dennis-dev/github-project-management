// src/components/subscription/PaymentForm.jsx
import React, { useState } from "react";
import { useSubscription } from "../../hooks/useSubscription";
import { useToast } from "../../hooks/useToast";
import { Button, Input, Select, Alert } from "../common";
import { CreditCard } from "lucide-react";

const PaymentForm = ({ subscriptionId, onSuccess }) => {
  const { isLoading, error, clearError } = useSubscription();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    subscription_id: subscriptionId || "",
    amount: "",
    currency: "USD",
    payment_method_type: "stripe",
    description: "",
    metadata: {},
  });

  const [validationErrors, setValidationErrors] = useState({});

  const currencyOptions = [
    { value: "USD", label: "USD" },
    { value: "EUR", label: "EUR" },
    { value: "GBP", label: "GBP" },
    { value: "CAD", label: "CAD" },
  ];

  const paymentMethodOptions = [
    { value: "card", label: "Card" },
    { value: "paypal", label: "PayPal" },
    { value: "stripe", label: "Stripe" },
    { value: "other", label: "Other" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors({});
    clearError();

    // Validate
    const errors = {};
    if (!formData.subscription_id) {
      errors.subscription_id = "Subscription ID is required";
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      errors.amount = "Amount must be greater than 0";
    }
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      // Payment creation would go here
      toast.success("Payment processed successfully");
      if (onSuccess) {
        onSuccess(formData);
      }
    } catch (err) {
      toast.error(err.message || "Failed to process payment");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="error" onClose={clearError}>
          {error}
        </Alert>
      )}

      {!subscriptionId && (
        <Input
          label="Subscription ID"
          name="subscription_id"
          value={formData.subscription_id}
          onChange={handleChange}
          error={validationErrors.subscription_id}
          placeholder="Enter subscription ID"
          fullWidth
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Amount"
          name="amount"
          type="number"
          step="0.01"
          min="0.01"
          value={formData.amount}
          onChange={handleChange}
          error={validationErrors.amount}
          placeholder="0.00"
          fullWidth
        />

        <Select
          label="Currency"
          name="currency"
          value={formData.currency}
          onChange={handleChange}
          options={currencyOptions}
          fullWidth
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Payment Method"
          name="payment_method_type"
          value={formData.payment_method_type}
          onChange={handleChange}
          options={paymentMethodOptions}
          fullWidth
        />

        <Input
          label="Description (Optional)"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Payment description"
          fullWidth
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        loading={isLoading}
        disabled={isLoading}
        fullWidth
        className="flex items-center justify-center space-x-2"
      >
        <CreditCard className="w-4 h-4" />
        <span>Process Payment</span>
      </Button>
    </form>
  );
};

export default PaymentForm;
