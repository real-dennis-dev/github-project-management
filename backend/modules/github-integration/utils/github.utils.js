const dotenv = require("dotenv");
dotenv.config();
const { Octokit } = require("@octokit/rest");
const { createAppAuth } = require("@octokit/auth-app");
const logger = require("../../../common/config/logger");

/**
 * GitHub Utilities - Handles parsing, formatting, and error handling for GitHub operations
 */
class GitHubUtils {
  /**
   * Initialize GitHub Utils
   *
   */
  constructor() {
    const accessToken = process.env.GITHUB_ACCESS_TOKEN;
    if (!accessToken) {
      throw new Error(
        "GITHUB_ACCESS_TOKEN is not defined in environment variables"
      );
    }
    this.octokit = new Octokit({
      auth: accessToken,
      userAgent: "ProjectManagementApp v1.0.0",
    });
  }

  /**
   * Parse GitHub URL to extract owner and repository name
   * @param {string} url - GitHub repository URL
   * @returns {Object} { owner, repo }
   * @throws {Error} If URL is invalid
   */
  parseGitHubUrl(url) {
    try {
      const urlPattern =
        /^https?:\/\/(?:www\.)?github\.com\/([^\/]+)\/([^\/]+)(?:\/|$)/;
      const match = url.match(urlPattern);

      if (!match) {
        throw new Error(
          "Invalid GitHub URL format. Expected: https://github.com/owner/repo"
        );
      }

      return {
        owner: match[1],
        repo: match[2].replace(/\.git$/, ""),
      };
    } catch (error) {
      logger.error("Error parsing GitHub URL:", error);
      throw new Error(`Failed to parse GitHub URL: ${error.message}`);
    }
  }

  /**
   * Format commit message for display
   * @param {string} message - Raw commit message
   * @param {number} maxLength - Maximum length for display
   * @returns {string} Formatted commit message
   */
  formatCommitMessage(message, maxLength = 100) {
    if (!message) return "No commit message";

    // Remove trailing whitespace and newlines
    let formatted = message.trim();

    // Take first line if multi-line
    formatted = formatted.split("\n")[0];

    // Truncate if too long
    if (formatted.length > maxLength) {
      formatted = formatted.substring(0, maxLength - 3) + "...";
    }

    return formatted;
  }

  /**
   * Calculate commit statistics
   * @param {Array} commits - Array of commit objects
   * @returns {Object} Statistics { totalCommits, totalAdditions, totalDeletions, authors, dateRange }
   */
  calculateCommitStats(commits) {
    if (!commits || commits.length === 0) {
      return {
        totalCommits: 0,
        totalAdditions: 0,
        totalDeletions: 0,
        authors: {},
        dateRange: null,
        averageChanges: 0,
      };
    }

    const stats = {
      totalCommits: commits.length,
      totalAdditions: 0,
      totalDeletions: 0,
      authors: {},
      dates: [],
      minDate: null,
      maxDate: null,
    };

    commits.forEach((commit) => {
      // Calculate additions/deletions
      stats.totalAdditions += commit.added_lines || 0;
      stats.totalDeletions += commit.removed_lines || 0;

      // Track authors
      const author = commit.author_name || "Unknown";
      if (!stats.authors[author]) {
        stats.authors[author] = 0;
      }
      stats.authors[author]++;

      // Track dates
      if (commit.committed_at) {
        stats.dates.push(new Date(commit.committed_at));
        const date = new Date(commit.committed_at);
        if (!stats.minDate || date < stats.minDate) stats.minDate = date;
        if (!stats.maxDate || date > stats.maxDate) stats.maxDate = date;
      }
    });

    // Calculate average changes per commit
    const averageChanges =
      stats.totalCommits > 0
        ? (stats.totalAdditions + stats.totalDeletions) / stats.totalCommits
        : 0;

    // Get commit frequency by period
    const frequency = this._calculateCommitFrequency(stats.dates);

    return {
      totalCommits: stats.totalCommits,
      totalAdditions: stats.totalAdditions,
      totalDeletions: stats.totalDeletions,
      totalChanges: stats.totalAdditions + stats.totalDeletions,
      authors: stats.authors,
      topAuthors: this._getTopAuthors(stats.authors, 5),
      dateRange:
        stats.minDate && stats.maxDate
          ? { from: stats.minDate, to: stats.maxDate }
          : null,
      averageChanges: Math.round(averageChanges * 100) / 100,
      frequency,
      commitsPerDay: stats.totalCommits / (stats.dates.length || 1),
    };
  }

  /**
   * Calculate commit frequency (commits per day/week/month)
   * @private
   */
  _calculateCommitFrequency(dates) {
    if (!dates || dates.length === 0) return null;

    const sortedDates = dates.sort((a, b) => a - b);
    const days = Math.ceil(
      (sortedDates[sortedDates.length - 1] - sortedDates[0]) /
        (1000 * 60 * 60 * 24)
    );

    return {
      commitsPerDay: dates.length / (days || 1),
      commitsPerWeek: dates.length / ((days || 1) / 7),
      commitsPerMonth: dates.length / ((days || 1) / 30),
    };
  }

  /**
   * Get top authors by commit count
   * @private
   */
  _getTopAuthors(authors, limit = 5) {
    return Object.entries(authors)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .reduce((obj, [name, count]) => {
        obj[name] = count;
        return obj;
      }, {});
  }

  /**
   * Map GitHub status to local application status
   * @param {string} status - GitHub status (open/closed/merged)
   * @returns {string} Mapped status
   */
  getGitHubStatus(status) {
    const statusMap = {
      open: "open",
      closed: "closed",
      merged: "merged",
      pending: "pending",
      success: "success",
      failure: "failure",
      error: "error",
    };

    return statusMap[status.toLowerCase()] || status;
  }

  /**
   * Extract relevant PR information from GitHub PR data
   * @param {Object} prData - GitHub pull request data
   * @returns {Object} Extracted PR details
   */
  extractPRDetails(prData) {
    return {
      pr_number: prData.number,
      title: prData.title,
      state: this.getGitHubStatus(prData.state),
      author: prData.user?.login || "Unknown",
      created_at_github: prData.created_at,
      updated_at_github: prData.updated_at,
      merged_at: prData.merged_at || null,
      additions: prData.additions || 0,
      deletions: prData.deletions || 0,
      body: prData.body || "",
      labels: prData.labels?.map((label) => label.name) || [],
      assignees: prData.assignees?.map((user) => user.login) || [],
      baseBranch: prData.base?.ref || "main",
      headBranch: prData.head?.ref || "",
      url: prData.html_url,
      draft: prData.draft || false,
      mergeable: prData.mergeable || false,
      mergeable_state: prData.mergeable_state || "unknown",
      review_comments: prData.review_comments || 0,
      comments: prData.comments || 0,
      commits: prData.commits || 0,
    };
  }

  /**
   * Handle GitHub API errors
   * @param {Error} error - GitHub API error
   * @param {string} operation - Operation being performed
   * @returns {Error} Formatted error
   */
  handleGitHubError(error, operation = "GitHub API") {
    logger.error(`${operation} error:`, error);

    // Handle specific GitHub error types
    if (error.status === 401) {
      return new Error(
        `GitHub authentication failed. Please check your access token.`
      );
    }

    if (error.status === 403) {
      return new Error(
        `GitHub API rate limit exceeded. Please try again later.`
      );
    }

    if (error.status === 404) {
      return new Error(`GitHub repository not found or you don't have access.`);
    }

    if (error.status === 422) {
      return new Error(`GitHub validation error: ${error.message}`);
    }

    // Handle network errors
    if (error.code === "ECONNRESET" || error.code === "ETIMEDOUT") {
      return new Error(
        `Network error connecting to GitHub API. Please check your connection.`
      );
    }

    // Default error
    return new Error(
      `GitHub operation failed: ${error.message || "Unknown error"}`
    );
  }

  /**
   * Validate GitHub repository name
   * @param {string} repoName - Repository name
   * @returns {boolean} True if valid
   */
  validateRepoName(repoName) {
    if (!repoName) return false;
    // GitHub repository name rules: alphanumeric, hyphen, underscore, dot
    return /^[a-zA-Z0-9\-_.]+$/.test(repoName);
  }

  /**
   * Validate GitHub owner
   * @param {string} owner - Owner username or organization
   * @returns {boolean} True if valid
   */
  validateOwner(owner) {
    if (!owner) return false;
    // GitHub username rules: alphanumeric, hyphen, underscore
    return /^[a-zA-Z0-9\-_]+$/.test(owner);
  }

  /**
   * Generate repository summary from GitHub data
   * @param {Object} repoData - GitHub repository data
   * @returns {Object} Summary information
   */
  generateRepoSummary(repoData) {
    return {
      name: repoData.name,
      fullName: repoData.full_name,
      description: repoData.description || "",
      isPrivate: repoData.private || false,
      defaultBranch: repoData.default_branch || "main",
      stars: repoData.stargazers_count || 0,
      forks: repoData.forks_count || 0,
      openIssues: repoData.open_issues_count || 0,
      watchers: repoData.watchers_count || 0,
      size: repoData.size || 0,
      language: repoData.language || "Unknown",
      license: repoData.license?.name || "None",
      createdAt: repoData.created_at,
      updatedAt: repoData.updated_at,
      pushedAt: repoData.pushed_at,
      url: repoData.html_url,
      cloneUrl: repoData.clone_url,
      sshUrl: repoData.ssh_url,
      topics: repoData.topics || [],
    };
  }

  /**
   * Extract issue details from GitHub issue data
   * @param {Object} issueData - GitHub issue data
   * @returns {Object} Extracted issue details
   */
  extractIssueDetails(issueData) {
    return {
      issue_number: issueData.number,
      title: issueData.title,
      state: this.getGitHubStatus(issueData.state),
      author: issueData.user?.login || "Unknown",
      created_at_github: issueData.created_at,
      updated_at_github: issueData.updated_at,
      closed_at: issueData.closed_at || null,
      body: issueData.body || "",
      labels: issueData.labels?.map((label) => label.name) || [],
      assignees: issueData.assignees?.map((user) => user.login) || [],
      comments: issueData.comments || 0,
      url: issueData.html_url,
      milestone: issueData.milestone?.title || null,
      isPullRequest: !!issueData.pull_request,
    };
  }

  /**
   * Get current GitHub API rate limit status
   * @returns {Promise<Object>} Rate limit status
   */
  async getRateLimit() {
    try {
      const response = await this.octokit.rest.rateLimit.get();
      return response.data.resources.core;
    } catch (error) {
      return this.handleGitHubError(error, "Rate limit check");
    }
  }

  /**
   * Check if GitHub token has required permissions
   * @param {string} token - GitHub access token
   * @returns {Promise<Object>} Token permissions
   */
  async checkTokenPermissions(token) {
    try {
      const octokit = new Octokit({ auth: token });
      const response = await octokit.rest.users.getAuthenticated();
      return {
        authenticated: true,
        username: response.data.login,
        permissions: response.data.permissions || {},
      };
    } catch (error) {
      return {
        authenticated: false,
        error: error.message,
      };
    }
  }

  /**
   * Format GitHub webhook payload for processing
   * @param {Object} payload - Raw webhook payload
   * @param {string} eventType - GitHub event type
   * @returns {Object} Processed webhook data
   */
  processWebhookPayload(payload, eventType) {
    const processed = {
      eventType,
      action: payload.action || "synchronize",
      timestamp: new Date().toISOString(),
    };

    switch (eventType) {
      case "push":
        processed.branch = payload.ref?.replace("refs/heads/", "");
        processed.commits = payload.commits?.map((commit) => ({
          sha: commit.id,
          message: commit.message,
          author: commit.author?.name,
          url: commit.url,
          timestamp: commit.timestamp,
        }));
        processed.before = payload.before;
        processed.after = payload.after;
        break;

      case "pull_request":
        processed.prNumber = payload.number;
        processed.state = payload.pull_request?.state;
        processed.action = payload.action;
        processed.prData = this.extractPRDetails(payload.pull_request);
        break;

      case "issues":
        processed.issueNumber = payload.issue?.number;
        processed.state = payload.issue?.state;
        processed.action = payload.action;
        processed.issueData = this.extractIssueDetails(payload.issue);
        break;

      default:
        processed.raw = payload;
    }

    return processed;
  }
}

const gitHubUtils = new GitHubUtils();

module.exports = gitHubUtils;
module.exports.gitHubUtils = gitHubUtils;
