// src/components/expenses/ExpenseForm.jsx
import React, { useState, useEffect } from "react";
import {
  Modal,
  Input,
  Textarea,
  Select,
  Checkbox,
  Button,
  Alert,
} from "../common";
import { useExpenses } from "../../hooks/useExpenses";
import { useToast } from "../../hooks/useToast";
import { CATEGORY_OPTIONS } from "../../utils/expenseValidation";

const ExpenseForm = ({ projectId, expense, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "other",
    expense_date: "",
    vendor: "",
    receipt_url: "",
    recurring: false,
  });
  const [validationErrors, setValidationErrors] = useState({});
  const {
    createExpense,
    updateExpense,
    isCreating,
    isUpdating,
    error,
    clearError,
  } = useExpenses();
  const { toast } = useToast();

  const isEditing = !!expense;

  useEffect(() => {
    if (expense) {
      setFormData({
        description: expense.description || "",
        amount: expense.amount || "",
        category: expense.category || "other",
        expense_date: expense.expense_date || "",
        vendor: expense.vendor || "",
        receipt_url: expense.receipt_url || "",
        recurring: expense.recurring || false,
      });
    }
  }, [expense]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors({});

    try {
      let result;
      if (isEditing) {
        result = await updateExpense(expense.id, formData);
        if (result.success) {
          toast.success("Expense updated successfully");
          onSuccess();
        }
      } else {
        result = await createExpense(projectId, formData);
        if (result.success) {
          toast.success("Expense created successfully");
          onSuccess();
        }
      }
    } catch (err) {
      // Handle validation errors from the hook
      const message = err.message;
      if (message.includes("{")) {
        try {
          const errors = JSON.parse(message);
          setValidationErrors(errors);
        } catch {
          // Not a JSON error
        }
      }
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={isEditing ? "Edit Expense" : "Add New Expense"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="error" onClose={clearError}>
            {error}
          </Alert>
        )}

        <div>
          <Input
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter expense description"
            required
            error={validationErrors.description}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              label="Amount"
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              required
              error={validationErrors.amount}
            />
          </div>
          <div>
            <Select
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              options={CATEGORY_OPTIONS}
              error={validationErrors.category}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              label="Expense Date"
              name="expense_date"
              type="date"
              value={formData.expense_date}
              onChange={handleChange}
              error={validationErrors.expense_date}
            />
          </div>
          <div>
            <Input
              label="Vendor"
              name="vendor"
              value={formData.vendor}
              onChange={handleChange}
              placeholder="Enter vendor name"
              error={validationErrors.vendor}
            />
          </div>
        </div>

        <div>
          <Input
            label="Receipt URL"
            name="receipt_url"
            value={formData.receipt_url}
            onChange={handleChange}
            placeholder="https://example.com/receipt.pdf"
            error={validationErrors.receipt_url}
          />
        </div>

        <div>
          <Checkbox
            id="recurring"
            name="recurring"
            label="This is a recurring expense"
            checked={formData.recurring}
            onChange={handleChange}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-300">
          <Button variant="ghost" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            loading={isCreating || isUpdating}
            disabled={isCreating || isUpdating}
          >
            {isEditing ? "Update Expense" : "Create Expense"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ExpenseForm;
