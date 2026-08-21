// src/components/DashboardLayout.jsx

import React from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faProjectDiagram,
  faCode,
  faBook,
  faClipboardList,
  faChartLine,
  faCog,
  faUsers,
  faWallet,
  faBug,
  faRocket,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FaGithub } from "react-icons/fa";
import Navbar from "./Navbar";
import Footer from "./Footer";

const DashboardLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const location = useLocation();

  const sidebarLinks = [
    { to: "/dashboard", label: "Dashboard", icon: faHome },
    { to: "/projects", label: "Projects", icon: faProjectDiagram },
    { to: "/github", label: "GitHub", icon: FaGithub },
    { to: "/journal", label: "Journal", icon: faBook },
    { to: "/expenses", label: "Expenses", icon: faWallet },
    { to: "/tech-debt", label: "Tech Debt", icon: faBug },
    { to: "/releases", label: "Releases", icon: faRocket },
  ];

  const bottomLinks = [
    { to: "/team", label: "Team", icon: faUsers },
    { to: "/settings", label: "Settings", icon: faCog },
  ];

  const isActive = (path) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <Navbar />

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside
          className={`fixed left-0 top-16 bottom-0 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 transition-all duration-300 z-30 ${
            isSidebarCollapsed ? "w-16" : "w-64"
          } overflow-y-auto`}
        >
          <div className="flex flex-col h-full">
            {/* Toggle Button */}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="absolute -right-3 top-4 w-6 h-6 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-full flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors shadow-sm"
            >
              <FontAwesomeIcon
                icon={isSidebarCollapsed ? faChevronRight : faChevronLeft}
                className="w-3 h-3 text-neutral-500"
              />
            </button>

            {/* Main Navigation */}
            <nav className="flex-1 py-4 px-2 space-y-1">
              {sidebarLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive: active }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                        : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    } ${isSidebarCollapsed ? "justify-center" : ""}`
                  }
                  title={isSidebarCollapsed ? link.label : ""}
                >
                  <FontAwesomeIcon
                    icon={link.icon}
                    className="w-5 h-5 flex-shrink-0"
                  />
                  {!isSidebarCollapsed && <span>{link.label}</span>}
                </NavLink>
              ))}
            </nav>

            {/* Bottom Navigation */}
            <div className="py-4 px-2 border-t border-neutral-200 dark:border-neutral-800 space-y-1">
              {bottomLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive: active }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                        : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    } ${isSidebarCollapsed ? "justify-center" : ""}`
                  }
                  title={isSidebarCollapsed ? link.label : ""}
                >
                  <FontAwesomeIcon
                    icon={link.icon}
                    className="w-5 h-5 flex-shrink-0"
                  />
                  {!isSidebarCollapsed && <span>{link.label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main
          className={`flex-1 transition-all duration-300 ${
            isSidebarCollapsed ? "ml-16" : "ml-64"
          }`}
        >
          <div className="min-h-[calc(100vh-8rem)] p-4 sm:p-6">
            <Outlet />
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
