const express = require("express");
const router = express.Router();
const GitHubController = require("../controllers/github.controller");
const GitHubMiddleware = require("../middleware/github.middleware");
const GitHubValidation = require("../validations/github.validation");
const ValidationMiddleware = require("../../../common/middleware/validation.middleware");
const AuthMiddleware = require("../../../common/middleware/auth.middleware");
const SecurityMiddleware = require("../../../common/middleware/security.middleware");

const controller = GitHubController;
const middleware = GitHubMiddleware;

/**
 * @route   GET /api/projects/:projectId/repositories
 * @desc    Get all GitHub repositories for a project
 * @access  Private
 */
router.get(
  "/projects/:projectId/repositories",
  AuthMiddleware.authenticate,
  ValidationMiddleware.validateParams({
    projectId: GitHubValidation.repositoryId,
  }),
  controller.getRepositories.bind(controller)
);

/**
 * @route   POST /api/projects/:projectId/repositories
 * @desc    Connect a GitHub repository
 * @access  Private
 */
router.post(
  "/projects/:projectId/repositories",
  AuthMiddleware.authenticate,
  SecurityMiddleware.rateLimiter,
  ValidationMiddleware.validateParams({
    projectId: GitHubValidation.repositoryId,
  }),
  ValidationMiddleware.validateRequest(GitHubValidation.connectRepository),
  controller.connectRepository.bind(controller)
);

/**
 * @route   DELETE /api/repositories/:repositoryId
 * @desc    Disconnect a GitHub repository
 * @access  Private
 */
router.delete(
  "/repositories/:repositoryId",
  AuthMiddleware.authenticate,
  ValidationMiddleware.validateParams({
    repositoryId: GitHubValidation.repositoryId,
  }),
  middleware.validateRepositoryId.bind(middleware),
  controller.disconnectRepository.bind(controller)
);

/**
 * @route   POST /api/repositories/:repositoryId/sync
 * @desc    Sync GitHub repository data
 * @access  Private
 */
router.post(
  "/repositories/:repositoryId/sync",
  AuthMiddleware.authenticate,
  ValidationMiddleware.validateParams({
    repositoryId: GitHubValidation.repositoryId,
  }),
  middleware.validateRepositoryId.bind(middleware),
  controller.syncRepository.bind(controller)
);

/**
 * @route   GET /api/repositories/:repositoryId/commits
 * @desc    Get repository commits
 * @access  Private
 */
router.get(
  "/repositories/:repositoryId/commits",
  AuthMiddleware.authenticate,
  ValidationMiddleware.validateParams({
    repositoryId: GitHubValidation.repositoryId,
  }),
  ValidationMiddleware.validateQuery(GitHubValidation.getCommits),
  middleware.validateRepositoryId.bind(middleware),
  controller.getCommits.bind(controller)
);

/**
 * @route   GET /api/repositories/:repositoryId/branches
 * @desc    Get repository branches
 * @access  Private
 */
router.get(
  "/repositories/:repositoryId/branches",
  AuthMiddleware.authenticate,
  ValidationMiddleware.validateParams({
    repositoryId: GitHubValidation.repositoryId,
  }),
  middleware.validateRepositoryId.bind(middleware),
  controller.getBranches.bind(controller)
);

/**
 * @route   GET /api/repositories/:repositoryId/pull-requests
 * @desc    Get repository pull requests
 * @access  Private
 */
router.get(
  "/repositories/:repositoryId/pull-requests",
  AuthMiddleware.authenticate,
  ValidationMiddleware.validateParams({
    repositoryId: GitHubValidation.repositoryId,
  }),
  ValidationMiddleware.validateQuery(GitHubValidation.getPullRequests),
  middleware.validateRepositoryId.bind(middleware),
  controller.getPullRequests.bind(controller)
);

/**
 * @route   GET /api/repositories/:repositoryId/issues
 * @desc    Get repository issues
 * @access  Private
 */
router.get(
  "/repositories/:repositoryId/issues",
  AuthMiddleware.authenticate,
  ValidationMiddleware.validateParams({
    repositoryId: GitHubValidation.repositoryId,
  }),
  ValidationMiddleware.validateQuery(GitHubValidation.getIssues),
  middleware.validateRepositoryId.bind(middleware),
  controller.getIssues.bind(controller)
);

/**
 * @route   POST /api/repositories/:repositoryId/webhook
 * @desc    Setup GitHub webhook
 * @access  Private
 */
router.post(
  "/repositories/:repositoryId/webhook",
  AuthMiddleware.authenticate,
  ValidationMiddleware.validateParams({
    repositoryId: GitHubValidation.repositoryId,
  }),
  ValidationMiddleware.validateRequest(GitHubValidation.setupWebhook),
  middleware.validateRepositoryId.bind(middleware),
  controller.setupWebhook.bind(controller)
);

/**
 * @route   GET /api/repositories/:repositoryId/stats
 * @desc    Get repository statistics
 * @access  Private
 */
router.get(
  "/repositories/:repositoryId/stats",
  AuthMiddleware.authenticate,
  ValidationMiddleware.validateParams({
    repositoryId: GitHubValidation.repositoryId,
  }),
  middleware.validateRepositoryId.bind(middleware),
  controller.getRepositoryStats.bind(controller)
);

/**
 * @route   POST /api/webhooks/github
 * @desc    GitHub webhook endpoint (public)
 * @access  Public
 */
router.post(
  "/webhooks/github",
  middleware.validateWebhookSignature.bind(middleware),
  controller.webhookHandler.bind(controller)
);
/**
 * @route   GET /api/github/stats
 * @desc    Get aggregated GitHub dashboard statistics across all accessible projects
 * @access  Private
 */
router.get(
  "/github/stats",
  AuthMiddleware.authenticate,
  ValidationMiddleware.validateQuery(GitHubValidation.getGitHubStats),
  controller.getGitHubStats.bind(controller)
);
module.exports = router;
