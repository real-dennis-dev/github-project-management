// src/components/expense/ExpenseList.jsx

import React, { useState } from "react";
import {
  Table,
  Button,
  SearchBar,
  Badge,
  Pagination,
  EmptyState,
  LoadingSpinner,
  Dropdown,
  DropdownItem,
  Modal,
  Alert,
  IconWrapper,
} from "../common";

import useExpenses from "./useExpenses";
import {
  CATEGORIES,
  getCategory,
  getCategoryLabel,
  getCategoryIcon,
  getCategoryColor,
} from "./ExpenseConstants";
import {
  Plus,
  Download,
  Trash2,
  Edit,
  Search,
  Settings,
  User,
  ChevronDown,
} from "lucide-react";
const ExpenseList = () => {
  const {
    expenses,
    loading,
    error,
    pagination,
    filters,
    sortBy,
    sortOrder,
    statistics,
    deleteExpense,
    updateFilters,
    resetFilters,
    changePage,
    changeLimit,
    changeSort,
    navigateToDetail,
    navigateToNew,
    exportExpenses,
    hasExpenses,
    totalAmount,
  } = useExpenses();

  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Table headers
  const headers = [
    { key: "expense_date", label: "Date", sortable: true },
    { key: "description", label: "Description", sortable: true },
    { key: "category", label: "Category", sortable: true },
    { key: "amount", label: "Amount", sortable: true },
    { key: "vendor", label: "Vendor", sortable: true },
    { key: "recurring", label: "Recurring", sortable: true },
    { key: "actions", label: "Actions", sortable: false },
  ];

  // Handle search
  const handleSearch = (value) => {
    setSearchQuery(value);
    updateFilters({ vendor: value });
  };

  // Handle delete
  const handleDelete = async () => {
    if (selectedExpense) {
      try {
        await deleteExpense(selectedExpense.id);
        setShowDeleteModal(false);
        setSelectedExpense(null);
      } catch (err) {
        // Error is handled by the hook
      }
    }
  };

  // Handle export
  const handleExport = async (format) => {
    setExporting(true);
    try {
      const data = await exportExpenses(
        format,
        filters.fromDate,
        filters.toDate
      );

      if (format === "json") {
        // Download as JSON
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `expenses_${new Date().toISOString().split("T")[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (format === "csv") {
        // Download as CSV
        const csvContent = convertToCSV(data.expenses || []);
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `expenses_${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      // Error is handled by the hook
    } finally {
      setExporting(false);
    }
  };

  // Convert expenses to CSV
  const convertToCSV = (data) => {
    if (!data || data.length === 0) return "";
    const headers = [
      "Date",
      "Description",
      "Category",
      "Amount",
      "Vendor",
      "Recurring",
    ];
    const rows = data.map((exp) => [
      exp.expense_date,
      exp.description,
      getCategoryLabel(exp.category),
      exp.amount,
      exp.vendor || "",
      exp.recurring ? "Yes" : "No",
    ]);
    return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  };

  // Render category badge
  const renderCategoryBadge = (category) => {
    const cat = getCategory(category);
    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <span>{cat?.icon}</span>
        <span>{cat?.label}</span>
      </Badge>
    );
  };

  // Render recurring badge
  const renderRecurringBadge = (recurring) => {
    return recurring ? (
      <Badge variant="info" className="text-xs">
        🔄 Recurring
      </Badge>
    ) : (
      <Badge variant="neutral" className="text-xs">
        One-time
      </Badge>
    );
  };

  // Render amount
  const renderAmount = (amount) => {
    return (
      <span className="font-semibold text-neutral-900 dark:text-neutral-100">
        ${amount.toFixed(2)}
      </span>
    );
  };

  // Loading state
  if (loading && !expenses.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Error state
  if (error && !expenses.length) {
    return (
      <div className="p-6">
        <Alert variant="error" title="Error loading expenses">
          {error}
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Expenses</h1>
          {statistics && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Total:{" "}
              <span className="font-semibold">
                ${statistics.formatted_total}
              </span>{" "}
              · {statistics.count} expenses · Avg: $
              {statistics.formatted_average}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Dropdown
            trigger={
              <Button variant="outline" size="sm">
                <IconWrapper icon={ChevronDown} size="sm" />
                Export
              </Button>
            }
            align="right"
          >
            <DropdownItem onClick={() => handleExport("json")}>
              Export as JSON
            </DropdownItem>
            <DropdownItem onClick={() => handleExport("csv")}>
              Export as CSV
            </DropdownItem>
          </Dropdown>
          <Button variant="primary" onClick={navigateToNew}>
            <IconWrapper icon={Plus} size="sm" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 w-full sm:w-auto">
          <SearchBar
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search by vendor or description..."
            fullWidth
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={filters.category}
            onChange={(e) => updateFilters({ category: e.target.value })}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.icon} {cat.label}
              </option>
            ))}
          </select>
          <input
            type="date"
            className="px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={filters.fromDate}
            onChange={(e) => updateFilters({ fromDate: e.target.value })}
          />
          <span className="text-neutral-500">to</span>
          <input
            type="date"
            className="px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={filters.toDate}
            onChange={(e) => updateFilters({ toDate: e.target.value })}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-neutral-500"
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Table */}
      {hasExpenses ? (
        <>
          <Table
            headers={headers}
            data={expenses}
            variant="striped"
            className="overflow-x-auto"
          >
            {(expense) => (
              <tr
                key={expense.id}
                className="hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer"
                onClick={() => navigateToDetail(expense.id)}
              >
                <td className="px-4 py-3 text-sm">
                  {expense.formatted_date || expense.expense_date}
                </td>
                <td className="px-4 py-3 text-sm font-medium max-w-xs truncate">
                  {expense.description}
                </td>
                <td className="px-4 py-3">
                  {renderCategoryBadge(expense.category)}
                </td>
                <td className="px-4 py-3">{renderAmount(expense.amount)}</td>
                <td className="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400">
                  {expense.vendor || "-"}
                </td>
                <td className="px-4 py-3">
                  {renderRecurringBadge(expense.recurring)}
                </td>
                <td className="px-4 py-3">
                  <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigateToEdit(expense.id)}
                    >
                      ✏️
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-error hover:bg-error/10"
                      onClick={() => {
                        setSelectedExpense(expense);
                        setShowDeleteModal(true);
                      }}
                    >
                      🗑️
                    </Button>
                  </div>
                </td>
              </tr>
            )}
          </Table>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-sm text-neutral-500 dark:text-neutral-400">
              Showing {expenses.length} of {pagination.total || expenses.length}{" "}
              expenses
            </div>
            <Pagination
              currentPage={pagination.page}
              totalPages={
                pagination.totalPages ||
                Math.ceil((pagination.total || 0) / pagination.limit)
              }
              onPageChange={changePage}
              showFirstLast
            />
          </div>
        </>
      ) : (
        <EmptyState
          title="No expenses found"
          description="Start tracking your project expenses by adding your first expense."
          action={
            <Button variant="primary" onClick={navigateToNew}>
              <IconWrapper icon={Plus} size="sm" />
              Add Expense
            </Button>
          }
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Expense"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-neutral-600 dark:text-neutral-400">
            Are you sure you want to delete this expense? This action cannot be
            undone.
          </p>
          {selectedExpense && (
            <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <p className="font-medium">{selectedExpense.description}</p>
              <p className="text-sm text-neutral-500">
                ${selectedExpense.amount.toFixed(2)} ·{" "}
                {getCategoryLabel(selectedExpense.category)}
              </p>
            </div>
          )}
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Export loading overlay */}
      {exporting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-xl flex flex-col items-center gap-4">
            <LoadingSpinner size="lg" />
            <p className="text-sm font-medium">Exporting expenses...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseList;
