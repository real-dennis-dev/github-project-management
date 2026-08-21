// src/components/ai-assistant/AIAssistant.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useAIAssistant } from "./hooks/useAIAssistant";
import AIQuestionForm from "./components/AIQuestionForm";
import AIResponseDisplay from "./components/AIResponseDisplay";
import ProjectAnalysis from "./components/ProjectAnalysis";
import ReportGenerator from "./components/ReportGenerator";
import TrendAnalysis from "./components/TrendAnalysis";
import NextActions from "./components/NextActions";
import { Tabs, Tab, LoadingSpinner, Alert, EmptyState } from "../common";
import {
  SparklesIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

const AIAssistant = ({ projectId, className = "" }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("ask");
  const [selectedConversation, setSelectedConversation] = useState(null);

  const {
    conversations,
    currentResponse,
    analysis,
    report,
    trends,
    actions,
    loading,
    error,
    askQuestion,
    analyzeProject,
    generateReport,
    getTrends,
    getNextActions,
    getConversationHistory,
    clearResponse,
    resetState,
  } = useAIAssistant(projectId);

  useEffect(() => {
    if (projectId && isAuthenticated) {
      getConversationHistory();
    }
  }, [projectId, isAuthenticated]);

  const handleAskQuestion = async (question, context) => {
    await askQuestion(question, context);
    await getConversationHistory();
  };

  const handleAnalyze = async (focus, depth) => {
    await analyzeProject(focus, depth);
  };

  const handleGenerateReport = async (type, options) => {
    await generateReport(type, options);
  };

  const handleGetTrends = async () => {
    await getTrends();
  };

  const handleGetActions = async () => {
    await getNextActions();
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <EmptyState
        title="Authentication Required"
        description="Please log in to use the AI Assistant."
        icon={<SparklesIcon className="w-12 h-12 text-neutral-400" />}
      />
    );
  }

  const tabs = [
    { id: "ask", label: "Ask AI", icon: <SparklesIcon className="w-5 h-5" /> },
    {
      id: "analyze",
      label: "Analyze",
      icon: <ChartBarIcon className="w-5 h-5" />,
    },
    {
      id: "report",
      label: "Reports",
      icon: <DocumentTextIcon className="w-5 h-5" />,
    },
    {
      id: "actions",
      label: "Actions",
      icon: <ClockIcon className="w-5 h-5" />,
    },
  ];

  return (
    <div className={`ai-assistant ${className}`}>
      {error && (
        <Alert
          variant="error"
          title="Error"
          className="mb-4"
          onClose={() => resetState()}
        >
          {error}
        </Alert>
      )}

      <Tabs value={activeTab} onChange={setActiveTab} className="mb-6">
        {tabs.map((tab) => (
          <Tab key={tab.id} value={tab.id} icon={tab.icon}>
            {tab.label}
          </Tab>
        ))}
      </Tabs>

      <div className="ai-assistant-content">
        {activeTab === "ask" && (
          <div className="space-y-6">
            <AIQuestionForm
              onSubmit={handleAskQuestion}
              loading={loading}
              onClear={clearResponse}
            />
            {currentResponse && (
              <AIResponseDisplay
                response={currentResponse}
                conversation={selectedConversation}
                onViewHistory={() => getConversationHistory()}
              />
            )}
            {conversations.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">
                  Recent Conversations
                </h3>
                <div className="space-y-2">
                  {conversations.slice(0, 5).map((conv) => (
                    <div
                      key={conv.id}
                      className="p-3 bg-neutral-50 rounded-lg cursor-pointer hover:bg-neutral-100 transition-colors"
                      onClick={() => setSelectedConversation(conv)}
                    >
                      <p className="font-medium text-sm truncate">
                        {conv.question}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {new Date(conv.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "analyze" && (
          <ProjectAnalysis
            onAnalyze={handleAnalyze}
            analysis={analysis}
            loading={loading}
          />
        )}

        {activeTab === "report" && (
          <ReportGenerator
            onGenerate={handleGenerateReport}
            report={report}
            loading={loading}
          />
        )}

        {activeTab === "actions" && (
          <div className="space-y-6">
            <NextActions
              actions={actions}
              loading={loading}
              onRefresh={handleGetActions}
            />
            <TrendAnalysis
              trends={trends}
              loading={loading}
              onRefresh={handleGetTrends}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAssistant;
