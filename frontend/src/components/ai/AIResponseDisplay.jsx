// src/components/ai/AIResponseDisplay.jsx
import React, { useState } from "react";
import { Alert, Badge, Button } from "../common";
import { Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "../../hooks/useToast";

const AIResponseDisplay = ({ response }) => {
  const [copied, setCopied] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const { toast } = useToast();

  if (!response) return null;

  const { answer, context_data, created_at } = response;
  const quality = response.quality || {};

  const handleCopy = () => {
    const text =
      typeof answer === "string" ? answer : JSON.stringify(answer, null, 2);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="bg-neutral-100 border border-neutral-300 rounded-lg overflow-hidden">
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-neutral-900">Response</h3>
          <div className="flex items-center space-x-2">
            {quality.isValid !== undefined && (
              <Badge variant={quality.isValid ? "success" : "error"}>
                {quality.isValid ? "Valid" : "Invalid"}
              </Badge>
            )}
            {quality.metrics && Object.keys(quality.metrics).length > 0 && (
              <Badge variant="info">
                {quality.metrics.confidence &&
                  `${Math.round(quality.metrics.confidence * 100)}% confidence`}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="p-1.5"
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="prose prose-neutral max-w-none">
          {typeof answer === "string" ? (
            <p className="text-neutral-800 whitespace-pre-wrap">{answer}</p>
          ) : (
            <pre className="bg-neutral-200 p-4 rounded-lg overflow-x-auto text-sm text-neutral-800">
              {JSON.stringify(answer, null, 2)}
            </pre>
          )}
        </div>

        {quality.issues && quality.issues.length > 0 && (
          <Alert variant="warning" title="Quality Issues">
            <ul className="list-disc list-inside">
              {quality.issues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          </Alert>
        )}

        {context_data && Object.keys(context_data).length > 0 && (
          <div>
            <button
              onClick={() => setShowRaw(!showRaw)}
              className="flex items-center text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
            >
              {showRaw ? (
                <ChevronUp className="w-4 h-4 mr-1" />
              ) : (
                <ChevronDown className="w-4 h-4 mr-1" />
              )}
              {showRaw ? "Hide" : "Show"} context data
            </button>
            {showRaw && (
              <div className="mt-2 p-3 bg-neutral-200 rounded-lg overflow-x-auto">
                <pre className="text-xs text-neutral-700">
                  {JSON.stringify(context_data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {created_at && (
          <p className="text-xs text-neutral-500">
            Generated: {formatDate(created_at)}
          </p>
        )}
      </div>
    </div>
  );
};

export default AIResponseDisplay;
