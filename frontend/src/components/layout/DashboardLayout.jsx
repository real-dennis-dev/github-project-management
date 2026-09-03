import React from "react";
import { Outlet, NavLink, useLocation, Navigate } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faProjectDiagram,
  faBook,
  faWallet,
  faBug,
  faRocket,
  faUsers,
  faCog,
  faChartLine,
  faBrain,
  faFileLines,
  faShieldHalved,
  faEye,
  faCreditCard,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

import { FaGithub } from "react-icons/fa";

import Navbar from "./Navbar";
import Footer from "./Footer";

import { useAuth } from "../../hooks/useAuth"; // adjust path if needed

const DashboardLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const location = useLocation();
  const { user } = useAuth();

  // Derive a friendly first name
  const displayName =
    user?.firstName ||
    user?.first_name ||
    user?.name?.split(" ")[0] ||
    user?.username ||
    "there";

  const sidebarLinks = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: faHome,
      exact: true,
    },
    {
      to: "/projects",
      label: "Projects",
      icon: faProjectDiagram,
    },
    {
      to: "/github",
      label: "GitHub",
      icon: FaGithub,
      reactIcon: true,
    },
    {
      to: "/journal",
      label: "Journal",
      icon: faBook,
    },
    {
      to: "/expenses",
      label: "Expenses",
      icon: faWallet,
    },
    {
      to: "/decisions-risks",
      label: "Decisions & Risks",
      icon: faShieldHalved,
    },
    {
      to: "/documentation-knowledge",
      label: "Documentation Knowledge",
      icon: faFileLines,
    },
    {
      to: "/tech-debt",
      label: "Tech Debt",
      icon: faBug,
    },
    {
      to: "/releases-milestones",
      label: "Releases",
      icon: faRocket,
    },
    {
      to: "/progress-timeline",
      label: "Progress",
      icon: faChartLine,
    },
    {
      to: "/vision",
      label: "Vision",
      icon: faEye,
    },
    {
      to: "/ai",
      label: "AI",
      icon: faBrain,
    },
  ];

  const bottomLinks = [
    {
      to: "/subscription",
      label: "Subscription",
      icon: faCreditCard,
    },
    {
      to: "/team",
      label: "Team",
      icon: faUsers,
    },
    {
      to: "/settings",
      label: "Settings",
      icon: faCog,
    },
  ];

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  const renderIcon = (link) => {
    if (link.reactIcon) {
      const Icon = link.icon;
      return <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />;
    }
    return (
      <FontAwesomeIcon icon={link.icon} className="w-5 h-5 flex-shrink-0" />
    );
  };

  const renderLink = (link) => {
    const active = isActive(link.to, link.exact);

    return (
      <NavLink
        key={link.to}
        to={link.to}
        title={isSidebarCollapsed ? link.label : undefined}
        className={`
          group relative
          flex items-center gap-3
          px-3 py-2.5
          rounded-lg
          text-sm font-medium
          transition-all duration-200

          ${
            active
              ? `bg-primary-500/10 text-primary-400`
              : `text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900`
          }

          ${isSidebarCollapsed ? "justify-center" : ""}
        `}
      >
        {active && (
          <span
            className="
              absolute left-0 top-1/2 -translate-y-1/2
              w-0.5 h-6 rounded-r-full bg-primary-500
            "
          />
        )}

        {renderIcon(link)}

        {!isSidebarCollapsed && <span className="truncate">{link.label}</span>}
      </NavLink>
    );
  };

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900">
      <Navbar />

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside
          className={`
            fixed left-0 top-16 bottom-0 z-30
            bg-neutral-100 border-r border-neutral-300
            transition-all duration-300
            ${isSidebarCollapsed ? "w-16" : "w-64"}
            overflow-y-auto
          `}
        >
          <div className="flex flex-col h-full">
            {/* Collapse button */}
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              aria-label={
                isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
              }
              className="
                absolute -right-3 top-5
                w-6 h-6 rounded-full
                bg-neutral-200 border border-neutral-300
                flex items-center justify-center
                text-neutral-600
                hover:bg-neutral-300 hover:text-neutral-900
                transition-colors shadow-lg
              "
            >
              <FontAwesomeIcon
                icon={isSidebarCollapsed ? faChevronRight : faChevronLeft}
                className="w-3 h-3"
              />
            </button>

            {/* Main navigation */}
            <nav
              className="flex-1 py-5 px-2 space-y-1"
              aria-label="Main navigation"
            >
              {!isSidebarCollapsed && (
                <div className="px-3 pb-3">
                  <span className="text-[0.65rem] font-bold uppercase tracking-widest text-neutral-500">
                    Workspace
                  </span>
                </div>
              )}

              {sidebarLinks.map(renderLink)}
            </nav>

            {/* Bottom navigation */}
            <div className="py-4 px-2 border-t border-neutral-300 space-y-1">
              {!isSidebarCollapsed && (
                <div className="px-3 pb-3">
                  <span className="text-[0.65rem] font-bold uppercase tracking-widest text-neutral-500">
                    Account
                  </span>
                </div>
              )}

              {bottomLinks.map(renderLink)}
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main
          className={`
            flex-1 min-w-0 transition-all duration-300
            ${isSidebarCollapsed ? "ml-16" : "ml-64"}
          `}
        >
          <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">
            {/* Welcome banner */}
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-neutral-900">
                Welcome {displayName}
              </h1>
              <p className="text-sm text-neutral-500 mt-1">
                Here’s what’s happening in your workspace today.
              </p>
            </div>

            <Outlet />
          </div>

          {/* <Footer /> */}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
