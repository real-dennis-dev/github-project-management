// src/components/expense/ExpenseDetail.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Badge,
  Alert,
  LoadingSpinner,
  IconWrapper,
  Modal,
  Breadcrumb,
} from "../common";
import useExpenses from "./useExpenses";
import {
  getCategory,
  getCategoryLabel,
  getCategoryIcon,
  getCategoryColor,
} from "./ExpenseConstants";

const ExpenseDetail = () => {
  const { expenseId } = useParams();
  const navigate = useNavigate();
  const { getExpenseById, deleteExpense, loading: hookLoading } = useExpenses();

  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Load expense data
  useEffect(() => {
    if (expenseId) {
      loadExpense();
    }
  }, [expenseId]);

  const loadExpense = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getExpenseById(expenseId);
      if (data) {
        setExpense(data);
      } else {
        setError("Expense not found");
      }
    } catch (err) {
      setError(err.message || "Failed to load expense");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      await deleteExpense(expenseId);
      navigate("/expenses");
    } catch (err) {
      setError(err.message || "Failed to delete expense");
    }
  };

  // Handle edit
  const handleEdit = () => {
    navigate(`/expenses/${expenseId}/edit`);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Expenses", href: "/expenses" },
    { label: expense?.description || "Expense Detail", href: "" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="error" title="Error loading expense">
          {error}
        </Alert>
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="p-6">
        <Alert variant="warning" title="Expense not found">
          The expense you're looking for doesn't exist or has been deleted.
        </Alert>
      </div>
    );
  }

  const category = getCategory(expense.category);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} separator="›" className="mb-6" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{expense.description}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge
              variant={expense.recurring ? "info" : "neutral"}
              className="flex items-center gap-1"
            >
              {expense.recurring ? "🔄 Recurring" : "One-time"}
            </Badge>
            <Badge
              variant="secondary"
              style={{
                backgroundColor: category?.color + "20",
                color: category?.color,
              }}
              className="flex items-center gap-1"
            >
              <span>{category?.icon}</span>
              <span>{category?.label}</span>
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleEdit}>
            ✏️ Edit
          </Button>
          <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
            🗑️ Delete
          </Button>
        </div>
      </div>

      {/* Details Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="p-6 space-y-6">
          {/* Amount */}
          <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <span className="text-sm text-neutral-500 dark:text-neutral-400">
              Amount
            </span>
            <span className="text-3xl font-bold text-primary-500">
              ${expense.amount.toFixed(2)}
            </span>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Date
              </p>
              <p className="font-medium">{formatDate(expense.expense_date)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Vendor
              </p>
              <p className="font-medium">{expense.vendor || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Category
              </p>
              <p className="font-medium flex items-center gap-2">
                <span>{category?.icon}</span>
                <span>{category?.label}</span>
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Status
              </p>
              <p className="font-medium">
                {expense.recurring ? "Recurring" : "One-time"}
              </p>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Receipt URL
              </p>
              {expense.receipt_url ? (
                <a
                  href={expense.receipt_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-500 hover:underline font-medium"
                >
                  View Receipt 📄
                </a>
              ) : (
                <p className="text-neutral-400">No receipt uploaded</p>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="text-xs text-neutral-400 border-t border-neutral-200 dark:border-neutral-700 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <span>
              Created: {new Date(expense.created_at).toLocaleString()}
            </span>
            <span>
              Updated: {new Date(expense.updated_at).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

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
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <p className="font-medium">{expense.description}</p>
            <p className="text-sm text-neutral-500">
              ${expense.amount.toFixed(2)} · {category?.label}
            </p>
          </div>
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
    </div>
  );
};

export default ExpenseDetail;
