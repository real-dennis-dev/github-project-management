// src/components/github/GitHubIntegration.jsx
import React, { useState } from "react";
import RepositoryList from "./RepositoryList";
import RepositoryConnect from "./RepositoryConnect";
import RepositoryStats from "./RepositoryStats";
import CommitList from "./CommitList";
import BranchList from "./BranchList";
import PullRequestList from "./PullRequestList";
import IssueList from "./IssueList";
import WebhookSetup from "./WebhookSetup";
import { useGithub } from "../../hooks/useGithub";
import { useToast } from "../../hooks/useToast";
import { Alert, LoadingSpinner, Tabs, Tab } from "../common";
import {
  GitBranch,
  GitCommit,
  GitPullRequest,
  AlertCircle,
  Settings,
  BarChart3,
} from "lucide-react";

const GitHubIntegration = ({ projectId }) => {
  const [activeTab, setActiveTab] = useState("repositories");
  const [selectedRepositoryId, setSelectedRepositoryId] = useState(null);
  const { isLoading, error, clearError } = useGithub();
  const { toast } = useToast();

  const tabs = [
    { id: "repositories", label: "Repositories", icon: GitBranch },
    { id: "commits", label: "Commits", icon: GitCommit },
    { id: "pullRequests", label: "Pull Requests", icon: GitPullRequest },
    { id: "issues", label: "Issues", icon: AlertCircle },
    { id: "stats", label: "Stats", icon: BarChart3 },
    { id: "webhook", label: "Webhook", icon: Settings },
  ];

  const handleRepositorySelect = (repositoryId) => {
    setSelectedRepositoryId(repositoryId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">
          GitHub Integration
        </h1>
      </div>

      {error && (
        <Alert variant="error" onClose={clearError}>
          {error}
        </Alert>
      )}

      {isLoading && <LoadingSpinner size="lg" className="my-8" />}

      {!isLoading && (
        <>
          <RepositoryConnect projectId={projectId} />

          <div className="border-b border-neutral-300">
            <nav className="flex space-x-4 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? "border-primary-500 text-primary-500"
                        : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-400"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="mt-6">
            {activeTab === "repositories" && (
              <RepositoryList
                projectId={projectId}
                onSelectRepository={handleRepositorySelect}
                selectedRepositoryId={selectedRepositoryId}
              />
            )}
            {activeTab === "commits" && (
              <CommitList repositoryId={selectedRepositoryId} />
            )}
            {activeTab === "pullRequests" && (
              <PullRequestList repositoryId={selectedRepositoryId} />
            )}
            {activeTab === "issues" && (
              <IssueList repositoryId={selectedRepositoryId} />
            )}
            {activeTab === "stats" && (
              <RepositoryStats repositoryId={selectedRepositoryId} />
            )}
            {activeTab === "webhook" && (
              <WebhookSetup repositoryId={selectedRepositoryId} />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default GitHubIntegration;
