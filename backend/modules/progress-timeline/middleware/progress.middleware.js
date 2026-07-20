// src/modules/progress-timeline/middleware/progress.middleware.js
import { ProgressValidation } from "../validation/progress.validation.js";
import { supabase } from "../../../common/config/supabase.js";
import { ValidationUtils } from "../../../common/utils/validation.utils.js";

export class ProgressMiddleware {
  /**
   * Validate project ID exists
   */
  static async validateProjectId(req, res, next) {
    try {
      const { projectId } = req.params;

      if (!ValidationUtils.validateUUID(projectId)) {
        return res.status(400).json({
          success: false,
          error: "Invalid project ID format",
        });
      }

      const { data, error } = await supabase
        .from("projects")
        .select("id, name")
        .eq("id", projectId)
        .single();

      if (error || !data) {
        return res.status(404).json({
          success: false,
          error: "Project not found",
        });
      }

      req.project = data;
      next();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Validate timeline entry ID exists
   */
  static async validateTimelineId(req, res, next) {
    try {
      const { id } = req.params;

      if (!ValidationUtils.validateUUID(id)) {
        return res.status(400).json({
          success: false,
          error: "Invalid timeline entry ID format",
        });
      }

      const { data, error } = await supabase
        .from("progress_timeline")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        return res.status(404).json({
          success: false,
          error: "Timeline entry not found",
        });
      }

      req.timelineEntry = data;
      next();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Validate create timeline entry data
   */
  static validateCreateTimelineEntry(req, res, next) {
    const { error } = ProgressValidation.createTimelineEntry.validate(
      req.body,
      {
        abortEarly: false,
      }
    );

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path[0],
        message: detail.message,
      }));
      return res.status(400).json({
        success: false,
        errors,
      });
    }

    next();
  }

  /**
   * Validate update timeline entry data
   */
  static validateUpdateTimelineEntry(req, res, next) {
    const { error } = ProgressValidation.updateTimelineEntry.validate(
      req.body,
      {
        abortEarly: false,
      }
    );

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path[0],
        message: detail.message,
      }));
      return res.status(400).json({
        success: false,
        errors,
      });
    }

    next();
  }

  /**
   * Validate timeline query parameters
   */
  static validateTimelineQuery(req, res, next) {
    const { error } = ProgressValidation.timelineQuery.validate(req.query, {
      abortEarly: false,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path[0],
        message: detail.message,
      }));
      return res.status(400).json({
        success: false,
        errors,
      });
    }

    next();
  }

  /**
   * Validate project ID param
   */
  static validateProjectIdParam(req, res, next) {
    const { error } = ProgressValidation.projectIdParam.validate(req.params, {
      abortEarly: false,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path[0],
        message: detail.message,
      }));
      return res.status(400).json({
        success: false,
        errors,
      });
    }

    next();
  }

  /**
   * Validate timeline ID param
   */
  static validateTimelineIdParam(req, res, next) {
    const { error } = ProgressValidation.timelineIdParam.validate(req.params, {
      abortEarly: false,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path[0],
        message: detail.message,
      }));
      return res.status(400).json({
        success: false,
        errors,
      });
    }

    next();
  }

  /**
   * Validate monthly progress query
   */
  static validateMonthlyProgressQuery(req, res, next) {
    const { error } = ProgressValidation.monthlyProgressQuery.validate(
      req.query,
      {
        abortEarly: false,
      }
    );

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path[0],
        message: detail.message,
      }));
      return res.status(400).json({
        success: false,
        errors,
      });
    }

    next();
  }

  /**
   * Check if entry already exists for the same month and feature
   */
  static async checkDuplicateEntry(req, res, next) {
    try {
      const { projectId } = req.params;
      const { month_year, feature_name } = req.body;

      // Only check if we're creating a new entry
      if (req.method === "POST") {
        const { data, error } = await supabase
          .from("progress_timeline")
          .select("id, progress_percentage")
          .eq("project_id", projectId)
          .eq("month_year", new Date(month_year).toISOString().split("T")[0])
          .eq("feature_name", feature_name)
          .maybeSingle();

        if (data) {
          // Entry exists - we'll update instead of create
          req.existingEntry = data;
          req.method = "PUT"; // Change method to update
          req.params.id = data.id;
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check if deleting the last entry for a feature
   */
  static async checkLastEntryForFeature(req, res, next) {
    try {
      const { id } = req.params;

      // Get entry details
      const { data: entry, error: entryError } = await supabase
        .from("progress_timeline")
        .select("project_id, feature_name")
        .eq("id", id)
        .single();

      if (entryError) {
        return res.status(404).json({
          success: false,
          error: "Timeline entry not found",
        });
      }

      // Count entries for this feature
      const { count, error: countError } = await supabase
        .from("progress_timeline")
        .select("id", { count: "exact", head: true })
        .eq("project_id", entry.project_id)
        .eq("feature_name", entry.feature_name);

      if (countError) {
        return next(countError);
      }

      // Store in request for potential warning
      req.featureEntryCount = count;
      req.isLastEntry = count <= 1;

      next();
    } catch (error) {
      next(error);
    }
  }
}
