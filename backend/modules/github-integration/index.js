/**
 * GitHub Integration Module
 * Exports routes and configurations
 */

const githubRoutes = require("./routes/github.routes");
const GitHubService = require("./services/github.service");
const GitHubController = require("./controllers/github.controller");
const GitHubMiddleware = require("./middleware/github.middleware");
const GitHubUtils = require("./utils/github.utils");
const GitHubValidation = require("./validations/github.validation");
const GitHubSwagger = require("./swagger/github.swagger");

module.exports = {
  routes: githubRoutes,
  service: GitHubService,
  controller: GitHubController,
  middleware: GitHubMiddleware,
  utils: GitHubUtils,
  validation: GitHubValidation,
  swagger: GitHubSwagger,
};
