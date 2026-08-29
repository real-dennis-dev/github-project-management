const { supabase } = require("../../../common/config/supabase");
const logger = require("../../../common/config/logger");
const GitHubUtils = require("../utils/github.utils");

/**
 * GitHub Middleware - Handles validation and authorization for GitHub operations
 */
class GitHubMiddleware {
  constructor() {
    this.githubUtils = new GitHubUtils({});
  }

  /**
   * Validate repository ID exists
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async validateRepositoryId(req, res, next) {
    try {
      const { repositoryId } = req.params;

      // Validate UUID format
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(repositoryId)) {
        return res.status(400).json({
          success: false,
          error: "Invalid repository ID format",
        });
      }

      // Check if repository exists
      const { data, error } = await supabase
        .from("github_repositories")
        .select("id, project_id, repo_name, repo_owner")
        .eq("id", repositoryId)
        .single();

      if (error || !data) {
        return res.status(404).json({
          success: false,
          error: "Repository not found",
        });
      }

      // Store repository info in request for later use
      req.repository = data;
      next();
    } catch (error) {
      logger.error("Error validating repository ID:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to validate repository",
      });
    }
  }

  /**
   * Check repository access (project ownership)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async checkRepositoryAccess(req, res, next) {
    try {
      const { projectId } = req.params;
      const repository = req.repository;

      if (!repository) {
        return res.status(404).json({
          success: false,
          error: "Repository not found",
        });
      }

      // Check if repository belongs to the project
      if (repository.project_id !== projectId) {
        return res.status(403).json({
          success: false,
          error: "Repository does not belong to this project",
        });
      }

      next();
    } catch (error) {
      logger.error("Error checking repository access:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to check repository access",
      });
    }
  }

  /**
   * Validate GitHub webhook signature
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  validateWebhookSignature(req, res, next) {
    try {
      const signature = req.headers["x-hub-signature-256"];
      const eventType = req.headers["x-github-event"];
      const deliveryId = req.headers["x-github-delivery"];

      if (!signature || !eventType) {
        return res.status(400).json({
          success: false,
          error: "Missing GitHub webhook headers",
        });
      }

      // Store webhook metadata in request
      req.webhook = {
        signature,
        eventType,
        deliveryId,
        timestamp: new Date().toISOString(),
      };

      // Log webhook receipt
      logger.info(`Received GitHub webhook: ${eventType} (${deliveryId})`);

      next();
    } catch (error) {
      logger.error("Error validating webhook signature:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to validate webhook",
      });
    }
  }

  /**
   * Validate GitHub API token and rate limits
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next function
   */
  async validateGitHubToken(req, res, next) {
    try {
      const { accessToken } = req.body;

      if (!accessToken) {
        // If no token provided, use default token from config
        return next();
      }

      // Validate token with GitHub
      const octokit = new Octokit({ auth: accessToken });

      try {
        await octokit.rest.users.getAuthenticated();
        req.githubToken = accessToken;
        next();
      } catch (error) {
        if (error.status === 401) {
          return res.status(401).json({
            success: false,
            error: "Invalid GitHub access token",
          });
        }
        throw error;
      }
    } catch (error) {
      logger.error("Error validating GitHub token:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to validate GitHub token",
      });
    }
  }
}

const gitHubMiddleware = new GitHubMiddleware();

module.exports = gitHubMiddleware;
module.exports.gitHubMiddleware = gitHubMiddleware;
