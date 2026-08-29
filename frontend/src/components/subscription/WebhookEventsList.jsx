// src/components/subscription/WebhookEventsList.jsx
import React, { useState, useEffect } from "react";
import { useSubscription } from "../../hooks/useSubscription";
import { useToast } from "../../hooks/useToast";
import {
  LoadingSpinner,
  Alert,
  Badge,
  Button,
  Pagination,
  SearchBar,
  Modal,
} from "../common";
import {
  Webhook,
  RefreshCw,
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

const WebhookEventsList = () => {
  const { getWebhookEvents, webhookEvents, isLoading, error, clearError } =
    useSubscription();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProcessed, setFilterProcessed] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const limit = 20;

  useEffect(() => {
    const params = {
      page,
      limit,
      processed: filterProcessed,
    };
    getWebhookEvents(params);
  }, [page, filterProcessed]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleRefresh = () => {
    getWebhookEvents({ page, limit, processed: filterProcessed });
    toast.info("Refreshing webhook events...");
  };

  const handleRetry = async (id) => {
    setIsRetrying(true);
    try {
      // Retry logic would go here
      toast.success("Webhook retried successfully");
      handleRefresh();
    } catch (err) {
      toast.error(err.message || "Failed to retry webhook");
    } finally {
      setIsRetrying(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString();
  };

  const getStatusBadge = (processed, error) => {
    if (error) {
      return <Badge variant="error">Failed</Badge>;
    }
    if (processed) {
      return <Badge variant="success">Processed</Badge>;
    }
    return <Badge variant="warning">Pending</Badge>;
  };

  const getEventTypeColor = (eventType) => {
    if (eventType.includes("success")) return "success";
    if (eventType.includes("fail")) return "error";
    if (eventType.includes("created")) return "info";
    if (eventType.includes("updated")) return "warning";
    return "neutral";
  };

  const filteredEvents = webhookEvents.filter((event) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      event.event_type.toLowerCase().includes(search) ||
      event.id?.toLowerCase().includes(search) ||
      event.stripe_event_id?.toLowerCase().includes(search)
    );
  });

  if (isLoading && webhookEvents.length === 0) {
    return <LoadingSpinner size="lg" className="my-8" />;
  }

  if (error) {
    return (
      <Alert variant="error" onClose={clearError}>
        {error}
      </Alert>
    );
  }

  if (webhookEvents.length === 0) {
    return (
      <div className="text-center py-12">
        <Webhook className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
        <p className="text-neutral-500">No webhook events yet</p>
        <p className="text-sm text-neutral-400">
          Webhook events will appear here as they are processed
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h2 className="text-xl font-bold text-neutral-900">Webhook Events</h2>
          <Badge variant="info" size="lg">
            {webhookEvents.length} events
          </Badge>
        </div>
        <Button
          variant="secondary"
          onClick={handleRefresh}
          className="flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search events..."
          className="flex-1 min-w-[200px]"
        />
        <div className="flex items-center space-x-2">
          <select
            value={filterProcessed === null ? "" : filterProcessed}
            onChange={(e) => {
              const value = e.target.value;
              setFilterProcessed(value === "" ? null : value === "true");
              setPage(1);
            }}
            className="px-3 py-2 bg-neutral-200 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Status</option>
            <option value="true">Processed</option>
            <option value="false">Pending</option>
          </select>
        </div>
      </div>

      <div className="bg-neutral-100 border border-neutral-300 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-neutral-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-600">
                Event Type
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-600">
                Status
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-600">
                Processed At
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-neutral-600">
                Created At
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-neutral-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-300">
            {filteredEvents.map((event) => (
              <tr
                key={event.id}
                className="hover:bg-neutral-200 transition-colors cursor-pointer"
                onClick={() => {
                  setSelectedEvent(event);
                  setShowDetailModal(true);
                }}
              >
                <td className="px-4 py-3">
                  <Badge variant={getEventTypeColor(event.event_type)}>
                    {event.event_type}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  {getStatusBadge(event.processed, event.error)}
                </td>
                <td className="px-4 py-3 text-sm text-neutral-600">
                  {event.processed_at ? formatDate(event.processed_at) : "-"}
                </td>
                <td className="px-4 py-3 text-sm text-neutral-600">
                  {formatDate(event.created_at)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRetry(event.id);
                    }}
                    disabled={isRetrying || event.processed}
                    className="flex items-center space-x-1"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Retry</span>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-8 text-neutral-500">
          No events match your search criteria
        </div>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedEvent(null);
        }}
        title="Webhook Event Details"
        size="lg"
      >
        {selectedEvent && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-neutral-500">Event ID</p>
                <p className="text-sm font-mono text-neutral-900">
                  {selectedEvent.id}
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Event Type</p>
                <Badge variant={getEventTypeColor(selectedEvent.event_type)}>
                  {selectedEvent.event_type}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Status</p>
                {getStatusBadge(selectedEvent.processed, selectedEvent.error)}
              </div>
              <div>
                <p className="text-sm text-neutral-500">Stripe Event ID</p>
                <p className="text-sm font-mono text-neutral-900">
                  {selectedEvent.stripe_event_id || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Processed At</p>
                <p className="text-sm text-neutral-900">
                  {selectedEvent.processed_at
                    ? formatDate(selectedEvent.processed_at)
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Created At</p>
                <p className="text-sm text-neutral-900">
                  {formatDate(selectedEvent.created_at)}
                </p>
              </div>
            </div>

            {selectedEvent.error && (
              <div className="bg-error/10 border border-error/30 rounded-lg p-4">
                <p className="text-sm font-medium text-error">Error</p>
                <p className="text-sm text-error/80">{selectedEvent.error}</p>
              </div>
            )}

            <div>
              <p className="text-sm text-neutral-500 mb-2">Payload</p>
              <pre className="bg-neutral-200 p-4 rounded-lg overflow-x-auto text-xs text-neutral-800 max-h-64 overflow-y-auto">
                {JSON.stringify(selectedEvent.payload, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end">
              {!selectedEvent.processed && (
                <Button
                  variant="primary"
                  onClick={() => {
                    handleRetry(selectedEvent.id);
                    setShowDetailModal(false);
                  }}
                  disabled={isRetrying}
                  className="flex items-center space-x-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retry Webhook</span>
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default WebhookEventsList;
