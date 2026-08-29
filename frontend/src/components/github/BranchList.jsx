// src/components/github/BranchList.jsx
import React, { useEffect } from "react";
import { useGithub } from "../../hooks/useGithub";
import { LoadingSpinner, Alert, EmptyState, Badge } from "../common";
import { GitBranch, Star } from "lucide-react";

const BranchList = ({ repositoryId }) => {
  const { getBranches, branches, isBranchesLoading, error, clearError } =
    useGithub();

  useEffect(() => {
    if (repositoryId) {
      getBranches(repositoryId);
    }
  }, [repositoryId]);

  if (!repositoryId) {
    return (
      <EmptyState
        title="No repository selected"
        description="Select a repository from the list to view branches."
        icon={<GitBranch className="w-12 h-12 text-neutral-400" />}
      />
    );
  }

  if (isBranchesLoading) {
    return <LoadingSpinner size="md" className="my-4" />;
  }

  if (error) {
    return (
      <Alert variant="error" onClose={clearError}>
        {error}
      </Alert>
    );
  }

  if (branches.length === 0) {
    return (
      <EmptyState
        title="No branches found"
        description="This repository doesn't have any branches."
        icon={<GitBranch className="w-12 h-12 text-neutral-400" />}
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900">Branches</h3>
        <Badge variant="info" size="lg">
          {branches.length} branches
        </Badge>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {branches.map((branch) => (
          <div
            key={branch.id}
            className="bg-neutral-100 border border-neutral-300 rounded-lg p-3 flex items-center justify-between hover:border-neutral-400 transition-colors"
          >
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-neutral-500" />
              <span className="text-neutral-900 font-medium">
                {branch.branch_name}
              </span>
            </div>
            {branch.is_default && (
              <Badge
                variant="success"
                size="sm"
                className="flex items-center gap-1"
              >
                <Star className="w-3 h-3" />
                Default
              </Badge>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BranchList;
