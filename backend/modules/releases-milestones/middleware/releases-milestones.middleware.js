const { supabase } = require("../../../common/config/supabase");
const ValidationUtils = require("../../../common/utils/validation.utils");
const ResponseUtils = require("../../../common/utils/response.utils");
const ReleaseUtils = require("../utils/release.utils");
const MilestoneUtils = require("../utils/milestone.utils");
const logger = require("../../../common/config/logger");

/**
 * Releases & Milestones Middleware
 * Provides middleware functions for release and milestone routes
 */
class ReleasesMilestonesMiddleware {
  /**
   * Validates release exists
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   * @returns {Promise<void>}
   */
  async validateReleaseExists(req, res, next) {
    try {
      const { id } = req.params;

      if (!ValidationUtils.validateUUID(id)) {
        return ResponseUtils.sendError(res, "Invalid release ID", 400);
      }

      const { data, error } = await supabase
        .from("releases")
        .select("id, project_id, version, status")
        .eq("id", id)
        .single();

      if (error || !data) {
        return ResponseUtils.sendError(res, "Release not found", 404);
      }

      req.release = data;
      next();
    } catch (error) {
      logger.error("Error in validateReleaseExists:", error);
      return ResponseUtils.sendError(res, "Internal server error", 500);
    }
  }

  /**
   * Validates milestone exists
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   * @returns {Promise<void>}
   */
  async validateMilestoneExists(req, res, next) {
    try {
      const { id } = req.params;

      if (!ValidationUtils.validateUUID(id)) {
        return ResponseUtils.sendError(res, "Invalid milestone ID", 400);
      }

      const { data, error } = await supabase
        .from("milestones")
        .select("id, project_id, name, status, target_date")
        .eq("id", id)
        .single();

      if (error || !data) {
        return ResponseUtils.sendError(res, "Milestone not found", 404);
      }

      req.milestone = data;
      next();
    } catch (error) {
      logger.error("Error in validateMilestoneExists:", error);
      return ResponseUtils.sendError(res, "Internal server error", 500);
    }
  }

  /**
   * Validates release version uniqueness
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   * @returns {Promise<void>}
   */
  async validateReleaseVersionUniqueness(req, res, next) {
    try {
      const { projectId } = req.params;
      const { version } = req.body;

      if (!version) {
        return next();
      }

      // Check if version already exists
      const { data, error } = await supabase
        .from("releases")
        .select("id, version")
        .eq("project_id", projectId)
        .eq("version", version);

      if (error) {
        logger.error("Error checking release version:", error);
        return ResponseUtils.sendError(res, "Error validating version", 500);
      }

      // If updating, exclude current release
      const currentId = req.params.id;
      const exists = data.some((r) => r.id !== currentId);

      if (exists) {
        return ResponseUtils.sendError(
          res,
          `Version ${version} already exists for this project`,
          409
        );
      }

      next();
    } catch (error) {
      logger.error("Error in validateReleaseVersionUniqueness:", error);
      return ResponseUtils.sendError(res, "Internal server error", 500);
    }
  }

  /**
   * Validates release status transition
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   * @returns {Promise<void>}
   */
  async validateReleaseStatusTransition(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return next();
      }

      // Get current release
      const { data: release, error } = await supabase
        .from("releases")
        .select("status")
        .eq("id", id)
        .single();

      if (error || !release) {
        return ResponseUtils.sendError(res, "Release not found", 404);
      }

      // Define valid transitions
      const validTransitions = {
        planned: ["in_progress", "cancelled"],
        in_progress: ["testing", "cancelled", "planned"],
        testing: ["released", "in_progress", "cancelled"],
        released: [],
        cancelled: ["planned"],
      };

      const currentStatus = release.status;
      const allowedTransitions = validTransitions[currentStatus] || [];

      if (currentStatus !== status && !allowedTransitions.includes(status)) {
        return ResponseUtils.sendError(
          res,
          `Invalid status transition from ${currentStatus} to ${status}`,
          400
        );
      }

      // If releasing, check if all features are completed
      if (status === "released") {
        const { data: features, error: featuresError } = await supabase
          .from("release_features")
          .select("is_completed")
          .eq("release_id", id);

        if (featuresError) {
          logger.error("Error checking release features:", featuresError);
          return ResponseUtils.sendError(
            res,
            "Error checking release readiness",
            500
          );
        }

        const totalFeatures = features.length;
        const completedFeatures = features.filter((f) => f.is_completed).length;

        if (totalFeatures > 0 && completedFeatures < totalFeatures) {
          return ResponseUtils.sendError(
            res,
            `Cannot release: ${completedFeatures}/${totalFeatures} features completed`,
            400
          );
        }
      }

      next();
    } catch (error) {
      logger.error("Error in validateReleaseStatusTransition:", error);
      return ResponseUtils.sendError(res, "Internal server error", 500);
    }
  }

  /**
   * Validates milestone status transition
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   * @returns {Promise<void>}
   */
  async validateMilestoneStatusTransition(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return next();
      }

      // Get current milestone
      const { data: milestone, error } = await supabase
        .from("milestones")
        .select("status")
        .eq("id", id)
        .single();

      if (error || !milestone) {
        return ResponseUtils.sendError(res, "Milestone not found", 404);
      }

      // Validate transition using utility
      const isValid = MilestoneUtils.validateStatusTransition(
        milestone.status,
        status
      );

      if (!isValid) {
        return ResponseUtils.sendError(
          res,
          `Invalid status transition from ${milestone.status} to ${status}`,
          400
        );
      }

      next();
    } catch (error) {
      logger.error("Error in validateMilestoneStatusTransition:", error);
      return ResponseUtils.sendError(res, "Internal server error", 500);
    }
  }

  /**
   * Validates feature exists for release
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   * @returns {Promise<void>}
   */
  async validateFeatureForRelease(req, res, next) {
    try {
      const { id, featureId } = req.params;

      if (!ValidationUtils.validateUUID(featureId)) {
        return ResponseUtils.sendError(res, "Invalid feature ID", 400);
      }

      // Check if feature exists in release
      const { data, error } = await supabase
        .from("release_features")
        .select("feature_id")
        .eq("release_id", id)
        .eq("feature_id", featureId)
        .single();

      if (error || !data) {
        return ResponseUtils.sendError(
          res,
          "Feature not found in this release",
          404
        );
      }

      next();
    } catch (error) {
      logger.error("Error in validateFeatureForRelease:", error);
      return ResponseUtils.sendError(res, "Internal server error", 500);
    }
  }

  /**
   * Validates release date constraints
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   * @returns {Promise<void>}
   */
  validateReleaseDateConstraints(req, res, next) {
    try {
      const { release_date } = req.body;

      if (release_date) {
        const date = new Date(release_date);
        if (isNaN(date.getTime())) {
          return ResponseUtils.sendError(
            res,
            "Invalid release date format",
            400
          );
        }

        // Check if release date is in the future
        const now = new Date();
        const status = req.body.status || req.release?.status;

        if (status === "released" && date > now) {
          return ResponseUtils.sendError(
            res,
            "Release date cannot be in the future for released status",
            400
          );
        }
      }

      next();
    } catch (error) {
      logger.error("Error in validateReleaseDateConstraints:", error);
      return ResponseUtils.sendError(res, "Internal server error", 500);
    }
  }

  /**
   * Validates milestone date constraints
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   * @returns {Promise<void>}
   */
  validateMilestoneDateConstraints(req, res, next) {
    try {
      const { target_date, completed_date, status } = req.body;

      if (target_date) {
        const date = new Date(target_date);
        if (isNaN(date.getTime())) {
          return ResponseUtils.sendError(
            res,
            "Invalid target date format",
            400
          );
        }
      }

      if (completed_date) {
        const date = new Date(completed_date);
        if (isNaN(date.getTime())) {
          return ResponseUtils.sendError(
            res,
            "Invalid completed date format",
            400
          );
        }
      }

      // Check that completed date is not before target date
      if (target_date && completed_date) {
        const target = new Date(target_date);
        const completed = new Date(completed_date);

        if (completed < target) {
          return ResponseUtils.sendError(
            res,
            "Completed date cannot be before target date",
            400
          );
        }
      }

      // If status is completed, ensure completed_date is set
      if (status === "completed" && !completed_date) {
        req.body.completed_date = new Date().toISOString().split("T")[0];
      }

      next();
    } catch (error) {
      logger.error("Error in validateMilestoneDateConstraints:", error);
      return ResponseUtils.sendError(res, "Internal server error", 500);
    }
  }

  /**
   * Validates feature IDs exist
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   * @returns {Promise<void>}
   */
  async validateFeatureIds(req, res, next) {
    try {
      const { featureIds } = req.body;

      if (
        !featureIds ||
        !Array.isArray(featureIds) ||
        featureIds.length === 0
      ) {
        return ResponseUtils.sendError(
          res,
          "At least one feature ID is required",
          400
        );
      }

      // Validate each UUID
      const invalidIds = featureIds.filter(
        (id) => !ValidationUtils.validateUUID(id)
      );
      if (invalidIds.length > 0) {
        return ResponseUtils.sendError(
          res,
          `Invalid feature ID(s): ${invalidIds.join(", ")}`,
          400
        );
      }

      // Check if features exist
      const { data, error } = await supabase
        .from("features")
        .select("id")
        .in("id", featureIds);

      if (error) {
        logger.error("Error validating features:", error);
        return ResponseUtils.sendError(res, "Error validating features", 500);
      }

      const foundIds = data.map((f) => f.id);
      const missingIds = featureIds.filter((id) => !foundIds.includes(id));

      if (missingIds.length > 0) {
        return ResponseUtils.sendError(
          res,
          `Features not found: ${missingIds.join(", ")}`,
          404
        );
      }

      next();
    } catch (error) {
      logger.error("Error in validateFeatureIds:", error);
      return ResponseUtils.sendError(res, "Internal server error", 500);
    }
  }

  /**
   * Checks if user can modify release
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   * @returns {Promise<void>}
   */
  async checkReleaseModificationPermission(req, res, next) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return ResponseUtils.sendUnauthorized(res, "User not authenticated");
      }

      // Get release with project info
      const releaseId = req.params.id;
      const { data, error } = await supabase
        .from("releases")
        .select(
          `
          id,
          project_id,
          projects (
            owner_id,
            name
          )
        `
        )
        .eq("id", releaseId)
        .single();

      if (error || !data) {
        return ResponseUtils.sendError(res, "Release not found", 404);
      }

      // Check if user is project owner or admin
      const isOwner = data.projects?.owner_id === userId;
      const isAdmin =
        req.user?.role === "admin" || req.user?.role === "project_manager";

      if (!isOwner && !isAdmin) {
        return ResponseUtils.sendForbidden(
          res,
          "You do not have permission to modify this release"
        );
      }

      next();
    } catch (error) {
      logger.error("Error in checkReleaseModificationPermission:", error);
      return ResponseUtils.sendError(res, "Internal server error", 500);
    }
  }

  /**
   * Checks if user can modify milestone
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   * @returns {Promise<void>}
   */
  async checkMilestoneModificationPermission(req, res, next) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return ResponseUtils.sendUnauthorized(res, "User not authenticated");
      }

      // Get milestone with project info
      const milestoneId = req.params.id;
      const { data, error } = await supabase
        .from("milestones")
        .select(
          `
          id,
          project_id,
          projects (
            owner_id,
            name
          )
        `
        )
        .eq("id", milestoneId)
        .single();

      if (error || !data) {
        return ResponseUtils.sendError(res, "Milestone not found", 404);
      }

      // Check if user is project owner or admin
      const isOwner = data.projects?.owner_id === userId;
      const isAdmin =
        req.user?.role === "admin" || req.user?.role === "project_manager";

      if (!isOwner && !isAdmin) {
        return ResponseUtils.sendForbidden(
          res,
          "You do not have permission to modify this milestone"
        );
      }

      next();
    } catch (error) {
      logger.error("Error in checkMilestoneModificationPermission:", error);
      return ResponseUtils.sendError(res, "Internal server error", 500);
    }
  }

  /**
   * Sanitizes release data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   */
  sanitizeReleaseData(req, res, next) {
    try {
      const data = req.body;

      if (data.version) {
        // Remove leading 'v' if present
        data.version = data.version.replace(/^v/, "");
        data.version = data.version.trim();
      }

      if (data.description) {
        data.description = data.description.trim().replace(/<[^>]*>/g, "");
      }

      if (data.features && Array.isArray(data.features)) {
        data.features = data.features.filter((id) => id);
      }

      req.body = data;
      next();
    } catch (error) {
      logger.error("Error in sanitizeReleaseData:", error);
      return ResponseUtils.sendError(res, "Invalid input data", 400);
    }
  }

  /**
   * Sanitizes milestone data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   */
  sanitizeMilestoneData(req, res, next) {
    try {
      const data = req.body;

      if (data.name) {
        data.name = data.name.trim().replace(/<[^>]*>/g, "");
      }

      if (data.description) {
        data.description = data.description.trim().replace(/<[^>]*>/g, "");
      }

      if (data.progress_percentage !== undefined) {
        data.progress_percentage = Math.min(
          100,
          Math.max(0, data.progress_percentage)
        );
      }

      req.body = data;
      next();
    } catch (error) {
      logger.error("Error in sanitizeMilestoneData:", error);
      return ResponseUtils.sendError(res, "Invalid input data", 400);
    }
  }

  /**
   * Logs release activity
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   */
  logReleaseActivity(req, res, next) {
    const startTime = Date.now();

    // Log after response
    res.on("finish", () => {
      const duration = Date.now() - startTime;
      const action = req.method;
      const path = req.path;
      const userId = req.user?.id || "anonymous";

      logger.info("Release Activity", {
        action,
        path,
        userId,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        params: req.params,
        query: req.query,
        releaseId: req.params.id || req.release?.id,
        version: req.body?.version || req.release?.version,
      });
    });

    next();
  }

  /**
   * Logs milestone activity
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   */
  logMilestoneActivity(req, res, next) {
    const startTime = Date.now();

    // Log after response
    res.on("finish", () => {
      const duration = Date.now() - startTime;
      const action = req.method;
      const path = req.path;
      const userId = req.user?.id || "anonymous";

      logger.info("Milestone Activity", {
        action,
        path,
        userId,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        params: req.params,
        query: req.query,
        milestoneId: req.params.id || req.milestone?.id,
        name: req.body?.name || req.milestone?.name,
      });
    });

    next();
  }

  /**
   * Checks if release can be deleted
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   * @returns {Promise<void>}
   */
  async validateReleaseDeletable(req, res, next) {
    try {
      const { id } = req.params;

      // Check if release has any features
      const { count, error } = await supabase
        .from("release_features")
        .select("*", { count: "exact", head: true })
        .eq("release_id", id);

      if (error) {
        logger.error("Error checking release features:", error);
        return ResponseUtils.sendError(
          res,
          "Error validating release deletion",
          500
        );
      }

      if (count > 0) {
        // Check if any features are still linked
        return ResponseUtils.sendError(
          res,
          "Cannot delete release with features. Remove all features first.",
          400
        );
      }

      next();
    } catch (error) {
      logger.error("Error in validateReleaseDeletable:", error);
      return ResponseUtils.sendError(res, "Internal server error", 500);
    }
  }

  /**
   * Checks if milestone can be deleted
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   * @returns {Promise<void>}
   */
  async validateMilestoneDeletable(req, res, next) {
    try {
      const { id } = req.params;

      // Get milestone status
      const { data: milestone, error } = await supabase
        .from("milestones")
        .select("status, progress_percentage")
        .eq("id", id)
        .single();

      if (error || !milestone) {
        return ResponseUtils.sendError(res, "Milestone not found", 404);
      }

      // Check if milestone is completed
      if (
        milestone.status === "completed" ||
        milestone.progress_percentage === 100
      ) {
        return ResponseUtils.sendError(
          res,
          "Cannot delete completed milestone",
          400
        );
      }

      next();
    } catch (error) {
      logger.error("Error in validateMilestoneDeletable:", error);
      return ResponseUtils.sendError(res, "Internal server error", 500);
    }
  }

  /**
   * Caches release response
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   */
  cacheReleaseResponse(req, res, next) {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    // Set cache headers
    res.set("Cache-Control", "private, max-age=300"); // 5 minutes
    res.set("ETag", req.params.id);

    // Check if response can be cached
    const originalSend = res.send;
    res.send = function (data) {
      // Store in cache if successful
      if (res.statusCode === 200) {
        try {
          // Parse and cache data
          const parsedData = JSON.parse(data);
          if (parsedData.data) {
            // Cache key based on request URL
            const cacheKey = `release:${req.params.id}:${req.path}`;
            // Note: Actual caching implementation would use Redis
            // This is a placeholder for cache logic
            logger.debug(`Cacheable response for ${cacheKey}`);
          }
        } catch (e) {
          // Not JSON or not cacheable
        }
      }

      return originalSend.call(this, data);
    };

    next();
  }

  /**
   * Caches milestone response
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   */
  cacheMilestoneResponse(req, res, next) {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    // Set cache headers
    res.set("Cache-Control", "private, max-age=300"); // 5 minutes
    res.set("ETag", req.params.id);

    const originalSend = res.send;
    res.send = function (data) {
      if (res.statusCode === 200) {
        try {
          const parsedData = JSON.parse(data);
          if (parsedData.data) {
            const cacheKey = `milestone:${req.params.id}:${req.path}`;
            logger.debug(`Cacheable response for ${cacheKey}`);
          }
        } catch (e) {
          // Not JSON or not cacheable
        }
      }

      return originalSend.call(this, data);
    };

    next();
  }

  /**
   * Validates release version format
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Next middleware
   */
  validateReleaseVersionFormat(req, res, next) {
    try {
      const { version } = req.body;

      if (version) {
        const isValid = ReleaseUtils.validateSemanticVersion(version);
        if (!isValid) {
          return ResponseUtils.sendError(
            res,
            "Invalid version format. Use semantic versioning (X.Y.Z)",
            400
          );
        }
      }

      next();
    } catch (error) {
      logger.error("Error in validateReleaseVersionFormat:", error);
      return ResponseUtils.sendError(res, "Internal server error", 500);
    }
  }
}

module.exports = new ReleasesMilestonesMiddleware();
