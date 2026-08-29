// src/components/ai/AIAssistant.jsx
import React, { useState } from "react";
import AIQuestionForm from "./AIQuestionForm";
import AIResponseDisplay from "./AIResponseDisplay";
import ConversationHistory from "./ConversationHistory";
import AIStatusIndicator from "./AIStatusIndicator";
import { useAI } from "../../hooks/useAI";
import { useToast } from "../../hooks/useToast";
import { Alert, LoadingSpinner } from "../common";
import { MessageSquare, Bot } from "lucide-react";

const AIAssistant = ({ projectId }) => {
  const [activeTab, setActiveTab] = useState("ask");
  const { askQuestion, currentConversation, isLoading, error, clearError } =
    useAI();
  const { toast } = useToast();

  const handleAskQuestion = async (data) => {
    try {
      const result = await askQuestion(projectId, data);
      if (result.success) {
        toast.success("Question answered successfully");
      }
    } catch (err) {
      toast.error(err.message || "Failed to get answer");
    }
  };

  const tabs = [
    { id: "ask", label: "Ask AI", icon: MessageSquare },
    { id: "history", label: "History", icon: Bot },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bot className="w-8 h-8 text-primary-500" />
          <h1 className="text-2xl font-bold text-neutral-900">AI Assistant</h1>
        </div>
        <AIStatusIndicator />
      </div>

      {error && (
        <Alert variant="error" onClose={clearError}>
          {error}
        </Alert>
      )}

      <div className="border-b border-neutral-300">
        <nav className="flex space-x-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-primary-500 text-primary-500"
                    : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-400"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {isLoading && <LoadingSpinner size="lg" className="my-8" />}

      {!isLoading && (
        <div className="mt-6">
          {activeTab === "ask" && (
            <div className="space-y-6">
              <AIQuestionForm
                onSubmit={handleAskQuestion}
                isLoading={isLoading}
              />
              {currentConversation && (
                <AIResponseDisplay response={currentConversation} />
              )}
            </div>
          )}
          {activeTab === "history" && (
            <ConversationHistory projectId={projectId} />
          )}
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
