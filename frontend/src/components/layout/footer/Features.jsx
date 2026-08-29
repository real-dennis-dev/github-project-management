// src/components/features/Features.jsx

import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRocket,
  faChartLine,
  faCode,
  faDollarSign,
  faShieldAlt,
  faUsers,
  faClock,
  faCloud,
  faMobileAlt,
  faPlug,
  faBell,
} from "@fortawesome/free-solid-svg-icons";
import { FaGithub } from "react-icons/fa";
const Features = () => {
  const features = [
    {
      icon: faDollarSign,
      title: "Expense Tracking",
      description:
        "Track and manage project expenses with detailed reporting and analytics.",
      color: "primary",
    },
    {
      icon: FaGithub,
      title: "GitHub Integration",
      description:
        "Connect your repositories, track commits, pull requests, and issues seamlessly.",
      color: "info",
    },
    {
      icon: faCode,
      title: "Technical Debt Management",
      description:
        "Identify, track, and reduce technical debt with comprehensive tools.",
      color: "warning",
    },
    {
      icon: faChartLine,
      title: "Real-time Analytics",
      description:
        "Get instant insights with interactive dashboards and reports.",
      color: "success",
    },
    {
      icon: faShieldAlt,
      title: "Security & Compliance",
      description:
        "Enterprise-grade security with role-based access and audit logs.",
      color: "error",
    },
    {
      icon: faUsers,
      title: "Team Collaboration",
      description:
        "Work together seamlessly with real-time collaboration features.",
      color: "secondary",
    },
    {
      icon: faClock,
      title: "Time Tracking",
      description: "Monitor time spent on projects and tasks with precision.",
      color: "primary",
    },
    {
      icon: faCloud,
      title: "Cloud Sync",
      description:
        "Access your data from anywhere with automatic cloud synchronization.",
      color: "info",
    },
    {
      icon: faMobileAlt,
      title: "Mobile Friendly",
      description:
        "Manage your projects on the go with fully responsive design.",
      color: "success",
    },
    {
      icon: faPlug,
      title: "Integrations",
      description: "Connect with popular tools like Jira, Slack, and Trello.",
      color: "warning",
    },
    {
      icon: faBell,
      title: "Smart Notifications",
      description: "Stay informed with intelligent notifications and alerts.",
      color: "error",
    },
    {
      icon: faRocket,
      title: "Quick Setup",
      description:
        "Get started in minutes with our intuitive onboarding process.",
      color: "secondary",
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      primary: "bg-primary-500/10 text-primary-500",
      secondary: "bg-secondary-400/10 text-secondary-400",
      info: "bg-info/10 text-info",
      success: "bg-success/10 text-success",
      warning: "bg-warning/10 text-warning",
      error: "bg-error/10 text-error",
    };
    return colors[color] || colors.primary;
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-4">
            Powerful Features for
            <span className="text-primary-500"> Project Success</span>
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Everything you need to manage projects efficiently, from planning to
            execution.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div
                className={`w-12 h-12 rounded-lg ${getColorClasses(
                  feature.color
                )} flex items-center justify-center mb-4`}
              >
                <FontAwesomeIcon icon={feature.icon} className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center bg-primary-500/5 dark:bg-primary-500/10 rounded-2xl p-12 border border-primary-500/20">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            Join thousands of teams already using ProjMate to streamline their
            workflows.
          </p>
          <Link
            to="/pricing"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors"
          >
            View Pricing
            <FontAwesomeIcon icon={faRocket} className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Features;
