// src/components/ai/TextSummarizer.jsx
import React, { useState } from "react";
import { Button, Textarea, Select, LoadingSpinner, Alert } from "../common";
import { useAI } from "../../hooks/useAI";
import { useToast } from "../../hooks/useToast";
import { FileText, Copy, Check } from "lucide-react";

const TextSummarizer = () => {
  const [text, setText] = useState("");
  const [maxLength, setMaxLength] = useState(500);
  const [format, setFormat] = useState("paragraph");
  const [copied, setCopied] = useState(false);
  const { summarizeText, currentSummary, isSummarizing, error, clearError } =
    useAI();
  const { toast } = useToast();

  const formatOptions = [
    { value: "paragraph", label: "Paragraph" },
    { value: "bullet", label: "Bullet Points" },
    { value: "numbered", label: "Numbered List" },
  ];

  const maxLengthOptions = [
    { value: 100, label: "100" },
    { value: 250, label: "250" },
    { value: 500, label: "500" },
    { value: 1000, label: "1000" },
  ];

  const handleSummarize = async () => {
    try {
      const result = await summarizeText({
        text,
        maxLength,
        format,
      });
      if (result.success) {
        toast.success("Text summarized successfully");
      }
    } catch (err) {
      toast.error(err.message || "Failed to summarize text");
    }
  };

  const handleCopy = () => {
    if (!currentSummary?.summary) return;

    const summaryText =
      typeof currentSummary.summary === "string"
        ? currentSummary.summary
        : JSON.stringify(currentSummary.summary, null, 2);

    navigator.clipboard.writeText(summaryText).then(() => {
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const renderSummary = () => {
    if (!currentSummary?.summary) return null;

    const summary = currentSummary.summary;

    if (typeof summary === "string") {
      return <p className="text-neutral-800 whitespace-pre-wrap">{summary}</p>;
    }

    if (Array.isArray(summary)) {
      if (format === "bullet") {
        return (
          <ul className="list-disc list-inside space-y-1 text-neutral-800">
            {summary.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        );
      }
      if (format === "numbered") {
        return (
          <ol className="list-decimal list-inside space-y-1 text-neutral-800">
            {summary.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ol>
        );
      }
    }

    return (
      <pre className="text-neutral-800 whitespace-pre-wrap">
        {JSON.stringify(summary, null, 2)}
      </pre>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-neutral-900">Text Summarizer</h2>
      </div>

      {error && (
        <Alert variant="error" onClose={clearError}>
          {error}
        </Alert>
      )}

      <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Text to Summarize
            </label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your text here to get an AI-powered summary..."
              rows={8}
              fullWidth
              className="min-h-[150px]"
            />
            <p className="mt-1 text-xs text-neutral-500">
              {text.length} characters
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Max Length
              </label>
              <Select
                value={maxLength}
                onChange={(e) => setMaxLength(Number(e.target.value))}
                options={maxLengthOptions}
                fullWidth
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Output Format
              </label>
              <Select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                options={formatOptions}
                fullWidth
              />
            </div>
          </div>

          <Button
            onClick={handleSummarize}
            loading={isSummarizing}
            disabled={!text.trim() || isSummarizing}
            variant="primary"
            fullWidth
            className="mt-2"
          >
            <FileText className="w-4 h-4 mr-2" />
            Summarize
          </Button>
        </div>
      </div>

      {isSummarizing && <LoadingSpinner size="lg" className="my-8" />}

      {currentSummary && !isSummarizing && (
        <div className="bg-neutral-100 border border-neutral-300 rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-900">
                Summary
              </h3>
              <div className="flex items-center space-x-3">
                <Badge variant="info" size="sm">
                  {currentSummary.originalLength} →{" "}
                  {currentSummary.summaryLength} chars
                </Badge>
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
              {renderSummary()}
            </div>
            {currentSummary.timestamp && (
              <p className="mt-4 text-xs text-neutral-500">
                Generated: {new Date(currentSummary.timestamp).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TextSummarizer;
