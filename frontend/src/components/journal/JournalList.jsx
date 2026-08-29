// src/components/journal/JournalList.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useJournal } from "../../hooks/useJournal";
import {
  SearchBar,
  LoadingSpinner,
  EmptyState,
  ErrorState,
  Pagination,
  Badge,
  Button,
  Dropdown,
  DropdownItem,
} from "../common";
import {
  Plus,
  Calendar,
  Filter,
  ArrowUpDown,
  Eye,
  Edit,
  Trash2,
  Download,
  BarChart3,
  Grid3x3,
} from "lucide-react";

const JournalList = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const {
    entries,
    isLoading,
    error,
    pagination,
    filters,
    isDeleting,
    changePage,
    changeFilters,
    resetFilters,
    deleteEntry,
    refetchEntries,
    getMoodLabel,
    getMoodColor,
    getMoodBgColor,
    MOODS,
  } = useJournal(projectId);

  const [selectedEntries, setSelectedEntries] = useState([]);
  const [viewMode, setViewMode] = useState("list"); // 'list' | 'grid'

  useEffect(() => {
    refetchEntries();
  }, [projectId]);

  const handleSearch = (value) => {
    // Search is handled by filters - we could add a search field to the API
    // For now, we'll just filter locally if needed
  };

  const handleFilterChange = (key, value) => {
    changeFilters({ [key]: value });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      await deleteEntry(id);
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const truncateText = (text, maxLength = 150) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  if (isLoading && entries.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load journal entries"
        description={error}
        onRetry={refetchEntries}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-800">
            Journal
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            Track your daily progress and reflections
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to={`/projects/${projectId}/journal/calendar`}>
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Calendar
            </Button>
          </Link>
          <Link to={`/projects/${projectId}/journal/stats`}>
            <Button variant="outline" size="sm">
              <BarChart3 className="w-4 h-4 mr-2" />
              Stats
            </Button>
          </Link>
          <Link to={`/projects/${projectId}/journal/export`}>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </Link>
          <Link to={`/projects/${projectId}/journal/new`}>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Entry
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-neutral-100 dark:bg-neutral-200 rounded-lg p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <SearchBar
              placeholder="Search entries..."
              onChange={handleSearch}
              fullWidth
            />
          </div>

          <div className="flex items-center gap-2">
            <Dropdown
              trigger={
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Mood
                  {filters.mood && (
                    <Badge variant="primary" size="sm" className="ml-2">
                      {filters.mood}
                    </Badge>
                  )}
                </Button>
              }
            >
              <DropdownItem onClick={() => handleFilterChange("mood", null)}>
                All Moods
              </DropdownItem>
              {MOODS.map((mood) => (
                <DropdownItem
                  key={mood}
                  onClick={() => handleFilterChange("mood", mood)}
                >
                  {mood} {getMoodLabel(mood)}
                </DropdownItem>
              ))}
            </Dropdown>

            <Dropdown
              trigger={
                <Button variant="outline" size="sm">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  Sort
                </Button>
              }
            >
              <DropdownItem
                onClick={() => handleFilterChange("sortBy", "entry_date")}
              >
                Sort by Date
              </DropdownItem>
              <DropdownItem
                onClick={() => handleFilterChange("sortBy", "mood")}
              >
                Sort by Mood
              </DropdownItem>
              <DropdownItem
                onClick={() => handleFilterChange("sortOrder", "DESC")}
              >
                Newest First
              </DropdownItem>
              <DropdownItem
                onClick={() => handleFilterChange("sortOrder", "ASC")}
              >
                Oldest First
              </DropdownItem>
            </Dropdown>

            {(filters.mood || filters.fromDate || filters.toDate) && (
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                Clear Filters
              </Button>
            )}
          </div>

          <div className="flex items-center gap-1 border-l border-neutral-300 dark:border-neutral-500 pl-4">
            <Button
              variant={viewMode === "list" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="p-2"
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="p-2"
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Entry List */}
      {entries.length === 0 ? (
        <EmptyState
          title="No journal entries yet"
          description="Start tracking your daily progress by creating your first journal entry."
          action={
            <Link to={`/projects/${projectId}/journal/new`}>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create First Entry
              </Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="space-y-4">
            {viewMode === "list" ? (
              // List View
              entries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-white dark:bg-neutral-100 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 border border-neutral-200 dark:border-neutral-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{entry.mood || "😐"}</span>
                        <span className="text-sm text-neutral-500 dark:text-neutral-400">
                          {formatDate(entry.entry_date)}
                        </span>
                        <Badge variant="primary" size="sm">
                          {getMoodLabel(entry.mood || "😐")}
                        </Badge>
                      </div>

                      {entry.finished_today && (
                        <div className="mb-2">
                          <p className="text-sm text-neutral-700 dark:text-neutral-600">
                            <span className="font-medium">Finished:</span>{" "}
                            {truncateText(entry.finished_today, 100)}
                          </p>
                        </div>
                      )}

                      {entry.problems && (
                        <div className="mb-2">
                          <p className="text-sm text-neutral-700 dark:text-neutral-600">
                            <span className="font-medium">Problems:</span>{" "}
                            {truncateText(entry.problems, 100)}
                          </p>
                        </div>
                      )}

                      {entry.tomorrow_plan && (
                        <div>
                          <p className="text-sm text-neutral-700 dark:text-neutral-600">
                            <span className="font-medium">Plan:</span>{" "}
                            {truncateText(entry.tomorrow_plan, 100)}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Link to={`/projects/${projectId}/journal/${entry.id}`}>
                        <Button variant="ghost" size="sm" className="p-2">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link
                        to={`/projects/${projectId}/journal/edit/${entry.id}`}
                      >
                        <Button variant="ghost" size="sm" className="p-2">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-2 text-error hover:text-error"
                        onClick={() => handleDelete(entry.id)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Grid View
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-white dark:bg-neutral-100 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 border border-neutral-200 dark:border-neutral-300"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{entry.mood || "😐"}</span>
                        <Badge
                          variant="primary"
                          size="sm"
                          className={getMoodBgColor(entry.mood || "😐")}
                        >
                          {getMoodLabel(entry.mood || "😐")}
                        </Badge>
                      </div>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        {formatDate(entry.entry_date)}
                      </span>
                    </div>

                    {entry.finished_today && (
                      <p className="text-sm text-neutral-700 dark:text-neutral-600 line-clamp-2 mb-2">
                        {truncateText(entry.finished_today, 80)}
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-300">
                      <Link
                        to={`/projects/${projectId}/journal/${entry.id}`}
                        className="flex-1"
                      >
                        <Button variant="outline" size="sm" fullWidth>
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      </Link>
                      <Link
                        to={`/projects/${projectId}/journal/edit/${entry.id}`}
                      >
                        <Button variant="outline" size="sm" className="p-2">
                          <Edit className="w-3 h-3" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        className="p-2 text-error hover:text-error"
                        onClick={() => handleDelete(entry.id)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.pages}
                onPageChange={changePage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default JournalList;
