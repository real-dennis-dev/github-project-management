// src/components/releases/ReleaseChangelog.jsx
import React, { useEffect, useState } from "react";
import { useReleases } from "../../hooks/useReleases";
import { Button, LoadingSpinner, Alert } from "../common";
import { useToast } from "../../hooks/useToast";
import { Copy, Check, Download } from "lucide-react";

const ReleaseChangelog = ({ releaseId }) => {
  const [copied, setCopied] = useState(false);
  const {
    getReleaseChangelog,
    changelog,
    isChangelogLoading,
    error,
    clearError,
  } = useReleases();

  const { toast } = useToast();

  useEffect(() => {
    if (releaseId) {
      getReleaseChangelog(releaseId);
    }
  }, [releaseId]);

  const handleCopy = () => {
    if (!changelog) return;
    navigator.clipboard.writeText(changelog).then(() => {
      setCopied(true);
      toast.success("Changelog copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    if (!changelog) return;
    const blob = new Blob([changelog], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `changelog-${releaseId}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isChangelogLoading) {
    return <LoadingSpinner size="md" className="my-4" />;
  }

  if (error) {
    return (
      <Alert variant="error" onClose={clearError}>
        {error}
      </Alert>
    );
  }

  if (!changelog) {
    return (
      <Alert variant="info">No changelog available for this release.</Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900">
          Release Changelog
        </h3>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="flex items-center space-x-1"
          >
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            <span>{copied ? "Copied!" : "Copy"}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="flex items-center space-x-1"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </Button>
        </div>
      </div>

      <div className="bg-neutral-200 border border-neutral-300 rounded-lg p-6 overflow-x-auto">
        <pre className="text-sm text-neutral-800 whitespace-pre-wrap font-mono">
          {changelog}
        </pre>
      </div>
    </div>
  );
};

export default ReleaseChangelog;
