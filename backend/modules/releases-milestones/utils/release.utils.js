/**
 * Release Utilities
 * Handles release-related helper functions
 */
class ReleaseUtils {
  /**
   * Validates semantic version format
   * @param {string} version - Version string to validate
   * @returns {boolean} - True if valid semantic version
   */
  validateSemanticVersion(version) {
    const semverRegex = /^\d+\.\d+\.\d+$/;
    return semverRegex.test(version);
  }

  /**
   * Generates version from current date
   * @param {string} prefix - Optional prefix (e.g., 'v')
   * @returns {string} - Version string (YYYY.MM.DD)
   */
  generateVersionFromDate(prefix = "") {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${prefix}${year}.${month}.${day}`;
  }

  /**
   * Formats release notes for display
   * @param {Object} release - Release object
   * @param {Array} features - Features in release
   * @returns {string} - Formatted release notes
   */
  formatReleaseNotes(release, features = []) {
    const parts = [
      `# Release ${release.version}`,
      `\n## Description\n${release.description || "No description provided"}`,
      `\n## Status\n${release.status.toUpperCase()}`,
      `\n## Release Date\n${
        release.release_date
          ? new Date(release.release_date).toLocaleDateString()
          : "Not scheduled"
      }`,
      `\n## Features\n`,
    ];

    if (features && features.length > 0) {
      features.forEach((feature, index) => {
        const status = feature.is_completed ? "✅" : "🔄";
        parts.push(`${index + 1}. ${status} ${feature.title}`);
        if (feature.description) {
          parts.push(`   - ${feature.description}`);
        }
      });
    } else {
      parts.push("No features assigned to this release");
    }

    parts.push(`\n## Generated\n${new Date().toISOString()}`);

    return parts.join("\n");
  }

  /**
   * Calculates release readiness percentage
   * @param {Object} release - Release object
   * @param {Array} features - Features in release
   * @returns {Object} - Readiness metrics
   */
  calculateReleaseReadiness(release, features = []) {
    if (!features || features.length === 0) {
      return {
        percentage: 0,
        totalFeatures: 0,
        completedFeatures: 0,
        status: "No features",
        readiness: "low",
      };
    }

    const totalFeatures = features.length;
    const completedFeatures = features.filter((f) => f.is_completed).length;
    const percentage = Math.round((completedFeatures / totalFeatures) * 100);

    let readiness = "low";
    if (percentage === 100) readiness = "ready";
    else if (percentage >= 75) readiness = "high";
    else if (percentage >= 50) readiness = "medium";
    else if (percentage >= 25) readiness = "low";

    return {
      percentage,
      totalFeatures,
      completedFeatures,
      status:
        percentage === 100 ? "Ready for release" : `${percentage}% complete`,
      readiness,
    };
  }

  /**
   * Gets release status color
   * @param {string} status - Release status
   * @returns {string} - Color code
   */
  getReleaseStatusColor(status) {
    const colors = {
      planned: "#42A5F5", // Blue
      in_progress: "#FFA726", // Orange
      testing: "#AB47BC", // Purple
      released: "#66BB6A", // Green
      cancelled: "#EF5350", // Red
    };
    return colors[status] || "#757575";
  }

  /**
   * Gets release status icon
   * @param {string} status - Release status
   * @returns {string} - Icon
   */
  getReleaseStatusIcon(status) {
    const icons = {
      planned: "📋",
      in_progress: "🚧",
      testing: "🧪",
      released: "🚀",
      cancelled: "❌",
    };
    return icons[status] || "📌";
  }

  /**
   * Validates release data
   * @param {Object} data - Release data to validate
   * @returns {Object} - { isValid: boolean, errors: Array }
   */
  validateReleaseData(data) {
    const errors = [];

    if (data.version && !this.validateSemanticVersion(data.version)) {
      errors.push("Invalid semantic version format (expected: X.Y.Z)");
    }

    if (data.status) {
      const validStatuses = [
        "planned",
        "in_progress",
        "testing",
        "released",
        "cancelled",
      ];
      if (!validStatuses.includes(data.status)) {
        errors.push("Invalid release status");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Compares two versions
   * @param {string} v1 - First version
   * @param {string} v2 - Second version
   * @returns {number} - -1 if v1 < v2, 0 if equal, 1 if v1 > v2
   */
  compareVersions(v1, v2) {
    if (
      !this.validateSemanticVersion(v1) ||
      !this.validateSemanticVersion(v2)
    ) {
      throw new Error("Invalid semantic version format");
    }

    const parts1 = v1.split(".").map(Number);
    const parts2 = v2.split(".").map(Number);

    for (let i = 0; i < 3; i++) {
      if (parts1[i] !== parts2[i]) {
        return parts1[i] > parts2[i] ? 1 : -1;
      }
    }
    return 0;
  }

  /**
   * Gets release options for UI
   * @returns {Object} - Release options
   */
  getReleaseOptions() {
    return {
      statuses: [
        { value: "planned", label: "Planned", color: "#42A5F5" },
        { value: "in_progress", label: "In Progress", color: "#FFA726" },
        { value: "testing", label: "Testing", color: "#AB47BC" },
        { value: "released", label: "Released", color: "#66BB6A" },
        { value: "cancelled", label: "Cancelled", color: "#EF5350" },
      ],
    };
  }

  /**
   * Formats release for AI analysis
   * @param {Object} release - Release object
   * @param {Array} features - Features in release
   * @returns {string} - Formatted release for AI
   */
  formatForAI(release, features = []) {
    const readiness = this.calculateReleaseReadiness(release, features);

    return `
Release: ${release.version}
Status: ${release.status}
Description: ${release.description || "No description"}
Release Date: ${release.release_date || "Not scheduled"}
Features: ${features.length}
Completed Features: ${readiness.completedFeatures}
Readiness: ${readiness.percentage}%
    `.trim();
  }

  /**
   * Generates release summary
   * @param {Array} releases - Array of releases
   * @returns {Object} - Release summary
   */
  generateReleaseSummary(releases) {
    if (!releases || releases.length === 0) {
      return {
        total: 0,
        byStatus: {
          planned: 0,
          in_progress: 0,
          testing: 0,
          released: 0,
          cancelled: 0,
        },
        latestRelease: null,
        nextRelease: null,
      };
    }

    const byStatus = releases.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {});

    const sortedReleases = [...releases].sort((a, b) =>
      this.compareVersions(a.version, b.version)
    );

    const released = releases.filter((r) => r.status === "released");
    const latestRelease =
      released.length > 0
        ? released.sort((a, b) => this.compareVersions(b.version, a.version))[0]
        : null;

    const planned = releases.filter(
      (r) => r.status === "planned" || r.status === "in_progress"
    );
    const nextRelease =
      planned.length > 0
        ? planned.sort((a, b) => this.compareVersions(a.version, b.version))[0]
        : null;

    return {
      total: releases.length,
      byStatus,
      latestRelease,
      nextRelease,
    };
  }

  /**
   * Formats version for display
   * @param {string} version - Version string
   * @param {string} prefix - Prefix to add
   * @returns {string} - Formatted version
   */
  formatVersion(version, prefix = "v") {
    return `${prefix}${version}`;
  }

  /**
   * Validates version increment
   * @param {string} current - Current version
   * @param {string} next - Next version
   * @param {string} type - Increment type (major, minor, patch)
   * @returns {boolean} - True if valid increment
   */
  validateVersionIncrement(current, next, type) {
    if (
      !this.validateSemanticVersion(current) ||
      !this.validateSemanticVersion(next)
    ) {
      return false;
    }

    const currentParts = current.split(".").map(Number);
    const nextParts = next.split(".").map(Number);

    if (type === "major") {
      return (
        nextParts[0] === currentParts[0] + 1 &&
        nextParts[1] === 0 &&
        nextParts[2] === 0
      );
    }

    if (type === "minor") {
      return (
        nextParts[0] === currentParts[0] &&
        nextParts[1] === currentParts[1] + 1 &&
        nextParts[2] === 0
      );
    }

    if (type === "patch") {
      return (
        nextParts[0] === currentParts[0] &&
        nextParts[1] === currentParts[1] &&
        nextParts[2] === currentParts[2] + 1
      );
    }

    return false;
  }
}

module.exports = new ReleaseUtils();
