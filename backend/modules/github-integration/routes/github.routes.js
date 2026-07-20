const express = require("express");
const router = express.Router();
const GitHubController = require("../controllers/github.controller");
const GitHubMiddleware = require("../middleware/github.middleware");
const GitHubValidation = require("../validations/github.validation");
const {
  validateRequest,
  validateQuery,
  validateParams,
} = require("../../../common/middleware/validation.middleware");
const {
  authenticate,
  authorize,
} = require("../../../common/middleware/auth.middleware");
const {
  rateLimiter,
} = require("../../../common/middleware/security.middleware");

const controller = new GitHubController();
const middleware = new GitHubMiddleware();

/**
 * @route   GET /api/projects/:projectId/repositories
 * @desc    Get all GitHub repositories for a project
 * @access  Private
 */
router.get(
  "/projects/:projectId/repositories",
  authenticate,
  validateParams({
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
  authenticate,
  rateLimiter,
  validateParams({
    projectId: GitHubValidation.repositoryId,
  }),
  validateRequest(GitHubValidation.connectRepository),
  controller.connectRepository.bind(controller)
);

/**
 * @route   DELETE /api/repositories/:repositoryId
 * @desc    Disconnect a GitHub repository
 * @access  Private
 */
router.delete(
  "/repositories/:repositoryId",
  authenticate,
  validateParams({
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
  authenticate,
  validateParams({
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
  authenticate,
  validateParams({
    repositoryId: GitHubValidation.repositoryId,
  }),
  validateQuery(GitHubValidation.getCommits),
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
  authenticate,
  validateParams({
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
  authenticate,
  validateParams({
    repositoryId: GitHubValidation.repositoryId,
  }),
  validateQuery(GitHubValidation.getPullRequests),
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
  authenticate,
  validateParams({
    repositoryId: GitHubValidation.repositoryId,
  }),
  validateQuery(GitHubValidation.getIssues),
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
  authenticate,
  validateParams({
    repositoryId: GitHubValidation.repositoryId,
  }),
  validateRequest(GitHubValidation.setupWebhook),
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
  authenticate,
  validateParams({
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

module.exports = router;
