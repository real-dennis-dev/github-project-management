// src/components/github/SyncButton.jsx
import React from "react";
import { Button } from "../common";
import { RefreshCw } from "lucide-react";

const SyncButton = ({
  repositoryId,
  onSync,
  isSyncing,
  variant = "primary",
  size = "md",
}) => {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => onSync(repositoryId)}
      loading={isSyncing}
      disabled={isSyncing}
      className="flex items-center gap-2"
    >
      <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
      {isSyncing ? "Syncing..." : "Sync"}
    </Button>
  );
};

export default SyncButton;
