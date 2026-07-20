import { supabase } from "../../../common/config/supabase.js";
import { DateUtils } from "../../../common/utils/date.utils.js";

// Enum definitions
export const projectStatus = {
  PLANNING: "planning",
  IN_PROGRESS: "in_progress",
  PAUSED: "paused",
  COMPLETED: "completed",
  ARCHIVED: "archived",
};

export const projectPriority = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
};

export const featureStatus = {
  PLANNED: "planned",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  BLOCKED: "blocked",
  CANCELLED: "cancelled",
};

export const featureDifficulty = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
  EXPERT: "expert",
};

export const bugStatus = {
  REPORTED: "reported",
  INVESTIGATING: "investigating",
  IN_PROGRESS: "in_progress",
  FIXED: "fixed",
  VERIFIED: "verified",
  CLOSED: "closed",
};

export const bugPriority = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
};

export class ProjectUtils {
  /**
   * Calculates project completion from features
   * @param {string} projectId - Project UUID
   * @returns {Promise<number>} Completion percentage
   */
  static async calculateProjectCompletion(projectId) {
    try {
      const { data: features, error } = await supabase
        .from("features")
        .select("status")
        .eq("project_id", projectId);

      if (error) throw error;

      if (features.length === 0) return 0;

      const completed = features.filter((f) => f.status === "completed").length;
      return Math.round((completed / features.length) * 100);
    } catch (error) {
      console.error("Error calculating project completion:", error);
      return 0;
    }
  }

  /**
   * Returns icon/color for status
   * @param {string} status - Project status
   * @returns {Object} Status icon and color
   */
  static getProjectStatusIcon(status) {
    const icons = {
      [projectStatus.PLANNING]: {
        icon: "📋",
        color: "#3B82F6",
        label: "Planning",
      },
      [projectStatus.IN_PROGRESS]: {
        icon: "🚀",
        color: "#10B981",
        label: "In Progress",
      },
      [projectStatus.PAUSED]: { icon: "⏸️", color: "#F59E0B", label: "Paused" },
      [projectStatus.COMPLETED]: {
        icon: "✅",
        color: "#8B5CF6",
        label: "Completed",
      },
      [projectStatus.ARCHIVED]: {
        icon: "📦",
        color: "#6B7280",
        label: "Archived",
      },
    };

    return icons[status] || { icon: "📄", color: "#6B7280", label: status };
  }

  /**
   * Formats project dates to local timezone
   * @param {Object} project - Project object
   * @returns {Object} Project with formatted dates
   */
  static formatProjectDates(project) {
    const formatted = { ...project };

    if (project.start_date) {
      formatted.start_date_formatted = DateUtils.formatDate(
        project.start_date,
        "MMM DD, YYYY"
      );
    }

    if (project.target_completion_date) {
      formatted.target_completion_date_formatted = DateUtils.formatDate(
        project.target_completion_date,
        "MMM DD, YYYY"
      );
    }

    formatted.created_at_formatted = DateUtils.formatDate(
      project.created_at,
      "MMM DD, YYYY HH:mm"
    );
    formatted.updated_at_formatted = DateUtils.formatDate(
      project.updated_at,
      "MMM DD, YYYY HH:mm"
    );

    return formatted;
  }

  /**
   * Filters projects by status
   * @param {Array} projects - Projects array
   * @param {string} status - Status to filter by
   * @returns {Array} Filtered projects
   */
  static filterProjectsByStatus(projects, status) {
    if (!status) return projects;
    return projects.filter((p) => p.status === status);
  }

  /**
   * Sorts projects by priority enum order
   * @param {Array} projects - Projects array
   * @param {string} order - 'asc' or 'desc'
   * @returns {Array} Sorted projects
   */
  static sortProjectsByPriority(projects, order = "desc") {
    const priorityOrder = {
      [projectPriority.CRITICAL]: 4,
      [projectPriority.HIGH]: 3,
      [projectPriority.MEDIUM]: 2,
      [projectPriority.LOW]: 1,
    };

    return [...projects].sort((a, b) => {
      const aWeight = priorityOrder[a.priority] || 0;
      const bWeight = priorityOrder[b.priority] || 0;
      return order === "desc" ? bWeight - aWeight : aWeight - bWeight;
    });
  }

  /**
   * Validates date range
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @returns {Object} Validation result
   */
  static validateDateRange(startDate, endDate) {
    if (!startDate && !endDate) {
      return { valid: true };
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { valid: false, error: "Invalid date format" };
    }

    if (start > end) {
      return { valid: false, error: "Start date must be before end date" };
    }

    return { valid: true };
  }

  /**
   * Generates progress color based on percentage
   * @param {number} percentage - Completion percentage
   * @returns {string} Color code
   */
  static getProgressColor(percentage) {
    if (percentage >= 80) return "#10B981"; // Green
    if (percentage >= 50) return "#3B82F6"; // Blue
    if (percentage >= 20) return "#F59E0B"; // Yellow
    return "#EF4444"; // Red
  }

  /**
   * Generates a summary for a project
   * @param {Object} project - Project object
   * @param {Object} analytics - Project analytics
   * @returns {Object} Project summary
   */
  static generateProjectSummary(project, analytics) {
    return {
      id: project.id,
      name: project.name,
      status: project.status,
      priority: project.priority,
      completion:
        project.completion_percentage || analytics?.completion_percentage || 0,
      progressColor: this.getProgressColor(project.completion_percentage || 0),
      total_features: analytics?.total_features || 0,
      total_bugs: analytics?.total_bugs || 0,
      days_remaining: project.target_completion_date
        ? DateUtils.calculateDaysBetween(
            new Date(),
            new Date(project.target_completion_date)
          )
        : null,
      status_icon: this.getProjectStatusIcon(project.status),
    };
  }

  /**
   * Gets statistics for multiple projects
   * @param {Array} projects - Projects array
   * @returns {Object} Aggregate statistics
   */
  static getProjectsStats(projects) {
    const stats = {
      total: projects.length,
      by_status: {},
      by_priority: {},
      avg_completion: 0,
    };

    // Initialize counters
    Object.values(projectStatus).forEach((status) => {
      stats.by_status[status] = 0;
    });

    Object.values(projectPriority).forEach((priority) => {
      stats.by_priority[priority] = 0;
    });

    let totalCompletion = 0;

    projects.forEach((project) => {
      stats.by_status[project.status] =
        (stats.by_status[project.status] || 0) + 1;
      stats.by_priority[project.priority] =
        (stats.by_priority[project.priority] || 0) + 1;
      totalCompletion += project.completion_percentage || 0;
    });

    stats.avg_completion =
      projects.length > 0 ? Math.round(totalCompletion / projects.length) : 0;

    return stats;
  }
}
