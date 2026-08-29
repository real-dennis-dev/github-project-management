// src/components/subscription/PlanSelector.jsx
import React, { useEffect, useState } from "react";
import { useSubscription } from "../../hooks/useSubscription";
import { useToast } from "../../hooks/useToast";
import { LoadingSpinner, Alert, Button, Badge } from "../common";
import { Check, Star } from "lucide-react";

const PlanSelector = ({ onSelect, selectedPlanId }) => {
  const { getPublicPlans, plans, isLoading, error, clearError } =
    useSubscription();
  const { toast } = useToast();
  const [selectedId, setSelectedId] = useState(selectedPlanId);

  useEffect(() => {
    getPublicPlans();
  }, []);

  const handleSelect = (plan) => {
    setSelectedId(plan.id);
    if (onSelect) {
      onSelect(plan);
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" className="my-8" />;
  }

  if (error) {
    return (
      <Alert variant="error" onClose={clearError}>
        {error}
      </Alert>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-500">
        No plans available at the moment.
      </div>
    );
  }

  // Sort plans by price
  const sortedPlans = [...plans].sort((a, b) => a.price - b.price);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sortedPlans.map((plan) => (
        <div
          key={plan.id}
          className={`bg-neutral-100 border-2 rounded-lg p-6 transition-all cursor-pointer ${
            selectedId === plan.id
              ? "border-primary-500 ring-2 ring-primary-500/20"
              : "border-neutral-300 hover:border-primary-400"
          }`}
          onClick={() => handleSelect(plan)}
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">
                {plan.name}
              </h3>
              {plan.plan_type && (
                <Badge variant="info" size="sm" className="mt-1">
                  {plan.plan_type.charAt(0).toUpperCase() +
                    plan.plan_type.slice(1)}
                </Badge>
              )}
            </div>
            {plan.is_default && (
              <Badge variant="primary" className="flex items-center space-x-1">
                <Star className="w-3 h-3" />
                <span>Default</span>
              </Badge>
            )}
          </div>

          <div className="mt-4">
            <p className="text-3xl font-bold text-neutral-900">
              ${plan.price.toFixed(2)}
              <span className="text-sm font-normal text-neutral-500">
                / {plan.billing_cycle}
              </span>
            </p>
          </div>

          {plan.description && (
            <p className="mt-2 text-sm text-neutral-600">{plan.description}</p>
          )}

          {plan.features && Object.keys(plan.features).length > 0 && (
            <div className="mt-4 space-y-1">
              <p className="text-sm font-medium text-neutral-700">Features:</p>
              <ul className="space-y-1">
                {Object.entries(plan.features).map(([key, value]) => (
                  <li
                    key={key}
                    className="flex items-center text-sm text-neutral-600"
                  >
                    <Check
                      className={`w-4 h-4 mr-2 ${
                        value ? "text-success" : "text-neutral-400"
                      }`}
                    />
                    {key.replace(/_/g, " ")}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {plan.limits && Object.keys(plan.limits).length > 0 && (
            <div className="mt-4 space-y-1">
              <p className="text-sm font-medium text-neutral-700">Limits:</p>
              <ul className="space-y-1">
                {Object.entries(plan.limits).map(([key, value]) => (
                  <li key={key} className="text-sm text-neutral-600">
                    {key.replace(/_/g, " ")}: {value}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {plan.trial_days > 0 && (
            <Badge variant="success" size="sm" className="mt-4">
              {plan.trial_days} days free trial
            </Badge>
          )}

          <Button
            variant={selectedId === plan.id ? "primary" : "outline"}
            fullWidth
            className="mt-6"
            onClick={() => handleSelect(plan)}
          >
            {selectedId === plan.id ? "Selected" : "Select Plan"}
          </Button>
        </div>
      ))}
    </div>
  );
};

export default PlanSelector;
