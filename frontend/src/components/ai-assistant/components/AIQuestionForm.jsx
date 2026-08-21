// src/components/ai-assistant/components/AIQuestionForm.jsx
import React, { useState } from "react";
import { Button, Textarea, Switch, Checkbox } from "../../common";

const AIQuestionForm = ({ onSubmit, loading = false, onClear }) => {
  const [question, setQuestion] = useState("");
  const [includeContext, setIncludeContext] = useState(true);
  const [contextOptions, setContextOptions] = useState({
    includeFeatures: true,
    includeBugs: true,
    includeDecisions: true,
    includeRisks: true,
    includeMilestones: true,
    includeTechDebt: true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    const context = includeContext ? contextOptions : {};
    onSubmit(question.trim(), context);
    setQuestion("");
  };

  const handleContextToggle = (key) => {
    setContextOptions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="ai-question-form space-y-4">
      <div>
        <Textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask me anything about your project... (e.g., 'What are the main risks?', 'Summarize recent progress', 'Generate a status report')"
          rows={3}
          className="resize-none"
          disabled={loading}
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Switch
          checked={includeContext}
          onChange={setIncludeContext}
          label="Include project context"
        />

        {includeContext && (
          <div className="flex flex-wrap gap-3 ml-2">
            <Checkbox
              checked={contextOptions.includeFeatures}
              onChange={() => handleContextToggle("includeFeatures")}
              label="Features"
              className="text-sm"
            />
            <Checkbox
              checked={contextOptions.includeBugs}
              onChange={() => handleContextToggle("includeBugs")}
              label="Bugs"
              className="text-sm"
            />
            <Checkbox
              checked={contextOptions.includeDecisions}
              onChange={() => handleContextToggle("includeDecisions")}
              label="Decisions"
              className="text-sm"
            />
            <Checkbox
              checked={contextOptions.includeRisks}
              onChange={() => handleContextToggle("includeRisks")}
              label="Risks"
              className="text-sm"
            />
            <Checkbox
              checked={contextOptions.includeMilestones}
              onChange={() => handleContextToggle("includeMilestones")}
              label="Milestones"
              className="text-sm"
            />
            <Checkbox
              checked={contextOptions.includeTechDebt}
              onChange={() => handleContextToggle("includeTechDebt")}
              label="Tech Debt"
              className="text-sm"
            />
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={loading || !question.trim()}
          loading={loading}
        >
          {loading ? "Thinking..." : "Ask AI"}
        </Button>
        {onClear && (
          <Button variant="ghost" onClick={onClear} disabled={loading}>
            Clear Response
          </Button>
        )}
      </div>
    </form>
  );
};

export default AIQuestionForm;
