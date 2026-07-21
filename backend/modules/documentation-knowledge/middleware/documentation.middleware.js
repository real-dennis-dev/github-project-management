const db = require("../../../common/config/database");
const responseUtils = require("../../../common/utils/response.utils");
const logger = require("../../../common/config/logger");

class DocumentationMiddleware {
  /**
   * Validate documentation ID exists
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware
   */
  async validateDocumentationId(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        return responseUtils.sendValidationError(res, [
          { message: "Documentation ID is required" },
        ]);
      }

      const { data, error } = await db
        .from("documentation")
        .select("id, project_id")
        .eq("id", id)
        .single();

      if (error || !data) {
        return responseUtils.sendError(res, "Documentation not found", 404);
      }

      // Attach documentation to request for later use
      req.documentation = data;
      next();
    } catch (error) {
      logger.error("Error in validateDocumentationId:", error);
      return responseUtils.sendError(res, "Internal server error", 500);
    }
  }

  /**
   * Validate project exists
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware
   */
  async validateProjectId(req, res, next) {
    try {
      const { projectId } = req.params;

      if (!projectId) {
        return responseUtils.sendValidationError(res, [
          { message: "Project ID is required" },
        ]);
      }

      const { data, error } = await db
        .from("projects")
        .select("id")
        .eq("id", projectId)
        .single();

      if (error || !data) {
        return responseUtils.sendError(res, "Project not found", 404);
      }

      next();
    } catch (error) {
      logger.error("Error in validateProjectId:", error);
      return responseUtils.sendError(res, "Internal server error", 500);
    }
  }

  /**
   * Check documentation access permissions
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware
   */
  async checkDocumentationAccess(req, res, next) {
    try {
      const { id, projectId } = req.params;
      const docProjectId = req.documentation?.project_id || projectId;

      // Here you would check if the user has access to the project
      // For now, we'll just pass through
      next();
    } catch (error) {
      logger.error("Error in checkDocumentationAccess:", error);
      return responseUtils.sendError(res, "Access denied", 403);
    }
  }

  /**
   * Sanitize documentation input
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware
   */
  sanitizeDocumentationInput(req, res, next) {
    try {
      if (req.body) {
        // Sanitize title
        if (req.body.title) {
          req.body.title = req.body.title.trim().replace(/[<>]/g, "");
        }

        // Sanitize content
        if (req.body.content) {
          req.body.content = req.body.content
            .trim()
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
            .replace(/javascript:/gi, "");
        }

        // Ensure tags is an array
        if (req.body.tags && typeof req.body.tags === "string") {
          req.body.tags = req.body.tags.split(",").map((t) => t.trim());
        }

        // Ensure related_links is an array
        if (
          req.body.related_links &&
          typeof req.body.related_links === "string"
        ) {
          req.body.related_links = req.body.related_links
            .split(",")
            .map((l) => l.trim());
        }
      }
      next();
    } catch (error) {
      logger.error("Error in sanitizeDocumentationInput:", error);
      return responseUtils.sendError(res, "Input sanitization failed", 400);
    }
  }

  /**
   * Log documentation access
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next middleware
   */
  logDocumentationAccess(req, res, next) {
    const startTime = Date.now();

    // Log after response is sent
    res.on("finish", () => {
      const duration = Date.now() - startTime;
      logger.info({
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        userId: req.user?.id || "anonymous",
        documentationId: req.params.id,
        projectId: req.params.projectId,
      });
    });

    next();
  }
}
module.exports = new DocumentationMiddleware();
