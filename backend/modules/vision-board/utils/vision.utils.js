/**
 * Vision Utilities
 * Handles vision board-related helper functions
 */
class VisionUtils {
  /**
   * Formats vision goal for display
   * @param {Object} goal - Vision goal object
   * @returns {Object} - Formatted goal
   */
  formatVisionGoal(goal) {
    if (!goal) return null;

    return {
      id: goal.id,
      goal: goal.goal,
      description: goal.description || "No description provided",
      target_timeline: goal.target_timeline || "Not specified",
      priority: goal.priority || 0,
      category: goal.category || "General",
      status: goal.status || "draft",
      progress: goal.progress || 0,
      project_count: goal.project_count || 0,
      linked_projects: goal.linked_projects || [],
      created_at: goal.created_at
        ? new Date(goal.created_at).toISOString()
        : null,
      updated_at: goal.updated_at
        ? new Date(goal.updated_at).toISOString()
        : null,
      // Formatted display fields
      display_goal: this.truncateGoal(goal.goal, 100),
      display_description: this.truncateDescription(goal.description, 200),
      status_color: this.getStatusColor(goal.status),
      priority_label: this.getPriorityLabel(goal.priority),
      timeline_formatted: this.formatTimeline(goal.target_timeline),
      // Progress indicators
      progress_bar: this.getProgressBar(goal.progress || 0),
      progress_label: this.getProgressLabel(goal.progress || 0),
    };
  }

  /**
   * Truncates goal text
   * @param {string} text - Goal text
   * @param {number} maxLength - Maximum length
   * @returns {string} - Truncated text
   */
  truncateGoal(text, maxLength = 100) {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  }

  /**
   * Truncates description
   * @param {string} text - Description text
   * @param {number} maxLength - Maximum length
   * @returns {string} - Truncated description
   */
  truncateDescription(text, maxLength = 200) {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  }

  /**
   * Gets status color
   * @param {string} status - Goal status
   * @returns {string} - Color code
   */
  getStatusColor(status) {
    const colors = {
      draft: "#BDBDBD", // Grey
      active: "#42A5F5", // Blue
      completed: "#66BB6A", // Green
      archived: "#78909C", // Blue Grey
    };
    return colors[status] || "#757575";
  }

  /**
   * Gets status icon
   * @param {string} status - Goal status
   * @returns {string} - Icon
   */
  getStatusIcon(status) {
    const icons = {
      draft: "📝",
      active: "🚀",
      completed: "✅",
      archived: "📦",
    };
    return icons[status] || "📌";
  }

  /**
   * Gets priority label
   * @param {number} priority - Priority value (0-10)
   * @returns {string} - Priority label
   */
  getPriorityLabel(priority) {
    if (priority >= 8) return "Critical";
    if (priority >= 6) return "High";
    if (priority >= 4) return "Medium";
    if (priority >= 2) return "Low";
    return "Very Low";
  }

  /**
   * Gets priority color
   * @param {number} priority - Priority value (0-10)
   * @returns {string} - Color code
   */
  getPriorityColor(priority) {
    if (priority >= 8) return "#D32F2F"; // Dark Red
    if (priority >= 6) return "#F44336"; // Red
    if (priority >= 4) return "#FFA726"; // Orange
    if (priority >= 2) return "#4CAF50"; // Green
    return "#BDBDBD"; // Grey
  }

  /**
   * Gets progress bar representation
   * @param {number} progress - Progress percentage (0-100)
   * @returns {string} - Progress bar string
   */
  getProgressBar(progress) {
    const totalBars = 20;
    const filledBars = Math.round((progress / 100) * totalBars);
    const emptyBars = totalBars - filledBars;
    return "█".repeat(filledBars) + "░".repeat(emptyBars);
  }

  /**
   * Gets progress label
   * @param {number} progress - Progress percentage (0-100)
   * @returns {string} - Progress label
   */
  getProgressLabel(progress) {
    if (progress === 0) return "Not Started";
    if (progress < 25) return "Early Stage";
    if (progress < 50) return "In Progress";
    if (progress < 75) return "Almost There";
    if (progress < 100) return "Near Completion";
    return "Complete";
  }

  /**
   * Formats timeline string
   * @param {string} timeline - Timeline string
   * @returns {string} - Formatted timeline
   */
  formatTimeline(timeline) {
    if (!timeline) return "No timeline set";

    // Try to parse as date
    const date = new Date(timeline);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }

    return timeline;
  }

  /**
   * Calculates goal progress from linked projects
   * @param {Array} projects - Array of linked projects
   * @returns {Object} - Progress calculation
   */
  calculateGoalProgress(projects) {
    if (!projects || projects.length === 0) {
      return {
        progress: 0,
        totalProjects: 0,
        completedProjects: 0,
        inProgressProjects: 0,
        notStartedProjects: 0,
        status: "not_started",
      };
    }

    const total = projects.length;
    let completed = 0;
    let inProgress = 0;
    let notStarted = 0;

    projects.forEach((project) => {
      // Check project status/completion
      if (
        project.status === "completed" ||
        project.completion_percentage === 100
      ) {
        completed++;
      } else if (
        project.status === "in_progress" ||
        (project.completion_percentage > 0 &&
          project.completion_percentage < 100)
      ) {
        inProgress++;
      } else {
        notStarted++;
      }
    });

    // Calculate progress percentage
    const progress = Math.round((completed / total) * 100);

    let status = "not_started";
    if (progress === 100) status = "completed";
    else if (progress > 0) status = "in_progress";

    return {
      progress,
      totalProjects: total,
      completedProjects: completed,
      inProgressProjects: inProgress,
      notStartedProjects: notStarted,
      status,
      completionRatio: `${completed}/${total}`,
      summary: `${completed} of ${total} projects completed (${progress}%)`,
    };
  }

  /**
   * Validates timeline string
   * @param {string} timeline - Timeline string
   * @returns {Object} - { isValid: boolean, parsed: string|null, error: string|null }
   */
  validateTimeline(timeline) {
    if (!timeline) {
      return {
        isValid: true,
        parsed: null,
        error: null,
      };
    }

    // Try to parse as date
    const date = new Date(timeline);
    if (!isNaN(date.getTime())) {
      return {
        isValid: true,
        parsed: date.toISOString().split("T")[0],
        error: null,
      };
    }

    // Check if it's a valid timeline string (e.g., "Q1 2024", "2025", etc.)
    const validTimelinePatterns = [
      /^Q[1-4]\s+\d{4}$/, // Q1 2024
      /^\d{4}$/, // 2024
      /^[A-Za-z]+\s+\d{4}$/, // January 2024
      /^\d{1,2}\/\d{4}$/, // 01/2024
    ];

    const isValid = validTimelinePatterns.some((pattern) =>
      pattern.test(timeline)
    );

    return {
      isValid,
      parsed: isValid ? timeline : null,
      error: isValid ? null : "Invalid timeline format",
    };
  }

  /**
   * Sorts vision goals by priority (highest first)
   * @param {Array} goals - Array of vision goals
   * @returns {Array} - Sorted goals
   */
  sortGoalsByPriority(goals) {
    if (!goals || goals.length === 0) return [];

    return [...goals].sort((a, b) => {
      // Sort by priority (highest first)
      const priorityA = a.priority || 0;
      const priorityB = b.priority || 0;

      if (priorityA !== priorityB) {
        return priorityB - priorityA;
      }

      // If same priority, sort by status (active first)
      const statusOrder = {
        active: 0,
        draft: 1,
        completed: 2,
        archived: 3,
      };

      const statusA = statusOrder[a.status] || 3;
      const statusB = statusOrder[b.status] || 3;

      if (statusA !== statusB) {
        return statusA - statusB;
      }

      // If same status, sort by created date
      return new Date(b.created_at) - new Date(a.created_at);
    });
  }

  /**
   * Groups goals by category
   * @param {Array} goals - Array of vision goals
   * @returns {Object} - Goals grouped by category
   */
  groupGoalsByCategory(goals) {
    if (!goals || goals.length === 0) return {};

    const grouped = {};
    goals.forEach((goal) => {
      const category = goal.category || "Uncategorized";
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(goal);
    });

    return grouped;
  }

  /**
   * Gets goal statistics
   * @param {Array} goals - Array of vision goals
   * @returns {Object} - Statistics
   */
  getGoalStatistics(goals) {
    if (!goals || goals.length === 0) {
      return {
        total: 0,
        byStatus: { draft: 0, active: 0, completed: 0, archived: 0 },
        byCategory: {},
        averagePriority: 0,
        averageProgress: 0,
        completedCount: 0,
        activeCount: 0,
      };
    }

    const byStatus = goals.reduce((acc, g) => {
      acc[g.status] = (acc[g.status] || 0) + 1;
      return acc;
    }, {});

    const byCategory = goals.reduce((acc, g) => {
      const category = g.category || "Uncategorized";
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    const totalPriority = goals.reduce((sum, g) => sum + (g.priority || 0), 0);
    const totalProgress = goals.reduce((sum, g) => sum + (g.progress || 0), 0);

    return {
      total: goals.length,
      byStatus,
      byCategory,
      averagePriority: Math.round((totalPriority / goals.length) * 10) / 10,
      averageProgress: Math.round(totalProgress / goals.length),
      completedCount: byStatus.completed || 0,
      activeCount: byStatus.active || 0,
      draftCount: byStatus.draft || 0,
    };
  }

  /**
   * Formats goal for AI analysis
   * @param {Object} goal - Vision goal
   * @returns {string} - Formatted text for AI
   */
  formatForAI(goal) {
    return `
Goal: ${goal.goal}
Status: ${goal.status}
Priority: ${this.getPriorityLabel(goal.priority)} (${goal.priority}/10)
Description: ${goal.description || "No description"}
Timeline: ${goal.target_timeline || "Not specified"}
Category: ${goal.category || "General"}
Progress: ${goal.progress || 0}%
Linked Projects: ${goal.project_count || 0}
    `.trim();
  }

  /**
   * Generates goal summary
   * @param {Object} goal - Vision goal
   * @returns {string} - Summary text
   */
  generateGoalSummary(goal) {
    const parts = [
      `🎯 ${goal.goal}`,
      `Status: ${goal.status.toUpperCase()}`,
      `Priority: ${this.getPriorityLabel(goal.priority)}`,
      `Progress: ${goal.progress || 0}%`,
    ];

    if (goal.category) {
      parts.push(`Category: ${goal.category}`);
    }

    if (goal.target_timeline) {
      parts.push(`Timeline: ${this.formatTimeline(goal.target_timeline)}`);
    }

    return parts.join(" | ");
  }

  /**
   * Validates goal data
   * @param {Object} data - Goal data
   * @returns {Object} - { isValid: boolean, errors: Array }
   */
  validateGoalData(data) {
    const errors = [];

    if (!data.goal || data.goal.length < 3) {
      errors.push("Goal must be at least 3 characters long");
    }

    if (data.goal && data.goal.length > 500) {
      errors.push("Goal must be less than 500 characters");
    }

    if (
      data.priority !== undefined &&
      (data.priority < 0 || data.priority > 10)
    ) {
      errors.push("Priority must be between 0 and 10");
    }

    if (data.status) {
      const validStatuses = ["draft", "active", "completed", "archived"];
      if (!validStatuses.includes(data.status)) {
        errors.push("Invalid status value");
      }
    }

    if (data.target_timeline) {
      const validation = this.validateTimeline(data.target_timeline);
      if (!validation.isValid) {
        errors.push(validation.error);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Gets goal options for UI
   * @returns {Object} - Goal options
   */
  getGoalOptions() {
    return {
      statuses: [
        { value: "draft", label: "Draft", color: "#BDBDBD" },
        { value: "active", label: "Active", color: "#42A5F5" },
        { value: "completed", label: "Completed", color: "#66BB6A" },
        { value: "archived", label: "Archived", color: "#78909C" },
      ],
      priorities: [
        { value: 10, label: "Critical" },
        { value: 8, label: "High" },
        { value: 6, label: "Medium-High" },
        { value: 4, label: "Medium" },
        { value: 2, label: "Low" },
        { value: 0, label: "Very Low" },
      ],
      categories: [
        "Product",
        "Technical",
        "Business",
        "Marketing",
        "Growth",
        "Innovation",
        "Operations",
        "Other",
      ],
    };
  }

  /**
   * Calculates goal completion status
   * @param {Object} goal - Vision goal
   * @returns {Object} - Completion status
   */
  getCompletionStatus(goal) {
    const progress = goal.progress || 0;
    const status = goal.status || "draft";

    if (status === "completed") {
      return {
        status: "completed",
        label: "Complete",
        color: "#66BB6A",
        icon: "✅",
      };
    }

    if (status === "archived") {
      return {
        status: "archived",
        label: "Archived",
        color: "#78909C",
        icon: "📦",
      };
    }

    if (progress === 100) {
      return {
        status: "complete",
        label: "Complete",
        color: "#66BB6A",
        icon: "✅",
      };
    }

    if (progress > 0) {
      return {
        status: "in_progress",
        label: "In Progress",
        color: "#42A5F5",
        icon: "🚀",
      };
    }

    return {
      status: "not_started",
      label: "Not Started",
      color: "#BDBDBD",
      icon: "⏳",
    };
  }
}

const visionUtils = new VisionUtils();

module.exports = visionUtils;
module.exports.visionUtils = visionUtils;
