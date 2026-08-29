/**
 * Risk Utilities
 * Handles risk-related helper functions
 */
class RiskUtils {
  /**
   * Calculates risk level based on probability and impact
   * @param {number} probability - Probability (0-100)
   * @param {string} impact - Impact level
   * @returns {string} - Risk level
   */
  calculateRiskLevel(probability, impact) {
    const impactScores = {
      low: 1,
      medium: 2,
      high: 3,
      critical: 4,
    };

    const impactScore = impactScores[impact] || 1;
    const probScore = probability / 25; // Convert 0-100 to 0-4

    // Risk Matrix
    const riskScore = probScore * impactScore;

    if (riskScore >= 12) return "critical";
    if (riskScore >= 8) return "high";
    if (riskScore >= 4) return "medium";
    return "low";
  }

  /**
   * Validates risk level enum
   * @param {string} level - Risk level to validate
   * @returns {boolean} - True if valid
   */
  validateRiskLevel(level) {
    const validLevels = ["low", "medium", "high", "critical"];
    return validLevels.includes(level);
  }

  /**
   * Gets mitigation strategies for a risk
   * @param {Object} risk - Risk object
   * @returns {Array} - Mitigation strategies
   */
  getMitigationStrategies(risk) {
    const strategies = {
      critical: [
        "Immediate action required",
        "Allocate additional resources",
        "Escalate to senior management",
        "Develop contingency plan",
      ],
      high: [
        "Prioritize mitigation efforts",
        "Assign dedicated team",
        "Monitor closely",
        "Consider risk transfer",
      ],
      medium: [
        "Include in regular planning",
        "Develop mitigation timeline",
        "Assign responsible person",
        "Regular monitoring",
      ],
      low: [
        "Monitor periodically",
        "Document for awareness",
        "Include in risk register",
        "No immediate action needed",
      ],
    };

    return strategies[risk.risk_level] || strategies.medium;
  }

  /**
   * Generates risk matrix data for visualization
   * @param {Array} risks - Array of risks
   * @returns {Object} - Risk matrix data
   */
  generateRiskMatrix(risks) {
    const matrix = {
      low: { low: [], medium: [], high: [], critical: [] },
      medium: { low: [], medium: [], high: [], critical: [] },
      high: { low: [], medium: [], high: [], critical: [] },
      critical: { low: [], medium: [], high: [], critical: [] },
    };

    risks.forEach((risk) => {
      const level = risk.risk_level;
      if (matrix[level]) {
        matrix[level][level] = matrix[level][level] || [];
        matrix[level][level].push(risk);
      }
    });

    return matrix;
  }

  /**
   * Calculates risk score
   * @param {Object} risk - Risk object
   * @returns {number} - Risk score (1-100)
   */
  calculateRiskScore(risk) {
    const levelScores = {
      low: 1,
      medium: 2,
      high: 3,
      critical: 4,
    };

    const statusMultipliers = {
      identified: 1.0,
      monitoring: 0.8,
      mitigated: 0.5,
      realized: 1.2,
      closed: 0.0,
    };

    const baseScore = levelScores[risk.risk_level] || 1;
    const multiplier = statusMultipliers[risk.status] || 1;

    return Math.round((baseScore / 4) * 100 * multiplier);
  }

  /**
   * Gets risk status color
   * @param {string} status - Risk status
   * @returns {string} - Color code
   */
  getRiskStatusColor(status) {
    const colors = {
      identified: "#FFA726", // Orange
      monitoring: "#42A5F5", // Blue
      mitigated: "#66BB6A", // Green
      realized: "#EF5350", // Red
      closed: "#BDBDBD", // Grey
    };
    return colors[status] || "#757575";
  }

  /**
   * Gets risk level icon
   * @param {string} level - Risk level
   * @returns {string} - Icon
   */
  getRiskLevelIcon(level) {
    const icons = {
      low: "🟢",
      medium: "🟡",
      high: "🔴",
      critical: "💀",
    };
    return icons[level] || "⚪";
  }

  /**
   * Validates risk data
   * @param {Object} data - Risk data to validate
   * @returns {Object} - { isValid: boolean, errors: Array }
   */
  validateRiskData(data) {
    const errors = [];

    if (!data.title || data.title.length < 3) {
      errors.push("Title must be at least 3 characters long");
    }

    if (data.risk_level && !this.validateRiskLevel(data.risk_level)) {
      errors.push("Invalid risk level");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Gets risk options for UI
   * @returns {Object} - Risk options
   */
  getRiskOptions() {
    return {
      levels: [
        { value: "low", label: "Low", color: "#4CAF50" },
        { value: "medium", label: "Medium", color: "#FFA726" },
        { value: "high", label: "High", color: "#F44336" },
        { value: "critical", label: "Critical", color: "#D32F2F" },
      ],
      statuses: [
        { value: "identified", label: "Identified", color: "#FFA726" },
        { value: "monitoring", label: "Monitoring", color: "#42A5F5" },
        { value: "mitigated", label: "Mitigated", color: "#66BB6A" },
        { value: "realized", label: "Realized", color: "#EF5350" },
        { value: "closed", label: "Closed", color: "#BDBDBD" },
      ],
    };
  }

  /**
   * Generates risk summary
   * @param {Array} risks - Array of risks
   * @returns {string} - Risk summary
   */
  generateRiskSummary(risks) {
    if (!risks || risks.length === 0) {
      return "No risks identified";
    }

    const byLevel = risks.reduce((acc, r) => {
      acc[r.risk_level] = (acc[r.risk_level] || 0) + 1;
      return acc;
    }, {});

    const byStatus = risks.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {});

    const totalScore = risks.reduce(
      (sum, r) => sum + this.calculateRiskScore(r),
      0
    );
    const avgScore = totalScore / risks.length;

    return {
      totalRisks: risks.length,
      byLevel,
      byStatus,
      averageScore: Math.round(avgScore),
      criticalRisks: byLevel.critical || 0,
      highRisks: byLevel.high || 0,
      realizedRisks: byStatus.realized || 0,
    };
  }

  /**
   * Formats risk for AI analysis
   * @param {Object} risk - Risk object
   * @returns {string} - Formatted risk for AI
   */
  formatForAI(risk) {
    return `
Risk: ${risk.title}
Level: ${risk.risk_level}
Status: ${risk.status}
Description: ${risk.description || "No description"}
Reason: ${risk.reason || "No reason provided"}
Mitigation: ${risk.mitigation || "No mitigation plan"}
Score: ${this.calculateRiskScore(risk)}/100
    `.trim();
  }

  /**
   * Gets risk priority order
   * @param {Array} risks - Array of risks
   * @returns {Array} - Sorted risks by priority
   */
  prioritizeRisks(risks) {
    const priorityOrder = {
      critical: 0,
      high: 1,
      medium: 2,
      low: 3,
    };

    return [...risks].sort((a, b) => {
      const priorityA = priorityOrder[a.risk_level] || 3;
      const priorityB = priorityOrder[b.risk_level] || 3;

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // If same level, sort by score
      const scoreA = this.calculateRiskScore(a);
      const scoreB = this.calculateRiskScore(b);
      return scoreB - scoreA;
    });
  }
}

const riskUtils = new RiskUtils();

module.exports = riskUtils;
module.exports.riskUtils = riskUtils;
