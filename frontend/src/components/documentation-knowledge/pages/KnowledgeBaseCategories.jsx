// src/components/documentation-knowledge/pages/KnowledgeBaseCategories.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, FolderOpen, BookOpen, ChevronRight } from "lucide-react";
import {
  Button,
  LoadingSpinner,
  ErrorState,
  EmptyState,
  Badge,
} from "../../common";
import { useKnowledgeBase } from "../hooks/useKnowledgeBase";
import CategoryBadge from "../components/CategoryBadge";
import { KNOWLEDGE_CATEGORIES } from "../utils/constants";

const KnowledgeBaseCategories = () => {
  const navigate = useNavigate();
  const {
    categories,
    loading,
    error,
    loadCategories,
    loadByCategory,
    entries,
  } = useKnowledgeBase();

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryEntries, setCategoryEntries] = useState([]);
  const [loadingCategory, setLoadingCategory] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCategoryClick = async (category) => {
    setSelectedCategory(category);
    setLoadingCategory(true);
    const result = await loadByCategory(category);
    setCategoryEntries(result || []);
    setLoadingCategory(false);
  };

  const getCategoryCount = (categoryName) => {
    const found = categories.find((c) => c.category === categoryName);
    return found ? found.count : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to Load Categories"
        description={error}
        onRetry={() => loadCategories()}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to="/knowledge-base">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Categories</h1>
            <p className="text-sm text-neutral-500">
              Browse knowledge base by category
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Categories List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-neutral-200 p-4">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <FolderOpen size={20} />
              All Categories
            </h2>
            <div className="space-y-1">
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setCategoryEntries([]);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  !selectedCategory
                    ? "bg-primary-50 text-primary-700"
                    : "hover:bg-neutral-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <BookOpen size={16} />
                    All Entries
                  </span>
                  <Badge variant="neutral" size="sm">
                    {categories.reduce((sum, c) => sum + c.count, 0)}
                  </Badge>
                </div>
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.category}
                  onClick={() => handleCategoryClick(cat.category)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedCategory === cat.category
                      ? "bg-primary-50 text-primary-700"
                      : "hover:bg-neutral-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <CategoryBadge category={cat.category} size="sm" />
                    </span>
                    <Badge variant="neutral" size="sm">
                      {cat.count}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Category Content */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-neutral-200 p-4">
            {selectedCategory ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                    <CategoryBadge category={selectedCategory} />
                    <span className="text-sm font-normal text-neutral-500">
                      ({getCategoryCount(selectedCategory)} entries)
                    </span>
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/knowledge-base/create")}
                  >
                    Add Entry
                  </Button>
                </div>

                {loadingCategory ? (
                  <div className="flex items-center justify-center py-12">
                    <LoadingSpinner />
                  </div>
                ) : categoryEntries.length === 0 ? (
                  <EmptyState
                    title="No Entries in This Category"
                    description={`No knowledge entries found in "${selectedCategory}"`}
                    action={
                      <Button
                        variant="primary"
                        onClick={() => navigate("/knowledge-base/create")}
                      >
                        Create Entry
                      </Button>
                    }
                  />
                ) : (
                  <div className="space-y-4">
                    {categoryEntries.map((entry) => (
                      <Link
                        key={entry.id}
                        to={`/knowledge-base/${entry.id}`}
                        className="block p-4 border border-neutral-200 rounded-lg hover:border-primary-300 hover:bg-neutral-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-neutral-900">
                              {entry.topic}
                            </h3>
                            <p className="text-sm text-neutral-500 mt-1 line-clamp-2">
                              {entry.content}
                            </p>
                            {entry.tags && entry.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {entry.tags.slice(0, 3).map((tag) => (
                                  <Badge key={tag} variant="neutral" size="sm">
                                    #{tag}
                                  </Badge>
                                ))}
                                {entry.tags.length > 3 && (
                                  <Badge variant="neutral" size="sm">
                                    +{entry.tags.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                          <ChevronRight
                            size={16}
                            className="text-neutral-400 ml-2 flex-shrink-0"
                          />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <FolderOpen
                  size={48}
                  className="text-neutral-300 mx-auto mb-4"
                />
                <h3 className="text-lg font-medium text-neutral-900 mb-2">
                  Select a Category
                </h3>
                <p className="text-sm text-neutral-500">
                  Choose a category from the list to view its entries
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBaseCategories;
