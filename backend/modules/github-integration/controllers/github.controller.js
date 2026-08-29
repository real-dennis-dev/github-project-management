const { supabase } = require("../../../common/config/supabase");
const logger = require("../../../common/config/logger");
const GitHubService = require("../services/github.service");
const ResponseUtils = require("../../../common/utils/response.utils");
const GitHubUtils = require("../utils/github.utils");
const AuthMiddleware = require("../../../common/middleware/auth.middleware");

/**
 * GitHub Controller - Handles HTTP requests for GitHub integration
 */
class GitHubController {
  constructor() {
    this.service = new GitHubService();
    this.response = ResponseUtils;
    this.utils = new GitHubUtils({});
  }

  /**
   * Get all GitHub repositories for a project
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response
   */
  async getRepositories(req, res) {
    try {
      const { projectId } = req.params;
      const userId = req.user?.id;

      // Check if user has access to project
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .select("id, owner_id")
        .eq("id", projectId)
        .single();

      if (projectError || !project) {
        return this.response.sendError(res, "Project not found", 404);
      }

      // Check if user is project owner or has access
      if (project.owner_id !== userId && req.user?.role !== "admin") {
        return this.response.sendError(res, "Access denied", 403);
      }

      const { data, error } = await supabase
        .from("github_repositories")
        .select(
          `
          *,
          github_commits(count),
          github_branches(count),
          github_pull_requests(count),
          github_issues(count)
        `
        )
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch repositories: ${error.message}`);
      }

      // Add summary stats to each repository
      const enrichedData = data.map((repo) => ({
        ...repo,
        stats: {
          commits: parseInt(repo.github_commits?.[0]?.count || 0),
          branches: parseInt(repo.github_branches?.[0]?.count || 0),
          pullRequests: parseInt(repo.github_pull_requests?.[0]?.count || 0),
          issues: parseInt(repo.github_issues?.[0]?.count || 0),
        },
      }));

      return this.response.sendSuccess(res, {
        data: enrichedData,
        count: enrichedData.length,
      });
    } catch (error) {
      logger.error("Error getting repositories:", error);
      return this.response.sendError(res, error.message, 500);
    }
  }

  /**
   * Connect a GitHub repository
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response
   */
  async connectRepository(req, res) {
    try {
      const { projectId } = req.params;
      const { repoUrl, defaultBranch, accessToken } = req.body;
      const userId = req.user?.id;

      // Verify project access
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .select("id, owner_id")
        .eq("id", projectId)
        .single();

      if (projectError || !project) {
        return this.response.sendError(res, "Project not found", 404);
      }

      if (project.owner_id !== userId && req.user?.role !== "admin") {
        return this.response.sendError(res, "Access denied", 403);
      }

      const result = await this.service.connectRepository(projectId, {
        repoUrl,
        defaultBranch,
        accessToken,
      });

      // Log activity
      logger.info(
        `Repository connected to project ${projectId} by user ${userId}`
      );

      return this.response.sendSuccess(
        res,
        {
          data: result,
          message: "Repository connected successfully",
        },
        201
      );
    } catch (error) {
      logger.error("Error connecting repository:", error);
      return this.response.sendError(res, error.message, 400);
    }
  }

  /**
   * Disconnect a GitHub repository
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response
   */
  async disconnectRepository(req, res) {
    try {
      const { repositoryId } = req.params;
      const userId = req.user?.id;

      // Verify repository ownership
      const { data: repo, error: repoError } = await supabase
        .from("github_repositories")
        .select("id, project_id, projects(owner_id)")
        .eq("id", repositoryId)
        .single();

      if (repoError || !repo) {
        return this.response.sendError(res, "Repository not found", 404);
      }

      const isOwner = repo.projects?.owner_id === userId;
      if (!isOwner && req.user?.role !== "admin") {
        return this.response.sendError(res, "Access denied", 403);
      }

      const result = await this.service.disconnectRepository(repositoryId);

      logger.info(`Repository ${repositoryId} disconnected by user ${userId}`);

      return this.response.sendSuccess(res, result);
    } catch (error) {
      logger.error("Error disconnecting repository:", error);
      return this.response.sendError(res, error.message, 400);
    }
  }

  /**
   * Sync a GitHub repository
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response
   */
  async syncRepository(req, res) {
    try {
      const { repositoryId } = req.params;
      const { accessToken } = req.body;
      const userId = req.user?.id;

      // Verify repository access
      const { data: repo, error: repoError } = await supabase
        .from("github_repositories")
        .select("id, project_id, projects(owner_id)")
        .eq("id", repositoryId)
        .single();

      if (repoError || !repo) {
        return this.response.sendError(res, "Repository not found", 404);
      }

      const isOwner = repo.projects?.owner_id === userId;
      if (!isOwner && req.user?.role !== "admin") {
        return this.response.sendError(res, "Access denied", 403);
      }

      const result = await this.service.syncRepository(
        repositoryId,
        accessToken
      );

      logger.info(`Repository ${repositoryId} synced by user ${userId}`);

      return this.response.sendSuccess(res, result);
    } catch (error) {
      logger.error("Error syncing repository:", error);
      return this.response.sendError(res, error.message, 400);
    }
  }

  /**
   * Get commits from a repository
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response
   */
  async getCommits(req, res) {
    try {
      const { repositoryId } = req.params;
      const filters = req.query;
      const userId = req.user?.id;

      // Verify repository access
      const { data: repo, error: repoError } = await supabase
        .from("github_repositories")
        .select("id, project_id, projects(owner_id)")
        .eq("id", repositoryId)
        .single();

      if (repoError || !repo) {
        return this.response.sendError(res, "Repository not found", 404);
      }

      const isOwner = repo.projects?.owner_id === userId;
      if (!isOwner && req.user?.role !== "admin") {
        return this.response.sendError(res, "Access denied", 403);
      }

      const result = await this.service.getCommits(repositoryId, filters);

      return this.response.sendPaginated(
        res,
        result.data,
        result.pagination.page,
        result.pagination.limit,
        result.pagination.total,
        { stats: result.stats }
      );
    } catch (error) {
      logger.error("Error getting commits:", error);
      return this.response.sendError(res, error.message, 400);
    }
  }

  /**
   * Get branches from a repository
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response
   */
  async getBranches(req, res) {
    try {
      const { repositoryId } = req.params;
      const userId = req.user?.id;

      // Verify repository access
      const { data: repo, error: repoError } = await supabase
        .from("github_repositories")
        .select("id, project_id, projects(owner_id)")
        .eq("id", repositoryId)
        .single();

      if (repoError || !repo) {
        return this.response.sendError(res, "Repository not found", 404);
      }

      const isOwner = repo.projects?.owner_id === userId;
      if (!isOwner && req.user?.role !== "admin") {
        return this.response.sendError(res, "Access denied", 403);
      }

      const branches = await this.service.getBranches(repositoryId);

      return this.response.sendSuccess(res, {
        data: branches,
        count: branches.length,
      });
    } catch (error) {
      logger.error("Error getting branches:", error);
      return this.response.sendError(res, error.message, 400);
    }
  }

  /**
   * Get pull requests from a repository
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response
   */
  async getPullRequests(req, res) {
    try {
      const { repositoryId } = req.params;
      const filters = req.query;
      const userId = req.user?.id;

      // Verify repository access
      const { data: repo, error: repoError } = await supabase
        .from("github_repositories")
        .select("id, project_id, projects(owner_id)")
        .eq("id", repositoryId)
        .single();

      if (repoError || !repo) {
        return this.response.sendError(res, "Repository not found", 404);
      }

      const isOwner = repo.projects?.owner_id === userId;
      if (!isOwner && req.user?.role !== "admin") {
        return this.response.sendError(res, "Access denied", 403);
      }

      const result = await this.service.getPullRequests(repositoryId, filters);

      return this.response.sendPaginated(
        res,
        result.data,
        result.pagination.page,
        result.pagination.limit,
        result.pagination.total
      );
    } catch (error) {
      logger.error("Error getting pull requests:", error);
      return this.response.sendError(res, error.message, 400);
    }
  }

  /**
   * Get issues from a repository
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response
   */
  async getIssues(req, res) {
    try {
      const { repositoryId } = req.params;
      const filters = req.query;
      const userId = req.user?.id;

      // Verify repository access
      const { data: repo, error: repoError } = await supabase
        .from("github_repositories")
        .select("id, project_id, projects(owner_id)")
        .eq("id", repositoryId)
        .single();

      if (repoError || !repo) {
        return this.response.sendError(res, "Repository not found", 404);
      }

      const isOwner = repo.projects?.owner_id === userId;
      if (!isOwner && req.user?.role !== "admin") {
        return this.response.sendError(res, "Access denied", 403);
      }

      const result = await this.service.getIssues(repositoryId, filters);

      return this.response.sendPaginated(
        res,
        result.data,
        result.pagination.page,
        result.pagination.limit,
        result.pagination.total
      );
    } catch (error) {
      logger.error("Error getting issues:", error);
      return this.response.sendError(res, error.message, 400);
    }
  }

  /**
   * Setup GitHub webhook
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response
   */
  async setupWebhook(req, res) {
    try {
      const { repositoryId } = req.params;
      const { webhookUrl, events, active, contentType } = req.body;
      const userId = req.user?.id;

      // Verify repository access
      const { data: repo, error: repoError } = await supabase
        .from("github_repositories")
        .select("id, project_id, projects(owner_id)")
        .eq("id", repositoryId)
        .single();

      if (repoError || !repo) {
        return this.response.sendError(res, "Repository not found", 404);
      }

      const isOwner = repo.projects?.owner_id === userId;
      if (!isOwner && req.user?.role !== "admin") {
        return this.response.sendError(res, "Access denied", 403);
      }

      const result = await this.service.setupWebhook(repositoryId, {
        webhookUrl,
        events,
        active,
        contentType,
      });

      logger.info(
        `Webhook setup for repository ${repositoryId} by user ${userId}`
      );

      return this.response.sendSuccess(res, result);
    } catch (error) {
      logger.error("Error setting up webhook:", error);
      return this.response.sendError(res, error.message, 400);
    }
  }

  /**
   * GitHub webhook endpoint
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response
   */
  async webhookHandler(req, res) {
    try {
      const payload = req.body;
      const eventType = req.headers["x-github-event"];
      const deliveryId = req.headers["x-github-delivery"];
      const signature = req.headers["x-hub-signature-256"];

      // Validate webhook signature if configured
      // const isValid = await this.service.validateWebhookSignature(
      //   signature,
      //   JSON.stringify(payload),
      //   process.env.GITHUB_WEBHOOK_SECRET
      // );

      // if (!isValid) {
      //   return res.status(401).json({
      //     success: false,
      //     error: "Invalid webhook signature"
      //   });
      // }

      // Process webhook asynchronously
      setImmediate(async () => {
        try {
          await this.service.processWebhook(payload, eventType, deliveryId);
        } catch (error) {
          logger.error("Error processing webhook async:", error);
        }
      });

      // Acknowledge webhook immediately
      return res.status(200).json({
        success: true,
        message: "Webhook received",
        deliveryId,
      });
    } catch (error) {
      logger.error("Error handling webhook:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to process webhook",
      });
    }
  }

  /**
   * Get repository statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} Response
   */
  async getRepositoryStats(req, res) {
    try {
      const { repositoryId } = req.params;
      const userId = req.user?.id;

      // Verify repository access
      const { data: repo, error: repoError } = await supabase
        .from("github_repositories")
        .select("id, project_id, projects(owner_id)")
        .eq("id", repositoryId)
        .single();

      if (repoError || !repo) {
        return this.response.sendError(res, "Repository not found", 404);
      }

      const isOwner = repo.projects?.owner_id === userId;
      if (!isOwner && req.user?.role !== "admin") {
        return this.response.sendError(res, "Access denied", 403);
      }

      // Get repository info
      const { data: repoData, error: repoDataError } = await supabase
        .from("github_repositories")
        .select("*")
        .eq("id", repositoryId)
        .single();

      if (repoDataError || !repoData) {
        throw new Error("Repository not found");
      }

      // Get stats from all related tables
      const [commits, branches, prs, issues] = await Promise.all([
        supabase
          .from("github_commits")
          .select("*", { count: "exact" })
          .eq("repository_id", repositoryId),
        supabase
          .from("github_branches")
          .select("*", { count: "exact" })
          .eq("repository_id", repositoryId),
        supabase
          .from("github_pull_requests")
          .select("*", { count: "exact" })
          .eq("repository_id", repositoryId),
        supabase
          .from("github_issues")
          .select("*", { count: "exact" })
          .eq("repository_id", repositoryId),
      ]);

      // Get commit stats
      const commitStats = this.utils.calculateCommitStats(commits.data || []);

      // Get PR stats
      const prStats = {
        total: prs.count || 0,
        open: (prs.data || []).filter((pr) => pr.state === "open").length,
        closed: (prs.data || []).filter((pr) => pr.state === "closed").length,
        merged: (prs.data || []).filter((pr) => pr.state === "merged").length,
      };

      // Get issue stats
      const issueStats = {
        total: issues.count || 0,
        open: (issues.data || []).filter((issue) => issue.state === "open")
          .length,
        closed: (issues.data || []).filter((issue) => issue.state === "closed")
          .length,
      };

      return this.response.sendSuccess(res, {
        data: {
          repository: {
            id: repoData.id,
            name: repoData.repo_name,
            owner: repoData.repo_owner,
            url: repoData.repo_url,
            defaultBranch: repoData.default_branch,
            lastSyncedAt: repoData.last_synced_at,
          },
          commits: {
            total: commits.count || 0,
            stats: commitStats,
          },
          branches: {
            total: branches.count || 0,
          },
          pullRequests: prStats,
          issues: issueStats,
        },
      });
    } catch (error) {
      logger.error("Error getting repository stats:", error);
      return this.response.sendError(res, error.message, 400);
    }
  }
}

const gitHubController = new GitHubController();

module.exports = gitHubController;
module.exports.gitHubController = gitHubController;
