// src/components/subscription/PaymentList.jsx
import React, { useState, useEffect } from "react";
import { useSubscription } from "../../hooks/useSubscription";
import { useToast } from "../../hooks/useToast";
import { LoadingSpinner, Alert, Badge, Button, Pagination } from "../common";
import {
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

// This is a placeholder component - payments would come from a payment service
const PaymentList = ({ subscriptionId }) => {
  const { isLoading, error, clearError } = useSubscription();
  const { toast } = useToast();
  const [payments, setPayments] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 0 });

  // Mock payments data - replace with actual API call
  useEffect(() => {
    // Simulate API call
    const mockPayments = [
      {
        id: "pay_1",
        subscription_id: subscriptionId,
        amount: 29.99,
        currency: "USD",
        status: "succeeded",
        status_label: "Succeeded",
        status_color: "success",
        payment_method_type: "card",
        description: "Monthly subscription payment",
        receipt_url: null,
        paid_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        id: "pay_2",
        subscription_id: subscriptionId,
        amount: 29.99,
        currency: "USD",
        status: "succeeded",
        status_label: "Succeeded",
        status_color: "success",
        payment_method_type: "card",
        description: "Monthly subscription payment",
        receipt_url: null,
        paid_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(
          Date.now() - 60 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      {
        id: "pay_3",
        subscription_id: subscriptionId,
        amount: 29.99,
        currency: "USD",
        status: "pending",
        status_label: "Pending",
        status_color: "warning",
        payment_method_type: "card",
        description: "Monthly subscription payment",
        receipt_url: null,
        paid_at: null,
        created_at: new Date().toISOString(),
      },
    ];
    setPayments(mockPayments);
    setPagination({ total: 3, pages: 1 });
  }, [subscriptionId]);

  const getStatusIcon = (status) => {
    switch (status) {
      case "succeeded":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "failed":
        return <XCircle className="w-4 h-4" />;
      case "refunded":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading && payments.length === 0) {
    return <LoadingSpinner size="md" className="my-4" />;
  }

  if (error) {
    return (
      <Alert variant="error" onClose={clearError}>
        {error}
      </Alert>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="text-center py-6 text-neutral-500">
        <CreditCard className="w-12 h-12 mx-auto mb-3 text-neutral-400" />
        <p>No payment records found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900">
          Payment History
        </h3>
        <Badge variant="info" size="sm">
          {pagination.total} payments
        </Badge>
      </div>

      <div className="bg-neutral-100 border border-neutral-300 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-neutral-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-600">
                Date
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-600">
                Description
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-600">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-600">
                Status
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-600">
                Method
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-300">
            {payments.map((payment) => (
              <tr
                key={payment.id}
                className="hover:bg-neutral-200 transition-colors"
              >
                <td className="px-4 py-3 text-sm text-neutral-600">
                  {formatDate(payment.paid_at || payment.created_at)}
                </td>
                <td className="px-4 py-3 text-sm text-neutral-700">
                  {payment.description || "Payment"}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-neutral-900">
                  ${payment.amount.toFixed(2)} {payment.currency}
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant={payment.status_color}
                    className="flex items-center space-x-1"
                  >
                    {getStatusIcon(payment.status)}
                    <span>{payment.status_label || payment.status}</span>
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-neutral-600">
                  {payment.payment_method_label || payment.payment_method_type}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination.pages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={pagination.pages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
};

export default PaymentList;
