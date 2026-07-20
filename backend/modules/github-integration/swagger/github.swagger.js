/**
 * GitHub Integration Swagger Documentation
 */
const GitHubSwagger = {
  tags: [
    {
      name: "GitHub Integration",
      description: "GitHub repository integration endpoints",
    },
  ],

  components: {
    schemas: {
      GitHubRepository: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          project_id: { type: "string", format: "uuid" },
          repo_name: { type: "string" },
          repo_owner: { type: "string" },
          repo_url: { type: "string", format: "uri" },
          github_id: { type: "integer" },
          default_branch: { type: "string", default: "main" },
          last_synced_at: { type: "string", format: "date-time" },
          created_at: { type: "string", format: "date-time" },
          updated_at: { type: "string", format: "date-time" },
        },
      },

      GitHubCommit: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          repository_id: { type: "string", format: "uuid" },
          commit_sha: { type: "string" },
          author_name: { type: "string" },
          author_email: { type: "string" },
          commit_message: { type: "string" },
          committed_at: { type: "string", format: "date-time" },
          added_lines: { type: "integer" },
          removed_lines: { type: "integer" },
        },
      },

      GitHubPullRequest: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          repository_id: { type: "string", format: "uuid" },
          pr_number: { type: "integer" },
          title: { type: "string" },
          state: { type: "string", enum: ["open", "closed", "merged"] },
          author: { type: "string" },
          created_at_github: { type: "string", format: "date-time" },
          updated_at_github: { type: "string", format: "date-time" },
          merged_at: { type: "string", format: "date-time" },
          additions: { type: "integer" },
          deletions: { type: "integer" },
        },
      },

      GitHubIssue: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          repository_id: { type: "string", format: "uuid" },
          issue_number: { type: "integer" },
          title: { type: "string" },
          state: { type: "string", enum: ["open", "closed"] },
          author: { type: "string" },
          created_at_github: { type: "string", format: "date-time" },
          updated_at_github: { type: "string", format: "date-time" },
          closed_at: { type: "string", format: "date-time" },
        },
      },

      ConnectRepositoryRequest: {
        type: "object",
        required: ["repoUrl"],
        properties: {
          repoUrl: {
            type: "string",
            format: "uri",
            description: "GitHub repository URL",
            example: "https://github.com/username/repo-name",
          },
          defaultBranch: {
            type: "string",
            default: "main",
            description: "Default branch name",
          },
          accessToken: {
            type: "string",
            description: "GitHub personal access token (optional)",
          },
        },
      },

      WebhookSetupRequest: {
        type: "object",
        required: ["webhookUrl"],
        properties: {
          webhookUrl: {
            type: "string",
            format: "uri",
            description: "Webhook endpoint URL",
          },
          events: {
            type: "array",
            items: {
              type: "string",
              enum: [
                "push",
                "pull_request",
                "issues",
                "commit_comment",
                "create",
                "delete",
                "fork",
                "release",
              ],
            },
            default: ["push", "pull_request", "issues"],
          },
          active: {
            type: "boolean",
            default: true,
          },
          contentType: {
            type: "string",
            enum: ["json", "form"],
            default: "json",
          },
        },
      },

      CommitStats: {
        type: "object",
        properties: {
          totalCommits: { type: "integer" },
          totalAdditions: { type: "integer" },
          totalDeletions: { type: "integer" },
          totalChanges: { type: "integer" },
          authors: { type: "object" },
          topAuthors: { type: "object" },
          dateRange: {
            type: "object",
            properties: {
              from: { type: "string", format: "date-time" },
              to: { type: "string", format: "date-time" },
            },
          },
          averageChanges: { type: "number" },
          frequency: {
            type: "object",
            properties: {
              commitsPerDay: { type: "number" },
              commitsPerWeek: { type: "number" },
              commitsPerMonth: { type: "number" },
            },
          },
        },
      },

      SyncResponse: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          message: { type: "string" },
          data: {
            type: "object",
            properties: {
              commitsAdded: { type: "integer" },
              branchesUpdated: { type: "integer" },
              prsUpdated: { type: "integer" },
              issuesUpdated: { type: "integer" },
            },
          },
        },
      },

      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", default: false },
          error: { type: "string" },
          details: { type: "object" },
        },
      },
    },
  },

  paths: {
    "/api/projects/{projectId}/repositories": {
      get: {
        tags: ["GitHub Integration"],
        summary: "Get all GitHub repositories for a project",
        description:
          "Retrieves all connected GitHub repositories for the specified project",
        parameters: [
          {
            in: "path",
            name: "projectId",
            required: true,
            schema: { type: "string", format: "uuid" },
            description: "Project ID",
          },
        ],
        responses: {
          200: {
            description: "Successfully retrieved repositories",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/GitHubRepository" },
                    },
                    count: { type: "integer" },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid project ID",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Project not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      post: {
        tags: ["GitHub Integration"],
        summary: "Connect a GitHub repository",
        description: "Connect a GitHub repository to the specified project",
        parameters: [
          {
            in: "path",
            name: "projectId",
            required: true,
            schema: { type: "string", format: "uuid" },
            description: "Project ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ConnectRepositoryRequest" },
            },
          },
        },
        responses: {
          201: {
            description: "Repository connected successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/GitHubRepository" },
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid request data",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          409: {
            description: "Repository already connected",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },

    "/api/repositories/{repositoryId}": {
      delete: {
        tags: ["GitHub Integration"],
        summary: "Disconnect a GitHub repository",
        description: "Disconnect a GitHub repository from the project",
        parameters: [
          {
            in: "path",
            name: "repositoryId",
            required: true,
            schema: { type: "string", format: "uuid" },
            description: "Repository ID",
          },
        ],
        responses: {
          200: {
            description: "Repository disconnected successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          404: {
            description: "Repository not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },

    "/api/repositories/{repositoryId}/sync": {
      post: {
        tags: ["GitHub Integration"],
        summary: "Sync GitHub repository data",
        description:
          "Synchronize commits, branches, pull requests, and issues from GitHub",
        parameters: [
          {
            in: "path",
            name: "repositoryId",
            required: true,
            schema: { type: "string", format: "uuid" },
            description: "Repository ID",
          },
        ],
        responses: {
          200: {
            description: "Sync completed successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SyncResponse" },
              },
            },
          },
          400: {
            description: "Sync failed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },

    "/api/repositories/{repositoryId}/commits": {
      get: {
        tags: ["GitHub Integration"],
        summary: "Get repository commits",
        description:
          "Get commits from the GitHub repository with pagination and filters",
        parameters: [
          {
            in: "path",
            name: "repositoryId",
            required: true,
            schema: { type: "string", format: "uuid" },
            description: "Repository ID",
          },
          {
            in: "query",
            name: "page",
            schema: { type: "integer", default: 1 },
            description: "Page number",
          },
          {
            in: "query",
            name: "limit",
            schema: { type: "integer", default: 20, maximum: 100 },
            description: "Items per page",
          },
          {
            in: "query",
            name: "branch",
            schema: { type: "string" },
            description: "Filter by branch",
          },
          {
            in: "query",
            name: "fromDate",
            schema: { type: "string", format: "date" },
            description: "Filter commits from date",
          },
          {
            in: "query",
            name: "toDate",
            schema: { type: "string", format: "date" },
            description: "Filter commits to date",
          },
          {
            in: "query",
            name: "author",
            schema: { type: "string" },
            description: "Filter by author name",
          },
        ],
        responses: {
          200: {
            description: "Commits retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/GitHubCommit" },
                    },
                    pagination: {
                      type: "object",
                      properties: {
                        page: { type: "integer" },
                        limit: { type: "integer" },
                        total: { type: "integer" },
                        pages: { type: "integer" },
                      },
                    },
                    stats: { $ref: "#/components/schemas/CommitStats" },
                  },
                },
              },
            },
          },
        },
      },
    },

    "/api/repositories/{repositoryId}/branches": {
      get: {
        tags: ["GitHub Integration"],
        summary: "Get repository branches",
        description: "Get all branches from the GitHub repository",
        parameters: [
          {
            in: "path",
            name: "repositoryId",
            required: true,
            schema: { type: "string", format: "uuid" },
            description: "Repository ID",
          },
        ],
        responses: {
          200: {
            description: "Branches retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string", format: "uuid" },
                          branch_name: { type: "string" },
                          is_default: { type: "boolean" },
                          last_commit_sha: { type: "string" },
                          last_commit_message: { type: "string" },
                          last_commit_date: {
                            type: "string",
                            format: "date-time",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    "/api/repositories/{repositoryId}/pull-requests": {
      get: {
        tags: ["GitHub Integration"],
        summary: "Get repository pull requests",
        description:
          "Get pull requests from the GitHub repository with filtering",
        parameters: [
          {
            in: "path",
            name: "repositoryId",
            required: true,
            schema: { type: "string", format: "uuid" },
            description: "Repository ID",
          },
          {
            in: "query",
            name: "state",
            schema: {
              type: "string",
              enum: ["open", "closed", "merged", "all"],
              default: "all",
            },
            description: "Filter by pull request state",
          },
          {
            in: "query",
            name: "page",
            schema: { type: "integer", default: 1 },
            description: "Page number",
          },
          {
            in: "query",
            name: "limit",
            schema: { type: "integer", default: 20, maximum: 100 },
            description: "Items per page",
          },
        ],
        responses: {
          200: {
            description: "Pull requests retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/GitHubPullRequest" },
                    },
                    pagination: {
                      type: "object",
                      properties: {
                        page: { type: "integer" },
                        limit: { type: "integer" },
                        total: { type: "integer" },
                        pages: { type: "integer" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    "/api/repositories/{repositoryId}/issues": {
      get: {
        tags: ["GitHub Integration"],
        summary: "Get repository issues",
        description: "Get issues from the GitHub repository with filtering",
        parameters: [
          {
            in: "path",
            name: "repositoryId",
            required: true,
            schema: { type: "string", format: "uuid" },
            description: "Repository ID",
          },
          {
            in: "query",
            name: "state",
            schema: {
              type: "string",
              enum: ["open", "closed", "all"],
              default: "all",
            },
            description: "Filter by issue state",
          },
          {
            in: "query",
            name: "labels",
            schema: { type: "string" },
            description: "Filter by labels (comma separated)",
          },
          {
            in: "query",
            name: "page",
            schema: { type: "integer", default: 1 },
            description: "Page number",
          },
          {
            in: "query",
            name: "limit",
            schema: { type: "integer", default: 20, maximum: 100 },
            description: "Items per page",
          },
        ],
        responses: {
          200: {
            description: "Issues retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/GitHubIssue" },
                    },
                    pagination: {
                      type: "object",
                      properties: {
                        page: { type: "integer" },
                        limit: { type: "integer" },
                        total: { type: "integer" },
                        pages: { type: "integer" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    "/api/repositories/{repositoryId}/webhook": {
      post: {
        tags: ["GitHub Integration"],
        summary: "Setup GitHub webhook",
        description: "Configure a webhook for the GitHub repository",
        parameters: [
          {
            in: "path",
            name: "repositoryId",
            required: true,
            schema: { type: "string", format: "uuid" },
            description: "Repository ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/WebhookSetupRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Webhook setup successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "object",
                      properties: {
                        webhookId: { type: "integer" },
                        url: { type: "string", format: "uri" },
                        events: { type: "array", items: { type: "string" } },
                        active: { type: "boolean" },
                      },
                    },
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid webhook configuration",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
  },
};

module.exports = GitHubSwagger;
