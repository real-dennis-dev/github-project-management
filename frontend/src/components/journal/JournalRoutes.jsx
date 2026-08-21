import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import JournalList from "./components/JournalList";
import JournalForm from "./components/JournalForm";
import JournalStats from "./components/JournalStats";
import JournalCalendar from "./components/JournalCalendar";
import JournalExport from "./components/JournalExport";

/**
 * Journal Routes Configuration
 * All routes are relative to the base journal path
 */
const JournalRoutes = () => {
  return (
    <Routes>
      {/* Main journal list view */}
      <Route index element={<JournalList />} />

      {/* Journal statistics dashboard */}
      <Route path="stats" element={<JournalStats />} />

      {/* Calendar view */}
      <Route path="calendar" element={<JournalCalendar />} />

      {/* Export functionality */}
      <Route path="export" element={<JournalExport />} />

      {/* Create new entry */}
      <Route path="new" element={<JournalForm />} />

      {/* View/Edit specific entry */}
      <Route path=":entryId" element={<JournalForm />} />

      {/* Edit specific entry (alternative path) */}
      <Route path=":entryId/edit" element={<JournalForm />} />

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="." replace />} />
    </Routes>
  );
};

export default JournalRoutes;
