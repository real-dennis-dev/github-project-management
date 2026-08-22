// src/App.jsx

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Layouts and Pages
import LandingPage from "./components/LandingPage";
import DashboardLayout from "./components/DashboardLayout";
import DashboardHome from "./components/DashboardHome";
import NotFound from "./components/NotFound";

// Routes
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import AuthRoutes from "./routes/AuthRoutes";

// Module Routes
import ExpenseRoutes from "./components/expense/ExpenseRoutes";
import GitHubRoutes from "./routes/GitHubRoutes";
import JournalRoutes from "./components/journal/JournalRoutes";
import TechDebtRoutes from "./components/tech-debt/TechDebtRoutes";
import ProjectRoutes from "./components/project-management/ProjectRoutes";
import SubscriptionsRoutes from "./components/subscriptions/SubscriptionsRoutes";
import VisionBoardRoutes from "./components/vision-board/VisionBoardRoutes";
import ReleasesMilestoneRoutes from "./components/releases-milestone/ReleasesMilestoneRoutes";
import ProcessRoutes from "./components/process/ProcessRoutes";
import DocumentationKnowledgeRoutes from "./components/documentation-knowledge/Routes";
import DecisionRiskRoutes from "./components/decision-risks/Routes";
import AIAssistantRoutes from "./components/ai-assistant/AIAssistantRoutes";
import Footer from "./components/Footer";
const App = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <LandingPage />
              </PublicRoute>
            }
          />

          {/* Auth Routes (login, register, etc.) */}
          <Route path="/*" element={<AuthRoutes />} />

          {/* Protected Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHome />} />
          </Route>

          {/* Protected Module Routes */}
          <Route
            path="/expenses/*"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="*" element={<ExpenseRoutes />} />
          </Route>

          <Route
            path="/github/*"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="*" element={<GitHubRoutes />} />
          </Route>

          <Route
            path="/journal/*"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="*" element={<JournalRoutes />} />
          </Route>

          <Route
            path="/tech-debt/*"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="*" element={<TechDebtRoutes />} />
          </Route>

          <Route
            path="/projects/*"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="*" element={<ProjectRoutes />} />
          </Route>

          <Route
            path="/subscriptions/*"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="*" element={<SubscriptionsRoutes />} />
          </Route>

          <Route
            path="/vision-board/*"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="*" element={<VisionBoardRoutes />} />
          </Route>

          <Route
            path="/releases/*"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="*" element={<ReleasesMilestoneRoutes />} />
          </Route>

          <Route
            path="/process/*"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="*" element={<ProcessRoutes />} />
          </Route>

          <Route
            path="/docs/*"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="*" element={<DocumentationKnowledgeRoutes />} />
          </Route>

          <Route
            path="/decisions/*"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="*" element={<DecisionRiskRoutes />} />
          </Route>

          <Route
            path="/ai/*"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="*" element={<AIAssistantRoutes />} />
          </Route>

          {/* 404 - Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
};

export default App;
