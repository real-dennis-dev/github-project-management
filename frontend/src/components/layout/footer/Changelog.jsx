// src/components/changelog/Changelog.jsx

import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRocket,
  faBug,
  faStar,
  faShieldAlt,
  faGift,
  faWrench,
  faChevronDown,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

const Changelog = () => {
  const [expandedVersion, setExpandedVersion] = useState(null);

  const releases = [
    {
      version: "2.4.0",
      date: "January 15, 2024",
      type: "major",
      title: "GitHub Integration Overhaul",
      description:
        "Complete rework of GitHub integration with enhanced features and performance improvements.",
      changes: [
        {
          type: "feature",
          title: "Real-time Webhook Support",
          description:
            "Added support for GitHub webhooks for instant updates on commits, PRs, and issues.",
        },
        {
          type: "feature",
          title: "Advanced Repository Analytics",
          description:
            "New statistics dashboard showing commit patterns, PR metrics, and team activity.",
        },
        {
          type: "improvement",
          title: "Faster Sync Performance",
          description:
            "Optimized repository sync process with 40% faster execution times.",
        },
        {
          type: "bugfix",
          title: "Fixed Webhook Authentication",
          description:
            "Resolved issue with webhook signature verification for GitHub events.",
        },
      ],
    },
    {
      version: "2.3.0",
      date: "December 20, 2023",
      type: "minor",
      title: "Expense Management Enhancements",
      description:
        "Major improvements to expense tracking with new features and better reporting.",
      changes: [
        {
          type: "feature",
          title: "Budget Alerts",
          description:
            "Set budget thresholds and receive notifications when approaching limits.",
        },
        {
          type: "improvement",
          title: "Category Insights",
          description:
            "New category breakdown and spending analytics dashboard.",
        },
        {
          type: "feature",
          title: "Expense CSV Export",
          description:
            "Export expense data to CSV format for external reporting.",
        },
        {
          type: "bugfix",
          title: "Date Range Filter",
          description:
            "Fixed date range filter not applying correctly in reports.",
        },
      ],
    },
    {
      version: "2.2.0",
      date: "December 5, 2023",
      type: "minor",
      title: "Technical Debt Management",
      description:
        "New module for tracking and managing technical debt across projects.",
      changes: [
        {
          type: "feature",
          title: "Technical Debt Dashboard",
          description:
            "Comprehensive dashboard showing debt metrics and trends.",
        },
        {
          type: "feature",
          title: "Debt Prioritization",
          description:
            "Priority scoring system to help identify critical debt items.",
        },
        {
          type: "improvement",
          title: "Integration with GitHub",
          description:
            "Link debt items to GitHub issues for better traceability.",
        },
      ],
    },
    {
      version: "2.1.0",
      date: "November 15, 2023",
      type: "patch",
      title: "Security & Performance Updates",
      description:
        "Security enhancements and performance improvements across the platform.",
      changes: [
        {
          type: "security",
          title: "2FA Support",
          description:
            "Added two-factor authentication for enhanced account security.",
        },
        {
          type: "improvement",
          title: "Page Load Performance",
          description:
            "Optimized frontend rendering with 30% faster page loads.",
        },
        {
          type: "bugfix",
          title: "Session Management",
          description: "Fixed session timeout issues on inactive tabs.",
        },
      ],
    },
    {
      version: "2.0.0",
      date: "November 1, 2023",
      type: "major",
      title: "Platform Redesign",
      description:
        "Complete redesign of the platform with new UI/UX and enhanced features.",
      changes: [
        {
          type: "feature",
          title: "Dark Mode",
          description:
            "Full dark mode support with system preference detection.",
        },
        {
          type: "feature",
          title: "Mobile Responsive Design",
          description: "Complete mobile-first redesign for all components.",
        },
        {
          type: "improvement",
          title: "Accessibility Enhancements",
          description:
            "WCAG 2.1 AA compliance with improved keyboard navigation.",
        },
        {
          type: "feature",
          title: "Customizable Dashboards",
          description:
            "New dashboard customization with drag-and-drop widgets.",
        },
      ],
    },
  ];

  const getTypeColor = (type) => {
    const colors = {
      feature: "bg-success/10 text-success",
      improvement: "bg-info/10 text-info",
      bugfix: "bg-error/10 text-error",
      security: "bg-warning/10 text-warning",
      major: "bg-primary-500/10 text-primary-500",
      minor: "bg-secondary-400/10 text-secondary-400",
      patch: "bg-neutral-100 dark:bg-neutral-800 text-neutral-500",
    };
    return colors[type] || colors.patch;
  };

  const getTypeIcon = (type) => {
    const icons = {
      feature: faStar,
      improvement: faWrench,
      bugfix: faBug,
      security: faShieldAlt,
      major: faRocket,
      minor: faGift,
      patch: faWrench,
    };
    return icons[type] || faWrench;
  };

  const getVersionBadge = (type) => {
    const badges = {
      major: "bg-primary-500 text-white",
      minor: "bg-secondary-400 text-white",
      patch: "bg-neutral-500 text-white",
    };
    return badges[type] || badges.patch;
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 text-primary-500 mb-4">
            <FontAwesomeIcon icon={faRocket} className="w-6 h-6" />
            <span className="text-sm font-semibold uppercase tracking-wider">
              Changelog
            </span>
          </div>
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-4">
            Product Updates
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400">
            All the latest features, improvements, and fixes
          </p>
        </div>

        {/* Releases */}
        <div className="space-y-8">
          {releases.map((release, index) => (
            <div
              key={index}
              className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden"
            >
              {/* Release Header */}
              <button
                onClick={() =>
                  setExpandedVersion(
                    expandedVersion === release.version ? null : release.version
                  )
                }
                className="w-full text-left p-6 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-lg ${getTypeColor(
                        release.type
                      )} flex items-center justify-center flex-shrink-0`}
                    >
                      <FontAwesomeIcon
                        icon={getTypeIcon(release.type)}
                        className="w-5 h-5"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span
                          className={`text-sm font-bold px-3 py-1 rounded-full ${getVersionBadge(
                            release.type
                          )}`}
                        >
                          v{release.version}
                        </span>
                        <span className="text-sm text-neutral-500 dark:text-neutral-400">
                          {release.date}
                        </span>
                      </div>
                      <h2 className="text-xl font-bold text-neutral-900 dark:text-white mt-1">
                        {release.title}
                      </h2>
                      <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-1">
                        {release.description}
                      </p>
                    </div>
                  </div>
                  <FontAwesomeIcon
                    icon={
                      expandedVersion === release.version
                        ? faChevronDown
                        : faChevronRight
                    }
                    className="text-neutral-400 w-5 h-5 flex-shrink-0 mt-1"
                  />
                </div>
              </button>

              {/* Release Details */}
              {expandedVersion === release.version && (
                <div className="px-6 pb-6 border-t border-neutral-200 dark:border-neutral-800 pt-4">
                  <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
                    Changes
                  </h3>
                  <ul className="space-y-3">
                    {release.changes.map((change, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm">
                        <span
                          className={`w-6 h-6 rounded-full ${getTypeColor(
                            change.type
                          )} flex items-center justify-center flex-shrink-0 mt-0.5`}
                        >
                          <FontAwesomeIcon
                            icon={getTypeIcon(change.type)}
                            className="w-3 h-3"
                          />
                        </span>
                        <div>
                          <span className="font-medium text-neutral-900 dark:text-white">
                            {change.title}
                          </span>
                          <p className="text-neutral-600 dark:text-neutral-400">
                            {change.description}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Subscribe */}
        <div className="mt-12 p-6 bg-primary-500/5 dark:bg-primary-500/10 rounded-xl border border-primary-500/20 text-center">
          <p className="text-neutral-600 dark:text-neutral-400">
            Stay up to date with our latest releases.
            <a
              href="#"
              className="text-primary-500 hover:underline font-medium ml-1"
            >
              Subscribe to updates
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Changelog;
