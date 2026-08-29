// src/components/techdebt/TechDebtDashboard.jsx
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import TechDebtOverview from "./TechDebtOverview";
import TechDebtScore from "./TechDebtScore";
import TechDebtStatistics from "./TechDebtStatistics";
import TechDebtList from "./TechDebtList";
import TechDebtExport from "./TechDebtExport";
import RefactoringSuggestions from "./RefactoringSuggestions";
import { Button } from "../common";
import {
  LayoutDashboard,
  List,
  BarChart3,
  AlertTriangle,
  Lightbulb,
  Download,
} from "lucide-react";

const TechDebtDashboard = () => {
  const { projectId } = useParams();
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "list", label: "Items", icon: List },
    { id: "statistics", label: "Statistics", icon: BarChart3 },
    { id: "score", label: "Score", icon: AlertTriangle },
    { id: "suggestions", label: "Suggestions", icon: Lightbulb },
    { id: "export", label: "Export", icon: Download },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <TechDebtOverview projectId={projectId} />;
      case "list":
        return <TechDebtList projectId={projectId} />;
      case "statistics":
        return <TechDebtStatistics projectId={projectId} />;
      case "score":
        return <TechDebtScore projectId={projectId} />;
      case "suggestions":
        return <RefactoringSuggestions projectId={projectId} />;
      case "export":
        return <TechDebtExport projectId={projectId} />;
      default:
        return <TechDebtOverview projectId={projectId} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">
          Technical Debt Dashboard
        </h1>
      </div>

      <div className="border-b border-neutral-300">
        <nav className="flex flex-wrap gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary-500 text-white"
                    : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-6">{renderContent()}</div>
    </div>
  );
};

export default TechDebtDashboard;
