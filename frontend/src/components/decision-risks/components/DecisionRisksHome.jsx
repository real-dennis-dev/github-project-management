// src/components/decision-risks/components/DecisionRisksHome.jsx
import React from "react";
import { Link, useParams } from "react-router-dom";
import {
  Scale,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Shield,
  FileText,
  LayoutGrid,
} from "lucide-react";
import { Button } from "../../../components/common/Button";
import { Badge } from "../../../components/common/Badge";

/**
 * Homepage for the Decisions & Risks module.
 * Provides entry points to both Decisions and Risks sections.
 *
 * Expects projectId from route params (e.g. /projects/:projectId/decisions-risks)
 * or falls back to a prop if provided.
 */
const DecisionRisksHome = ({ projectId: projectIdProp }) => {
  const { projectId: projectIdParam } = useParams();
  const projectId = projectIdProp || projectIdParam;

  const basePath = projectId
    ? `/projects/${projectId}/decisions-risks`
    : "/decisions-risks";

  const sections = [
    {
      title: "Decisions",
      description:
        "Record key project decisions, capture context and rationale, track impact levels, and review decision history and statistics.",
      icon: Scale,
      href: `${basePath}/decisions`,
      color: "primary",
      features: [
        "Create & edit decisions",
        "Impact classification",
        "Decision statistics",
        "Export & reporting",
      ],
      cta: "Manage Decisions",
    },
    {
      title: "Risks",
      description:
        "Identify, assess, and monitor project risks. Use risk levels, status tracking, risk matrix, and overall risk score.",
      icon: AlertTriangle,
      href: `${basePath}/risks`,
      color: "warning",
      features: [
        "Risk identification",
        "Status & mitigation",
        "Risk matrix view",
        "Project risk score",
      ],
      cta: "Manage Risks",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 text-sm font-medium mb-4">
          <Shield className="w-4 h-4" />
          Project Governance
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
          Decisions & Risks
        </h1>
        <p className="mt-3 text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl">
          Capture important decisions and manage risks in one place. Keep your
          project transparent, auditable, and under control.
        </p>
      </div>

      {/* Section cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sections.map((section) => {
          const Icon = section.icon;
          const isPrimary = section.color === "primary";

          return (
            <div
              key={section.title}
              className="group relative flex flex-col bg-neutral-50 dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6 sm:p-8 hover:border-primary-400 dark:hover:border-primary-500 transition-all duration-200 hover:shadow-lg hover:shadow-primary-500/5"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`
                    flex-shrink-0 p-3 rounded-xl
                    ${
                      isPrimary
                        ? "bg-primary-500/10 text-primary-600 dark:text-primary-400"
                        : "bg-warning-500/10 text-warning-600 dark:text-warning-400"
                    }
                  `}
                >
                  <Icon className="w-7 h-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                    {section.title}
                  </h2>
                  <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {section.description}
                  </p>
                </div>
              </div>

              <ul className="mt-6 space-y-2">
                {section.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300"
                  >
                    <span
                      className={`
                        w-1.5 h-1.5 rounded-full flex-shrink-0
                        ${isPrimary ? "bg-primary-500" : "bg-warning-500"}
                      `}
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-8 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <Link to={section.href} className="block">
                  <Button
                    variant={isPrimary ? "primary" : "outline"}
                    className="w-full sm:w-auto group-hover:gap-3 transition-all"
                  >
                    {section.cta}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick links / secondary navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to={`${basePath}/decisions`}
          className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 hover:border-primary-400 dark:hover:border-primary-500 transition-colors"
        >
          <FileText className="w-5 h-5 text-primary-500" />
          <div>
            <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Decision Log
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              View all decisions
            </div>
          </div>
        </Link>

        <Link
          to={`${basePath}/risks`}
          className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 hover:border-primary-400 dark:hover:border-primary-500 transition-colors"
        >
          <AlertTriangle className="w-5 h-5 text-warning-500" />
          <div>
            <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Risk Register
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              View & manage risks
            </div>
          </div>
        </Link>

        <Link
          to={`${basePath}/risks`}
          className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 hover:border-primary-400 dark:hover:border-primary-500 transition-colors"
        >
          <LayoutGrid className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
          <div>
            <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Risk Matrix
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400">
              Visual risk overview
            </div>
          </div>
        </Link>
      </div>

      {/* Optional tip / info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700">
        <Badge variant="info" size="sm">
          Tip
        </Badge>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Use Decisions to document why choices were made. Use Risks to track
          what could go wrong and how you plan to handle it. Both feed into
          better project visibility and accountability.
        </p>
      </div>
    </div>
  );
};

export default DecisionRisksHome;
