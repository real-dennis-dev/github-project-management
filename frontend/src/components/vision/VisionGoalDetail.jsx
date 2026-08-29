// src/components/vision/VisionGoalDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useVision } from "../../hooks/useVision";
import { useToast } from "../../hooks/useToast";
import {
  LoadingSpinner,
  Alert,
  Badge,
  Button,
  Modal,
  Tabs,
  Tab,
} from "../common";
import VisionGoalProgress from "./VisionGoalProgress";
import ProjectLinker from "./ProjectLinker";
import VisionGoalForm from "./VisionGoalForm";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Target,
  Calendar,
  Clock,
  Link as LinkIcon,
  BarChart3,
  FolderKanban,
} from "lucide-react";

const VisionGoalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    getGoal,
    currentGoal,
    isLoading,
    error,
    clearError,
    deleteGoal,
    getGoalProgress,
  } = useVision();
  const { toast } = useToast();

  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (id) {
      getGoal(id);
      getGoalProgress(id);
    }
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this vision goal?")) {
      try {
        await deleteGoal(id);
        toast.success("Vision goal deleted successfully");
        navigate("/vision");
      } catch (err) {
        toast.error(err.message || "Failed to delete vision goal");
      }
    }
  };

  const handleUpdateSuccess = () => {
    setShowEditModal(false);
    getGoal(id);
    getGoalProgress(id);
    toast.success("Vision goal updated successfully");
  };

  if (isLoading && !currentGoal) {
    return <LoadingSpinner size="lg" className="my-8" />;
  }

  if (error) {
    return (
      <Alert variant="error" onClose={clearError}>
        {error}
      </Alert>
    );
  }

  if (!currentGoal) {
    return (
      <div className="text-center py-12">
        <Target className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
        <p className="text-neutral-500">Vision goal not found</p>
        <Link to="/vision">
          <Button variant="primary" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Vision Board
          </Button>
        </Link>
      </div>
    );
  }

  const {
    goal,
    description,
    category,
    status,
    priority,
    progress,
    target_timeline,
    project_count,
    linked_projects = [],
    created_at,
    updated_at,
    formatted,
  } = currentGoal;

  const statusColors = {
    draft: "neutral",
    active: "info",
    completed: "success",
    archived: "neutral",
  };

  const getPriorityLabel = (value) => {
    if (value <= 3) return "Low";
    if (value <= 7) return "Medium";
    return "High";
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: Target },
    { id: "progress", label: "Progress", icon: BarChart3 },
    { id: "projects", label: "Projects", icon: FolderKanban },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/vision">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">{goal}</h1>
            <div className="flex items-center space-x-3 mt-1">
              <Badge variant={statusColors[status] || "neutral"}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
              <Badge variant="warning">
                Priority: {getPriorityLabel(priority)}
              </Badge>
              {category && <Badge variant="secondary">{category}</Badge>}
              {project_count > 0 && (
                <Badge variant="info">
                  <LinkIcon className="w-3 h-3 mr-1" />
                  {project_count} projects
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="secondary" onClick={() => setShowEditModal(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Description */}
      {description && (
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
          <p className="text-neutral-700">{description}</p>
        </div>
      )}

      {/* Meta Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
          <p className="text-sm text-neutral-500">Target Timeline</p>
          <p className="text-neutral-900 font-medium">
            {target_timeline ? formatDate(target_timeline) : "Not set"}
          </p>
        </div>
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
          <p className="text-sm text-neutral-500">Progress</p>
          <p className="text-neutral-900 font-medium">{progress || 0}%</p>
        </div>
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
          <p className="text-sm text-neutral-500">Created</p>
          <p className="text-neutral-900 font-medium">
            {formatDate(created_at)}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-300">
        <nav className="flex space-x-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
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

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "overview" && (
          <div className="space-y-4">
            <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
              <h3 className="font-medium text-neutral-800 mb-2">
                Goal Details
              </h3>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-neutral-500">Goal</dt>
                  <dd className="text-neutral-900">{goal}</dd>
                </div>
                <div>
                  <dt className="text-sm text-neutral-500">Status</dt>
                  <dd className="text-neutral-900">{status}</dd>
                </div>
                <div>
                  <dt className="text-sm text-neutral-500">Priority</dt>
                  <dd className="text-neutral-900">
                    {getPriorityLabel(priority)} ({priority}/10)
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-neutral-500">Category</dt>
                  <dd className="text-neutral-900">
                    {category || "Uncategorized"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-neutral-500">Target Timeline</dt>
                  <dd className="text-neutral-900">
                    {target_timeline ? formatDate(target_timeline) : "Not set"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-neutral-500">Linked Projects</dt>
                  <dd className="text-neutral-900">{project_count || 0}</dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {activeTab === "progress" && <VisionGoalProgress goalId={id} />}

        {activeTab === "projects" && <ProjectLinker goalId={id} />}
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Vision Goal"
        size="lg"
      >
        <VisionGoalForm
          initialData={currentGoal}
          onSuccess={handleUpdateSuccess}
          onCancel={() => setShowEditModal(false)}
        />
      </Modal>
    </div>
  );
};

export default VisionGoalDetail;
