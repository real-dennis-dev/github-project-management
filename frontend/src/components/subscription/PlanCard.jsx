// src/components/subscription/PlanCard.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Button, Modal } from "../common";
import { useSubscription } from "../../hooks/useSubscription";
import { useToast } from "../../hooks/useToast";
import BillingCycleBadge from "./BillingCycleBadge";
import { Check, X, Edit, Trash2, Star, Package } from "lucide-react";

const PlanCard = ({ plan, isAdmin = false }) => {
  const navigate = useNavigate();
  const { deletePlan } = useSubscription();
  const { toast } = useToast();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    id,
    name,
    description,
    plan_type,
    price,
    billing_cycle,
    features,
    limits,
    is_active,
    is_default,
    trial_days,
  } = plan;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deletePlan(id);
      if (result.success) {
        toast.success("Plan deleted successfully");
        setShowDeleteModal(false);
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete plan");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    navigate(`/plans/${id}/edit`);
  };

  const handleSelect = () => {
    navigate(`/subscriptions/new?plan=${id}`);
  };

  const featureList = Object.entries(features || {}).slice(0, 4);
  const hasMoreFeatures = Object.keys(features || {}).length > 4;

  return (
    <div
      className={`bg-neutral-100 border rounded-lg p-6 transition-all ${
        is_default
          ? "border-primary-500 ring-2 ring-primary-500/20"
          : "border-neutral-300 hover:border-primary-400"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">{name}</h3>
          {is_default && (
            <Badge
              variant="primary"
              size="sm"
              className="mt-1 flex items-center space-x-1"
            >
              <Star className="w-3 h-3" />
              <span>Default</span>
            </Badge>
          )}
          {!is_active && (
            <Badge variant="neutral" size="sm" className="mt-1">
              Inactive
            </Badge>
          )}
        </div>
        <Badge variant="info" size="sm">
          {plan_type?.charAt(0).toUpperCase() + plan_type?.slice(1)}
        </Badge>
      </div>

      <div className="mt-4">
        <p className="text-3xl font-bold text-neutral-900">
          ${price?.toFixed(2)}
          <span className="text-sm font-normal text-neutral-500">
            {" "}
            / {billing_cycle}
          </span>
        </p>
      </div>

      {description && (
        <p className="mt-2 text-sm text-neutral-600 line-clamp-2">
          {description}
        </p>
      )}

      {trial_days > 0 && (
        <Badge variant="success" size="sm" className="mt-2">
          {trial_days} days free trial
        </Badge>
      )}

      {featureList.length > 0 && (
        <div className="mt-4 space-y-1">
          <p className="text-xs font-medium text-neutral-500 uppercase">
            Features
          </p>
          {featureList.map(([key, value]) => (
            <div key={key} className="flex items-center text-sm">
              {value ? (
                <Check className="w-4 h-4 text-success mr-2 flex-shrink-0" />
              ) : (
                <X className="w-4 h-4 text-neutral-400 mr-2 flex-shrink-0" />
              )}
              <span className="text-neutral-700">{key.replace(/_/g, " ")}</span>
            </div>
          ))}
          {hasMoreFeatures && (
            <p className="text-xs text-neutral-500">
              +{Object.keys(features).length - 4} more
            </p>
          )}
        </div>
      )}

      {limits && Object.keys(limits).length > 0 && (
        <div className="mt-3 pt-3 border-t border-neutral-300">
          <p className="text-xs font-medium text-neutral-500 uppercase">
            Limits
          </p>
          <div className="flex flex-wrap gap-2 mt-1">
            {Object.entries(limits)
              .slice(0, 3)
              .map(([key, value]) => (
                <Badge key={key} variant="neutral" size="sm">
                  {key.replace(/_/g, " ")}: {value}
                </Badge>
              ))}
            {Object.keys(limits).length > 3 && (
              <Badge variant="neutral" size="sm">
                +{Object.keys(limits).length - 3} more
              </Badge>
            )}
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-neutral-300 space-y-2">
        {isAdmin ? (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              className="flex-1"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <Button
            variant={is_default ? "primary" : "secondary"}
            size="sm"
            fullWidth
            onClick={handleSelect}
          >
            Select Plan
          </Button>
        )}
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Plan"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-neutral-700">
            Are you sure you want to delete the plan <strong>{name}</strong>?
            This action cannot be undone.
          </p>
          <p className="text-sm text-warning">
            Note: Plans with active subscriptions cannot be deleted.
          </p>
          <div className="flex space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={isDeleting}
              disabled={isDeleting}
              className="flex-1"
            >
              Delete Plan
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PlanCard;
