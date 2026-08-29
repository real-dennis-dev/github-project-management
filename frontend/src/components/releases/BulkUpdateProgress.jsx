// src/components/releases/BulkUpdateProgress.jsx
import React, { useState } from "react";
import { useReleases } from "../../hooks/useReleases";
import { Button, LoadingSpinner, Alert, Input } from "../common";
import { useToast } from "../../hooks/useToast";
import { Save, X } from "lucide-react";

const BulkUpdateProgress = ({ projectId }) => {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(false);
  const { milestones, getMilestones, bulkUpdateMilestones, error, clearError } =
    useReleases();
  const { toast } = useToast();

  const [milestonesLoaded, setMilestonesLoaded] = useState(false);

  const loadMilestones = async () => {
    setLoading(true);
    try {
      const result = await getMilestones(projectId, { limit: 100 });
      if (result.success) {
        setUpdates(
          result.data.map((m) => ({
            id: m.id,
            name: m.name,
            currentProgress: m.progress_percentage || 0,
            newProgress: m.progress_percentage || 0,
          }))
        );
        setMilestonesLoaded(true);
      }
    } catch (err) {
      toast.error("Failed to load milestones");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (projectId && !milestonesLoaded) {
      loadMilestones();
    }
  }, [projectId]);

  const handleProgressChange = (index, value) => {
    const newValue = Math.min(100, Math.max(0, Number(value) || 0));
    setUpdates((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, newProgress: newValue } : item
      )
    );
  };

  const handleSubmit = async () => {
    const data = {
      updates: updates.map((u) => ({
        id: u.id,
        progress_percentage: u.newProgress,
      })),
    };

    try {
      const result = await bulkUpdateMilestones(projectId, data);
      if (result.success) {
        toast.success("Milestones updated successfully");
        // Refresh milestones
        loadMilestones();
      }
    } catch (err) {
      // Error handled in hook
    }
  };

  const hasChanges = updates.some((u) => u.newProgress !== u.currentProgress);

  if (loading) {
    return <LoadingSpinner size="lg" className="my-8" />;
  }

  if (error) {
    return (
      <Alert variant="error" onClose={clearError}>
        {error}
      </Alert>
    );
  }

  if (updates.length === 0) {
    return (
      <Alert variant="info">
        No milestones found to update. Create some milestones first.
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-neutral-900">
          Bulk Update Milestone Progress
        </h2>
        <div className="flex items-center space-x-3">
          {hasChanges && (
            <span className="text-sm text-neutral-500">
              {
                updates.filter((u) => u.newProgress !== u.currentProgress)
                  .length
              }{" "}
              milestones changed
            </span>
          )}
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!hasChanges}
          >
            <Save className="w-4 h-4 mr-2" />
            Save All
          </Button>
        </div>
      </div>

      <div className="bg-neutral-100 border border-neutral-300 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">
                  Milestone
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">
                  Current Progress
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">
                  New Progress
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-300">
              {updates.map((item, index) => (
                <tr
                  key={item.id}
                  className="hover:bg-neutral-200 transition-colors"
                >
                  <td className="px-4 py-3 text-neutral-900 font-medium">
                    {item.name}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-24 h-2 bg-neutral-300 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-neutral-500 rounded-full"
                          style={{ width: `${item.currentProgress}%` }}
                        />
                      </div>
                      <span className="text-sm text-neutral-600">
                        {item.currentProgress}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-3">
                      <Input
                        type="range"
                        min="0"
                        max="100"
                        value={item.newProgress}
                        onChange={(e) =>
                          handleProgressChange(index, e.target.value)
                        }
                        className="w-32"
                      />
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={item.newProgress}
                        onChange={(e) =>
                          handleProgressChange(index, e.target.value)
                        }
                        className="w-16 text-center"
                      />
                      <span className="text-sm text-neutral-500">%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-sm ${
                        item.newProgress === item.currentProgress
                          ? "text-neutral-500"
                          : "text-primary-500 font-medium"
                      }`}
                    >
                      {item.newProgress === item.currentProgress
                        ? "Unchanged"
                        : item.newProgress > item.currentProgress
                        ? `+${item.newProgress - item.currentProgress}%`
                        : `${item.newProgress - item.currentProgress}%`}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BulkUpdateProgress;
