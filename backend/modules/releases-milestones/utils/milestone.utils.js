/**
 * Milestone Utilities
 * Handles milestone-related helper functions
 */
class MilestoneUtils {
  /**
   * Calculates date-based progress
   * @param {Object} milestone - Milestone object
   * @returns {number} - Progress percentage (0-100)
   */
  calculateTargetDateProgress(milestone) {
    if (!milestone.target_date) return 0;

    const now = new Date();
    const target = new Date(milestone.target_date);

    // If already completed
    if (milestone.status === "completed") {
      return 100;
    }

    // If target date passed
    if (now > target) {
      // Calculate how overdue (capped at 100)
      const daysOverdue = Math.floor((now - target) / (1000 * 60 * 60 * 24));
      const progress = Math.min(100, 50 + daysOverdue * 5);
      return Math.min(100, progress);
    }

    // Calculate days until target
    const totalDays = Math.ceil(
      (target - milestone.created_at) / (1000 * 60 * 60 * 24)
    );
    const daysPassed = Math.ceil(
      (now - milestone.created_at) / (1000 * 60 * 60 * 24)
    );

    if (totalDays <= 0) return 0;

    const progress = Math.round((daysPassed / totalDays) * 100);
    return Math.min(100, Math.max(0, progress));
  }

  /**
   * Validates status transition
   * @param {string} from - Current status
   * @param {string} to - Target status
   * @returns {boolean} - True if transition is valid
   */
  validateStatusTransition(from, to) {
    const validTransitions = {
      not_started: ["in_progress", "delayed"],
      in_progress: ["completed", "delayed", "not_started"],
      delayed: ["in_progress", "completed"],
      completed: ["not_started"],
    };

    // Allow same status
    if (from === to) return true;

    return validTransitions[from]?.includes(to) || false;
  }

  /**
   * Formats milestone progress for display
   * @param {number} progress - Progress percentage
   * @returns {string} - Formatted progress string
   */
  formatMilestoneProgress(progress) {
    const clampedProgress = Math.min(100, Math.max(0, progress));

    // Create progress bar
    const barLength = 20;
    const filled = Math.round((clampedProgress / 100) * barLength);
    const empty = barLength - filled;

    const bar = "█".repeat(filled) + "░".repeat(empty);

    return `[${bar}] ${clampedProgress}%`;
  }

  /**
   * Gets milestone status icon
   * @param {string} status - Milestone status
   * @returns {string} - Icon
   */
  getMilestoneStatusIcon(status) {
    const icons = {
      not_started: "⏳",
      in_progress: "🚧",
      completed: "✅",
      delayed: "⚠️",
    };
    return icons[status] || "📌";
  }

  /**
   * Gets milestone status color
   * @param {string} status - Milestone status
   * @returns {string} - Color code
   */
  getMilestoneStatusColor(status) {
    const colors = {
      not_started: "#BDBDBD", // Grey
      in_progress: "#42A5F5", // Blue
      completed: "#66BB6A", // Green
      delayed: "#EF5350", // Red
    };
    return colors[status] || "#757575";
  }

  /**
   * Validates milestone data
   * @param {Object} data - Milestone data to validate
   * @returns {Object} - { isValid: boolean, errors: Array }
   */
  validateMilestoneData(data) {
    const errors = [];

    if (data.name && data.name.length < 3) {
      errors.push("Name must be at least 3 characters long");
    }

    if (data.status) {
      const validStatuses = [
        "not_started",
        "in_progress",
        "completed",
        "delayed",
      ];
      if (!validStatuses.includes(data.status)) {
        errors.push("Invalid milestone status");
      }
    }

    if (data.progress_percentage !== undefined) {
      if (data.progress_percentage < 0 || data.progress_percentage > 100) {
        errors.push("Progress percentage must be between 0 and 100");
      }
    }

    if (data.target_date) {
      const targetDate = new Date(data.target_date);
      if (isNaN(targetDate.getTime())) {
        errors.push("Invalid target date");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calculates milestone status from progress
   * @param {number} progress - Progress percentage
   * @returns {string} - Suggested status
   */
  getStatusFromProgress(progress) {
    if (progress === 0) return "not_started";
    if (progress === 100) return "completed";
    if (progress > 0 && progress < 100) return "in_progress";
    return "not_started";
  }

  /**
   * Gets milestone options for UI
   * @returns {Object} - Milestone options
   */
  getMilestoneOptions() {
    return {
      statuses: [
        { value: "not_started", label: "Not Started", color: "#BDBDBD" },
        { value: "in_progress", label: "In Progress", color: "#42A5F5" },
        { value: "completed", label: "Completed", color: "#66BB6A" },
        { value: "delayed", label: "Delayed", color: "#EF5350" },
      ],
    };
  }

  /**
   * Gets overdue milestones
   * @param {Array} milestones - Array of milestones
   * @returns {Array} - Overdue milestones
   */
  getOverdueMilestones(milestones) {
    const now = new Date();

    return milestones
      .filter((milestone) => {
        // Only check incomplete milestones with target date
        if (milestone.status === "completed") return false;
        if (!milestone.target_date) return false;

        const targetDate = new Date(milestone.target_date);
        return now > targetDate;
      })
      .sort((a, b) => new Date(a.target_date) - new Date(b.target_date));
  }

  /**
   * Formats milestone for AI analysis
   * @param {Object} milestone - Milestone object
   * @returns {string} - Formatted milestone for AI
   */
  formatForAI(milestone) {
    const progress =
      milestone.progress_percentage ||
      this.calculateTargetDateProgress(milestone);

    return `
Milestone: ${milestone.name}
Status: ${milestone.status}
Description: ${milestone.description || "No description"}
Target Date: ${
      milestone.target_date
        ? new Date(milestone.target_date).toLocaleDateString()
        : "Not set"
    }
Progress: ${progress}%
${milestone.status === "delayed" ? "⚠️ This milestone is delayed!" : ""}
    `.trim();
  }

  /**
   * Generates milestone summary
   * @param {Array} milestones - Array of milestones
   * @returns {Object} - Milestone summary
   */
  generateMilestoneSummary(milestones) {
    if (!milestones || milestones.length === 0) {
      return {
        total: 0,
        byStatus: { not_started: 0, in_progress: 0, completed: 0, delayed: 0 },
        averageProgress: 0,
        overdueCount: 0,
        completedCount: 0,
      };
    }

    const byStatus = milestones.reduce((acc, m) => {
      acc[m.status] = (acc[m.status] || 0) + 1;
      return acc;
    }, {});

    const totalProgress = milestones.reduce((sum, m) => {
      const progress =
        m.progress_percentage || this.calculateTargetDateProgress(m);
      return sum + progress;
    }, 0);

    const averageProgress = Math.round(totalProgress / milestones.length);
    const overdueCount = this.getOverdueMilestones(milestones).length;
    const completedCount = milestones.filter(
      (m) => m.status === "completed"
    ).length;

    return {
      total: milestones.length,
      byStatus,
      averageProgress,
      overdueCount,
      completedCount,
      completionRate: Math.round((completedCount / milestones.length) * 100),
    };
  }

  /**
   * Gets status transition options
   * @param {string} currentStatus - Current milestone status
   * @returns {Array} - Valid next statuses
   */
  getValidTransitions(currentStatus) {
    const transitions = {
      not_started: ["in_progress", "delayed"],
      in_progress: ["completed", "delayed", "not_started"],
      delayed: ["in_progress", "completed"],
      completed: ["not_started"],
    };

    return transitions[currentStatus] || [];
  }

  /**
   * Calculates days until target date
   * @param {Date} targetDate - Target date
   * @returns {number} - Days until target (negative if overdue)
   */
  calculateDaysUntilTarget(targetDate) {
    if (!targetDate) return null;

    const now = new Date();
    const target = new Date(targetDate);
    const diffTime = target - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Gets milestone priority
   * @param {Object} milestone - Milestone object
   * @returns {string} - Priority level
   */
  getMilestonePriority(milestone) {
    const daysUntilTarget = this.calculateDaysUntilTarget(
      milestone.target_date
    );

    if (milestone.status === "completed") return "completed";
    if (milestone.status === "delayed") return "critical";

    if (daysUntilTarget === null) return "low";
    if (daysUntilTarget <= 0) return "critical";
    if (daysUntilTarget <= 7) return "high";
    if (daysUntilTarget <= 14) return "medium";
    return "low";
  }
}

module.exports = new MilestoneUtils();
