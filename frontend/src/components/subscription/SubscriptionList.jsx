// src/components/subscription/SubscriptionList.jsx
import React, { useEffect, useState } from "react";
import { useSubscription } from "../../hooks/useSubscription";
import { useToast } from "../../hooks/useToast";
import {
  LoadingSpinner,
  Alert,
  EmptyState,
  Pagination,
  Badge,
  Button,
} from "../common";
import SubscriptionCard from "./SubscriptionCard";
import { CreditCard, Plus } from "lucide-react";

const SubscriptionList = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const {
    getSubscriptions,
    subscriptions,
    pagination,
    isLoading,
    error,
    clearError,
    setFilters,
    filters,
  } = useSubscription();
  const { toast } = useToast();

  const limit = 10;

  useEffect(() => {
    const params = {
      page,
      limit,
      status: statusFilter || undefined,
      ...filters,
    };
    getSubscriptions(params);
  }, [page, statusFilter, filters]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status === statusFilter ? "" : status);
    setPage(1);
  };

  const statusOptions = [
    "active",
    "inactive",
    "past_due",
    "canceled",
    "trialing",
    "expired",
  ];

  if (isLoading && subscriptions.length === 0) {
    return <LoadingSpinner size="lg" className="my-8" />;
  }

  if (error) {
    return (
      <Alert variant="error" onClose={clearError}>
        {error}
      </Alert>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <EmptyState
        title="No Subscriptions"
        description="You don't have any subscriptions yet. Browse our plans to get started."
        icon={<CreditCard className="w-12 h-12 text-neutral-400" />}
        action={
          <Button variant="primary" href="/plans">
            <Plus className="w-4 h-4 mr-2" />
            Browse Plans
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-neutral-900">My Subscriptions</h2>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-neutral-500 mr-2">Filter:</span>
          {statusOptions.map((status) => (
            <Badge
              key={status}
              variant={statusFilter === status ? "primary" : "neutral"}
              className="cursor-pointer hover:opacity-80"
              onClick={() => handleStatusFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {subscriptions.map((subscription) => (
          <SubscriptionCard key={subscription.id} subscription={subscription} />
        ))}
      </div>

      {pagination.pages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={pagination.pages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default SubscriptionList;
