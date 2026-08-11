// src/components/expense/ExpenseForm.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Input,
  Textarea,
  Button,
  Select,
  Switch,
  Alert,
  LoadingSpinner,
  Modal,
} from "../common";
import useExpenses from "./useExpenses";
import {
  CATEGORIES,
  EXPENSE_FORM_INITIAL_VALUES,
  EXPENSE_FORM_VALIDATION,
} from "./ExpenseConstants";

const ExpenseForm = () => {
  const { expenseId } = useParams();
  const navigate = useNavigate();
  const { createExpense, updateExpense, getExpenseById, loading } =
    useExpenses();

  const [formData, setFormData] = useState(EXPENSE_FORM_INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Load expense data if editing
  useEffect(() => {
    if (expenseId) {
      setIsEditing(true);
      loadExpense();
    }
  }, [expenseId]);

  const loadExpense = async () => {
    setIsLoading(true);
    try {
      const expense = await getExpenseById(expenseId);
      if (expense) {
        setFormData({
          description: expense.description || "",
          amount: expense.amount || "",
          category: expense.category || "other",
          expense_date:
            expense.expense_date || new Date().toISOString().split("T")[0],
          vendor: expense.vendor || "",
          receipt_url: expense.receipt_url || "",
          recurring: expense.recurring || false,
        });
      }
    } catch (err) {
      // Error is handled by the hook
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;

    setFormData((prev) => ({ ...prev, [name]: val }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle switch change
  const handleSwitchChange = (checked) => {
    setFormData((prev) => ({ ...prev, recurring: checked }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    const rules = EXPENSE_FORM_VALIDATION;

    // Check description
    if (rules.description.required && !formData.description) {
      newErrors.description = rules.description.required;
    } else if (formData.description && rules.description.minLength) {
      if (formData.description.length < rules.description.minLength.value) {
        newErrors.description = rules.description.minLength.message;
      }
    } else if (formData.description && rules.description.maxLength) {
      if (formData.description.length > rules.description.maxLength.value) {
        newErrors.description = rules.description.maxLength.message;
      }
    }

    // Check amount
    if (rules.amount.required && !formData.amount) {
      newErrors.amount = rules.amount.required;
    } else if (formData.amount && rules.amount.min) {
      if (parseFloat(formData.amount) < rules.amount.min.value) {
        newErrors.amount = rules.amount.min.message;
      }
    }

    // Check category
    if (rules.category.required && !formData.category) {
      newErrors.category = rules.category.required;
    }

    // Check expense_date
    if (rules.expense_date.required && !formData.expense_date) {
      newErrors.expense_date = rules.expense_date.required;
    }

    // Check vendor
    if (formData.vendor && rules.vendor.maxLength) {
      if (formData.vendor.length > rules.vendor.maxLength.value) {
        newErrors.vendor = rules.vendor.maxLength.message;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const expenseData = {
        ...formData,
        amount: parseFloat(formData.amount),
      };

      let result;
      if (isEditing) {
        result = await updateExpense(expenseId, expenseData);
        setSuccessMessage("Expense updated successfully!");
      } else {
        result = await createExpense(expenseData);
        setSuccessMessage("Expense created successfully!");
      }

      setShowSuccess(true);

      // Reset form if not editing
      if (!isEditing) {
        setFormData(EXPENSE_FORM_INITIAL_VALUES);
      }

      // Redirect after a delay
      setTimeout(() => {
        setShowSuccess(false);
        navigate("/expenses");
      }, 2000);
    } catch (err) {
      // Error is handled by the hook
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate("/expenses");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {isEditing ? "Edit Expense" : "Add New Expense"}
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {isEditing
            ? "Update the details of your expense"
            : "Enter the details of your new expense"}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Description <span className="text-error">*</span>
          </label>
          <Textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter expense description..."
            rows={3}
            error={errors.description}
            fullWidth
          />
        </div>

        {/* Amount and Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Amount <span className="text-error">*</span>
            </label>
            <Input
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              error={errors.amount}
              fullWidth
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Category <span className="text-error">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-neutral-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.category
                  ? "border-error"
                  : "border-neutral-300 dark:border-neutral-700"
              }`}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-xs text-error mt-1">{errors.category}</p>
            )}
          </div>
        </div>

        {/* Date and Vendor */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Date <span className="text-error">*</span>
            </label>
            <Input
              name="expense_date"
              type="date"
              value={formData.expense_date}
              onChange={handleChange}
              error={errors.expense_date}
              fullWidth
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Vendor</label>
            <Input
              name="vendor"
              value={formData.vendor}
              onChange={handleChange}
              placeholder="Vendor name"
              error={errors.vendor}
              fullWidth
            />
          </div>
        </div>

        {/* Receipt URL */}
        <div>
          <label className="block text-sm font-medium mb-1">Receipt URL</label>
          <Input
            name="receipt_url"
            type="url"
            value={formData.receipt_url}
            onChange={handleChange}
            placeholder="https://example.com/receipt.pdf"
            fullWidth
          />
        </div>

        {/* Recurring Switch */}
        <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
          <div>
            <p className="font-medium">Recurring Expense</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Enable if this expense repeats regularly
            </p>
          </div>
          <Switch
            checked={formData.recurring}
            onChange={handleSwitchChange}
            id="recurring"
          />
        </div>

        {/* Form Actions */}
        <div className="flex items-center gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isEditing ? "Update Expense" : "Create Expense"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccess}
        onClose={() => {}}
        title="Success"
        size="sm"
        className="text-center"
      >
        <div className="py-4">
          <div className="text-4xl mb-4">✅</div>
          <p className="text-lg font-medium">{successMessage}</p>
          <p className="text-sm text-neutral-500 mt-2">Redirecting...</p>
        </div>
      </Modal>
    </div>
  );
};

export default ExpenseForm;
