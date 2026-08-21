import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useJournal from "../hooks/useJournal";
import {
  Table,
  Badge,
  Button,
  SearchBar,
  Pagination,
  LoadingSpinner,
  EmptyState,
  ErrorState,
  Dropdown,
  DropdownItem,
  IconWrapper,
} from "../../common";
import { format, parseISO } from "date-fns";

const MOOD_LABELS = {
  "😊": "Happy",
  "😐": "Neutral",
  "😔": "Sad",
  "😡": "Angry",
  "😴": "Tired",
  "🤔": "Thinking",
  "🎉": "Celebrating",
  "😰": "Anxious",
};

const JournalList = ({ projectId }) => {
  const navigate = useNavigate();
  const {
    entries,
    loading,
    error,
    pagination,
    filters,
    fetchEntries,
    updateFilters,
    changePage,
    deleteEntry,
    clearError,
    moodOptions,
  } = useJournal(projectId);

  const [deletingId, setDeletingId] = useState(null);

  const handleSearch = (value) => {
    // Search across finished_today, problems, tomorrow_plan, notes
    updateFilters({ search: value });
  };

  const handleMoodFilter = (mood) => {
    updateFilters({ mood: mood === filters.mood ? null : mood });
  };

  const handleSort = (sortBy) => {
    const newOrder =
      sortBy === filters.sortBy && filters.sortOrder === "ASC" ? "DESC" : "ASC";
    updateFilters({ sortBy, sortOrder: newOrder });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      setDeletingId(id);
      try {
        await deleteEntry(id);
      } catch (err) {
        console.error("Delete failed:", err);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const getMoodBadgeVariant = (mood) => {
    const variants = {
      "😊": "success",
      "🎉": "success",
      "🤔": "info",
      "😐": "neutral",
      "😴": "warning",
      "😔": "warning",
      "😰": "error",
      "😡": "error",
    };
    return variants[mood] || "neutral";
  };

  const headers = [
    { key: "entry_date", label: "Date", sortable: true },
    { key: "mood", label: "Mood", sortable: true },
    { key: "finished_today", label: "Finished Today" },
    { key: "problems", label: "Problems" },
    { key: "tomorrow_plan", label: "Plan" },
    { key: "actions", label: "Actions", sortable: false },
  ];

  if (loading && entries.length === 0) {
    return <LoadingSpinner size="lg" className="mx-auto my-12" />;
  }

  if (error && entries.length === 0) {
    return (
      <ErrorState
        title="Failed to Load Journal"
        description={error}
        onRetry={fetchEntries}
        className="my-8"
      />
    );
  }

  if (!loading && !error && entries.length === 0) {
    return (
      <EmptyState
        title="No Journal Entries Yet"
        description="Start documenting your daily progress, challenges, and plans."
        action={
          <Button
            variant="primary"
            onClick={() => navigate("new")}
            className="mt-4"
          >
            Create First Entry
          </Button>
        }
        className="my-8"
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-bold">Journal Entries</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate("new")}
            className="whitespace-nowrap"
          >
            + New Entry
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate("stats")}>
            Stats
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("calendar")}
          >
            Calendar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("export")}
          >
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <SearchBar
          value={filters.search || ""}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search entries..."
          className="flex-1"
        />
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-sm text-neutral-500 mr-1">Mood:</span>
          {moodOptions.map((mood) => (
            <button
              key={mood}
              onClick={() => handleMoodFilter(mood)}
              className={`text-lg px-1.5 py-0.5 rounded transition-all ${
                filters.mood === mood
                  ? "bg-primary-500/20 ring-2 ring-primary-500"
                  : "hover:bg-neutral-200"
              }`}
              title={MOOD_LABELS[mood]}
            >
              {mood}
            </button>
          ))}
          {filters.mood && (
            <button
              onClick={() => updateFilters({ mood: null })}
              className="text-xs text-neutral-400 hover:text-neutral-600 ml-1"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-neutral-200">
        <Table
          headers={headers}
          data={entries}
          variant="striped"
          className="min-w-full"
          renderRow={(entry) => (
            <tr
              key={entry.id}
              className="cursor-pointer hover:bg-neutral-50 transition-colors"
              onClick={() => navigate(`/${entry.id}`)}
            >
              <td className="px-4 py-3 whitespace-nowrap">
                {format(parseISO(entry.entry_date), "MMM dd, yyyy")}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{entry.mood || "😐"}</span>
                  <Badge variant={getMoodBadgeVariant(entry.mood)} size="sm">
                    {MOOD_LABELS[entry.mood] || "Neutral"}
                  </Badge>
                </div>
              </td>
              <td className="px-4 py-3 max-w-xs truncate">
                {entry.finished_today || "—"}
              </td>
              <td className="px-4 py-3 max-w-xs truncate text-neutral-500">
                {entry.problems || "—"}
              </td>
              <td className="px-4 py-3 max-w-xs truncate text-neutral-500">
                {entry.tomorrow_plan || "—"}
              </td>
              <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                <Dropdown
                  trigger={
                    <Button variant="ghost" size="sm">
                      ⋮
                    </Button>
                  }
                  align="right"
                >
                  <DropdownItem onClick={() => navigate(`/${entry.id}`)}>
                    View
                  </DropdownItem>
                  <DropdownItem onClick={() => navigate(`/${entry.id}/edit`)}>
                    Edit
                  </DropdownItem>
                  <DropdownItem
                    onClick={() => handleDelete(entry.id)}
                    disabled={deletingId === entry.id}
                    className="text-error"
                  >
                    {deletingId === entry.id ? "Deleting..." : "Delete"}
                  </DropdownItem>
                </Dropdown>
              </td>
            </tr>
          )}
        />
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-neutral-500">
            Showing {entries.length} of {pagination.total} entries
          </span>
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={changePage}
            showFirstLast
            siblingCount={1}
          />
        </div>
      )}
    </div>
  );
};

export default JournalList;
