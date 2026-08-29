// src/components/auth/SessionStats.jsx
import {
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Clock,
  Activity,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { EmptyState } from "../common/EmptyState";
import { Badge } from "../common/Badge";

const SessionStats = () => {
  const { sessionStats, isStatsLoading, error } = useAuth();

  if (isStatsLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (!sessionStats) {
    return (
      <EmptyState
        title="No session data"
        description="Session statistics are not available."
        icon={<Activity className="w-12 h-12" />}
      />
    );
  }

  const statsCards = [
    {
      label: "Total Sessions",
      value: sessionStats.total || 0,
      icon: <Monitor className="w-5 h-5" />,
      color: "primary",
    },
    {
      label: "Active Sessions",
      value: sessionStats.active || 0,
      icon: <Activity className="w-5 h-5" />,
      color: "success",
    },
    {
      label: "Expired Sessions",
      value: sessionStats.expired || 0,
      icon: <Clock className="w-5 h-5" />,
      color: "warning",
    },
  ];

  const getDeviceIcon = (deviceType) => {
    if (!deviceType) return <Monitor className="w-4 h-4" />;
    const type = deviceType.toLowerCase();
    if (type.includes("phone")) return <Smartphone className="w-4 h-4" />;
    if (type.includes("tablet")) return <Tablet className="w-4 h-4" />;
    if (type.includes("desktop")) return <Monitor className="w-4 h-4" />;
    return <Laptop className="w-4 h-4" />;
  };

  const getDeviceColor = (deviceType) => {
    if (!deviceType) return "neutral";
    const type = deviceType.toLowerCase();
    if (type.includes("phone")) return "primary";
    if (type.includes("tablet")) return "info";
    if (type.includes("desktop")) return "success";
    return "neutral";
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statsCards.map((stat, index) => (
          <div
            key={index}
            className="bg-neutral-200 rounded-lg p-4 flex items-center justify-between"
          >
            <div>
              <p className="text-sm text-neutral-500">{stat.label}</p>
              <p className="text-2xl font-bold text-neutral-900">
                {stat.value}
              </p>
            </div>
            <div className={`text-${stat.color}-500`}>{stat.icon}</div>
          </div>
        ))}
      </div>

      {sessionStats.devices && Object.keys(sessionStats.devices).length > 0 && (
        <div className="bg-neutral-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-neutral-700 mb-3">
            Device Distribution
          </h4>
          <div className="flex flex-wrap gap-3">
            {Object.entries(sessionStats.devices).map(([deviceType, count]) => (
              <div
                key={deviceType}
                className="flex items-center gap-2 px-3 py-1.5 bg-neutral-300 rounded-full"
              >
                <span className={`text-${getDeviceColor(deviceType)}-500`}>
                  {getDeviceIcon(deviceType)}
                </span>
                <span className="text-sm font-medium text-neutral-700">
                  {deviceType || "Unknown"}
                </span>
                <Badge variant="neutral" size="sm">
                  {count}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-error">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default SessionStats;
