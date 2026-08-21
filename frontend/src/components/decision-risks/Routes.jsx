// src/components/decision-risks/Routes.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import DecisionsList from "./DecisionsList";
import DecisionDetail from "./DecisionDetail";
import DecisionCreate from "./DecisionCreate";
import DecisionEdit from "./DecisionEdit";
import RisksList from "./RisksList";
import RiskDetail from "./RiskDetail";
import RiskCreate from "./RiskCreate";
import RiskEdit from "./RiskEdit";
import RiskDashboard from "./RiskDashboard";

const DecisionRiskRoutes = () => {
  return (
    <Routes>
      {/* Decisions Routes */}
      <Route path="/decisions" element={<DecisionsList />} />
      <Route path="/decisions/new" element={<DecisionCreate />} />
      <Route path="/decisions/:id" element={<DecisionDetail />} />
      <Route path="/decisions/:id/edit" element={<DecisionEdit />} />

      {/* Risks Routes */}
      <Route path="/risks" element={<RisksList />} />
      <Route path="/risks/new" element={<RiskCreate />} />
      <Route path="/risks/:id" element={<RiskDetail />} />
      <Route path="/risks/:id/edit" element={<RiskEdit />} />

      {/* Risk Dashboard */}
      <Route path="/risks/dashboard" element={<RiskDashboard />} />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/decisions" replace />} />
    </Routes>
  );
};

export default DecisionRiskRoutes;
