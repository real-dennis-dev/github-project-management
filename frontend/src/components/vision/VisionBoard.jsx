// src/components/vision/VisionBoard.jsx
import React, { useState, useEffect } from "react";
import { useVision } from "../../hooks/useVision";
import { useToast } from "../../hooks/useToast";
import VisionGoalList from "./VisionGoalList";
import VisionStatistics from "./VisionStatistics";
import VisionGoalForm from "./VisionGoalForm";
import VisionCategoryFilter from "./VisionCategoryFilter";
import { Button, Modal, LoadingSpinner, Alert } from "../common";
import { Plus, Eye } from "lucide-react";

const VisionBoard = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const {
    getGoals,
    getStatistics,
    getCategories,
    getOptions,
    isLoading,
    error,
    clearError,
    filters,
    setFilters,
  } = useVision();
  const { toast } = useToast();

  useEffect(() => {
    getGoals(filters);
    getStatistics();
    getCategories();
    getOptions();
  }, []);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    getGoals({ ...filters, ...newFilters });
  };

  const handleGoalCreated = () => {
    setShowCreateModal(false);
    getGoals(filters);
    getStatistics();
    toast.success("Vision goal created successfully");
  };

  if (isLoading && !goals.length) {
    return <LoadingSpinner size="lg" className="my-8" />;
  }

  if (error) {
    return (
      <Alert variant="error" onClose={clearError}>
        {error}
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Eye className="w-8 h-8 text-primary-500" />
          <h1 className="text-2xl font-bold text-neutral-900">Vision Board</h1>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex border border-neutral-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1.5 text-sm ${
                viewMode === "grid"
                  ? "bg-primary-500 text-white"
                  : "bg-neutral-200 text-neutral-600 hover:bg-neutral-300"
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 text-sm ${
                viewMode === "list"
                  ? "bg-primary-500 text-white"
                  : "bg-neutral-200 text-neutral-600 hover:bg-neutral-300"
              }`}
            >
              List
            </button>
          </div>
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Goal
          </Button>
        </div>
      </div>

      <VisionStatistics />

      <VisionCategoryFilter onFilterChange={handleFilterChange} />

      <VisionGoalList viewMode={viewMode} />
    </div>
  );
};

export default VisionBoard;
