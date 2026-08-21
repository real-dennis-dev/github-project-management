import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useJournal from "../hooks/useJournal";
import {
  Input,
  Textarea,
  Button,
  LoadingSpinner,
  Alert,
  Badge,
} from "../../common";
import { format } from "date-fns";

const MOOD_EMOJIS = ["😊", "😐", "😔", "😡", "😴", "🤔", "🎉", "😰"];
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

const JournalForm = ({ projectId }) => {
  const navigate = useNavigate();
  const { entryId } = useParams();
  const isEdit = Boolean(entryId);

  const { getEntry, createEntry, updateEntry, loading, error, clearError } =
    useJournal(projectId);

  const [formData, setFormData] = useState({
    entry_date: format(new Date(), "yyyy-MM-dd"),
    finished_today: "",
    problems: "",
    tomorrow_plan: "",
    mood: "😐",
    notes: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isLoadingEntry, setIsLoadingEntry] = useState(false);

  // Load entry if editing
  useEffect(() => {
    if (isEdit && entryId) {
      setIsLoadingEntry(true);
      getEntry(entryId)
        .then((entry) => {
          if (entry) {
            setFormData({
              entry_date: entry.entry_date || format(new Date(), "yyyy-MM-dd"),
              finished_today: entry.finished_today || "",
              problems: entry.problems || "",
              tomorrow_plan: entry.tomorrow_plan || "",
              mood: entry.mood || "😐",
              notes: entry.notes || "",
            });
          }
        })
        .finally(() => {
          setIsLoadingEntry(false);
        });
    }
  }, [isEdit, entryId, getEntry]);

  const validate = () => {
    const errors = {};
    if (!formData.entry_date) {
      errors.entry_date = "Date is required";
    }
    if (formData.finished_today && formData.finished_today.length > 2000) {
      errors.finished_today = "Maximum 2000 characters";
    }
    if (formData.problems && formData.problems.length > 2000) {
      errors.problems = "Maximum 2000 characters";
    }
    if (formData.tomorrow_plan && formData.tomorrow_plan.length > 2000) {
      errors.tomorrow_plan = "Maximum 2000 characters";
    }
    if (formData.notes && formData.notes.length > 5000) {
      errors.notes = "Maximum 5000 characters";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleMoodSelect = (mood) => {
    setFormData((prev) => ({ ...prev, mood }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    if (!validate()) return;

    try {
      let result;
      if (isEdit) {
        result = await updateEntry(entryId, formData);
      } else {
        result = await createEntry(formData);
      }

      if (result) {
        // Navigate back to list
        navigate("..", { replace: true });
      }
    } catch (err) {
      // Error handled by hook
      console.error("Submit failed:", err);
    }
  };

  if (isLoadingEntry) {
    return <LoadingSpinner size="lg" className="mx-auto my-12" />;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold">
          {isEdit ? "Edit Journal Entry" : "New Journal Entry"}
        </h2>
        <p className="text-neutral-500 text-sm mt-1">
          {isEdit
            ? "Update your daily journal entry"
            : "Document what you finished, problems, and plans"}
        </p>
      </div>

      {error && (
        <Alert variant="error" className="mb-4" onClose={clearError}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date */}
        <Input
          label="Date"
          type="date"
          name="entry_date"
          value={formData.entry_date}
          onChange={handleChange}
          error={formErrors.entry_date}
          required
        />

        {/* Mood Selection */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            How are you feeling today?
          </label>
          <div className="flex gap-3 flex-wrap">
            {MOOD_EMOJIS.map((mood) => (
              <button
                key={mood}
                type="button"
                onClick={() => handleMoodSelect(mood)}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all min-w-[60px] ${
                  formData.mood === mood
                    ? "border-primary-500 bg-primary-500/10 shadow-md"
                    : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
                }`}
              >
                <span className="text-2xl">{mood}</span>
                <span className="text-xs text-neutral-500">
                  {MOOD_LABELS[mood]}
                </span>
              </button>
            ))}
          </div>
          {formData.mood && (
            <div className="mt-2 text-sm text-neutral-500">
              Selected: <Badge variant="primary">{formData.mood}</Badge>
            </div>
          )}
        </div>

        {/* What you finished today */}
        <Textarea
          label="What did you finish today? ✨"
          name="finished_today"
          value={formData.finished_today}
          onChange={handleChange}
          placeholder="Describe what you accomplished today..."
          rows={3}
          error={formErrors.finished_today}
          helper={`${formData.finished_today.length}/2000 characters`}
        />

        {/* Problems */}
        <Textarea
          label="Problems / Challenges 🚧"
          name="problems"
          value={formData.problems}
          onChange={handleChange}
          placeholder="What problems or challenges did you face?"
          rows={3}
          error={formErrors.problems}
          helper={`${formData.problems.length}/2000 characters`}
        />

        {/* Tomorrow's Plan */}
        <Textarea
          label="Plan for Tomorrow 📋"
          name="tomorrow_plan"
          value={formData.tomorrow_plan}
          onChange={handleChange}
          placeholder="What do you plan to work on tomorrow?"
          rows={3}
          error={formErrors.tomorrow_plan}
          helper={`${formData.tomorrow_plan.length}/2000 characters`}
        />

        {/* Notes */}
        <Textarea
          label="Additional Notes 📝"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Any other thoughts or notes..."
          rows={2}
          error={formErrors.notes}
          helper={`${formData.notes.length}/5000 characters`}
        />

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-neutral-200">
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={loading}
          >
            {isEdit ? "Update Entry" : "Create Entry"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate("..")}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default JournalForm;
