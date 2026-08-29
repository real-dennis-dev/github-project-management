// src/components/projects/ProjectDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useProjects } from "../../hooks/useProjects";
import { useToast } from "../../hooks/useToast";
import { LoadingSpinner, Alert, Badge, Button, Tabs, Tab } from "../common";
import ProjectStatusBadge from "./ProjectStatusBadge";
import FeatureList from "./FeatureList";
import BugList from "./BugList";
import ProjectStats from "./ProjectStats";
import { ArrowLeft, Edit, Calendar, GitBranch, Code2 } from "lucide-react";

const ProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    getProject,
    getProjectStats,
    getFeatures,
    getBugs,
    currentProject,
    projectStats,
    isLoading,
    error,
    clearError,
  } = useProjects();

  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (projectId) {
      getProject(projectId);
      getProjectStats(projectId);
      getFeatures(projectId);
      getBugs(projectId);
    }
  }, [projectId]);

  if (isLoading && !currentProject) {
    return <LoadingSpinner size="lg" className="my-12" />;
  }

  if (error) {
    return (
      <Alert variant="error" onClose={clearError}>
        {error}
      </Alert>
    );
  }

  if (!currentProject) {
    return <Alert variant="warning">Project not found</Alert>;
  }

  const formatDate = (date) => {
    if (!date) return "Not set";
    return new Date(date).toLocaleDateString();
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "features", label: "Features" },
    { id: "bugs", label: "Bugs" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/projects")}
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold text-neutral-900">
            {currentProject.name}
          </h1>
          <ProjectStatusBadge status={currentProject.status} />
          <Badge variant="info" size="sm">
            {currentProject.priority || "Medium"} Priority
          </Badge>
        </div>
        <Button
          variant="secondary"
          onClick={() => navigate(`/projects/${projectId}/edit`)}
          className="flex items-center space-x-2"
        >
          <Edit className="w-4 h-4" />
          <span>Edit</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
          <p className="text-sm text-neutral-500">Description</p>
          <p className="text-neutral-800 mt-1">
            {currentProject.description || "No description provided"}
          </p>
        </div>
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
          <p className="text-sm text-neutral-500">Tech Stack</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {currentProject.tech_stack &&
            currentProject.tech_stack.length > 0 ? (
              currentProject.tech_stack.map((tech) => (
                <Badge key={tech} variant="info" size="sm">
                  {tech}
                </Badge>
              ))
            ) : (
              <span className="text-neutral-500">No technologies listed</span>
            )}
          </div>
        </div>
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-500">Start Date</span>
              <span className="text-neutral-800">
                {formatDate(currentProject.start_date)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-500">Target Completion</span>
              <span className="text-neutral-800">
                {formatDate(currentProject.target_completion_date)}
              </span>
            </div>
            {currentProject.repository_url && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500">Repository</span>
                <a
                  href={currentProject.repository_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-500 hover:underline flex items-center space-x-1"
                >
                  <GitBranch className="w-3 h-3" />
                  <span>View</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-b border-neutral-300">
        <nav className="flex space-x-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary-500 text-primary-500"
                  : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-400"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === "overview" && (
          <ProjectStats stats={projectStats} project={currentProject} />
        )}
        {activeTab === "features" && <FeatureList projectId={projectId} />}
        {activeTab === "bugs" && <BugList projectId={projectId} />}
      </div>
    </div>
  );
};

export default ProjectDetails;
