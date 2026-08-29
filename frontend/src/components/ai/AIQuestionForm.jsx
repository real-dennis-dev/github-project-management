// src/components/ai/AIQuestionForm.jsx
import React, { useState } from "react";
import { Button, Input, Checkbox } from "../common";
import { Send, Sparkles } from "lucide-react";
import { useAI } from "../../hooks/useAI";

const AIQuestionForm = ({ onSubmit, isLoading }) => {
  const [question, setQuestion] = useState("");
  const [context, setContext] = useState({
    includeFeatures: true,
    includeBugs: true,
    includeDecisions: true,
    includeRisks: true,
    includeMilestones: true,
    includeTechDebt: true,
  });
  const [errors, setErrors] = useState({});

  const contextOptions = [
    { id: "includeFeatures", label: "Features" },
    { id: "includeBugs", label: "Bugs" },
    { id: "includeDecisions", label: "Decisions" },
    { id: "includeRisks", label: "Risks" },
    { id: "includeMilestones", label: "Milestones" },
    { id: "includeTechDebt", label: "Tech Debt" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const data = {
      question: question.trim(),
      context,
    };

    try {
      await onSubmit(data);
      setQuestion("");
    } catch (error) {
      // Errors handled by parent
    }
  };

  const handleContextToggle = (id) => {
    setContext((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const quickQuestions = [
    "What are the main risks in this project?",
    "Give me an overall project status summary",
    "What should be our next priority?",
    "Are there any performance issues?",
    "How is the team progress?",
  ];

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-start space-x-3">
          <div className="flex-1">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask me anything about your project..."
              className="w-full min-h-[100px] p-4 bg-neutral-100 border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-y"
              disabled={isLoading}
            />
            {errors.question && (
              <p className="mt-1 text-sm text-error">{errors.question}</p>
            )}
          </div>
          <Button
            type="submit"
            variant="primary"
            loading={isLoading}
            disabled={!question.trim() || isLoading}
            className="flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Ask</span>
          </Button>
        </div>

        <div className="flex flex-wrap gap-4">
          <span className="text-sm font-medium text-neutral-600">
            Include in context:
          </span>
          {contextOptions.map((option) => (
            <Checkbox
              key={option.id}
              id={option.id}
              label={option.label}
              checked={context[option.id]}
              onChange={() => handleContextToggle(option.id)}
              className="text-sm"
            />
          ))}
        </div>
      </form>

      <div>
        <p className="text-sm text-neutral-500 mb-3">Quick questions:</p>
        <div className="flex flex-wrap gap-2">
          {quickQuestions.map((q) => (
            <button
              key={q}
              onClick={() => setQuestion(q)}
              className="px-3 py-1.5 text-sm bg-neutral-200 hover:bg-neutral-300 rounded-full text-neutral-700 transition-colors"
              disabled={isLoading}
            >
              <Sparkles className="inline w-3 h-3 mr-1" />
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIQuestionForm;
