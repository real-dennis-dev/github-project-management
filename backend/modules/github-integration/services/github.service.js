const { supabase } = require("../../../common/config/supabase");
const logger = require("../../../common/config/logger");
const GitHubUtils = require("../utils/github.utils");
const { Octokit } = require("@octokit/rest");

/**
 * GitHub Service - Handles GitHub API interactions and data management
 */
class GitHubService {
  constructor() {
    this.utils = GitHubUtils;
    this.octokit = null;
  }

  /**
   * Initialize Octokit client with token
   * @param {string} token - GitHub access token
   */
  _initializeOctokit(token) {
    if (token) {
      this.octokit = new Octokit({ auth: token });
    } else if (this.octokit) {
      this.octokit = new Octokit({
        auth: process.env.GITHUB_ACCESS_TOKEN,
        userAgent: "ProjectManagementApp v1.0.0",
      });
    }
    return this.octokit;
  }

  /**
   * Connect GitHub repository to project
   * @param {string} projectId - Project UUID
   * @param {Object} repoData - { repoUrl, defaultBranch, accessToken }
   * @returns {Promise<Object>} Connected repository data
   */
  async connectRepository(projectId, repoData) {
    try {
      const { repoUrl, defaultBranch = "main", accessToken } = repoData;

      // Parse GitHub URL
      const { owner, repo } = this.utils.parseGitHubUrl(repoUrl);

      // Validate project exists
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .select("id")
        .eq("id", projectId)
        .single();

      if (projectError || !project) {
        throw new Error("Project not found");
      }

      // Check if repository already connected
      const { data: existingRepo } = await supabase
        .from("github_repositories")
        .select("id")
        .eq("project_id", projectId)
        .eq("repo_name", repo)
        .eq("repo_owner", owner)
        .single();

      if (existingRepo) {
        throw new Error("Repository already connected to this project");
      }

      // Initialize Octokit
      const octokit = this._initializeOctokit(accessToken);

      // Get repository details from GitHub
      let repoInfo;
      try {
        const response = await octokit.rest.repos.get({
          owner,
          repo,
        });
        repoInfo = response.data;
      } catch (error) {
        throw this.utils.handleGitHubError(error, "Repository fetch");
      }

      // Insert repository into database
      const { data, error } = await supabase
        .from("github_repositories")
        .insert({
          project_id: projectId,
          repo_name: repo,
          repo_owner: owner,
          repo_url: repoUrl,
          github_id: repoInfo.id,
          default_branch: defaultBranch,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to save repository: ${error.message}`);
      }

      // Initial sync
      await this.syncRepository(data.id, accessToken);

      logger.info(
        `Repository ${owner}/${repo} connected to project ${projectId}`
      );

      return data;
    } catch (error) {
      logger.error("Error connecting repository:", error);
      throw error;
    }
  }

  /**
   * Disconnect GitHub repository
   * @param {string} repositoryId - Repository UUID
   * @returns {Promise<Object>} Disconnection result
   */
  async disconnectRepository(repositoryId) {
    try {
      // Get repository info
      const { data: repo, error: repoError } = await supabase
        .from("github_repositories")
        .select("id, repo_name, repo_owner")
        .eq("id", repositoryId)
        .single();

      if (repoError || !repo) {
        throw new Error("Repository not found");
      }

      // Delete associated data (cascading)
      const { error } = await supabase
        .from("github_repositories")
        .delete()
        .eq("id", repositoryId);

      if (error) {
        throw new Error(`Failed to disconnect repository: ${error.message}`);
      }

      logger.info(
        `Repository ${repo.repo_owner}/${repo.repo_name} disconnected`
      );

      return {
        success: true,
        message: "Repository disconnected successfully",
      };
    } catch (error) {
      logger.error("Error disconnecting repository:", error);
      throw error;
    }
  }

  /**
   * Sync repository data from GitHub
   * @param {string} repositoryId - Repository UUID
   * @param {string} accessToken - GitHub access token
   * @returns {Promise<Object>} Sync results
   */
  async syncRepository(repositoryId, accessToken) {
    try {
      const results = {
        commitsAdded: 0,
        branchesUpdated: 0,
        prsUpdated: 0,
        issuesUpdated: 0,
      };

      // Get repository info
      const { data: repo, error: repoError } = await supabase
        .from("github_repositories")
        .select("*")
        .eq("id", repositoryId)
        .single();

      if (repoError || !repo) {
        throw new Error("Repository not found");
      }

      // Initialize Octokit
      const octokit = this._initializeOctokit(
        accessToken || process.env.GITHUB_ACCESS_TOKEN
      );

      // Sync commits
      const commitsResult = await this._syncCommits(repo, octokit);
      results.commitsAdded = commitsResult.added;

      // Sync branches
      const branchesResult = await this._syncBranches(repo, octokit);
      results.branchesUpdated = branchesResult.updated;

      // Sync pull requests
      const prsResult = await this._syncPullRequests(repo, octokit);
      results.prsUpdated = prsResult.updated;

      // Sync issues
      const issuesResult = await this._syncIssues(repo, octokit);
      results.issuesUpdated = issuesResult.updated;

      // Update last_synced_at
      await supabase
        .from("github_repositories")
        .update({ last_synced_at: new Date().toISOString() })
        .eq("id", repositoryId);

      logger.info(
        `Repository ${repo.repo_owner}/${repo.repo_name} sync completed`,
        results
      );

      return {
        success: true,
        message: "Repository synced successfully",
        data: results,
      };
    } catch (error) {
      logger.error("Error syncing repository:", error);
      throw error;
    }
  }

  /**
   * Sync commits from GitHub
   * @private
   */
  async _syncCommits(repo, octokit) {
    try {
      const { owner, repo: repoName, default_branch } = repo;

      // Get commits from GitHub
      const response = await octokit.rest.repos.listCommits({
        owner,
        repo: repoName,
        sha: default_branch,
        per_page: 100,
      });

      const commits = response.data;
      let added = 0;

      for (const commit of commits) {
        // Check if commit already exists
        const { data: existing } = await supabase
          .from("github_commits")
          .select("id")
          .eq("repository_id", repo.id)
          .eq("commit_sha", commit.sha)
          .single();

        if (!existing) {
          // Insert commit
          const { error } = await supabase.from("github_commits").insert({
            repository_id: repo.id,
            commit_sha: commit.sha,
            author_name: commit.commit.author?.name || "Unknown",
            author_email: commit.commit.author?.email || "",
            commit_message: commit.commit.message || "",
            committed_at:
              commit.commit.author?.date || new Date().toISOString(),
            added_lines: commit.stats?.additions || 0,
            removed_lines: commit.stats?.deletions || 0,
          });

          if (!error) added++;
        }
      }

      return { added };
    } catch (error) {
      logger.error("Error syncing commits:", error);
      throw this.utils.handleGitHubError(error, "Commits sync");
    }
  }

  /**
   * Sync branches from GitHub
   * @private
   */
  async _syncBranches(repo, octokit) {
    try {
      const { owner, repo: repoName, default_branch } = repo;

      // Get branches from GitHub
      const response = await octokit.rest.repos.listBranches({
        owner,
        repo: repoName,
        per_page: 100,
      });

      const branches = response.data;
      let updated = 0;

      // First, get all existing branches
      const { data: existingBranches } = await supabase
        .from("github_branches")
        .select("branch_name, id")
        .eq("repository_id", repo.id);

      const existingBranchNames = new Set(
        existingBranches.map((b) => b.branch_name)
      );

      for (const branch of branches) {
        const isDefault = branch.name === default_branch;
        const lastCommitSha = branch.commit?.sha;

        if (existingBranchNames.has(branch.name)) {
          // Update existing branch
          const { error } = await supabase
            .from("github_branches")
            .update({
              is_default: isDefault,
              last_commit_sha: lastCommitSha,
              updated_at: new Date().toISOString(),
            })
            .eq("repository_id", repo.id)
            .eq("branch_name", branch.name);

          if (!error) updated++;
        } else {
          // Insert new branch
          const { error } = await supabase.from("github_branches").insert({
            repository_id: repo.id,
            branch_name: branch.name,
            is_default: isDefault,
            last_commit_sha: lastCommitSha,
          });

          if (!error) updated++;
        }
      }

      return { updated };
    } catch (error) {
      logger.error("Error syncing branches:", error);
      throw this.utils.handleGitHubError(error, "Branches sync");
    }
  }

  /**
   * Sync pull requests from GitHub
   * @private
   */
  async _syncPullRequests(repo, octokit) {
    try {
      const { owner, repo: repoName } = repo;
      let updated = 0;

      // Get pull requests from GitHub
      const response = await octokit.rest.pulls.list({
        owner,
        repo: repoName,
        state: "all",
        per_page: 100,
      });

      const prs = response.data;

      for (const pr of prs) {
        // Check if PR already exists
        const { data: existing } = await supabase
          .from("github_pull_requests")
          .select("id")
          .eq("repository_id", repo.id)
          .eq("pr_number", pr.number)
          .single();

        const prData = this.utils.extractPRDetails(pr);

        if (existing) {
          // Update existing PR
          const { error } = await supabase
            .from("github_pull_requests")
            .update({
              title: prData.title,
              state: prData.state,
              author: prData.author,
              updated_at_github: prData.updated_at_github,
              merged_at: prData.merged_at,
              additions: prData.additions,
              deletions: prData.deletions,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existing.id);

          if (!error) updated++;
        } else {
          // Insert new PR
          const { error } = await supabase.from("github_pull_requests").insert({
            repository_id: repo.id,
            pr_number: prData.pr_number,
            title: prData.title,
            state: prData.state,
            author: prData.author,
            created_at_github: prData.created_at_github,
            updated_at_github: prData.updated_at_github,
            merged_at: prData.merged_at,
            additions: prData.additions,
            deletions: prData.deletions,
          });

          if (!error) updated++;
        }
      }

      return { updated };
    } catch (error) {
      logger.error("Error syncing pull requests:", error);
      throw this.utils.handleGitHubError(error, "Pull Requests sync");
    }
  }

  /**
   * Sync issues from GitHub
   * @private
   */
  async _syncIssues(repo, octokit) {
    try {
      const { owner, repo: repoName } = repo;
      let updated = 0;

      // Get issues from GitHub
      const response = await octokit.rest.issues.listForRepo({
        owner,
        repo: repoName,
        state: "all",
        per_page: 100,
      });

      const issues = response.data;

      for (const issue of issues) {
        // Skip pull requests (they appear in issues list)
        if (issue.pull_request) continue;

        // Check if issue already exists
        const { data: existing } = await supabase
          .from("github_issues")
          .select("id")
          .eq("repository_id", repo.id)
          .eq("issue_number", issue.number)
          .single();

        const issueData = this.utils.extractIssueDetails(issue);

        if (existing) {
          // Update existing issue
          const { error } = await supabase
            .from("github_issues")
            .update({
              title: issueData.title,
              state: issueData.state,
              author: issueData.author,
              updated_at_github: issueData.updated_at_github,
              closed_at: issueData.closed_at,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existing.id);

          if (!error) updated++;
        } else {
          // Insert new issue
          const { error } = await supabase.from("github_issues").insert({
            repository_id: repo.id,
            issue_number: issueData.issue_number,
            title: issueData.title,
            state: issueData.state,
            author: issueData.author,
            created_at_github: issueData.created_at_github,
            updated_at_github: issueData.updated_at_github,
            closed_at: issueData.closed_at,
          });

          if (!error) updated++;
        }
      }

      return { updated };
    } catch (error) {
      logger.error("Error syncing issues:", error);
      throw this.utils.handleGitHubError(error, "Issues sync");
    }
  }

  /**
   * Get commits with pagination and filters
   * @param {string} repositoryId - Repository UUID
   * @param {Object} filters - { page, limit, branch, fromDate, toDate, author, sortBy, sortOrder }
   * @returns {Promise<Object>} Commits data with pagination
   */
  async getCommits(repositoryId, filters = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        branch,
        fromDate,
        toDate,
        author,
        sortBy = "committed_at",
        sortOrder = "desc",
      } = filters;

      const offset = (page - 1) * limit;

      // Build query
      let query = supabase
        .from("github_commits")
        .select("*", { count: "exact" })
        .eq("repository_id", repositoryId);

      // Apply filters
      if (branch) {
        // Need to join with branches to filter by branch
        // This is simplified - in production, you'd need to handle this differently
      }

      if (fromDate) {
        query = query.gte("committed_at", fromDate);
      }

      if (toDate) {
        query = query.lte("committed_at", toDate);
      }

      if (author) {
        query = query.ilike("author_name", `%${author}%`);
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === "asc" });

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        throw new Error(`Failed to get commits: ${error.message}`);
      }

      // Calculate stats
      const stats = this.utils.calculateCommitStats(data);

      return {
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit),
        },
        stats,
      };
    } catch (error) {
      logger.error("Error getting commits:", error);
      throw error;
    }
  }

  /**
   * Get branches with details
   * @param {string} repositoryId - Repository UUID
   * @returns {Promise<Array>} Branches with details
   */
  async getBranches(repositoryId) {
    try {
      const { data, error } = await supabase
        .from("github_branches")
        .select("*")
        .eq("repository_id", repositoryId)
        .order("is_default", { ascending: false })
        .order("branch_name");

      if (error) {
        throw new Error(`Failed to get branches: ${error.message}`);
      }

      // Get last commit info for each branch
      const branchesWithDetails = await Promise.all(
        data.map(async (branch) => {
          if (branch.last_commit_sha) {
            const { data: commit } = await supabase
              .from("github_commits")
              .select("commit_message, committed_at, author_name")
              .eq("repository_id", repositoryId)
              .eq("commit_sha", branch.last_commit_sha)
              .single();

            return {
              ...branch,
              last_commit_message:
                commit?.commit_message || "No commit message",
              last_commit_date: commit?.committed_at || null,
              last_commit_author: commit?.author_name || "Unknown",
            };
          }
          return branch;
        })
      );

      return branchesWithDetails;
    } catch (error) {
      logger.error("Error getting branches:", error);
      throw error;
    }
  }

  /**
   * Get pull requests with filtering
   * @param {string} repositoryId - Repository UUID
   * @param {Object} filters - { state, page, limit, sort, order }
   * @returns {Promise<Object>} Pull requests with pagination
   */
  async getPullRequests(repositoryId, filters = {}) {
    try {
      const {
        state = "all",
        page = 1,
        limit = 20,
        sort = "created_at",
        order = "desc",
      } = filters;

      const offset = (page - 1) * limit;

      let query = supabase
        .from("github_pull_requests")
        .select("*", { count: "exact" })
        .eq("repository_id", repositoryId);

      if (state !== "all") {
        query = query.eq("state", state);
      }

      // Apply sorting
      const sortField =
        sort === "created_at"
          ? "created_at_github"
          : sort === "updated_at"
          ? "updated_at_github"
          : "merged_at";
      query = query.order(sortField, { ascending: order === "asc" });

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        throw new Error(`Failed to get pull requests: ${error.message}`);
      }

      return {
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit),
        },
      };
    } catch (error) {
      logger.error("Error getting pull requests:", error);
      throw error;
    }
  }

  /**
   * Get issues with filtering
   * @param {string} repositoryId - Repository UUID
   * @param {Object} filters - { state, labels, page, limit, sort, order }
   * @returns {Promise<Object>} Issues with pagination
   */
  async getIssues(repositoryId, filters = {}) {
    try {
      const {
        state = "all",
        labels,
        page = 1,
        limit = 20,
        sort = "created_at",
        order = "desc",
      } = filters;

      const offset = (page - 1) * limit;

      let query = supabase
        .from("github_issues")
        .select("*", { count: "exact" })
        .eq("repository_id", repositoryId);

      if (state !== "all") {
        query = query.eq("state", state);
      }

      // Apply sorting
      const sortField =
        sort === "created_at" ? "created_at_github" : "updated_at_github";
      query = query.order(sortField, { ascending: order === "asc" });

      // Apply pagination
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        throw new Error(`Failed to get issues: ${error.message}`);
      }

      return {
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit),
        },
      };
    } catch (error) {
      logger.error("Error getting issues:", error);
      throw error;
    }
  }

  /**
   * Process GitHub webhook event
   * @param {Object} payload - Webhook payload
   * @param {string} eventType - GitHub event type
   * @param {string} deliveryId - GitHub delivery ID
   * @returns {Promise<Object>} Processing result
   */
  async processWebhook(payload, eventType, deliveryId) {
    try {
      logger.info(`Processing webhook: ${eventType} (${deliveryId})`);

      const processed = this.utils.processWebhookPayload(payload, eventType);

      // Find repository by GitHub ID
      let repo;
      if (payload.repository?.id) {
        const { data } = await supabase
          .from("github_repositories")
          .select("*")
          .eq("github_id", payload.repository.id)
          .single();
        repo = data;
      }

      if (!repo) {
        throw new Error("Repository not found for webhook");
      }

      const octokit = this._initializeOctokit(process.env.GITHUB_ACCESS_TOKEN);

      // Handle different event types
      switch (eventType) {
        case "push":
          await this._handlePushWebhook(repo, processed);
          break;
        case "pull_request":
          await this._handlePullRequestWebhook(repo, processed);
          break;
        case "issues":
          await this._handleIssueWebhook(repo, processed);
          break;
        default:
          logger.info(`Unhandled webhook event type: ${eventType}`);
      }

      return {
        success: true,
        message: "Webhook processed successfully",
        eventType,
        processed,
      };
    } catch (error) {
      logger.error("Error processing webhook:", error);
      throw error;
    }
  }

  /**
   * Handle push webhook
   * @private
   */
  async _handlePushWebhook(repo, processed) {
    try {
      // Add new commits
      const commits = processed.commits || [];
      let added = 0;

      for (const commit of commits) {
        const { data: existing } = await supabase
          .from("github_commits")
          .select("id")
          .eq("repository_id", repo.id)
          .eq("commit_sha", commit.sha)
          .single();

        if (!existing) {
          const { error } = await supabase.from("github_commits").insert({
            repository_id: repo.id,
            commit_sha: commit.sha,
            author_name: commit.author || "Unknown",
            commit_message: commit.message || "",
            committed_at: commit.timestamp || new Date().toISOString(),
          });

          if (!error) added++;
        }
      }

      // Update branch info
      if (processed.branch) {
        const { error } = await supabase
          .from("github_branches")
          .update({
            last_commit_sha: processed.after,
            updated_at: new Date().toISOString(),
          })
          .eq("repository_id", repo.id)
          .eq("branch_name", processed.branch);

        if (error) {
          logger.error("Error updating branch from webhook:", error);
        }
      }

      logger.info(`Webhook push processed: ${added} new commits`);
    } catch (error) {
      logger.error("Error handling push webhook:", error);
      throw error;
    }
  }

  /**
   * Handle pull request webhook
   * @private
   */
  async _handlePullRequestWebhook(repo, processed) {
    try {
      const prData = processed.prData;
      if (!prData) return;

      // Check if PR exists
      const { data: existing } = await supabase
        .from("github_pull_requests")
        .select("id")
        .eq("repository_id", repo.id)
        .eq("pr_number", prData.pr_number)
        .single();

      if (existing) {
        // Update PR
        await supabase
          .from("github_pull_requests")
          .update({
            title: prData.title,
            state: prData.state,
            updated_at_github: prData.updated_at_github,
            merged_at: prData.merged_at,
            additions: prData.additions,
            deletions: prData.deletions,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
      } else {
        // Insert PR
        await supabase.from("github_pull_requests").insert({
          repository_id: repo.id,
          pr_number: prData.pr_number,
          title: prData.title,
          state: prData.state,
          author: prData.author,
          created_at_github: prData.created_at_github,
          updated_at_github: prData.updated_at_github,
          merged_at: prData.merged_at,
          additions: prData.additions,
          deletions: prData.deletions,
        });
      }

      logger.info(
        `Webhook PR ${processed.action} processed: #${prData.pr_number}`
      );
    } catch (error) {
      logger.error("Error handling pull request webhook:", error);
      throw error;
    }
  }

  /**
   * Handle issue webhook
   * @private
   */
  async _handleIssueWebhook(repo, processed) {
    try {
      const issueData = processed.issueData;
      if (!issueData) return;

      // Check if issue exists
      const { data: existing } = await supabase
        .from("github_issues")
        .select("id")
        .eq("repository_id", repo.id)
        .eq("issue_number", issueData.issue_number)
        .single();

      if (existing) {
        // Update issue
        await supabase
          .from("github_issues")
          .update({
            title: issueData.title,
            state: issueData.state,
            updated_at_github: issueData.updated_at_github,
            closed_at: issueData.closed_at,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
      } else {
        // Insert issue
        await supabase.from("github_issues").insert({
          repository_id: repo.id,
          issue_number: issueData.issue_number,
          title: issueData.title,
          state: issueData.state,
          author: issueData.author,
          created_at_github: issueData.created_at_github,
          updated_at_github: issueData.updated_at_github,
          closed_at: issueData.closed_at,
        });
      }

      logger.info(
        `Webhook issue ${processed.action} processed: #${issueData.issue_number}`
      );
    } catch (error) {
      logger.error("Error handling issue webhook:", error);
      throw error;
    }
  }

  /**
   * Setup GitHub webhook
   * @param {string} repositoryId - Repository UUID
   * @param {Object} config - { webhookUrl, events, active, contentType }
   * @returns {Promise<Object>} Webhook setup result
   */
  async setupWebhook(repositoryId, config) {
    try {
      const {
        webhookUrl,
        events = ["push", "pull_request", "issues"],
        active = true,
        contentType = "json",
      } = config;

      // Get repository info
      const { data: repo, error: repoError } = await supabase
        .from("github_repositories")
        .select("*")
        .eq("id", repositoryId)
        .single();

      if (repoError || !repo) {
        throw new Error("Repository not found");
      }

      // Initialize Octokit
      const octokit = this._initializeOctokit(process.env.GITHUB_ACCESS_TOKEN);

      // Create webhook on GitHub
      const webhookConfig = {
        owner: repo.repo_owner,
        repo: repo.repo_name,
        name: "web",
        active,
        events,
        config: {
          url: webhookUrl,
          content_type: contentType === "json" ? "json" : "form",
          insecure_ssl: "0",
        },
      };

      let response;
      try {
        response = await octokit.rest.repos.createWebhook(webhookConfig);
      } catch (error) {
        throw this.utils.handleGitHubError(error, "Webhook creation");
      }

      logger.info(
        `Webhook setup for ${repo.repo_owner}/${repo.repo_name}: ${response.data.id}`
      );

      return {
        success: true,
        data: {
          webhookId: response.data.id,
          url: response.data.config.url,
          events: response.data.events,
          active: response.data.active,
        },
        message: "Webhook setup successfully",
      };
    } catch (error) {
      logger.error("Error setting up webhook:", error);
      throw error;
    }
  }
  /**
   * Get aggregated GitHub dashboard statistics across all accessible projects
   *
   * This endpoint intentionally does NOT accept a projectId.
   *
   * @param {string} userId - Authenticated user ID
   * @param {boolean} isAdmin - Whether authenticated user is an admin
   * @param {Object} filters - { page, limit }
   * @returns {Promise<Object>} Aggregated GitHub dashboard statistics
   */
  async getGitHubStats(userId, isAdmin = false, filters = {}) {
    try {
      const { page = 1, limit = 20 } = filters;

      const offset = (page - 1) * limit;

      /*
       * ---------------------------------------------------------
       * 1. Get projects accessible to the current user
       * ---------------------------------------------------------
       */

      let projectsQuery = supabase
        .from("projects")
        .select("id, name, owner_id, created_at");

      if (!isAdmin) {
        projectsQuery = projectsQuery.eq("owner_id", userId);
      }

      const { data: projects, error: projectsError } = await projectsQuery;

      if (projectsError) {
        throw new Error(
          `Failed to fetch accessible projects: ${projectsError.message}`
        );
      }

      const projectList = projects || [];

      if (projectList.length === 0) {
        return {
          summary: {
            projects: 0,
            repositories: 0,
            commits: 0,
            branches: 0,
            pullRequests: 0,
            issues: 0,
            openPullRequests: 0,
            mergedPullRequests: 0,
            closedPullRequests: 0,
            openIssues: 0,
            closedIssues: 0,
          },

          projects: [],

          activity: [],

          pagination: {
            page,
            limit,
            total: 0,
            pages: 0,
          },

          generatedAt: new Date().toISOString(),
        };
      }

      const projectIds = projectList.map((project) => project.id);

      /*
       * ---------------------------------------------------------
       * 2. Get all GitHub repositories belonging to those projects
       * ---------------------------------------------------------
       */

      const { data: repositories, error: repositoriesError } = await supabase
        .from("github_repositories")
        .select(
          `
        id,
        project_id,
        repo_name,
        repo_owner,
        repo_url,
        github_id,
        default_branch,
        last_synced_at,
        created_at
      `
        )
        .in("project_id", projectIds)
        .order("last_synced_at", { ascending: false, nullsFirst: false });

      if (repositoriesError) {
        throw new Error(
          `Failed to fetch GitHub repositories: ${repositoriesError.message}`
        );
      }

      const repositoryList = repositories || [];

      if (repositoryList.length === 0) {
        return {
          summary: {
            projects: projectList.length,
            repositories: 0,
            commits: 0,
            branches: 0,
            pullRequests: 0,
            issues: 0,
            openPullRequests: 0,
            mergedPullRequests: 0,
            closedPullRequests: 0,
            openIssues: 0,
            closedIssues: 0,
          },

          projects: projectList.map((project) => ({
            projectId: project.id,
            projectName: project.name,
            repositories: [],
            stats: {
              repositories: 0,
              commits: 0,
              branches: 0,
              pullRequests: 0,
              issues: 0,
            },
            latestActivityAt: null,
          })),

          activity: [],

          pagination: {
            page,
            limit,
            total: 0,
            pages: 0,
          },

          generatedAt: new Date().toISOString(),
        };
      }

      const repositoryIds = repositoryList.map((repo) => repo.id);

      /*
       * ---------------------------------------------------------
       * 3. Fetch all GitHub data
       *
       * We fetch only the columns required by the dashboard.
       * ---------------------------------------------------------
       */

      const [commitsResult, branchesResult, pullRequestsResult, issuesResult] =
        await Promise.all([
          supabase
            .from("github_commits")
            .select(
              `
          id,
          repository_id,
          commit_sha,
          author_name,
          commit_message,
          committed_at,
          added_lines,
          removed_lines
        `
            )
            .in("repository_id", repositoryIds),

          supabase
            .from("github_branches")
            .select(
              `
          id,
          repository_id,
          branch_name,
          is_default,
          updated_at
        `
            )
            .in("repository_id", repositoryIds),

          supabase
            .from("github_pull_requests")
            .select(
              `
          id,
          repository_id,
          pr_number,
          title,
          state,
          author,
          created_at_github,
          updated_at_github,
          merged_at,
          additions,
          deletions
        `
            )
            .in("repository_id", repositoryIds),

          supabase
            .from("github_issues")
            .select(
              `
          id,
          repository_id,
          issue_number,
          title,
          state,
          author,
          created_at_github,
          updated_at_github,
          closed_at
        `
            )
            .in("repository_id", repositoryIds),
        ]);

      if (commitsResult.error) {
        throw new Error(
          `Failed to fetch commits: ${commitsResult.error.message}`
        );
      }

      if (branchesResult.error) {
        throw new Error(
          `Failed to fetch branches: ${branchesResult.error.message}`
        );
      }

      if (pullRequestsResult.error) {
        throw new Error(
          `Failed to fetch pull requests: ${pullRequestsResult.error.message}`
        );
      }

      if (issuesResult.error) {
        throw new Error(
          `Failed to fetch issues: ${issuesResult.error.message}`
        );
      }

      const commits = commitsResult.data || [];
      const branches = branchesResult.data || [];
      const pullRequests = pullRequestsResult.data || [];
      const issues = issuesResult.data || [];

      /*
       * ---------------------------------------------------------
       * 4. Create lookup maps
       * ---------------------------------------------------------
       */

      const projectMap = new Map(
        projectList.map((project) => [project.id, project])
      );

      const repositoryMap = new Map(
        repositoryList.map((repository) => [repository.id, repository])
      );

      /*
       * ---------------------------------------------------------
       * 5. Overall summary
       * ---------------------------------------------------------
       */

      const summary = {
        projects: projectList.length,

        repositories: repositoryList.length,

        commits: commits.length,

        branches: branches.length,

        pullRequests: pullRequests.length,

        issues: issues.length,

        openPullRequests: pullRequests.filter((pr) => pr.state === "open")
          .length,

        mergedPullRequests: pullRequests.filter((pr) => pr.state === "merged")
          .length,

        closedPullRequests: pullRequests.filter((pr) => pr.state === "closed")
          .length,

        openIssues: issues.filter((issue) => issue.state === "open").length,

        closedIssues: issues.filter((issue) => issue.state === "closed").length,

        totalAdditions: commits.reduce(
          (total, commit) => total + (commit.added_lines || 0),
          0
        ),

        totalDeletions: commits.reduce(
          (total, commit) => total + (commit.removed_lines || 0),
          0
        ),
      };

      summary.totalChanges = summary.totalAdditions + summary.totalDeletions;

      /*
       * ---------------------------------------------------------
       * 6. Build project statistics
       * ---------------------------------------------------------
       */

      const projectStatsMap = new Map();

      for (const project of projectList) {
        projectStatsMap.set(project.id, {
          projectId: project.id,
          projectName: project.name,

          repositories: [],

          stats: {
            repositories: 0,
            commits: 0,
            branches: 0,
            pullRequests: 0,
            issues: 0,
            openPullRequests: 0,
            mergedPullRequests: 0,
            openIssues: 0,
            closedIssues: 0,
          },

          latestActivityAt: null,
        });
      }

      /*
       * ---------------------------------------------------------
       * 7. Build repository statistics
       * ---------------------------------------------------------
       */

      for (const repository of repositoryList) {
        const projectStats = projectStatsMap.get(repository.project_id);

        if (!projectStats) {
          continue;
        }

        const repositoryCommits = commitsByRepository.get(repository.id) || [];

        const repositoryBranches =
          branchesByRepository.get(repository.id) || [];

        const repositoryPRs = prsByRepository.get(repository.id) || [];

        const repositoryIssues = issuesByRepository.get(repository.id) || [];

        const commitDates = repositoryCommits
          .map((commit) => commit.committed_at)
          .filter(Boolean);

        const prDates = repositoryPRs
          .map((pr) => pr.updated_at_github || pr.created_at_github)
          .filter(Boolean);

        const issueDates = repositoryIssues
          .map((issue) => issue.updated_at_github || issue.created_at_github)
          .filter(Boolean);

        const allDates = [...commitDates, ...prDates, ...issueDates]
          .map((date) => new Date(date))
          .filter((date) => !isNaN(date));

        const latestActivityAt =
          allDates.length > 0
            ? new Date(
                Math.max(...allDates.map((date) => date.getTime()))
              ).toISOString()
            : repository.last_synced_at;

        const repositoryStats = {
          repositoryId: repository.id,

          projectId: repository.project_id,

          name: repository.repo_name,

          owner: repository.repo_owner,

          url: repository.repo_url,

          defaultBranch: repository.default_branch,

          lastSyncedAt: repository.last_synced_at,

          latestActivityAt,

          stats: {
            commits: repositoryCommits.length,

            branches: repositoryBranches.length,

            pullRequests: repositoryPRs.length,

            issues: repositoryIssues.length,

            openPullRequests: repositoryPRs.filter((pr) => pr.state === "open")
              .length,

            mergedPullRequests: repositoryPRs.filter(
              (pr) => pr.state === "merged"
            ).length,

            closedPullRequests: repositoryPRs.filter(
              (pr) => pr.state === "closed"
            ).length,

            openIssues: repositoryIssues.filter(
              (issue) => issue.state === "open"
            ).length,

            closedIssues: repositoryIssues.filter(
              (issue) => issue.state === "closed"
            ).length,

            additions: repositoryCommits.reduce(
              (total, commit) => total + (commit.added_lines || 0),
              0
            ),

            deletions: repositoryCommits.reduce(
              (total, commit) => total + (commit.removed_lines || 0),
              0
            ),
          },
        };

        repositoryStats.stats.totalChanges =
          repositoryStats.stats.additions + repositoryStats.stats.deletions;

        projectStats.repositories.push(repositoryStats);

        projectStats.stats.repositories += 1;

        projectStats.stats.commits += repositoryStats.stats.commits;
        projectStats.stats.branches += repositoryStats.stats.branches;
        projectStats.stats.pullRequests += repositoryStats.stats.pullRequests;
        projectStats.stats.issues += repositoryStats.stats.issues;

        projectStats.stats.openPullRequests +=
          repositoryStats.stats.openPullRequests;

        projectStats.stats.mergedPullRequests +=
          repositoryStats.stats.mergedPullRequests;

        projectStats.stats.openIssues += repositoryStats.stats.openIssues;

        projectStats.stats.closedIssues += repositoryStats.stats.closedIssues;

        if (
          latestActivityAt &&
          (!projectStats.latestActivityAt ||
            new Date(latestActivityAt) >
              new Date(projectStats.latestActivityAt))
        ) {
          projectStats.latestActivityAt = latestActivityAt;
        }
      }

      const projectStats = Array.from(projectStatsMap.values())
        .filter((project) => project.repositories.length > 0)
        .sort(
          (a, b) =>
            new Date(b.latestActivityAt || 0) -
            new Date(a.latestActivityAt || 0)
        );

      /*
       * ---------------------------------------------------------
       * 8. Build unified activity feed
       *
       * This is what the dashboard can display as a
       * "latest activity" / "latest stats" list.
       * ---------------------------------------------------------
       */

      const activity = [];

      /*
       * Commits
       */

      for (const commit of commits) {
        const repository = repositoryMap.get(commit.repository_id);

        if (!repository) continue;

        const project = projectMap.get(repository.project_id);

        if (!project) continue;

        activity.push({
          id: commit.id,

          type: "commit",

          timestamp: commit.committed_at,

          project: {
            id: project.id,
            name: project.name,
          },

          repository: {
            id: repository.id,
            name: repository.repo_name,
            owner: repository.repo_owner,
            url: repository.repo_url,
          },

          data: {
            sha: commit.commit_sha,
            author: commit.author_name,
            message: commit.commit_message,
            additions: commit.added_lines || 0,
            deletions: commit.removed_lines || 0,
          },

          navigation: {
            repositoryId: repository.id,
            projectId: project.id,
            resource: "commits",
          },
        });
      }

      /*
       * Pull requests
       */

      for (const pr of pullRequests) {
        const repository = repositoryMap.get(pr.repository_id);

        if (!repository) continue;

        const project = projectMap.get(repository.project_id);

        if (!project) continue;

        activity.push({
          id: pr.id,

          type: "pull_request",

          timestamp: pr.updated_at_github || pr.created_at_github,

          project: {
            id: project.id,
            name: project.name,
          },

          repository: {
            id: repository.id,
            name: repository.repo_name,
            owner: repository.repo_owner,
            url: repository.repo_url,
          },

          data: {
            number: pr.pr_number,
            title: pr.title,
            state: pr.state,
            author: pr.author,
            createdAt: pr.created_at_github,
            updatedAt: pr.updated_at_github,
            mergedAt: pr.merged_at,
            additions: pr.additions || 0,
            deletions: pr.deletions || 0,
          },

          navigation: {
            repositoryId: repository.id,
            projectId: project.id,
            resource: "pull-requests",
            resourceId: pr.id,
          },
        });
      }

      /*
       * Issues
       */

      for (const issue of issues) {
        const repository = repositoryMap.get(issue.repository_id);

        if (!repository) continue;

        const project = projectMap.get(repository.project_id);

        if (!project) continue;

        activity.push({
          id: issue.id,

          type: "issue",

          timestamp: issue.updated_at_github || issue.created_at_github,

          project: {
            id: project.id,
            name: project.name,
          },

          repository: {
            id: repository.id,
            name: repository.repo_name,
            owner: repository.repo_owner,
            url: repository.repo_url,
          },

          data: {
            number: issue.issue_number,
            title: issue.title,
            state: issue.state,
            author: issue.author,
            createdAt: issue.created_at_github,
            updatedAt: issue.updated_at_github,
            closedAt: issue.closed_at,
          },

          navigation: {
            repositoryId: repository.id,
            projectId: project.id,
            resource: "issues",
            resourceId: issue.id,
          },
        });
      }

      /*
       * ---------------------------------------------------------
       * 9. Sort ALL activity by latest
       * ---------------------------------------------------------
       */

      activity.sort((a, b) => {
        return new Date(b.timestamp || 0) - new Date(a.timestamp || 0);
      });

      /*
       * ---------------------------------------------------------
       * 10. Paginate activity
       * ---------------------------------------------------------
       */

      const totalActivity = activity.length;

      const paginatedActivity = activity.slice(offset, offset + limit);

      /*
       * ---------------------------------------------------------
       * 11. Return dashboard response
       * ---------------------------------------------------------
       */

      return {
        summary,

        projects: projectStats,

        activity: paginatedActivity,

        pagination: {
          page,
          limit,
          total: totalActivity,
          pages: Math.ceil(totalActivity / limit),
        },

        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      logger.error("Error getting GitHub dashboard statistics:", error);

      throw error;
    }
  }
}

const gitHubService = new GitHubService();

module.exports = gitHubService;
module.exports.gitHubService = gitHubService;
