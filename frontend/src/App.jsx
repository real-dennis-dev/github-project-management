import { Routes, Route, Navigate } from "react-router-dom";
import authRoutes from "./routes/authRoutes";
import { ProtectedRoute } from "./components/auth";
import aiRoutes from "./routes/aiRoutes";
import subscriptionRoutes from "./routes/subscriptionRoutes";
import { decisionsRisksRoutes } from "./components/decision-risks";
import documentationKnowledgeRoutes from "./routes/documentationKnowledgeRoutes";
import journalRoutes from "./routes/journalRoutes";
import expenseRoutes from "./routes/expenseRoutes";
import githubRoutes from "./routes/githubRoutes";
import progressRoutes from "./routes/progressRoutes";
import projectRoutes from "./routes/projectRoutes";
import releasesRoutes from "./routes/releasesRoutes";
import visionRoutes from "./routes/visionRoutes";
import techDebtRoutes from "./routes/techDebtRoutes";
import FooterRoutes from "./routes/FooterRoutes";

// Layouts and Pages
import LandingPage from "./components/layout/LandingPage";
import DashboardLayout from "./components/layout/DashboardLayout";
import DashboardHome from "./components/layout/DashboardHome";
import NotFound from "./components/layout/NotFound";
const App = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      {/* Render base auth routes (/login, /register, etc.) */}
      {authRoutes.map((route, index) => (
        <Route key={index} path={route.path} element={route.element} />
      ))}

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardHome />} />

        {/* Render AI routes */}
        {aiRoutes.map((route, index) => (
          <Route
            key={`ai-${index}`}
            path={route.path}
            element={route.element}
          />
        ))}
        {/* Render subscription routes */}
        {subscriptionRoutes.map((route, index) => (
          <Route
            key={`sub-${index}`}
            path={route.path}
            element={route.element}
          />
        ))}
        {/* Decisions & Risks Routes */}
        {decisionsRisksRoutes.map((route, index) => (
          <Route
            key={`dr-${index}`}
            path={route.path}
            element={route.element}
          />
        ))}
        {/* Journal routes */}
        {journalRoutes.map((route, index) => (
          <Route
            key={`journal-${index}`}
            path={route.path}
            element={route.element}
          />
        ))}
        {/* Render expense routes */}
        {expenseRoutes.map((route, index) => (
          <Route
            key={`expense-${index}`}
            path={route.path}
            element={route.element}
          />
        ))}
        {/* Render GitHub routes */}
        {githubRoutes.map((route, index) => (
          <Route
            key={`github-${index}`}
            path={route.path}
            element={route.element}
          />
        ))}
        {/* Render progress routes */}
        {progressRoutes.map((route, index) => (
          <Route
            key={`progress-${index}`}
            path={route.path}
            element={route.element}
          />
        ))}
        {/* Render project routes */}
        {projectRoutes.map((route, index) => (
          <Route
            key={`project-${index}`}
            path={route.path}
            element={route.element}
          />
        ))}
        {/* Render releases & milestones routes */}
        {releasesRoutes.map((route, index) => (
          <Route
            key={`releases-${index}`}
            path={route.path}
            element={route.element}
          />
        ))}
        {/* Render vision routes */}
        {visionRoutes.map((route, index) => (
          <Route
            key={`vision-${index}`}
            path={route.path}
            element={route.element}
          />
        ))}
        {/* Render tech debt routes */}
        {techDebtRoutes.map((route, index) => (
          <Route
            key={`td-${index}`}
            path={route.path}
            element={route.element}
          />
        ))}
        {/* Render documentation knowledge routes */}
        {documentationKnowledgeRoutes.map((route, index) => (
          <Route
            key={`dk-${index}`}
            path={route.path}
            element={route.element}
          />
        ))}
      </Route>
      {/* Render aliased /auth/* routes (/auth/login, /auth/register, etc.) */}
      {authRoutes
        .filter((route) => route.path !== "/auth/*")
        .map((route, index) => (
          <Route
            key={`auth-${index}`}
            path={`/auth${route.path}`}
            element={route.element}
          />
        ))}

      {/* 404 - Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
