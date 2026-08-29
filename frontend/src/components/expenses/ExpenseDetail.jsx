// src/components/expenses/ExpenseDetail.jsx
import React from "react";
import { Modal, Badge, Button } from "../common";
import { Calendar, Building, Link, Repeat, DollarSign } from "lucide-react";

const ExpenseDetail = ({ expense, onClose, onEdit }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const DetailRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start space-x-3 py-3 border-b border-neutral-200 last:border-0">
      <div className="mt-1">
        <Icon className="w-5 h-5 text-neutral-500" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-neutral-500">{label}</p>
        <p className="text-neutral-900 font-medium">
          {value || "Not provided"}
        </p>
      </div>
    </div>
  );

  return (
    <Modal isOpen={true} onClose={onClose} title="Expense Details" size="md">
      <div className="space-y-4">
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">
                {expense.description}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="info">
                  {expense.category_label || expense.category}
                </Badge>
                {expense.recurring && (
                  <Badge variant="success">Recurring</Badge>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary-500">
                {expense.formatted_amount || formatCurrency(expense.amount)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-4">
          <DetailRow
            icon={Calendar}
            label="Expense Date"
            value={
              expense.expense_date
                ? formatDate(expense.expense_date)
                : "Not set"
            }
          />
          <DetailRow
            icon={Building}
            label="Vendor"
            value={expense.vendor || "Not specified"}
          />
          <DetailRow
            icon={DollarSign}
            label="Amount"
            value={expense.formatted_amount || formatCurrency(expense.amount)}
          />
          <DetailRow
            icon={Repeat}
            label="Recurring"
            value={expense.recurring ? "Yes" : "No"}
          />
          {expense.receipt_url && (
            <DetailRow
              icon={Link}
              label="Receipt"
              value={
                <a
                  href={expense.receipt_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-500 hover:underline"
                >
                  View Receipt
                </a>
              }
            />
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-300">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" onClick={onEdit}>
            Edit Expense
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ExpenseDetail;
