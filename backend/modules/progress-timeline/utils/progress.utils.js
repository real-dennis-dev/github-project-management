// src/modules/progress-timeline/utils/progress.utils.js
const {
  format,
  parseISO,
  isValid,
  differenceInDays,
  startOfMonth,
  endOfMonth,
} = require("date-fns");

class ProgressUtils {
  // methods here
  /**
   * Generates chart data for timeline
   * @param {Array} data - Timeline entries
   * @returns {Object} Chart data formatted for visualization
   */
  static generateTimelineChart(data) {
    if (!data || !data.length) {
      return {
        labels: [],
        datasets: [],
        features: [],
      };
    }

    // Group by feature
    const featureMap = new Map();
    const dateMap = new Map();

    data.forEach((entry) => {
      const feature = entry.feature_name;
      const date = format(new Date(entry.month_year), "MMM yyyy");

      // Track unique features
      if (!featureMap.has(feature)) {
        featureMap.set(feature, []);
      }

      // Track unique dates
      if (!dateMap.has(date)) {
        dateMap.set(date, new Set());
      }
      dateMap.get(date).add(feature);

      // Store progress data
      featureMap.get(feature).push({
        date,
        progress: entry.progress_percentage,
        id: entry.id,
        month_year: entry.month_year,
      });
    });

    const sortedDates = Array.from(dateMap.keys()).sort((a, b) => {
      return new Date(a) - new Date(b);
    });

    const labels = sortedDates;
    const features = Array.from(featureMap.keys());

    // Create datasets for each feature
    const datasets = features.map((feature) => {
      const entries = featureMap.get(feature);
      const dataMap = new Map();
      entries.forEach((entry) => {
        dataMap.set(entry.date, entry.progress);
      });

      const data = labels.map((date) => dataMap.get(date) || 0);

      return {
        label: feature,
        data: data,
        borderColor: this.getColorForFeature(feature),
        backgroundColor: this.getColorForFeature(feature, 0.2),
        tension: 0.4,
        fill: false,
        pointRadius: 4,
        pointHoverRadius: 6,
      };
    });

    return {
      labels,
      datasets,
      features,
    };
  }

  /**
   * Calculates progress trend line
   * @param {Array} entries - Timeline entries for a specific feature
   * @returns {Object} Trend data and statistics
   */
  static calculateTrendLine(entries) {
    if (!entries || entries.length < 2) {
      return {
        trend: "insufficient_data",
        slope: 0,
        intercept: 0,
        average:
          entries && entries.length === 1 ? entries[0].progress_percentage : 0,
        dataPoints: entries || [],
        prediction: null,
      };
    }

    // Sort by month_year
    const sorted = [...entries].sort(
      (a, b) => new Date(a.month_year) - new Date(b.month_year)
    );

    const xValues = sorted.map((_, i) => i + 1);
    const yValues = sorted.map((e) => e.progress_percentage);

    // Calculate linear regression
    const n = xValues.length;
    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = yValues.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((a, b, i) => a + b * yValues[i], 0);
    const sumX2 = xValues.reduce((a, b) => a + b * b, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate R-squared (coefficient of determination)
    const avgY = sumY / n;
    const totalSS = yValues.reduce((sum, y) => sum + (y - avgY) ** 2, 0);
    const residualSS = yValues.reduce((sum, y, i) => {
      const predicted = slope * xValues[i] + intercept;
      return sum + (y - predicted) ** 2;
    }, 0);
    const rSquared = totalSS === 0 ? 0 : 1 - residualSS / totalSS;

    // Predict next month
    const nextX = n + 1;
    const nextPrediction = Math.min(
      100,
      Math.max(0, slope * nextX + intercept)
    );

    // Determine trend direction
    let trend;
    if (slope > 1) trend = "strong_upward";
    else if (slope > 0.3) trend = "upward";
    else if (slope > -0.3) trend = "stable";
    else if (slope > -1) trend = "downward";
    else trend = "strong_downward";

    return {
      trend,
      slope: Math.round(slope * 100) / 100,
      intercept: Math.round(intercept * 100) / 100,
      rSquared: Math.round(rSquared * 100) / 100,
      average: Math.round((yValues.reduce((a, b) => a + b, 0) / n) * 10) / 10,
      dataPoints: sorted,
      prediction: {
        nextMonth: Math.round(nextPrediction),
        confidence: Math.round(rSquared * 100),
      },
    };
  }

  /**
   * Formats month year for display
   * @param {Date|string} date - Date to format
   * @returns {string} Formatted month-year string
   */
  static formatMonthYear(date) {
    const d = typeof date === "string" ? new Date(date) : date;
    if (!isValid(d)) {
      throw new Error("Invalid date provided");
    }
    return format(d, "MMM yyyy");
  }

  /**
   * Validates progress data
   * @param {Object} data - Progress data to validate
   * @param {number} data.progress_percentage - Progress percentage (0-100)
   * @param {string} data.feature_name - Feature name
   * @param {string} data.month_year - Month year
   * @returns {Object} Validation result with errors if any
   */
  static validateProgressData(data) {
    const errors = {};

    if (!data) {
      return { valid: false, errors: { general: "Data is required" } };
    }

    // Validate progress_percentage
    if (data.progress_percentage !== undefined) {
      if (
        !Number.isInteger(data.progress_percentage) ||
        data.progress_percentage < 0 ||
        data.progress_percentage > 100
      ) {
        errors.progress_percentage =
          "Progress percentage must be an integer between 0 and 100";
      }
    }

    // Validate feature_name
    if (data.feature_name !== undefined) {
      if (!data.feature_name || data.feature_name.trim().length === 0) {
        errors.feature_name = "Feature name is required";
      } else if (data.feature_name.length > 255) {
        errors.feature_name = "Feature name must be less than 255 characters";
      }
    }

    // Validate month_year
    if (data.month_year !== undefined) {
      const d = new Date(data.month_year);
      if (!isValid(d)) {
        errors.month_year = "Invalid month year date format";
      } else {
        // Check if it's first day of month
        const firstDay = startOfMonth(d);
        if (d.getDate() !== 1 || d.getMonth() !== firstDay.getMonth()) {
          errors.month_year = "Date must be the first day of the month";
        }
      }
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Aggregates monthly data entries
   * @param {Array} entries - Timeline entries
   * @returns {Object} Aggregated data by month
   */
  static aggregateMonthlyData(entries) {
    if (!entries || !entries.length) {
      return {
        monthlyAggregates: {},
        totalFeatures: 0,
        averageProgress: 0,
        monthlyAverages: {},
      };
    }

    const monthlyAggregates = new Map();
    const features = new Set();

    entries.forEach((entry) => {
      const monthKey = this.formatMonthYear(entry.month_year);
      features.add(entry.feature_name);

      if (!monthlyAggregates.has(monthKey)) {
        monthlyAggregates.set(monthKey, {
          total: 0,
          count: 0,
          entries: [],
        });
      }

      const monthData = monthlyAggregates.get(monthKey);
      monthData.total += entry.progress_percentage;
      monthData.count += 1;
      monthData.entries.push(entry);
    });

    // Calculate monthly averages
    const monthlyAverages = {};
    const sortedMonths = Array.from(monthlyAggregates.keys()).sort((a, b) => {
      return new Date(a) - new Date(b);
    });

    sortedMonths.forEach((month) => {
      const data = monthlyAggregates.get(month);
      monthlyAverages[month] = {
        average: Math.round(data.total / data.count),
        entries: data.count,
        total: data.total,
      };
    });

    // Calculate overall average
    const overallTotal = Array.from(monthlyAggregates.values()).reduce(
      (sum, data) => sum + data.total,
      0
    );
    const overallCount = Array.from(monthlyAggregates.values()).reduce(
      (sum, data) => sum + data.count,
      0
    );
    const averageProgress =
      overallCount > 0 ? Math.round(overallTotal / overallCount) : 0;

    return {
      monthlyAggregates: Object.fromEntries(monthlyAggregates),
      monthlyAverages,
      totalFeatures: features.size,
      averageProgress,
      totalEntries: entries.length,
    };
  }

  /**
   * Gets color for a feature based on name hash
   * @param {string} featureName - Feature name
   * @param {number} alpha - Alpha channel value
   * @returns {string} Color string
   */
  static getColorForFeature(featureName, alpha = 1) {
    const colors = [
      "rgba(54, 162, 235, {{alpha}})", // Blue
      "rgba(255, 99, 132, {{alpha}})", // Red
      "rgba(75, 192, 192, {{alpha}})", // Teal
      "rgba(255, 159, 64, {{alpha}})", // Orange
      "rgba(153, 102, 255, {{alpha}})", // Purple
      "rgba(255, 205, 86, {{alpha}})", // Yellow
      "rgba(201, 203, 207, {{alpha}})", // Grey
      "rgba(255, 99, 132, {{alpha}})", // Pink
      "rgba(54, 162, 235, {{alpha}})", // Light Blue
      "rgba(75, 192, 192, {{alpha}})", // Light Teal
    ];

    let hash = 0;
    for (let i = 0; i < featureName.length; i++) {
      hash = featureName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorIndex = Math.abs(hash) % colors.length;
    return colors[colorIndex].replace("{{alpha}}", alpha.toString());
  }

  /**
   * Gets status based on progress percentage
   * @param {number} progress - Progress percentage
   * @returns {Object} Status object with label and class
   */
  static getProgressStatus(progress) {
    if (progress === 100) {
      return { label: "Completed", class: "success", icon: "✅" };
    } else if (progress >= 75) {
      return { label: "Almost Done", class: "primary", icon: "🟢" };
    } else if (progress >= 50) {
      return { label: "Halfway", class: "info", icon: "🔵" };
    } else if (progress >= 25) {
      return { label: "In Progress", class: "warning", icon: "🟡" };
    } else if (progress > 0) {
      return { label: "Just Started", class: "warning", icon: "🟠" };
    } else {
      return { label: "Not Started", class: "secondary", icon: "⚪" };
    }
  }

  /**
   * Calculates overall project progress from timeline entries
   * @param {Array} entries - Timeline entries
   * @returns {Object} Overall progress metrics
   */
  static calculateOverallProgress(entries) {
    if (!entries || !entries.length) {
      return {
        overall: 0,
        features: {},
        byDate: {},
        average: 0,
        totalFeatures: 0,
        completedFeatures: 0,
      };
    }

    // Group by feature
    const features = {};
    entries.forEach((entry) => {
      if (!features[entry.feature_name]) {
        features[entry.feature_name] = [];
      }
      features[entry.feature_name].push(entry);
    });

    // Get most recent progress per feature
    const featureProgress = {};
    Object.keys(features).forEach((featureName) => {
      const sorted = features[featureName].sort(
        (a, b) => new Date(b.month_year) - new Date(a.month_year)
      );
      featureProgress[featureName] = sorted[0].progress_percentage;
    });

    const progressValues = Object.values(featureProgress);
    const overall =
      progressValues.length > 0
        ? Math.round(
            progressValues.reduce((a, b) => a + b, 0) / progressValues.length
          )
        : 0;

    const completedFeatures = progressValues.filter((p) => p === 100).length;

    return {
      overall,
      features: featureProgress,
      byDate: this.aggregateMonthlyData(entries),
      average: overall,
      totalFeatures: Object.keys(features).length,
      completedFeatures,
      completionRate:
        Object.keys(features).length > 0
          ? Math.round((completedFeatures / Object.keys(features).length) * 100)
          : 0,
    };
  }
}

const progressUtils = new ProgressUtils();

module.exports = progressUtils;
module.exports.progressUtils = progressUtils;
