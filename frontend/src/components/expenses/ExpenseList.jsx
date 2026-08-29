// src/components/expenses/ExpenseList.jsx
import React, { useState, useEffect } from "react";
import { useExpenses } from "../../hooks/useExpenses";
import { useToast } from "../../hooks/useToast";
import {
  Table,
  Button,
  Badge,
  LoadingSpinner,
  Alert,
  EmptyState,
  Pagination,
  SearchBar,
} from "../common";
import ExpenseFilters from "./ExpenseFilters";
import ExpenseForm from "./ExpenseForm";
import ExpenseDetail from "./ExpenseDetail";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  RefreshCw,
  Download,
  DollarSign,
} from "lucide-react";

const ExpenseList = ({ projectId }) => {
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    getExpenses,
    deleteExpense,
    exportExpenses,
    expenses,
    pagination,
    filters,
    isLoading,
    error,
    clearError,
    setFilters,
    resetFilters,
  } = useExpenses();

  const { toast } = useToast();

  const limit = 10;

  useEffect(() => {
    if (projectId) {
      const params = {
        page,
        limit,
        ...filters,
        vendor: searchTerm || undefined,
      };
      getExpenses(projectId, params);
    }
  }, [projectId, page, filters, searchTerm]);

  const handleDelete = async (expenseId) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        const result = await deleteExpense(expenseId);
        if (result.success) {
          toast.success("Expense deleted successfully");
        }
      } catch (err) {
        toast.error(err.message || "Failed to delete expense");
      }
    }
  };

  const handleExport = async () => {
    try {
      const result = await exportExpenses(projectId, {
        format: "csv",
        ...filters,
      });
      if (result.success) {
        // Handle download
        const blob = new Blob([JSON.stringify(result.data)], {
          type: "text/csv",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `expenses-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Expenses exported successfully");
      }
    } catch (err) {
      toast.error(err.message || "Failed to export expenses");
    }
  };

  const handleEdit = (expense) => {
    setSelectedExpense(expense);
    setShowForm(true);
  };

  const handleView = (expense) => {
    setSelectedExpense(expense);
    setShowDetail(true);
  };

  const headers = [
    { key: "expense_date", label: "Date" },
    { key: "description", label: "Description" },
    { key: "category", label: "Category" },
    { key: "vendor", label: "Vendor" },
    { key: "amount", label: "Amount" },
    { key: "recurring", label: "Recurring" },
    { key: "actions", label: "Actions" },
  ];

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (isLoading && expenses.length === 0) {
    return <LoadingSpinner size="lg" className="my-8" />;
  }

  if (error) {
    return (
      <Alert variant="error" onClose={clearError}>
        {error}
      </Alert>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-neutral-900">Expenses</h2>
          <Button
            onClick={() => {
              setSelectedExpense(null);
              setShowForm(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </div>
        <ExpenseFilters projectId={projectId} />
        <EmptyState
          title="No expenses found"
          description="Start tracking your project expenses by adding your first expense."
          action={
            <Button
              onClick={() => {
                setSelectedExpense(null);
                setShowForm(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          }
        />
        {showForm && (
          <ExpenseForm
            projectId={projectId}
            expense={selectedExpense}
            onClose={() => {
              setShowForm(false);
              setSelectedExpense(null);
            }}
            onSuccess={() => {
              setShowForm(false);
              setSelectedExpense(null);
              getExpenses(projectId, { page, limit, ...filters });
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-xl font-bold text-neutral-900">Expenses</h2>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => getExpenses(projectId, { page, limit, ...filters })}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="secondary" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setSelectedExpense(null);
              setShowForm(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by vendor..."
          className="flex-1 min-w-[200px]"
        />
        <ExpenseFilters projectId={projectId} />
      </div>

      <div className="bg-neutral-100 border border-neutral-300 rounded-lg overflow-hidden">
        <Table
          headers={headers}
          data={expenses.map((expense) => ({
            ...expense,
            expense_date: formatDate(expense.expense_date),
            category: (
              <Badge variant="info" size="sm">
                {expense.category_label || expense.category}
              </Badge>
            ),
            amount: (
              <span className="font-medium text-neutral-900">
                {expense.formatted_amount || formatCurrency(expense.amount)}
              </span>
            ),
            recurring: expense.recurring ? (
              <Badge variant="success" size="sm">
                Yes
              </Badge>
            ) : (
              <Badge variant="neutral" size="sm">
                No
              </Badge>
            ),
            actions: (
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleView(expense)}
                  className="p-1"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(expense)}
                  className="p-1"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(expense.id)}
                  className="p-1 text-error hover:text-error"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ),
          }))}
        />
      </div>

      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
        />
      )}

      {showForm && (
        <ExpenseForm
          projectId={projectId}
          expense={selectedExpense}
          onClose={() => {
            setShowForm(false);
            setSelectedExpense(null);
          }}
          onSuccess={() => {
            setShowForm(false);
            setSelectedExpense(null);
            getExpenses(projectId, { page, limit, ...filters });
          }}
        />
      )}

      {showDetail && selectedExpense && (
        <ExpenseDetail
          expense={selectedExpense}
          onClose={() => {
            setShowDetail(false);
            setSelectedExpense(null);
          }}
          onEdit={() => {
            setShowDetail(false);
            handleEdit(selectedExpense);
          }}
        />
      )}
    </div>
  );
};

export default ExpenseList;
