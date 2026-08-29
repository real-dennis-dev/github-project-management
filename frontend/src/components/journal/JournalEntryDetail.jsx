// src/components/journal/JournalEntryDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useJournal } from "../../hooks/useJournal";
import { Button, Badge, LoadingSpinner, ErrorState } from "../common";
import { ArrowLeft, Edit, Trash2, Calendar, Clock } from "lucide-react";

const JournalEntryDetail = () => {
  const { projectId, entryId } = useParams();
  const {
    currentEntry,
    isLoading,
    error,
    isDeleting,
    deleteEntry,
    refetchEntries,
    getMoodLabel,
    getMoodColor,
    getMoodBgColor,
    setCurrentEntry,
  } = useJournal(projectId);

  const [isDeletingLocal, setIsDeletingLocal] = useState(false);

  useEffect(() => {
    // If we don't have a current entry, fetch it
    if (!currentEntry && entryId) {
      // This should trigger the entry query
      refetchEntries();
    }
  }, [entryId]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this journal entry?")) {
      setIsDeletingLocal(true);
      await deleteEntry(entryId);
      // The hook will handle navigation
      setIsDeletingLocal(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading && !currentEntry) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !currentEntry) {
    return (
      <ErrorState
        title="Entry not found"
        description={error || "The journal entry could not be found."}
        onRetry={() => window.location.reload()}
      />
    );
  }

  const entry = currentEntry;

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to={`/projects/${projectId}/journal`}>
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-800">
              Journal Entry
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400">
              {formatDate(entry.entry_date)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to={`/projects/${projectId}/journal/edit/${entry.id}`}>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting || isDeletingLocal}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Entry Content */}
      <div className="bg-white dark:bg-neutral-100 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-300 p-6 space-y-6">
        {/* Mood */}
        <div className="flex items-center gap-4 p-4 rounded-lg bg-neutral-50 dark:bg-neutral-200">
          <span className="text-4xl">{entry.mood || "😐"}</span>
          <div>
            <h3 className="font-medium text-neutral-900 dark:text-neutral-800">
              {getMoodLabel(entry.mood || "😐")}
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Your mood for this day
            </p>
          </div>
          <Badge
            variant="primary"
            className={`ml-auto ${getMoodBgColor(entry.mood || "😐")}`}
          >
            {getMoodLabel(entry.mood || "😐")}
          </Badge>
        </div>

        {/* Finished Today */}
        {entry.finished_today && (
          <div>
            <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-600 mb-2">
              What I Finished Today
            </h3>
            <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-200">
              <p className="text-neutral-800 dark:text-neutral-700 whitespace-pre-wrap">
                {entry.finished_today}
              </p>
            </div>
          </div>
        )}

        {/* Problems */}
        {entry.problems && (
          <div>
            <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-600 mb-2">
              Problems I Faced
            </h3>
            <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-200">
              <p className="text-neutral-800 dark:text-neutral-700 whitespace-pre-wrap">
                {entry.problems}
              </p>
            </div>
          </div>
        )}

        {/* Tomorrow Plan */}
        {entry.tomorrow_plan && (
          <div>
            <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-600 mb-2">
              Plan for Tomorrow
            </h3>
            <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-200">
              <p className="text-neutral-800 dark:text-neutral-700 whitespace-pre-wrap">
                {entry.tomorrow_plan}
              </p>
            </div>
          </div>
        )}

        {/* Notes */}
        {entry.notes && (
          <div>
            <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-600 mb-2">
              Additional Notes
            </h3>
            <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-200">
              <p className="text-neutral-800 dark:text-neutral-700 whitespace-pre-wrap">
                {entry.notes}
              </p>
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="pt-4 border-t border-neutral-200 dark:border-neutral-300">
          <div className="flex flex-wrap items-center gap-6 text-sm text-neutral-500 dark:text-neutral-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Created: {formatDateTime(entry.created_at)}</span>
            </div>
            {entry.updated_at && entry.updated_at !== entry.created_at && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>Updated: {formatDateTime(entry.updated_at)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalEntryDetail;
