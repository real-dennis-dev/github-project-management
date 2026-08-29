// src/components/ai/ConversationHistory.jsx
import React, { useState, useEffect } from "react";
import { useAI } from "../../hooks/useAI";
import { LoadingSpinner, Alert, Pagination, SearchBar, Badge } from "../common";
import { MessageSquare, ChevronRight, Clock } from "lucide-react";

const ConversationHistory = ({ projectId }) => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const {
    getConversations,
    conversations,
    pagination,
    isLoading,
    error,
    clearError,
    filters,
    setFilters,
  } = useAI();

  const limit = 10;

  useEffect(() => {
    if (projectId) {
      const params = {
        page,
        limit,
        questionContains: searchTerm || undefined,
        ...filters,
      };
      getConversations(projectId, params);
    }
  }, [projectId, page, searchTerm, filters]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setPage(1);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  if (isLoading && conversations.length === 0) {
    return <LoadingSpinner size="lg" className="my-8" />;
  }

  if (error) {
    return (
      <Alert variant="error" onClose={clearError}>
        {error}
      </Alert>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
        <p className="text-neutral-500">No conversations yet</p>
        <p className="text-sm text-neutral-400">
          Ask your first question to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <SearchBar
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search conversations..."
          className="flex-1"
        />
        <Badge variant="info" size="lg">
          {pagination.total} conversations
        </Badge>
      </div>

      <div className="space-y-4">
        {conversations.map((conv) => (
          <div
            key={conv.id}
            className="bg-neutral-100 border border-neutral-300 rounded-lg p-4 hover:border-primary-400 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-neutral-900 font-medium">{conv.question}</p>
                <p className="text-sm text-neutral-600 mt-1 line-clamp-2">
                  {typeof conv.answer === "string"
                    ? conv.answer
                    : JSON.stringify(conv.answer).slice(0, 200)}
                </p>
                <div className="flex items-center space-x-4 mt-2 text-xs text-neutral-500">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(conv.created_at)}</span>
                  </span>
                  {conv.context_data && (
                    <Badge variant="info" size="sm">
                      With context
                    </Badge>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  // Navigate to conversation detail or expand
                }}
                className="p-2 hover:bg-neutral-200 rounded-full transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-neutral-500" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {pagination.pages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={pagination.pages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default ConversationHistory;
