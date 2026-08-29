// src/components/subscription/PlanList.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "../../hooks/useSubscription";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import {
  LoadingSpinner,
  Alert,
  EmptyState,
  Pagination,
  Badge,
  Button,
  SearchBar,
} from "../common";
import PlanCard from "./PlanCard";
import { Package, Plus, Layers } from "lucide-react";

const PlanList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    getPlans,
    plans,
    pagination,
    isLoading,
    error,
    clearError,
    setFilters,
    filters,
  } = useSubscription();
  const { toast } = useToast();

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [planTypeFilter, setPlanTypeFilter] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const isAdmin = user?.role === "admin" || user?.role === "project_manager";

  const limit = 12;

  useEffect(() => {
    const params = {
      page,
      limit,
      plan_type: planTypeFilter || undefined,
      is_active: showInactive ? undefined : true,
      ...filters,
    };
    getPlans(params);
  }, [page, planTypeFilter, showInactive, filters]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setFilters({ search: value });
    setPage(1);
  };

  const typeOptions = [
    { value: "", label: "All Types" },
    { value: "free", label: "Free" },
    { value: "basic", label: "Basic" },
    { value: "pro", label: "Pro" },
    { value: "enterprise", label: "Enterprise" },
    { value: "custom", label: "Custom" },
  ];

  // Filter plans based on search term
  const filteredPlans = plans.filter((plan) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      plan.name.toLowerCase().includes(search) ||
      plan.description?.toLowerCase().includes(search) ||
      plan.plan_type?.toLowerCase().includes(search)
    );
  });

  if (isLoading && plans.length === 0) {
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
      <EmptyState
        title="No Plans Available"
        description="There are no plans available at the moment."
        icon={<Package className="w-12 h-12 text-neutral-400" />}
        action={
          isAdmin && (
            <Button variant="primary" onClick={() => navigate("/plans/new")}>
              <Plus className="w-4 h-4 mr-2" />
              Create Plan
            </Button>
          )
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-bold text-neutral-900">Plans</h1>
          <Badge variant="info" size="lg">
            {plans.length} plans
          </Badge>
        </div>
        {isAdmin && (
          <Button variant="primary" onClick={() => navigate("/plans/new")}>
            <Plus className="w-4 h-4 mr-2" />
            Create Plan
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <SearchBar
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search plans..."
          className="flex-1 min-w-[200px]"
        />
        <div className="flex items-center space-x-2">
          <select
            value={planTypeFilter}
            onChange={(e) => setPlanTypeFilter(e.target.value)}
            className="px-3 py-2 bg-neutral-200 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {isAdmin && (
            <label className="flex items-center space-x-2 text-sm text-neutral-700">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
              />
              <span>Show Inactive</span>
            </label>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredPlans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} isAdmin={isAdmin} />
        ))}
      </div>

      {filteredPlans.length === 0 && (
        <div className="text-center py-8 text-neutral-500">
          <Layers className="w-12 h-12 mx-auto mb-3 text-neutral-400" />
          <p>No plans match your search criteria</p>
        </div>
      )}

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

export default PlanList;
