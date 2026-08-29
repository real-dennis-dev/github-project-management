// src/components/subscription/PlanForm.jsx
import React, { useState } from "react";
import { useSubscription } from "../../hooks/useSubscription";
import { useToast } from "../../hooks/useToast";
import { Button, Input, Textarea, Select, Switch, Alert } from "../common";
import { Plus, X } from "lucide-react";

const PlanForm = ({ onSuccess, initialData }) => {
  const { createPlan, updatePlan, isLoading, error, clearError, planOptions } =
    useSubscription();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    plan_type: initialData?.plan_type || "basic",
    price: initialData?.price || 0,
    billing_cycle: initialData?.billing_cycle || "monthly",
    features: initialData?.features || {},
    limits: initialData?.limits || {},
    is_active:
      initialData?.is_active !== undefined ? initialData.is_active : true,
    is_default: initialData?.is_default || false,
    trial_days: initialData?.trial_days || 0,
    sort_order: initialData?.sort_order || 0,
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [newFeatureKey, setNewFeatureKey] = useState("");
  const [newFeatureValue, setNewFeatureValue] = useState(true);
  const [newLimitKey, setNewLimitKey] = useState("");
  const [newLimitValue, setNewLimitValue] = useState(0);

  const typeOptions = [
    { value: "free", label: "Free" },
    { value: "basic", label: "Basic" },
    { value: "pro", label: "Pro" },
    { value: "enterprise", label: "Enterprise" },
    { value: "custom", label: "Custom" },
  ];

  const cycleOptions = [
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" },
    { value: "quarterly", label: "Quarterly" },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddFeature = () => {
    if (newFeatureKey.trim()) {
      setFormData((prev) => ({
        ...prev,
        features: {
          ...prev.features,
          [newFeatureKey.trim()]: newFeatureValue,
        },
      }));
      setNewFeatureKey("");
      setNewFeatureValue(true);
    }
  };

  const handleRemoveFeature = (key) => {
    setFormData((prev) => {
      const { [key]: _, ...rest } = prev.features;
      return { ...prev, features: rest };
    });
  };

  const handleAddLimit = () => {
    if (newLimitKey.trim()) {
      setFormData((prev) => ({
        ...prev,
        limits: {
          ...prev.limits,
          [newLimitKey.trim()]: Number(newLimitValue),
        },
      }));
      setNewLimitKey("");
      setNewLimitValue(0);
    }
  };

  const handleRemoveLimit = (key) => {
    setFormData((prev) => {
      const { [key]: _, ...rest } = prev.limits;
      return { ...prev, limits: rest };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors({});
    clearError();

    try {
      let result;
      if (initialData?.id) {
        result = await updatePlan(initialData.id, formData);
      } else {
        result = await createPlan(formData);
      }

      if (result.success) {
        toast.success(
          initialData?.id
            ? "Plan updated successfully"
            : "Plan created successfully"
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Plan Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          fullWidth
        />

        <Select
          label="Plan Type"
          name="plan_type"
          value={formData.plan_type}
          onChange={handleChange}
          options={typeOptions}
          fullWidth
        />
      </div>

      <Textarea
        label="Description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        rows={3}
        fullWidth
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Price"
          name="price"
          type="number"
          step="0.01"
          min="0"
          value={formData.price}
          onChange={handleChange}
          fullWidth
        />

        <Select
          label="Billing Cycle"
          name="billing_cycle"
          value={formData.billing_cycle}
          onChange={handleChange}
          options={cycleOptions}
          fullWidth
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Trial Days"
          name="trial_days"
          type="number"
          min="0"
          value={formData.trial_days}
          onChange={handleChange}
          fullWidth
        />

        <Input
          label="Sort Order"
          name="sort_order"
          type="number"
          min="0"
          value={formData.sort_order}
          onChange={handleChange}
          fullWidth
        />
      </div>

      <div className="flex items-center space-x-6">
        <Switch
          label="Active"
          checked={formData.is_active}
          onChange={() =>
            setFormData((prev) => ({ ...prev, is_active: !prev.is_active }))
          }
        />

        <Switch
          label="Default Plan"
          checked={formData.is_default}
          onChange={() =>
            setFormData((prev) => ({ ...prev, is_default: !prev.is_default }))
          }
        />
      </div>

      {/* Features Section */}
      <div className="bg-neutral-200 rounded-lg p-4">
        <h4 className="font-medium text-neutral-800 mb-3">Features</h4>
        <div className="flex flex-wrap gap-2 mb-3">
          {Object.entries(formData.features).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center bg-neutral-300 rounded-full px-3 py-1 text-sm"
            >
              <span>
                {key}: {value ? "✓" : "✗"}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveFeature(key)}
                className="ml-2 text-neutral-500 hover:text-error"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center space-x-2">
          <Input
            value={newFeatureKey}
            onChange={(e) => setNewFeatureKey(e.target.value)}
            placeholder="Feature name"
            className="flex-1"
          />
          <Switch
            checked={newFeatureValue}
            onChange={() => setNewFeatureValue(!newFeatureValue)}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleAddFeature}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Limits Section */}
      <div className="bg-neutral-200 rounded-lg p-4">
        <h4 className="font-medium text-neutral-800 mb-3">Limits</h4>
        <div className="flex flex-wrap gap-2 mb-3">
          {Object.entries(formData.limits).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center bg-neutral-300 rounded-full px-3 py-1 text-sm"
            >
              <span>
                {key}: {value}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveLimit(key)}
                className="ml-2 text-neutral-500 hover:text-error"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center space-x-2">
          <Input
            value={newLimitKey}
            onChange={(e) => setNewLimitKey(e.target.value)}
            placeholder="Limit name"
            className="flex-1"
          />
          <Input
            type="number"
            value={newLimitValue}
            onChange={(e) => setNewLimitValue(Number(e.target.value))}
            placeholder="Value"
            className="w-24"
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleAddLimit}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        loading={isLoading}
        disabled={isLoading}
        fullWidth
      >
        {initialData?.id ? "Update Plan" : "Create Plan"}
      </Button>
    </form>
  );
};

export default PlanForm;
