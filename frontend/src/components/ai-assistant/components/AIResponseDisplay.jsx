// src/components/ai-assistant/components/AIResponseDisplay.jsx
import React, { useState } from "react";
import { Button, Badge, Alert } from "../../common";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";
import { CheckIcon } from "@heroicons/react/24/solid";

const AIResponseDisplay = ({ response, conversation, onViewHistory }) => {
  const [copied, setCopied] = useState(false);

  if (!response) return null;

  const { question, response: answer, quality, timestamp, context } = response;

  const handleCopy = () => {
    const text =
      typeof answer === "string" ? answer : JSON.stringify(answer, null, 2);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderResponse = () => {
    if (typeof answer === "string") {
      return <div className="whitespace-pre-wrap">{answer}</div>;
    }

    if (typeof answer === "object" && answer !== null) {
      return (
        <div className="space-y-4">
          {answer.summary && (
            <div>
              <h4 className="font-medium text-neutral-700">Summary</h4>
              <p className="mt-1">{answer.summary}</p>
            </div>
          )}

          {answer.data && (
            <div>
              <h4 className="font-medium text-neutral-700">Data</h4>
              <pre className="mt-1 p-3 bg-neutral-50 rounded-lg overflow-auto text-sm">
                {JSON.stringify(answer.data, null, 2)}
              </pre>
            </div>
          )}

          {answer.actions && (
            <div>
              <h4 className="font-medium text-neutral-700">
                Suggested Actions
              </h4>
              <ul className="mt-1 space-y-1">
                {answer.actions.map((action, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary-500">•</span>
                    <span>{action.text || action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    }

    return <div>{String(answer)}</div>;
  };

  return (
    <div className="ai-response-display border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-neutral-50 px-4 py-3 border-b flex justify-between items-center">
        <div className="flex items-center gap-3">
          <DocumentTextIcon className="w-5 h-5 text-primary-500" />
          <span className="font-medium">Response</span>
          {quality && quality.isValid !== undefined && (
            <Badge variant={quality.isValid ? "success" : "warning"} size="sm">
              {quality.isValid ? "Valid" : "Needs Review"}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleCopy}>
            {copied ? (
              <CheckIcon className="w-4 h-4 text-green-500" />
            ) : (
              <ClipboardDocumentIcon className="w-4 h-4" />
            )}
          </Button>
          {onViewHistory && (
            <Button variant="ghost" size="sm" onClick={onViewHistory}>
              History
            </Button>
          )}
        </div>
      </div>

      {/* Question */}
      <div className="px-4 py-3 border-b bg-white">
        <p className="text-sm text-neutral-500">Question:</p>
        <p className="font-medium">{question}</p>
      </div>

      {/* Response */}
      <div className="px-4 py-4 bg-white">
        {answer ? (
          renderResponse()
        ) : (
          <Alert variant="warning">No response content available.</Alert>
        )}
      </div>

      {/* Footer */}
      {(quality || context || timestamp) && (
        <div className="bg-neutral-50 px-4 py-2 border-t text-xs text-neutral-500 flex flex-wrap gap-4">
          {quality && quality.metrics && (
            <span>Confidence: {quality.metrics.confidence || "N/A"}</span>
          )}
          {context && context.projectName && (
            <span>Project: {context.projectName}</span>
          )}
          {timestamp && (
            <span>Generated: {new Date(timestamp).toLocaleString()}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default AIResponseDisplay;
