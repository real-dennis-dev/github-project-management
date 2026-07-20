/**
 * Tech Debt Utilities
 * Handles tech debt-related helper functions
 */
class TechDebtUtils {
  /**
   * Calculates estimated effort hours based on priority
   * @param {string} priority - Priority level
   * @param {number} complexity - Complexity factor (1-10)
   * @returns {number} - Estimated effort hours
   */
  calculateEffortHours(priority, complexity = 5) {
    const baseHours = {
      low: 4,
      medium: 8,
      high: 16,
      critical: 24,
    };

    const base = baseHours[priority] || 8;
    const complexityMultiplier = complexity / 5;

    return Math.round(base * complexityMultiplier);
  }

  /**
   * Validates priority enum
   * @param {string} priority - Priority to validate
   * @returns {boolean} - True if valid
   */
  validatePriority(priority) {
    const validPriorities = ["low", "medium", "high", "critical"];
    return validPriorities.includes(priority);
  }

  /**
   * Gets status color for UI
   * @param {string} status - Tech debt status
   * @returns {string} - Color code
   */
  getStatusColor(status) {
    const colors = {
      identified: "#FFA726", // Orange
      planned: "#42A5F5", // Blue
      in_progress: "#66BB6A", // Green
      resolved: "#4CAF50", // Dark Green
      ignored: "#BDBDBD", // Grey
    };
    return colors[status] || "#757575";
  }

  /**
   * Gets status icon
   * @param {string} status - Tech debt status
   * @returns {string} - Icon
   */
  getStatusIcon(status) {
    const icons = {
      identified: "🔍",
      planned: "📋",
      in_progress: "🔧",
      resolved: "✅",
      ignored: "⏭️",
    };
    return icons[status] || "📌";
  }

  /**
   * Calculates business impact of tech debt
   * @param {Object} techDebt - Tech debt object
   * @returns {Object} - Impact assessment
   */
  calculateDebtImpact(techDebt) {
    const priorityScores = {
      low: 1,
      medium: 2,
      high: 3,
      critical: 4,
    };

    const statusFactors = {
      identified: 1.0,
      planned: 0.8,
      in_progress: 0.5,
      resolved: 0.0,
      ignored: 1.5,
    };

    const baseScore = priorityScores[techDebt.priority] || 1;
    const statusFactor = statusFactors[techDebt.status] || 1;

    const impactScore = Math.round((baseScore / 4) * 100 * statusFactor);

    // Determine impact level
    let level = "low";
    if (impactScore > 75) level = "critical";
    else if (impactScore > 50) level = "high";
    else if (impactScore > 25) level = "medium";

    return {
      score: Math.min(impactScore, 100),
      level,
      description: this.getImpactDescription(level, techDebt),
      estimatedCost: this.calculateBusinessCost(techDebt),
    };
  }

  /**
   * Gets impact description
   * @param {string} level - Impact level
   * @param {Object} techDebt - Tech debt object
   * @returns {string} - Description
   */
  getImpactDescription(level, techDebt) {
    const descriptions = {
      critical:
        "🚨 This tech debt severely impacts system performance and requires immediate attention",
      high: "⚠️ This tech debt significantly affects development velocity and system stability",
      medium:
        "📊 This tech debt impacts development efficiency but is manageable",
      low: "📝 This tech debt has minimal impact and can be addressed when convenient",
    };
    return descriptions[level] || descriptions.low;
  }

  /**
   * Calculates business cost of tech debt
   * @param {Object} techDebt - Tech debt object
   * @returns {Object} - Cost estimation
   */
  calculateBusinessCost(techDebt) {
    const hourlyRate = 50; // Average developer hourly rate
    const hours =
      techDebt.estimated_effort_hours ||
      this.calculateEffortHours(techDebt.priority);

    const directCost = hours * hourlyRate;
    const multiplier =
      {
        low: 1,
        medium: 1.5,
        high: 2,
        critical: 3,
      }[techDebt.priority] || 1;

    const indirectCost = directCost * 0.5; // Additional maintenance cost

    return {
      directCost: Math.round(directCost),
      indirectCost: Math.round(indirectCost),
      totalCost: Math.round(directCost + indirectCost),
      timeEstimate: hours,
      multiplier,
    };
  }

  /**
   * Prioritizes tech debt items
   * @param {Array} items - Array of tech debt items
   * @returns {Array} - Sorted items by priority and effort
   */
  prioritizeTechDebt(items) {
    const priorityOrder = {
      critical: 0,
      high: 1,
      medium: 2,
      low: 3,
    };

    return [...items].sort((a, b) => {
      // First sort by priority
      const priorityA = priorityOrder[a.priority] || 3;
      const priorityB = priorityOrder[b.priority] || 3;

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // Then by estimated effort (smaller effort first for same priority)
      const effortA = a.estimated_effort_hours || Infinity;
      const effortB = b.estimated_effort_hours || Infinity;
      return effortA - effortB;
    });
  }

  /**
   * Gets priority color for UI
   * @param {string} priority - Priority level
   * @returns {string} - Color code
   */
  getPriorityColor(priority) {
    const colors = {
      low: "#4CAF50", // Green
      medium: "#FFA726", // Orange
      high: "#F44336", // Red
      critical: "#D32F2F", // Dark Red
    };
    return colors[priority] || "#757575";
  }

  /**
   * Gets priority icon
   * @param {string} priority - Priority level
   * @returns {string} - Icon
   */
  getPriorityIcon(priority) {
    const icons = {
      low: "🟢",
      medium: "🟡",
      high: "🔴",
      critical: "🚨",
    };
    return icons[priority] || "⚪";
  }

  /**
   * Validates tech debt data
   * @param {Object} data - Tech debt data to validate
   * @returns {Object} - { isValid: boolean, errors: Array }
   */
  validateTechDebtData(data) {
    const errors = [];

    if (!data.title || data.title.length < 3) {
      errors.push("Title must be at least 3 characters long");
    }

    if (!data.description || data.description.length < 10) {
      errors.push("Description must be at least 10 characters long");
    }

    if (!data.reason || data.reason.length < 5) {
      errors.push("Reason must be at least 5 characters long");
    }

    if (data.priority && !this.validatePriority(data.priority)) {
      errors.push("Invalid priority value");
    }

    if (
      data.estimated_effort_hours !== undefined &&
      data.estimated_effort_hours !== null
    ) {
      if (
        typeof data.estimated_effort_hours !== "number" ||
        data.estimated_effort_hours < 0
      ) {
        errors.push("Estimated effort hours must be a positive number");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Gets priority options for UI
   * @returns {Array} - Priority options
   */
  getPriorityOptions() {
    return [
      { value: "low", label: "Low", color: "#4CAF50" },
      { value: "medium", label: "Medium", color: "#FFA726" },
      { value: "high", label: "High", color: "#F44336" },
      { value: "critical", label: "Critical", color: "#D32F2F" },
    ];
  }

  /**
   * Gets status options for UI
   * @returns {Array} - Status options
   */
  getStatusOptions() {
    return [
      { value: "identified", label: "Identified", color: "#FFA726" },
      { value: "planned", label: "Planned", color: "#42A5F5" },
      { value: "in_progress", label: "In Progress", color: "#66BB6A" },
      { value: "resolved", label: "Resolved", color: "#4CAF50" },
      { value: "ignored", label: "Ignored", color: "#BDBDBD" },
    ];
  }

  /**
   * Suggests refactoring priority based on tech debt analysis
   * @param {Object} techDebt - Tech debt object
   * @returns {Object} - Refactoring suggestion
   */
  suggestRefactoringPriority(techDebt) {
    const impact = this.calculateDebtImpact(techDebt);
    const hours =
      techDebt.estimated_effort_hours ||
      this.calculateEffortHours(techDebt.priority);

    // Calculate urgency score (0-100)
    const urgencyScore = Math.min(impact.score * 0.6 + (hours / 100) * 40, 100);

    let suggestion = {
      priority: techDebt.priority,
      urgency: urgencyScore,
      recommendedAction: "",
      estimatedTimeframe: "",
    };

    if (urgencyScore > 80) {
      suggestion.recommendedAction = "Immediate refactoring required";
      suggestion.estimatedTimeframe = "Within 1 week";
    } else if (urgencyScore > 60) {
      suggestion.recommendedAction = "Schedule for next sprint";
      suggestion.estimatedTimeframe = "Within 2 weeks";
    } else if (urgencyScore > 40) {
      suggestion.recommendedAction = "Plan for upcoming sprint";
      suggestion.estimatedTimeframe = "Within 1 month";
    } else {
      suggestion.recommendedAction = "Monitor and plan for future";
      suggestion.estimatedTimeframe = "Within 3 months";
    }

    return suggestion;
  }

  /**
   * Calculates tech debt metrics
   * @param {Array} techDebtItems - Array of tech debt items
   * @returns {Object} - Metrics
   */
  calculateMetrics(techDebtItems) {
    if (!techDebtItems || techDebtItems.length === 0) {
      return {
        total: 0,
        byPriority: { low: 0, medium: 0, high: 0, critical: 0 },
        byStatus: {
          identified: 0,
          planned: 0,
          in_progress: 0,
          resolved: 0,
          ignored: 0,
        },
        totalEffort: 0,
        averageImpact: 0,
        resolutionRate: 0,
      };
    }

    const byPriority = techDebtItems.reduce((acc, item) => {
      acc[item.priority] = (acc[item.priority] || 0) + 1;
      return acc;
    }, {});

    const byStatus = techDebtItems.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});

    const totalEffort = techDebtItems.reduce(
      (sum, item) => sum + (item.estimated_effort_hours || 0),
      0
    );

    const impacts = techDebtItems.map(
      (item) => this.calculateDebtImpact(item).score
    );
    const averageImpact =
      impacts.length > 0
        ? Math.round(impacts.reduce((a, b) => a + b, 0) / impacts.length)
        : 0;

    const resolved = byStatus.resolved || 0;
    const total = techDebtItems.length;
    const resolutionRate = total > 0 ? (resolved / total) * 100 : 0;

    return {
      total,
      byPriority,
      byStatus,
      totalEffort,
      averageImpact,
      resolutionRate: Math.round(resolutionRate),
      unresolved: total - resolved,
    };
  }

  /**
   * Formats tech debt for export
   * @param {Object} techDebt - Tech debt object
   * @returns {Object} - Formatted object
   */
  formatForExport(techDebt) {
    const impact = this.calculateDebtImpact(techDebt);
    return {
      id: techDebt.id,
      title: techDebt.title,
      description: techDebt.description,
      reason: techDebt.reason,
      impact: techDebt.impact || "Not specified",
      priority: techDebt.priority,
      status: techDebt.status,
      estimatedEffortHours: techDebt.estimated_effort_hours || "Not estimated",
      impactScore: impact.score,
      impactLevel: impact.level,
      created_at: new Date(techDebt.created_at).toISOString(),
      updated_at: new Date(techDebt.updated_at).toISOString(),
    };
  }

  /**
   * Generates tech debt summary for AI
   * @param {Array} techDebtItems - Array of tech debt items
   * @returns {string} - Summary text
   */
  generateAISummary(techDebtItems) {
    if (!techDebtItems || techDebtItems.length === 0) {
      return "No technical debt items identified.";
    }

    const metrics = this.calculateMetrics(techDebtItems);
    const prioritized = this.prioritizeTechDebt(techDebtItems);

    let summary = `Technical Debt Summary:\n`;
    summary += `Total items: ${metrics.total}\n`;
    summary += `Critical: ${metrics.byPriority.critical || 0}, High: ${
      metrics.byPriority.high || 0
    }\n`;
    summary += `Resolved: ${metrics.byStatus.resolved || 0}/${metrics.total}\n`;
    summary += `Resolution Rate: ${metrics.resolutionRate}%\n`;
    summary += `Total Estimated Effort: ${metrics.totalEffort} hours\n\n`;

    if (prioritized.length > 0) {
      summary += `Top Priority Items:\n`;
      prioritized.slice(0, 5).forEach((item, index) => {
        summary += `${index + 1}. ${item.title} (${item.priority}) - ${
          item.status
        }\n`;
      });
    }

    return summary;
  }
}

module.exports = new TechDebtUtils();
