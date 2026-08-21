/**
 * Journal Module - Main Export File
 *
 * This module provides comprehensive journal functionality for project documentation,
 * including creating, viewing, editing, and analyzing daily journal entries.
 */

// Routes
export { default as JournalRoutes } from "./JournalRoutes";

// Hooks
export { default as useJournal } from "./hooks/useJournal";

// Services
export { default as journalService } from "./services/journalService";

// Components
export { default as JournalList } from "./components/JournalList";
export { default as JournalForm } from "./components/JournalForm";
export { default as JournalStats } from "./components/JournalStats";
export { default as JournalCalendar } from "./components/JournalCalendar";
export { default as JournalExport } from "./components/JournalExport";

// Types/Constants
export const MOOD_EMOJIS = ["😊", "😐", "😔", "😡", "😴", "🤔", "🎉", "😰"];
export const MOOD_LABELS = {
  "😊": "Happy",
  "😐": "Neutral",
  "😔": "Sad",
  "😡": "Angry",
  "😴": "Tired",
  "🤔": "Thinking",
  "🎉": "Celebrating",
  "😰": "Anxious",
};
export const MOOD_SCORES = {
  "😊": 5,
  "🎉": 5,
  "🤔": 3,
  "😐": 3,
  "😴": 2,
  "😔": 2,
  "😰": 1,
  "😡": 1,
};

// Default export
const JournalModule = {
  JournalRoutes,
  useJournal,
  journalService,
  JournalList,
  JournalForm,
  JournalStats,
  JournalCalendar,
  JournalExport,
  MOOD_EMOJIS,
  MOOD_LABELS,
  MOOD_SCORES,
};

export default JournalModule;
