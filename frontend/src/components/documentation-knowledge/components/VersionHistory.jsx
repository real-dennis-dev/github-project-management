// src/components/documentation-knowledge/components/VersionHistory.jsx

import React, { useState } from "react";
import { Clock, GitBranch, RotateCcw, Check, X } from "lucide-react";
import { Button, Badge } from "../../common";
import { formatDate } from "../utils/helpers";

const VersionHistory = ({ versions, currentVersion, onRestore, onClose }) => {
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [restoring, setRestoring] = useState(false);

  const handleRestore = async (version) => {
    setRestoring(true);
    await onRestore(version);
    setRestoring(false);
  };

  if (!versions || versions.length === 0) {
    return (
      <div className="text-center py-8">
        <GitBranch size={40} className="text-neutral-300 mx-auto mb-3" />
        <p className="text-neutral-500">No version history available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock size={18} className="text-neutral-500" />
          <span className="text-sm font-medium text-neutral-700">
            {versions.length} versions
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X size={16} />
        </Button>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {versions.map((version, index) => {
          const isCurrent = version.version === currentVersion;
          const isSelected = selectedVersion === version.version;

          return (
            <div
              key={version.version}
              className={`p-3 border rounded-lg transition-colors ${
                isCurrent
                  ? "border-primary-200 bg-primary-50"
                  : isSelected
                  ? "border-primary-300 bg-primary-50"
                  : "border-neutral-200 hover:border-neutral-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <GitBranch size={16} className="text-neutral-400" />
                    <span className="font-medium">
                      Version {version.version}
                    </span>
                  </div>
                  {isCurrent && (
                    <Badge variant="primary" size="sm">
                      Current
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-500">
                    {formatDate(version.created_at)}
                  </span>
                  {!isCurrent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setSelectedVersion(
                          selectedVersion === version.version
                            ? null
                            : version.version
                        )
                      }
                      className="p-1"
                    >
                      <RotateCcw size={14} />
                    </Button>
                  )}
                </div>
              </div>

              {/* Version details */}
              {isSelected && !isCurrent && (
                <div className="mt-2 pt-2 border-t border-neutral-200">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedVersion(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleRestore(version.version)}
                      loading={restoring}
                      className="flex items-center gap-1"
                    >
                      <RotateCcw size={14} />
                      Restore Version {version.version}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VersionHistory;
