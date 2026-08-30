// src/components/vision/VisionGoalList.jsx
import React, { useState, useEffect } from "react";
import { useVision } from "../../hooks/useVision";
import VisionGoalCard from "./VisionGoalCard";
import {
  Pagination,
  Button,
  EmptyState,
  LoadingSpinner,
  Alert,
} from "../common";
import { Target, Plus } from "lucide-react";

const VisionGoalList = ({ viewMode = "grid" }) => {
  const {
    goals,
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
  const [page, setPage] = useState(1);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading && goals.length === 0) {
    return <LoadingSpinner size="lg" className="my-8" />;
  }

  if (error) {
    return (
      <Alert variant="error" onClose={clearError}>
        {error}
      </Alert>
    );
  }

  if (goals.length === 0) {
    return (
      <EmptyState
        title="No Vision Goals"
        description="Create your first vision goal to start tracking your progress."
        icon={<Target className="w-12 h-12 text-neutral-400" />}
        action={
          <Button variant="primary" href="/vision/new">
            <Plus className="w-4 h-4 mr-2" />
            Create Goal
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div
        className={`grid ${
          viewMode === "grid"
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            : "grid-cols-1"
        } gap-6`}
      >
        {goals.map((goal) => (
          <VisionGoalCard key={goal.id} goal={goal} viewMode={viewMode} />
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

export default VisionGoalList;
