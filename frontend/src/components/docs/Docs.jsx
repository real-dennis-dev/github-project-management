// src/components/docs/Docs.jsx

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faBook,
  faRocket,
  faDollarSign,
  faGithub,
  faCode,
  faUsers,
  faShieldAlt,
  faPlug,
  faQuestionCircle,
  faChevronRight,
  faFileAlt,
  faVideo,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";

const Docs = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    {
      icon: faRocket,
      title: "Getting Started",
      description: "Learn the basics and set up your account",
      articles: [
        "Quick Start Guide",
        "Creating Your First Project",
        "Inviting Team Members",
        "Understanding the Dashboard",
      ],
      color: "primary",
    },
    {
      icon: faDollarSign,
      title: "Expenses",
      description: "Manage and track project expenses",
      articles: [
        "Adding Expenses",
        "Expense Categories",
        "Generating Reports",
        "Budget Management",
      ],
      color: "success",
    },
    {
      icon: faGithub,
      title: "GitHub Integration",
      description: "Connect and manage GitHub repositories",
      articles: [
        "Connecting a Repository",
        "Managing Webhooks",
        "Tracking Commits",
        "Pull Request Workflow",
      ],
      color: "info",
    },
    {
      icon: faCode,
      title: "Technical Debt",
      description: "Identify and manage technical debt",
      articles: [
        "Understanding Technical Debt",
        "Creating Debt Items",
        "Prioritization Strategies",
        "Debt Reduction Planning",
      ],
      color: "warning",
    },
    {
      icon: faUsers,
      title: "Collaboration",
      description: "Work together effectively",
      articles: [
        "Team Management",
        "Roles & Permissions",
        "Real-time Updates",
        "Comments & Feedback",
      ],
      color: "secondary",
    },
    {
      icon: faShieldAlt,
      title: "Security",
      description: "Keep your data safe and secure",
      articles: [
        "Two-Factor Authentication",
        "Data Encryption",
        "Backup & Recovery",
        "Compliance Standards",
      ],
      color: "error",
    },
  ];

  const filteredCategories = categories.filter(
    (category) =>
      category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.articles.some((article) =>
        article.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const getColorClasses = (color) => {
    const colors = {
      primary: "bg-primary-500/10 text-primary-500",
      success: "bg-success/10 text-success",
      info: "bg-info/10 text-info",
      warning: "bg-warning/10 text-warning",
      secondary: "bg-secondary-400/10 text-secondary-400",
      error: "bg-error/10 text-error",
    };
    return colors[color] || colors.primary;
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 text-primary-500 mb-4">
            <FontAwesomeIcon icon={faBook} className="w-6 h-6" />
            <span className="text-sm font-semibold uppercase tracking-wider">
              Documentation
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-4">
            Welcome to the
            <span className="text-primary-500"> Docs</span>
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Everything you need to know about ProjMate. Find guides, tutorials,
            and API references.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documentation..."
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-neutral-900 dark:text-white placeholder:text-neutral-400"
            />
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Link
            to="/docs/getting-started"
            className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:shadow-md transition-all"
          >
            <FontAwesomeIcon
              icon={faRocket}
              className="text-primary-500 w-5 h-5"
            />
            <span className="text-sm font-medium">Getting Started</span>
            <FontAwesomeIcon
              icon={faChevronRight}
              className="text-neutral-400 w-3 h-3 ml-auto"
            />
          </Link>
          <Link
            to="/docs/api"
            className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:shadow-md transition-all"
          >
            <FontAwesomeIcon icon={faFileAlt} className="text-info w-5 h-5" />
            <span className="text-sm font-medium">API Reference</span>
            <FontAwesomeIcon
              icon={faChevronRight}
              className="text-neutral-400 w-3 h-3 ml-auto"
            />
          </Link>
          <Link
            to="/docs/video-tutorials"
            className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:shadow-md transition-all"
          >
            <FontAwesomeIcon icon={faVideo} className="text-success w-5 h-5" />
            <span className="text-sm font-medium">Video Tutorials</span>
            <FontAwesomeIcon
              icon={faChevronRight}
              className="text-neutral-400 w-3 h-3 ml-auto"
            />
          </Link>
          <Link
            to="/downloads"
            className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:shadow-md transition-all"
          >
            <FontAwesomeIcon
              icon={faDownload}
              className="text-warning w-5 h-5"
            />
            <span className="text-sm font-medium">Downloads</span>
            <FontAwesomeIcon
              icon={faChevronRight}
              className="text-neutral-400 w-3 h-3 ml-auto"
            />
          </Link>
        </div>

        {/* Categories */}
        {filteredCategories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category, index) => (
              <div
                key={index}
                className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-10 h-10 rounded-lg ${getColorClasses(
                      category.color
                    )} flex items-center justify-center`}
                  >
                    <FontAwesomeIcon icon={category.icon} className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                    {category.title}
                  </h3>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                  {category.description}
                </p>
                <ul className="space-y-2">
                  {category.articles.map((article, idx) => (
                    <li key={idx}>
                      <Link
                        to={`/docs/${article
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                        className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-primary-500 transition-colors"
                      >
                        <FontAwesomeIcon
                          icon={faChevronRight}
                          className="w-3 h-3 text-neutral-400"
                        />
                        {article}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <FontAwesomeIcon
              icon={faQuestionCircle}
              className="w-16 h-16 text-neutral-300 dark:text-neutral-700 mx-auto mb-4"
            />
            <p className="text-neutral-600 dark:text-neutral-400">
              No results found for "{searchQuery}"
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-2 text-primary-500 hover:underline"
            >
              Clear search
            </button>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-16 p-8 bg-primary-500/5 dark:bg-primary-500/10 rounded-2xl border border-primary-500/20 text-center">
          <FontAwesomeIcon
            icon={faQuestionCircle}
            className="w-12 h-12 text-primary-500 mb-4"
          />
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
            Still have questions?
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            Our support team is here to help you with any questions you might
            have.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors"
          >
            Contact Support
            <FontAwesomeIcon icon={faChevronRight} className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Docs;
