// src/components/auth/SessionList.jsx
import { useState } from "react";
import {
  Smartphone,
  Laptop,
  Monitor,
  Tablet,
  Clock,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../common/Button";
import { Badge } from "../common/Badge";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { EmptyState } from "../common/EmptyState";
import { Alert } from "../common/Alert";
import { Modal } from "../common/Modal";

const SessionList = () => {
  const {
    sessions,
    sessionsMeta,
    isSessionsLoading,
    revokeSession,
    revokeAllSessions,
    isRevokingSession,
    isRevokingAll,
    error,
    clearError,
    refetchSessions,
  } = useAuth();

  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [showRevokeAllModal, setShowRevokeAllModal] = useState(false);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("active");

  const getDeviceIcon = (deviceInfo) => {
    if (!deviceInfo) return <Monitor className="w-5 h-5" />;
    const deviceType = deviceInfo.deviceType || "";
    if (deviceType.includes("Phone")) return <Smartphone className="w-5 h-5" />;
    if (deviceType.includes("Tablet")) return <Tablet className="w-5 h-5" />;
    if (deviceType.includes("Desktop")) return <Monitor className="w-5 h-5" />;
    return <Laptop className="w-5 h-5" />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleRevokeSession = async () => {
    if (selectedSessionId) {
      await revokeSession(selectedSessionId);
      setShowRevokeModal(false);
      setSelectedSessionId(null);
    }
  };

  const handleRevokeAll = async () => {
    await revokeAllSessions(true);
    setShowRevokeAllModal(false);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    refetchSessions();
  };

  if (isSessionsLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <EmptyState
        title="No active sessions"
        description="You don't have any active sessions on other devices."
        icon={<Monitor className="w-12 h-12" />}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">
            Active Sessions
          </h3>
          {sessionsMeta && (
            <p className="text-sm text-neutral-500">
              {sessionsMeta.pagination.total} total sessions •
              {sessionsMeta.stats.active} active
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetchSessions()}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>

          {sessions.length > 1 && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowRevokeAllModal(true)}
              disabled={isRevokingAll}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Revoke All
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="error" onClose={clearError}>
          {error}
        </Alert>
      )}

      <div className="space-y-3">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="bg-neutral-300 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-400/50 transition-colors"
          >
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="text-neutral-500 mt-1">
                {getDeviceIcon(session.deviceInfo)}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-neutral-900 truncate">
                    {session.deviceInfo?.deviceName || "Unknown Device"}
                  </span>
                  {session.isCurrent && (
                    <Badge variant="success" size="sm">
                      Current
                    </Badge>
                  )}
                  {session.isActive ? (
                    <Badge variant="info" size="sm">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="neutral" size="sm">
                      Expired
                    </Badge>
                  )}
                </div>

                <div className="text-sm text-neutral-500 space-y-0.5">
                  <p>
                    IP: {session.ipAddress || "Unknown"} • Browser:{" "}
                    {session.deviceInfo?.browser || "Unknown"}
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    Last active: {formatDate(session.lastActivity)}
                    {session.expiresAt && (
                      <span>• Expires: {formatDate(session.expiresAt)}</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {!session.isCurrent && session.isActive && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  setSelectedSessionId(session.id);
                  setShowRevokeModal(true);
                }}
                disabled={isRevokingSession}
                className="flex-shrink-0"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Revoke
              </Button>
            )}
          </div>
        ))}
      </div>

      {sessionsMeta?.pagination && sessionsMeta.pagination.pages > 1 && (
        <div className="flex justify-center mt-6">
          {/* Pagination component would go here */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
            >
              Previous
            </Button>
            <span className="px-4 py-2 text-sm">
              Page {page} of {sessionsMeta.pagination.pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= sessionsMeta.pagination.pages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Revoke Session Modal */}
      <Modal
        isOpen={showRevokeModal}
        onClose={() => setShowRevokeModal(false)}
        title="Revoke Session"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-warning">
            <AlertCircle className="w-6 h-6" />
            <p className="text-sm text-neutral-600">
              Are you sure you want to revoke this session? The user will be
              logged out from this device.
            </p>
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRevokeModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleRevokeSession}
              loading={isRevokingSession}
              disabled={isRevokingSession}
            >
              Revoke Session
            </Button>
          </div>
        </div>
      </Modal>

      {/* Revoke All Sessions Modal */}
      <Modal
        isOpen={showRevokeAllModal}
        onClose={() => setShowRevokeAllModal(false)}
        title="Revoke All Sessions"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-warning">
            <AlertCircle className="w-6 h-6" />
            <p className="text-sm text-neutral-600">
              Are you sure you want to revoke all sessions? You will be logged
              out from all devices except this one.
            </p>
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRevokeAllModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleRevokeAll}
              loading={isRevokingAll}
              disabled={isRevokingAll}
            >
              Revoke All
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SessionList;
