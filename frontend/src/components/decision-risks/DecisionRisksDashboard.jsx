// src/components/decision-risks/DecisionRisksDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDecisionRisksDashboard } from "../../hooks/useDecisionRisksDashboard";
import { useToast } from "../../hooks/useToast";
import {
  LoadingSpinner,
  Alert,
  Button,
  Badge,
  Select,
  Pagination,
} from "../common";
import {
  LayoutDashboard,
  List,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Shield,
  TrendingUp,
  TrendingDown,
  Clock,
  Zap,
  Building2,
  RefreshCw,
  ChevronRight,
  Calendar,
  Filter,
  PieChart,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";

// Import existing components
import DecisionStats from "./components/DecisionStats";
import RiskScore from "./components/RiskScore";
import RiskMatrix from "./components/RiskMatrix";
import RiskStatusBadge from "./components/RiskStatusBadge";

const DecisionRisksDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [decisionImpact, setDecisionImpact] = useState("");
  const [riskLevel, setRiskLevel] = useState("");
  const [riskStatus, setRiskStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [months, setMonths] = useState(12);

  const params = {
    page,
    limit,
    decisionImpact: decisionImpact || undefined,
    riskLevel: riskLevel || undefined,
    riskStatus: riskStatus || undefined,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
    months,
  };

  // ✅ Hook called at top level with current params
  const { stats, items, pagination, isLoading, error, clearError, refetch } =
    useDecisionRisksDashboard(params);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleRefresh = () => {
    refetch();
    toast.success("Dashboard refreshed");
  };

  const handleClearFilters = () => {
    setDecisionImpact("");
    setRiskLevel("");
    setRiskStatus("");
    setFromDate("");
    setToDate("");
    setMonths(12);
    setPage(1);
  };

  const handleItemClick = (item) => {
    if (item.type === "decision") {
      navigate(`/projects/${item.projectId}/decisions/${item.id}`);
    } else {
      navigate(`/projects/${item.projectId}/risks/${item.id}`);
    }
  };

  // Tabs configuration
  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "items", label: "Activity Feed", icon: List },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  const impactOptions = [
    { value: "", label: "All Impacts" },
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" },
  ];

  const riskLevelOptions = [
    { value: "", label: "All Levels" },
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" },
  ];

  const riskStatusOptions = [
    { value: "", label: "All Statuses" },
    { value: "identified", label: "Identified" },
    { value: "monitoring", label: "Monitoring" },
    { value: "mitigated", label: "Mitigated" },
    { value: "realized", label: "Realized" },
    { value: "closed", label: "Closed" },
  ];

  const monthsOptions = [
    { value: 3, label: "3 Months" },
    { value: 6, label: "6 Months" },
    { value: 12, label: "12 Months" },
    { value: 18, label: "18 Months" },
    { value: 24, label: "24 Months" },
  ];

  if (isLoading && !stats) {
    return <LoadingSpinner size="lg" className="my-8" />;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="error" onClose={clearError}>
          {error}
        </Alert>
        <Button variant="primary" onClick={handleRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <Shield className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
        <p className="text-neutral-500">
          No decisions or risks data available.
        </p>
        <Button variant="primary" className="mt-4" onClick={handleRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
    );
  }

  const {
    overview,
    decisions,
    risks,
    trends,
    projects,
    items: feedItems,
    generatedAt,
  } = stats;

  const getRiskLevelColor = (level) => {
    switch (level) {
      case "critical":
        return "error";
      case "high":
        return "warning";
      case "medium":
        return "info";
      case "low":
        return "success";
      default:
        return "neutral";
    }
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case "critical":
        return "error";
      case "high":
        return "warning";
      case "medium":
        return "info";
      case "low":
        return "success";
      default:
        return "neutral";
    }
  };

  const getTrendIcon = (value) => {
    if (value > 0) return <ArrowUp className="w-4 h-4 text-success" />;
    if (value < 0) return <ArrowDown className="w-4 h-4 text-error" />;
    return <Minus className="w-4 h-4 text-neutral-500" />;
  };

  // Render Overview Tab
  const renderOverview = () => {
    const statCards = [
      {
        label: "Total Decisions",
        value: overview?.totalDecisions || 0,
        icon: BarChart3,
        color: "primary",
        description: `${decisions?.byImpact?.critical || 0} critical`,
      },
      {
        label: "Total Risks",
        value: overview?.totalRisks || 0,
        icon: AlertTriangle,
        color: "warning",
        description: `${overview?.criticalRisks || 0} critical`,
      },
      {
        label: "Active Risks",
        value: overview?.activeRisks || 0,
        icon: Clock,
        color: "info",
        description: "Identified + Monitoring",
      },
      {
        label: "Mitigated Risks",
        value: overview?.mitigatedRisks || 0,
        icon: Shield,
        color: "success",
        description: `${overview?.closedRisks || 0} closed`,
      },
      {
        label: "Avg Risk Score",
        value: overview?.averageRiskScore || 0,
        icon: TrendingUp,
        color: overview?.averageRiskScore > 50 ? "warning" : "success",
        description: `Overall: ${overview?.overallRiskLevel || "low"}`,
      },
      {
        label: "Projects",
        value: overview?.totalProjects || 0,
        icon: Building2,
        color: "neutral",
        description: "With decisions/risks",
      },
    ];

    return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg p-4 hover:border-primary-400 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-neutral-500 truncate">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                      {stat.value}
                    </p>
                    {stat.description && (
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {stat.description}
                      </p>
                    )}
                  </div>
                  <Icon
                    className={`w-6 h-6 text-${stat.color}-500 opacity-50 flex-shrink-0`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Decisions & Risks Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Decisions by Impact */}
          <div className="bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
              Decisions by Impact
            </h4>
            <div className="space-y-2">
              {decisions?.byImpact &&
                Object.entries(decisions.byImpact).map(([impact, count]) => (
                  <div
                    key={impact}
                    className="flex items-center justify-between"
                  >
                    <Badge variant={getImpactColor(impact)} size="sm">
                      {impact.charAt(0).toUpperCase() + impact.slice(1)}
                    </Badge>
                    <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                      {count}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Risks by Level */}
          <div className="bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
              Risks by Level
            </h4>
            <div className="space-y-2">
              {risks?.byLevel &&
                Object.entries(risks.byLevel).map(([level, count]) => (
                  <div
                    key={level}
                    className="flex items-center justify-between"
                  >
                    <Badge variant={getRiskLevelColor(level)} size="sm">
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Badge>
                    <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                      {count}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Risks by Status */}
        <div className="bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg p-4">
          <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
            Risks by Status
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {risks?.byStatus &&
              Object.entries(risks.byStatus).map(([status, count]) => (
                <div
                  key={status}
                  className="flex items-center justify-between p-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg"
                >
                  <RiskStatusBadge status={status} size="sm" />
                  <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                    {count}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Trend Data */}
        {trends?.data && trends.data.length > 0 && (
          <div className="bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Monthly Trends ({trends.months} months)
            </h4>
            <div className="overflow-x-auto">
              <div className="flex gap-4 min-w-[600px]">
                {trends.data.map((monthData) => (
                  <div key={monthData.month} className="flex-1 min-w-[60px]">
                    <div className="text-center">
                      <div className="text-xs text-neutral-500">
                        {monthData.month}
                      </div>
                      <div className="flex justify-center gap-1 mt-1">
                        <div className="flex flex-col items-center">
                          <div
                            className="w-3 bg-primary-500 rounded-t"
                            style={{
                              height: `${Math.min(
                                monthData.decisions * 8,
                                60
                              )}px`,
                            }}
                          />
                          <span className="text-xs text-neutral-500">
                            {monthData.decisions}
                          </span>
                        </div>
                        <div className="flex flex-col items-center">
                          <div
                            className="w-3 bg-warning-500 rounded-t"
                            style={{
                              height: `${Math.min(monthData.risks * 8, 60)}px`,
                            }}
                          />
                          <span className="text-xs text-neutral-500">
                            {monthData.risks}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-neutral-400 mt-1">
                        D: {monthData.criticalDecisions} | R:{" "}
                        {monthData.criticalRisks}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center gap-4 mt-3 text-xs text-neutral-500">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-primary-500 rounded" />
                Decisions
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-warning-500 rounded" />
                Risks
              </span>
            </div>
          </div>
        )}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <div className="bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
              Projects Overview
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-300 dark:border-neutral-700">
                    <th className="text-left py-2 px-3 text-neutral-500">
                      Project
                    </th>
                    <th className="text-center py-2 px-3 text-neutral-500">
                      Decisions
                    </th>
                    <th className="text-center py-2 px-3 text-neutral-500">
                      Risks
                    </th>
                    <th className="text-center py-2 px-3 text-neutral-500">
                      Critical
                    </th>
                    <th className="text-center py-2 px-3 text-neutral-500">
                      Avg Score
                    </th>
                    <th className="text-center py-2 px-3 text-neutral-500">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr
                      key={project.projectId}
                      className="border-b border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700 cursor-pointer transition-colors"
                      onClick={() =>
                        navigate(`/projects/${project.projectId}/overview`)
                      }
                    >
                      <td className="py-2 px-3 font-medium text-neutral-800 dark:text-neutral-200">
                        Project {project.projectId.slice(0, 8)}
                      </td>
                      <td className="text-center py-2 px-3">
                        {project.decisions}
                      </td>
                      <td className="text-center py-2 px-3">{project.risks}</td>
                      <td className="text-center py-2 px-3 text-error">
                        {project.criticalDecisions + project.criticalRisks}
                      </td>
                      <td className="text-center py-2 px-3">
                        {project.averageRiskScore || 0}
                      </td>
                      <td className="text-center py-2 px-3">
                        <Badge
                          variant={
                            project.criticalRisks > 0
                              ? "error"
                              : project.highRisks > 0
                              ? "warning"
                              : "success"
                          }
                          size="sm"
                        >
                          {project.criticalRisks > 0
                            ? `${project.criticalRisks} critical`
                            : project.highRisks > 0
                            ? `${project.highRisks} high`
                            : "OK"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render Activity Feed Tab
  const renderActivityFeed = () => {
    return (
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-neutral-500" />
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Filters:
              </span>
            </div>

            <Select
              value={decisionImpact}
              onChange={(e) => setDecisionImpact(e.target.value)}
              options={impactOptions}
              className="w-40"
            />

            <Select
              value={riskLevel}
              onChange={(e) => setRiskLevel(e.target.value)}
              options={riskLevelOptions}
              className="w-40"
            />

            <Select
              value={riskStatus}
              onChange={(e) => setRiskStatus(e.target.value)}
              options={riskStatusOptions}
              className="w-40"
            />

            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-neutral-500" />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="px-2 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded text-sm text-neutral-900 dark:text-neutral-100"
              />
              <span className="text-neutral-500">to</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="px-2 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-600 rounded text-sm text-neutral-900 dark:text-neutral-100"
              />
            </div>

            <Select
              value={months}
              onChange={(e) => setMonths(Number(e.target.value))}
              options={monthsOptions}
              className="w-36"
            />

            {(decisionImpact ||
              riskLevel ||
              riskStatus ||
              fromDate ||
              toDate ||
              months !== 12) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-sm"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Activity Items */}
        <div className="space-y-4">
          {feedItems?.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              className="bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg p-4 hover:border-primary-400 transition-colors cursor-pointer"
              onClick={() => handleItemClick(item)}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Badge
                      variant={item.type === "decision" ? "primary" : "warning"}
                      size="sm"
                    >
                      {item.type === "decision" ? "Decision" : "Risk"}
                    </Badge>
                    <Badge
                      variant={getImpactColor(item.severityOrImpact)}
                      size="sm"
                    >
                      {item.severityOrImpact}
                    </Badge>
                    {item.status && (
                      <RiskStatusBadge status={item.status} size="sm" />
                    )}
                    {item.riskScore !== null &&
                      item.riskScore !== undefined && (
                        <Badge variant="neutral" size="sm">
                          Score: {item.riskScore}
                        </Badge>
                      )}
                  </div>
                  <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
                    <span>
                      Project: {item.projectId?.slice(0, 8) || "Unknown"}
                    </span>
                    <span>{new Date(item.timestamp).toLocaleString()}</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-neutral-400 flex-shrink-0 mt-2" />
              </div>
            </div>
          ))}

          {feedItems?.length === 0 && (
            <div className="text-center py-8 text-neutral-500">
              No items found matching your filters.
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination?.totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={pagination.totalPages || 1}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    );
  };

  // Render Analytics Tab
  const renderAnalytics = () => {
    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg p-4">
            <p className="text-sm text-neutral-500">Decision-to-Risk Ratio</p>
            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {overview?.totalRisks > 0
                ? (overview?.totalDecisions / overview?.totalRisks).toFixed(1)
                : "N/A"}
            </p>
            <p className="text-xs text-neutral-400">
              {overview?.totalDecisions} decisions / {overview?.totalRisks}{" "}
              risks
            </p>
          </div>
          <div className="bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg p-4">
            <p className="text-sm text-neutral-500">Risk Resolution Rate</p>
            <p className="text-2xl font-bold text-success">
              {overview?.totalRisks > 0
                ? Math.round(
                    ((overview?.mitigatedRisks + overview?.closedRisks) /
                      overview?.totalRisks) *
                      100
                  )
                : 0}
              %
            </p>
            <p className="text-xs text-neutral-400">
              {overview?.mitigatedRisks + overview?.closedRisks} resolved
            </p>
          </div>
          <div className="bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg p-4">
            <p className="text-sm text-neutral-500">Critical Items</p>
            <p className="text-2xl font-bold text-error">
              {overview?.criticalDecisions + overview?.criticalRisks}
            </p>
            <p className="text-xs text-neutral-400">
              {overview?.criticalDecisions} decisions /{" "}
              {overview?.criticalRisks} risks
            </p>
          </div>
          <div className="bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg p-4">
            <p className="text-sm text-neutral-500">Active Items</p>
            <p className="text-2xl font-bold text-warning">
              {overview?.activeRisks +
                (overview?.totalDecisions -
                  (decisions?.byImpact?.critical || 0))}
            </p>
            <p className="text-xs text-neutral-400">
              {overview?.activeRisks} risks / {overview?.totalDecisions}{" "}
              decisions
            </p>
          </div>
        </div>

        {/* Risk Score Distribution */}
        {risks && (
          <div className="bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              Risk Score Distribution
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {Object.entries(risks.byLevel || {}).map(([level, count]) => (
                <div
                  key={level}
                  className="text-center p-3 bg-neutral-200 dark:bg-neutral-700 rounded-lg"
                >
                  <Badge variant={getRiskLevelColor(level)} size="sm">
                    {level}
                  </Badge>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">
                    {count}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {overview?.totalRisks > 0
                      ? Math.round((count / overview?.totalRisks) * 100)
                      : 0}
                    %
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Risk Matrix */}
        {stats.riskMatrix && <RiskMatrix matrix={stats.riskMatrix} />}

        {/* Risk Score Summary */}
        {stats.riskScore && <RiskScore score={stats.riskScore} />}

        {/* Generated At */}
        {generatedAt && (
          <p className="text-xs text-neutral-500 text-right">
            Generated: {new Date(generatedAt).toLocaleString()}
          </p>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "items":
        return renderActivityFeed();
      case "analytics":
        return renderAnalytics();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Decisions & Risks Dashboard
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Aggregated view across all projects
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          {generatedAt && (
            <Badge variant="neutral" size="sm">
              Updated: {new Date(generatedAt).toLocaleTimeString()}
            </Badge>
          )}
        </div>
      </div>

      <div className="border-b border-neutral-300 dark:border-neutral-700">
        <nav className="flex flex-wrap gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary-500 text-white"
                    : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-6">{renderContent()}</div>
    </div>
  );
};

export default DecisionRisksDashboard;
