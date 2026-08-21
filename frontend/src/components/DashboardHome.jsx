// src/components/DashboardHome.jsx

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWallet,
  faCode,
  faBook,
  faBug,
  faRocket,
  faUsers,
  faArrowUp,
  faArrowDown,
  faPlus,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthContext";
import { Card, Button, LoadingSpinner, ProgressBar, Badge } from "./common";
import useGitHub from "../hooks/useGitHub";
import useExpenses from "../hooks/useExpenses";

const DashboardHome = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalExpenses: 0,
    totalCommits: 0,
    openIssues: 0,
    recentActivity: [],
    monthlyGrowth: 12,
  });

  // Fetch data from different modules
  const {
    repositories,
    stats: githubStats,
    loading: githubLoading,
  } = useGitHub();
  const { expenses, statistics, loading: expenseLoading } = useExpenses();

  useEffect(() => {
    // Simulate loading data from multiple sources
    const timer = setTimeout(() => {
      setStats((prev) => ({
        ...prev,
        totalProjects: 5,
        totalExpenses: expenses.length || 0,
        totalCommits: githubStats?.commits?.total || 0,
        openIssues: githubStats?.issues?.open || 0,
        recentActivity: [
          {
            id: 1,
            type: "expense",
            title: "New expense added",
            description: "AWS EC2 Monthly Hosting - $49.99",
            time: "2 hours ago",
          },
          {
            id: 2,
            type: "commit",
            title: "GitHub commit",
            description: "Fixed authentication bug",
            time: "4 hours ago",
          },
          {
            id: 3,
            type: "journal",
            title: "Journal entry created",
            description: "Weekly project retrospective",
            time: "1 day ago",
          },
          {
            id: 4,
            type: "tech-debt",
            title: "Tech debt item added",
            description: "Upgrade legacy authentication system",
            time: "2 days ago",
          },
        ],
      }));
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [expenses, githubStats]);

  const statCards = [
    {
      title: "Total Projects",
      value: stats.totalProjects,
      icon: faRocket,
      color: "text-primary-500",
      bgColor: "bg-primary-50 dark:bg-primary-950/20",
      change: "+2",
      changeType: "positive",
    },
    {
      title: "Total Expenses",
      value: `$${statistics?.formatted_total || "0.00"}`,
      icon: faWallet,
      color: "text-success",
      bgColor: "bg-success/10",
      change: `+${statistics?.count || 0}`,
      changeType: "positive",
    },
    {
      title: "Total Commits",
      value: stats.totalCommits,
      icon: faCode,
      color: "text-info",
      bgColor: "bg-info/10",
      change: stats.monthlyGrowth,
      changeType: "positive",
    },
    {
      title: "Open Issues",
      value: stats.openIssues,
      icon: faBug,
      color: "text-error",
      bgColor: "bg-error/10",
      change: "-3",
      changeType: "negative",
    },
  ];

  const quickActions = [
    {
      title: "Add Expense",
      icon: faWallet,
      path: "/expenses/new",
      color: "text-success",
    },
    {
      title: "Connect GitHub",
      icon: faCode,
      path: "/github/repositories/connect",
      color: "text-info",
    },
    {
      title: "Create Journal",
      icon: faBook,
      path: "/journal/new",
      color: "text-warning",
    },
    {
      title: "New Project",
      icon: faRocket,
      path: "/projects/new",
      color: "text-primary-500",
    },
  ];

  if (loading || githubLoading || expenseLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Welcome back, {user?.name?.split(" ")[0] || "User"}! 👋
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            Here's what's happening with your projects today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <FontAwesomeIcon icon={faEye} className="w-4 h-4 mr-2" />
            View All
          </Button>
          <Button variant="primary" size="sm">
            <FontAwesomeIcon icon={faPlus} className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">
                  {stat.value}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <span
                    className={`text-xs font-medium ${
                      stat.changeType === "positive"
                        ? "text-success"
                        : "text-error"
                    }`}
                  >
                    {stat.change}
                  </span>
                  <FontAwesomeIcon
                    icon={
                      stat.changeType === "positive" ? faArrowUp : faArrowDown
                    }
                    className={`w-3 h-3 ${
                      stat.changeType === "positive"
                        ? "text-success"
                        : "text-error"
                    }`}
                  />
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    vs last month
                  </span>
                </div>
              </div>
              <div
                className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}
              >
                <FontAwesomeIcon
                  icon={stat.icon}
                  className={`w-6 h-6 ${stat.color}`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.path}
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-950/20 transition-all group"
            >
              <div className="w-12 h-12 rounded-lg bg-neutral-100 dark:bg-neutral-800 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 flex items-center justify-center transition-colors">
                <FontAwesomeIcon
                  icon={action.icon}
                  className={`w-6 h-6 ${action.color} group-hover:scale-110 transition-transform`}
                />
              </div>
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 text-center">
                {action.title}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Recent Activity
            </h2>
            <Link
              to="/activity"
              className="text-sm text-primary-500 hover:text-primary-600 font-medium"
            >
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {stats.recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/20 flex items-center justify-center flex-shrink-0">
                  <FontAwesomeIcon
                    icon={
                      activity.type === "expense"
                        ? faWallet
                        : activity.type === "commit"
                        ? faCode
                        : activity.type === "journal"
                        ? faBook
                        : faBug
                    }
                    className="w-4 h-4 text-primary-500"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">
                    {activity.title}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                    {activity.description}
                  </p>
                </div>
                <span className="text-xs text-neutral-400 flex-shrink-0">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            Project Health
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-neutral-600 dark:text-neutral-400">
                  Overall Progress
                </span>
                <span className="font-medium text-neutral-900 dark:text-white">
                  78%
                </span>
              </div>
              <ProgressBar value={78} max={100} variant="primary" size="md" />
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-neutral-600 dark:text-neutral-400">
                  Budget Used
                </span>
                <span className="font-medium text-neutral-900 dark:text-white">
                  62%
                </span>
              </div>
              <ProgressBar value={62} max={100} variant="success" size="md" />
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-neutral-600 dark:text-neutral-400">
                  Tech Debt
                </span>
                <span className="font-medium text-neutral-900 dark:text-white">
                  45%
                </span>
              </div>
              <ProgressBar value={45} max={100} variant="warning" size="md" />
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-neutral-600 dark:text-neutral-400">
                  Team Velocity
                </span>
                <span className="font-medium text-neutral-900 dark:text-white">
                  92%
                </span>
              </div>
              <ProgressBar value={92} max={100} variant="info" size="md" />
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-500 dark:text-neutral-400">
                Team Members
              </span>
              <div className="flex -space-x-2">
                {["JD", "MK", "SR", "AL"].map((initials, index) => (
                  <div
                    key={index}
                    className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-medium ring-2 ring-white dark:ring-neutral-900"
                  >
                    {initials}
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-xs font-medium ring-2 ring-white dark:ring-neutral-900 text-neutral-600 dark:text-neutral-400">
                  +2
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
