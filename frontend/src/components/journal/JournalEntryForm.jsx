// src/components/journal/JournalEntryForm.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useJournal } from "../../hooks/useJournal";
import { Input, Textarea, Button, Alert, Badge, Radio } from "../common";
import { ArrowLeft, Save, Trash2, Calendar } from "lucide-react";
import { MOODS } from "../../utils/journalValidation";

const JournalEntryForm = () => {
  const { projectId, entryId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = location.pathname.includes("/edit/");

  const {
    currentEntry,
    isCreating,
    isUpdating,
    isDeleting,
    createEntry,
    updateEntry,
    deleteEntry,
    setCurrentEntry,
    getMoodLabel,
  } = useJournal(projectId);

  const [formData, setFormData] = useState({
    entry_date: new Date().toISOString().split("T")[0],
    finished_today: "",
    problems: "",
    tomorrow_plan: "",
    mood: "😐",
    notes: "",
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isEdit && entryId) {
      // If we have a current entry, populate the form
      if (currentEntry && currentEntry.id === entryId) {
        setFormData({
          entry_date:
            currentEntry.entry_date || new Date().toISOString().split("T")[0],
          finished_today: currentEntry.finished_today || "",
          problems: currentEntry.problems || "",
          tomorrow_plan: currentEntry.tomorrow_plan || "",
          mood: currentEntry.mood || "😐",
          notes: currentEntry.notes || "",
        });
      }
    } else {
      // New entry - set default date
      setFormData((prev) => ({
        ...prev,
        entry_date: new Date().toISOString().split("T")[0],
      }));
    }
  }, [currentEntry, entryId, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSuccess(false);

    try {
      if (isEdit && entryId) {
        await updateEntry({ id: entryId, data: formData });
        setIsSuccess(true);
        setTimeout(() => {
          navigate(`/projects/${projectId}/journal/${entryId}`);
        }, 1500);
      } else {
        await createEntry(formData);
        setIsSuccess(true);
        setTimeout(() => {
          navigate(`/projects/${projectId}/journal`);
        }, 1500);
      }
    } catch (error) {
      // Handle validation errors
      if (error.cause) {
        setValidationErrors(error.cause);
      }
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this journal entry?")) {
      await deleteEntry(entryId);
      navigate(`/projects/${projectId}/journal`);
    }
  };

  const handleCancel = () => {
    if (isEdit && entryId) {
      navigate(`/projects/${projectId}/journal/${entryId}`);
    } else {
      navigate(`/projects/${projectId}/journal`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-800">
            {isEdit ? "Edit Journal Entry" : "New Journal Entry"}
          </h1>
        </div>
        {isEdit && (
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        )}
      </div>

      {/* Success Alert */}
      {isSuccess && (
        <Alert variant="success" className="mb-6">
          {isEdit
            ? "Journal entry updated successfully!"
            : "Journal entry created successfully!"}
        </Alert>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-600 mb-1">
            Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input
              type="date"
              name="entry_date"
              value={formData.entry_date}
              onChange={handleChange}
              className="pl-10"
              required
            />
          </div>
          {validationErrors.entry_date && (
            <p className="mt-1 text-sm text-error">
              {validationErrors.entry_date}
            </p>
          )}
        </div>

        {/* Mood Selection */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-600 mb-2">
            How are you feeling today?
          </label>
          <div className="flex flex-wrap gap-3">
            {MOODS.map((mood) => (
              <button
                key={mood}
                type="button"
                onClick={() => {
                  setFormData((prev) => ({ ...prev, mood }));
                  setValidationErrors((prev) => ({ ...prev, mood: undefined }));
                }}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all
                  ${
                    formData.mood === mood
                      ? "border-primary-500 bg-primary-500/10"
                      : "border-neutral-200 dark:border-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-400"
                  }
                `}
              >
                <span className="text-xl">{mood}</span>
                <span className="text-sm text-neutral-700 dark:text-neutral-600">
                  {getMoodLabel(mood)}
                </span>
                {formData.mood === mood && (
                  <Badge variant="primary" size="sm">
                    Selected
                  </Badge>
                )}
              </button>
            ))}
          </div>
          {validationErrors.mood && (
            <p className="mt-1 text-sm text-error">{validationErrors.mood}</p>
          )}
        </div>

        {/* Finished Today */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-600 mb-1">
            What did you finish today?
          </label>
          <Textarea
            name="finished_today"
            value={formData.finished_today}
            onChange={handleChange}
            placeholder="Describe what you accomplished today..."
            rows={3}
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-neutral-400">
              {formData.finished_today?.length || 0}/2000
            </span>
          </div>
          {validationErrors.finished_today && (
            <p className="mt-1 text-sm text-error">
              {validationErrors.finished_today}
            </p>
          )}
        </div>

        {/* Problems */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-600 mb-1">
            What problems did you face?
          </label>
          <Textarea
            name="problems"
            value={formData.problems}
            onChange={handleChange}
            placeholder="Describe any challenges or problems you encountered..."
            rows={3}
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-neutral-400">
              {formData.problems?.length || 0}/2000
            </span>
          </div>
          {validationErrors.problems && (
            <p className="mt-1 text-sm text-error">
              {validationErrors.problems}
            </p>
          )}
        </div>

        {/* Tomorrow Plan */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-600 mb-1">
            What are you planning for tomorrow?
          </label>
          <Textarea
            name="tomorrow_plan"
            value={formData.tomorrow_plan}
            onChange={handleChange}
            placeholder="Describe your plan for tomorrow..."
            rows={3}
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-neutral-400">
              {formData.tomorrow_plan?.length || 0}/2000
            </span>
          </div>
          {validationErrors.tomorrow_plan && (
            <p className="mt-1 text-sm text-error">
              {validationErrors.tomorrow_plan}
            </p>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-600 mb-1">
            Additional Notes
          </label>
          <Textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Any additional notes or thoughts..."
            rows={2}
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-neutral-400">
              {formData.notes?.length || 0}/5000
            </span>
          </div>
          {validationErrors.notes && (
            <p className="mt-1 text-sm text-error">{validationErrors.notes}</p>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex items-center gap-4 pt-4 border-t border-neutral-200 dark:border-neutral-300">
          <Button type="submit" disabled={isCreating || isUpdating}>
            <Save className="w-4 h-4 mr-2" />
            {isEdit ? "Update Entry" : "Create Entry"}
          </Button>
          <Button variant="outline" type="button" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default JournalEntryForm;
