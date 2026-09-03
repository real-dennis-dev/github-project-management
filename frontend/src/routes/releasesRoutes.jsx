// src/routes/releasesRoutes.jsx
import React from "react";

// Direct imports
import ReleasesDashboard from "../components/releases/ReleasesDashboard";
import ReleaseList from "../components/releases/ReleaseList";
import ReleaseForm from "../components/releases/ReleaseForm";
import ReleaseDetail from "../components/releases/ReleaseDetail";
import ReleaseStats from "../components/releases/ReleaseStats";
import MilestoneList from "../components/releases/MilestoneList";
import MilestoneForm from "../components/releases/MilestoneForm";
import MilestoneDetail from "../components/releases/MilestoneDetail";
import MilestoneStats from "../components/releases/MilestoneStats";
import BulkUpdateProgress from "../components/releases/BulkUpdateProgress";

const releasesRoutes = [
  // Top-level dashboard
  {
    path: "/releases-milestones",
    element: <ReleasesDashboard />,
  },

  // ========== Project-scoped routes ==========
  {
    path: "projects/:projectId/releases",
    element: <ReleaseList />,
  },
  {
    path: "projects/:projectId/releases/create",
    element: <ReleaseForm />,
  },
  {
    path: "projects/:projectId/releases/stats",
    element: <ReleaseStats />,
  },
  {
    path: "projects/:projectId/milestones",
    element: <MilestoneList />,
  },
  {
    path: "projects/:projectId/milestones/create",
    element: <MilestoneForm />,
  },
  {
    path: "projects/:projectId/milestones/stats",
    element: <MilestoneStats />,
  },
  {
    path: "projects/:projectId/milestones/bulk-update",
    element: <BulkUpdateProgress />,
  },

  // ========== By ID routes ==========
  {
    path: "releases/:id",
    element: <ReleaseDetail />,
  },
  {
    path: "releases/:id/edit",
    element: <ReleaseForm editMode={true} />,
  },
  {
    path: "milestones/:id",
    element: <MilestoneDetail />,
  },
  {
    path: "milestones/:id/edit",
    element: <MilestoneForm editMode={true} />,
  },
];

export default releasesRoutes;
