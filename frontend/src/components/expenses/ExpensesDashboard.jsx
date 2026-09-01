// src/components/expenses/ExpensesDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useExpensesDashboard } from "../../hooks/useExpensesDashboard";
import { useToast } from "../../hooks/useToast";
import {
  LoadingSpinner,
  Alert,
  Button,
  Badge,
  SearchBar,
  Pagination,
} from "../common";
import {
  LayoutDashboard,
  List,
  BarChart3,
  PieChart,
  Download,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  Repeat,
  Building2,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

// Import existing components (reused with dashboard data)
import ExpenseFilters from "./ExpenseFilters";
import ExpenseExport from "./ExpenseExport";
import {
  CATEGORY_LABELS,
  CATEGORY_COLORS,
} from "../../utils/expenseValidation";

const ExpensesDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    fromDate: "",
    toDate: "",
    minAmount: "",
    maxAmount: "",
    vendor: "",
    recurring: null,
  });
  const {
    dashboard,
    latestExpenses,
    pagination,
    isLoading,
    error,
    clearError,
    refetch,
  } = useExpensesDashboard({
    page,
    limit,
    ...filters,
    vendor: searchTerm || undefined,
  });

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1);
  };

  const handleRefresh = () => {
    refetch();
    toast.success("Dashboard refreshed");
  };

  // Tabs configuration
  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "list", label: "All Expenses", icon: List },
    { id: "statistics", label: "Statistics", icon: BarChart3 },
    { id: "categories", label: "Categories", icon: PieChart },
    { id: "export", label: "Export", icon: Download },
  ];

  if (isLoading && !dashboard) {
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

  if (!dashboard) {
    return (
      <div className="text-center py-12">
        <DollarSign className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
        <p className="text-neutral-500">No expense data available.</p>
        <Button variant="primary" className="mt-4" onClick={handleRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
    );
  }

  const {
    statistics,
    categories,
    projects,
    monthlyTrend,
    topExpense,
    generatedAt,
  } = dashboard;

  // Format currency
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return "$0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Render Overview Tab
  const renderOverview = () => {
    const statCards = [
      {
        label: "Total Expenses",
        value: statistics?.formatted_total || "$0.00",
        icon: DollarSign,
        color: "text-primary-500",
        change: statistics?.monthly_change_percentage,
        changeLabel: "vs last month",
      },
      {
        label: "Average",
        value: statistics?.formatted_average || "$0.00",
        icon: TrendingUp,
        color: "text-info-500",
      },
      {
        label: "Total Count",
        value: statistics?.count || 0,
        icon: Receipt,
        color: "text-success-500",
      },
      {
        label: "Recurring Total",
        value: statistics?.formatted_recurring_total || "$0.00",
        icon: Repeat,
        color: "text-warning-500",
      },
      {
        label: "This Month",
        value: statistics?.formatted_current_month_total || "$0.00",
        icon: Calendar,
        color: "text-blue-500",
      },
      {
        label: "Last Month",
        value: statistics?.formatted_previous_month_total || "$0.00",
        icon: Calendar,
        color: "text-neutral-500",
      },
    ];

    return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            const change = stat.change;
            const isPositive = change && change > 0;
            const isNegative = change && change < 0;

            return (
              <div
                key={stat.label}
                className="bg-neutral-100 border border-neutral-300 rounded-lg p-4 hover:border-primary-400 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-neutral-500 truncate">
                      {stat.label}
                    </p>
                    <p className="text-xl font-bold text-neutral-900">
                      {stat.value}
                    </p>
                    {stat.change !== undefined && (
                      <div className="flex items-center space-x-1 mt-0.5">
                        {isPositive && (
                          <ArrowUpRight className="w-3 h-3 text-success-500" />
                        )}
                        {isNegative && (
                          <ArrowDownRight className="w-3 h-3 text-error-500" />
                        )}
                        <span
                          className={`text-xs ${
                            isPositive
                              ? "text-success-500"
                              : isNegative
                              ? "text-error-500"
                              : "text-neutral-500"
                          }`}
                        >
                          {change !== 0 && (
                            <>
                              {isPositive ? "+" : ""}
                              {change.toFixed(1)}%
                            </>
                          )}
                          {change === 0 && "0%"}
                        </span>
                        {stat.changeLabel && (
                          <span className="text-xs text-neutral-400">
                            {stat.changeLabel}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <Icon
                    className={`w-6 h-6 ${stat.color} opacity-50 flex-shrink-0`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Monthly Trend */}
        {monthlyTrend && monthlyTrend.length > 0 && (
          <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
            <h4 className="text-sm font-medium text-neutral-700 mb-3">
              Monthly Trend
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {monthlyTrend.map((month) => (
                <div
                  key={month.month}
                  className="text-center p-3 bg-neutral-200 rounded-lg"
                >
                  <p className="text-xs text-neutral-500">
                    {month.month?.slice(5, 7)}/{month.month?.slice(0, 4)}
                  </p>
                  <p className="text-sm font-bold text-neutral-900">
                    {month.formatted_total || formatCurrency(month.total)}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {month.count} expense{month.count !== 1 ? "s" : ""}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Expense */}
        {topExpense && (
          <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
            <h4 className="text-sm font-medium text-neutral-700 mb-3">
              Highest Expense
            </h4>
            <div className="flex flex-wrap items-center justify-between p-3 bg-neutral-200 rounded-lg">
              <div>
                <p className="text-sm font-medium text-neutral-900">
                  {topExpense.description}
                </p>
                <p className="text-xs text-neutral-500">
                  {formatDate(topExpense.expense_date)} ·{" "}
                  {topExpense.vendor || "No vendor"}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant="info" size="sm">
                  {topExpense.category_label || topExpense.category}
                </Badge>
                <span className="text-lg font-bold text-error-500">
                  {topExpense.formatted_amount ||
                    formatCurrency(topExpense.amount)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Projects Summary */}
        {projects && projects.length > 0 && (
          <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
            <h4 className="text-sm font-medium text-neutral-700 mb-3">
              Expenses by Project
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {projects.slice(0, 6).map((project) => (
                <div
                  key={project.project_id}
                  className="flex items-center justify-between p-3 bg-neutral-200 rounded-lg cursor-pointer hover:bg-neutral-300 transition-colors"
                  onClick={() =>
                    navigate(`/projects/${project.project_id}/expenses`)
                  }
                >
                  <div>
                    <p className="text-sm font-medium text-neutral-800">
                      {project.project_name}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {project.count} expenses
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-neutral-900">
                      {project.formatted_total || formatCurrency(project.total)}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {project.percentage?.toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Categories Summary */}
        {categories && categories.length > 0 && (
          <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
            <h4 className="text-sm font-medium text-neutral-700 mb-3">
              Top Categories
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {categories.slice(0, 6).map((cat) => (
                <div
                  key={cat.category}
                  className="flex items-center justify-between p-3 bg-neutral-200 rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor:
                          cat.category_color ||
                          CATEGORY_COLORS[cat.category] ||
                          "#9E9E9E",
                      }}
                    />
                    <span className="text-sm text-neutral-700">
                      {cat.category_label ||
                        CATEGORY_LABELS[cat.category] ||
                        cat.category}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant="info" size="sm">
                      {cat.percentage?.toFixed(0)}%
                    </Badge>
                    <span className="text-sm font-medium text-neutral-900">
                      {cat.formatted_total || formatCurrency(cat.total)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generated At */}
        {generatedAt && (
          <p className="text-xs text-neutral-500 text-right">
            Last updated: {new Date(generatedAt).toLocaleString()}
          </p>
        )}
      </div>
    );
  };

  // Render List Tab
  const renderList = () => {
    const filteredExpenses = latestExpenses?.filter((expense) => {
      const matchesSearch =
        !searchTerm ||
        expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.vendor?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        !filters.category || expense.category === filters.category;
      const matchesVendor =
        !filters.vendor ||
        expense.vendor?.toLowerCase().includes(filters.vendor.toLowerCase());
      const matchesRecurring =
        filters.recurring === null ||
        filters.recurring === undefined ||
        expense.recurring === filters.recurring;
      return (
        matchesSearch && matchesCategory && matchesVendor && matchesRecurring
      );
    });

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <SearchBar
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search expenses by description or vendor..."
            className="flex-1"
          />
          <ExpenseFilters onFilterChange={handleFilterChange} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExpenses?.map((expense) => (
            <div
              key={expense.id}
              className="bg-neutral-100 border border-neutral-300 rounded-lg p-6 hover:border-primary-400 transition-all flex flex-col cursor-pointer"
              onClick={() =>
                navigate(
                  `/projects/${expense.project_id}/expenses/${expense.id}`
                )
              }
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-neutral-900 flex-1">
                  {expense.description}
                </h3>
                <span className="text-lg font-bold text-primary-500 ml-2">
                  {expense.formatted_amount || formatCurrency(expense.amount)}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="info" size="sm">
                  {expense.category_label || expense.category}
                </Badge>
                {expense.recurring && (
                  <Badge variant="success" size="sm">
                    Recurring
                  </Badge>
                )}
                {expense.vendor && (
                  <Badge variant="neutral" size="sm">
                    {expense.vendor}
                  </Badge>
                )}
              </div>

              <p className="text-sm text-neutral-600 flex-1">
                {expense.expense_date && (
                  <span className="text-xs text-neutral-500 block">
                    {formatDate(expense.expense_date)}
                  </span>
                )}
                {expense.project_name && (
                  <span className="text-xs text-neutral-500 block mt-1">
                    Project: {expense.project_name}
                  </span>
                )}
              </p>

              <div className="mt-4 pt-4 border-t border-neutral-300 flex items-center justify-end">
                <Button variant="ghost" size="sm">
                  View Details →
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filteredExpenses?.length === 0 && (
          <div className="text-center py-8 text-neutral-500">
            No expenses found matching your filters.
          </div>
        )}

        {pagination?.totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={pagination.totalPages || 1}
            onPageChange={handlePageChange}
            hasNextPage={pagination.hasNextPage}
            hasPreviousPage={pagination.hasPreviousPage}
          />
        )}
      </div>
    );
  };

  // Render Statistics Tab
  const renderStatistics = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
            <p className="text-sm text-neutral-500">Total</p>
            <p className="text-2xl font-bold text-neutral-900">
              {statistics?.formatted_total || "$0.00"}
            </p>
          </div>
          <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
            <p className="text-sm text-neutral-500">Average</p>
            <p className="text-2xl font-bold text-neutral-900">
              {statistics?.formatted_average || "$0.00"}
            </p>
          </div>
          <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
            <p className="text-sm text-neutral-500">Count</p>
            <p className="text-2xl font-bold text-neutral-900">
              {statistics?.count || 0}
            </p>
          </div>
          <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
            <p className="text-sm text-neutral-500">Recurring Total</p>
            <p className="text-2xl font-bold text-neutral-900">
              {statistics?.formatted_recurring_total || "$0.00"}
            </p>
          </div>
        </div>

        {/* Monthly Change */}
        {statistics?.monthly_change_percentage !== undefined && (
          <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
            <h4 className="text-sm font-medium text-neutral-700 mb-3">
              Monthly Change
            </h4>
            <div className="flex items-center space-x-4">
              <div className="text-center p-4 bg-neutral-200 rounded-lg flex-1">
                <p className="text-sm text-neutral-500">This Month</p>
                <p className="text-xl font-bold text-neutral-900">
                  {statistics?.formatted_current_month_total || "$0.00"}
                </p>
              </div>
              <div className="text-center p-4 bg-neutral-200 rounded-lg flex-1">
                <p className="text-sm text-neutral-500">Last Month</p>
                <p className="text-xl font-bold text-neutral-900">
                  {statistics?.formatted_previous_month_total || "$0.00"}
                </p>
              </div>
              <div className="text-center p-4 bg-neutral-200 rounded-lg flex-1">
                <p className="text-sm text-neutral-500">Change</p>
                <p
                  className={`text-xl font-bold ${
                    statistics.monthly_change_percentage > 0
                      ? "text-success-500"
                      : statistics.monthly_change_percentage < 0
                      ? "text-error-500"
                      : "text-neutral-500"
                  }`}
                >
                  {statistics.monthly_change_percentage > 0 ? "+" : ""}
                  {statistics.monthly_change_percentage.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Range */}
        {statistics?.min !== undefined && statistics?.max !== undefined && (
          <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
            <h4 className="text-sm font-medium text-neutral-700 mb-3">
              Amount Range
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-neutral-200 rounded-lg">
                <p className="text-sm text-neutral-500">Minimum</p>
                <p className="text-xl font-bold text-neutral-900">
                  {statistics?.formatted_min || formatCurrency(statistics.min)}
                </p>
              </div>
              <div className="text-center p-4 bg-neutral-200 rounded-lg">
                <p className="text-sm text-neutral-500">Maximum</p>
                <p className="text-xl font-bold text-neutral-900">
                  {statistics?.formatted_max || formatCurrency(statistics.max)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render Categories Tab
  const renderCategories = () => {
    if (!categories || categories.length === 0) {
      return (
        <div className="text-center py-8 text-neutral-500">
          No category data available.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.category}
              className="bg-neutral-100 border border-neutral-300 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor:
                        cat.category_color ||
                        CATEGORY_COLORS[cat.category] ||
                        "#9E9E9E",
                    }}
                  />
                  <span className="font-medium text-neutral-900">
                    {cat.category_label ||
                      CATEGORY_LABELS[cat.category] ||
                      cat.category}
                  </span>
                </div>
                <Badge variant="info" size="sm">
                  {cat.percentage?.toFixed(1)}%
                </Badge>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">
                  {cat.count} expense{cat.count !== 1 ? "s" : ""}
                </span>
                <span className="font-medium text-neutral-900">
                  {cat.formatted_total || formatCurrency(cat.total)}
                </span>
              </div>

              <div className="mt-2 w-full bg-neutral-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(cat.percentage || 0, 100)}%`,
                    backgroundColor:
                      cat.category_color ||
                      CATEGORY_COLORS[cat.category] ||
                      "#9E9E9E",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render Export Tab
  const renderExport = () => {
    return <ExpenseExport projectId={null} />;
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "list":
        return renderList();
      case "statistics":
        return renderStatistics();
      case "categories":
        return renderCategories();
      case "export":
        return renderExport();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            Expenses Dashboard
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
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

      <div className="border-b border-neutral-300">
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
                    : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-200"
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

export default ExpensesDashboard;
