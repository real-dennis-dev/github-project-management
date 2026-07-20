/**
 * Decision Utilities
 * Handles decision-related helper functions
 */
class DecisionUtils {
  /**
   * Validates impact enum value
   * @param {string} impact - Impact value to validate
   * @returns {boolean} - True if valid
   */
  validateImpact(impact) {
    const validImpacts = ["low", "medium", "high", "critical"];
    return validImpacts.includes(impact);
  }

  /**
   * Formats decision for export
   * @param {Object} decision - Decision object
   * @returns {Object} - Formatted decision
   */
  formatDecisionForExport(decision) {
    return {
      id: decision.id,
      title: decision.title,
      description: decision.description,
      decision: decision.decision,
      reason: decision.reason,
      impact: decision.impact,
      alternatives: decision.alternatives || "None provided",
      decision_date: new Date(decision.decision_date).toLocaleDateString(),
      created_at: new Date(decision.created_at).toISOString(),
      updated_at: new Date(decision.updated_at).toISOString(),
    };
  }

  /**
   * Compares alternatives
   * @param {string} alternatives - Alternatives text
   * @returns {Array} - Array of alternatives
   */
  compareAlternatives(alternatives) {
    if (!alternatives) return [];

    // Split by common delimiters
    const altArray = alternatives.split(/[,;|]\s*/).filter((alt) => alt.trim());

    // If no alternatives found, try splitting by newlines
    if (altArray.length <= 1) {
      const lineSplit = alternatives.split("\n").filter((alt) => alt.trim());
      if (lineSplit.length > 1) return lineSplit;
    }

    return altArray;
  }

  /**
   * Calculates decision weight based on impact
   * @param {string} impact - Impact level
   * @returns {number} - Weight value (1-10)
   */
  calculateDecisionWeight(impact) {
    const weights = {
      low: 2,
      medium: 5,
      high: 8,
      critical: 10,
    };
    return weights[impact] || 5;
  }

  /**
   * Gets impact color for UI
   * @param {string} impact - Impact level
   * @returns {string} - Color code
   */
  getImpactColor(impact) {
    const colors = {
      low: "#4CAF50", // Green
      medium: "#FFA726", // Orange
      high: "#F44336", // Red
      critical: "#D32F2F", // Dark Red
    };
    return colors[impact] || "#757575";
  }

  /**
   * Gets impact icon
   * @param {string} impact - Impact level
   * @returns {string} - Icon name
   */
  getImpactIcon(impact) {
    const icons = {
      low: "✅",
      medium: "⚠️",
      high: "🔴",
      critical: "🚨",
    };
    return icons[impact] || "📌";
  }

  /**
   * Generates decision summary
   * @param {Object} decision - Decision object
   * @returns {string} - Summary text
   */
  generateDecisionSummary(decision) {
    const parts = [
      `Decision: ${decision.title}`,
      `Impact: ${decision.impact.toUpperCase()}`,
      `Date: ${new Date(decision.decision_date).toLocaleDateString()}`,
    ];

    if (decision.decision) {
      parts.push(`Outcome: ${decision.decision}`);
    }

    return parts.join(" | ");
  }

  /**
   * Validates decision data
   * @param {Object} data - Decision data to validate
   * @returns {Object} - { isValid: boolean, errors: Array }
   */
  validateDecisionData(data) {
    const errors = [];

    if (!data.title || data.title.length < 3) {
      errors.push("Title must be at least 3 characters long");
    }

    if (!data.description || data.description.length < 10) {
      errors.push("Description must be at least 10 characters long");
    }

    if (!data.decision || data.decision.length < 5) {
      errors.push("Decision must be at least 5 characters long");
    }

    if (!data.reason || data.reason.length < 5) {
      errors.push("Reason must be at least 5 characters long");
    }

    if (data.impact && !this.validateImpact(data.impact)) {
      errors.push("Invalid impact value");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Gets impact options for UI dropdown
   * @returns {Array} - Impact options
   */
  getImpactOptions() {
    return [
      { value: "low", label: "Low", color: "#4CAF50" },
      { value: "medium", label: "Medium", color: "#FFA726" },
      { value: "high", label: "High", color: "#F44336" },
      { value: "critical", label: "Critical", color: "#D32F2F" },
    ];
  }

  /**
   * Formats decision for AI analysis
   * @param {Object} decision - Decision object
   * @returns {string} - Formatted text for AI
   */
  formatForAI(decision) {
    return `
Decision: ${decision.title}
Impact: ${decision.impact}
Description: ${decision.description}
Decision Made: ${decision.decision}
Reason: ${decision.reason}
Alternatives: ${decision.alternatives || "None provided"}
Date: ${new Date(decision.decision_date).toISOString().split("T")[0]}
    `.trim();
  }

  /**
   * Calculates decision statistics
   * @param {Array} decisions - Array of decisions
   * @returns {Object} - Statistics
   */
  calculateStatistics(decisions) {
    if (!decisions || decisions.length === 0) {
      return {
        total: 0,
        byImpact: { low: 0, medium: 0, high: 0, critical: 0 },
        recentDecisions: [],
        impactDistribution: [],
      };
    }

    const byImpact = decisions.reduce((acc, d) => {
      acc[d.impact] = (acc[d.impact] || 0) + 1;
      return acc;
    }, {});

    const sortedDecisions = [...decisions].sort(
      (a, b) => new Date(b.decision_date) - new Date(a.decision_date)
    );

    return {
      total: decisions.length,
      byImpact,
      recentDecisions: sortedDecisions.slice(0, 5),
      impactDistribution: Object.entries(byImpact).map(([impact, count]) => ({
        impact,
        count,
        percentage: ((count / decisions.length) * 100).toFixed(1),
      })),
    };
  }
}

module.exports = new DecisionUtils();
