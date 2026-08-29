const { supabase } = require("../../../common/config/supabase");
const MilestoneUtils = require("../utils/milestone.utils");
const logger = require("../../../common/config/logger");

/**
 * Milestone Service
 * Handles business logic for milestones
 */
class MilestoneService {
  /**
   * Gets milestones for a project
   * @param {string} projectId - Project UUID
   * @param {Object} options - Query options
   * @param {string} options.status - Filter by status
   * @param {number} options.page - Page number
   * @param {number} options.limit - Items per page
   * @param {string} options.sortBy - Sort field
   * @param {string} options.sortOrder - Sort order
   * @returns {Promise<Object>} - Milestones with pagination
   */
  async getProjectMilestones(projectId, options = {}) {
    try {
      const {
        status,
        page = 1,
        limit = 20,
        sortBy = "target_date",
        sortOrder = "ASC",
      } = options;

      // Build query
      let query = supabase
        .from("milestones")
        .select("*", { count: "exact" })
        .eq("project_id", projectId);

      // Apply filters
      if (status) {
        const validStatuses = [
          "not_started",
          "in_progress",
          "completed",
          "delayed",
        ];
        if (validStatuses.includes(status)) {
          query = query.eq("status", status);
        }
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === "ASC" });

      // Apply pagination
      const from = (page - 1) * limit;
      query = query.range(from, from + limit - 1);

      // Execute query
      const { data, error, count } = await query;

      if (error) {
        logger.error("Error fetching milestones:", error);
        throw new Error("Failed to fetch milestones");
      }

      // Calculate progress for each milestone
      const milestones = (data || []).map((milestone) => {
        const progress =
          milestone.progress_percentage ||
          MilestoneUtils.calculateTargetDateProgress(milestone);

        // Auto-update status if needed
        let status = milestone.status;
        if (status !== "completed" && progress === 100) {
          status = "completed";
        }

        return {
          ...milestone,
          progress_percentage: progress,
          status: status || milestone.status,
          days_until_target: MilestoneUtils.calculateDaysUntilTarget(
            milestone.target_date
          ),
          priority: MilestoneUtils.getMilestonePriority({
            ...milestone,
            progress_percentage: progress,
          }),
        };
      });

      return {
        data: milestones,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      };
    } catch (error) {
      logger.error("MilestoneService.getProjectMilestones error:", error);
      throw error;
    }
  }

  /**
   * Creates a new milestone
   * @param {string} projectId - Project UUID
   * @param {Object} data - Milestone data
   * @returns {Promise<Object>} - Created milestone
   */
  async createMilestone(projectId, data) {
    try {
      // Validate data
      const validation = MilestoneUtils.validateMilestoneData(data);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      // Prepare milestone data
      const milestoneData = {
        project_id: projectId,
        name: data.name.trim(),
        description: data.description ? data.description.trim() : null,
        status: data.status || "not_started",
        target_date: data.target_date,
        completed_date: data.completed_date || null,
        progress_percentage: data.progress_percentage || 0,
      };

      // Validate dates
      if (data.completed_date && data.completed_date > data.target_date) {
        throw new Error("Completed date cannot be after target date");
      }

      // Insert milestone
      const { data: milestone, error } = await supabase
        .from("milestones")
        .insert([milestoneData])
        .select()
        .single();

      if (error) {
        logger.error("Error creating milestone:", error);
        throw new Error("Failed to create milestone");
      }

      logger.info(`Milestone created: ${milestone.id} - ${milestone.name}`);
      return milestone;
    } catch (error) {
      logger.error("MilestoneService.createMilestone error:", error);
      throw error;
    }
  }

  /**
   * Gets a milestone by ID
   * @param {string} id - Milestone UUID
   * @returns {Promise<Object>} - Milestone object
   */
  async getMilestoneById(id) {
    try {
      const { data, error } = await supabase
        .from("milestones")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        logger.error("Error fetching milestone:", error);
        throw new Error("Milestone not found");
      }

      // Calculate progress
      const progress =
        data.progress_percentage ||
        MilestoneUtils.calculateTargetDateProgress(data);

      return {
        ...data,
        progress_percentage: progress,
        days_until_target: MilestoneUtils.calculateDaysUntilTarget(
          data.target_date
        ),
        priority: MilestoneUtils.getMilestonePriority(data),
      };
    } catch (error) {
      logger.error("MilestoneService.getMilestoneById error:", error);
      throw error;
    }
  }

  /**
   * Updates a milestone
   * @param {string} id - Milestone UUID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} - Updated milestone
   */
  async updateMilestone(id, data) {
    try {
      // Check if milestone exists
      const existing = await this.getMilestoneById(id);

      // Validate data
      const validation = MilestoneUtils.validateMilestoneData(data);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      // Prepare update data
      const updateData = {};

      if (data.name) updateData.name = data.name.trim();
      if (data.description !== undefined) {
        updateData.description = data.description
          ? data.description.trim()
          : null;
      }
      if (data.status) {
        // Validate status transition
        if (
          !MilestoneUtils.validateStatusTransition(existing.status, data.status)
        ) {
          throw new Error(
            `Invalid status transition from ${existing.status} to ${data.status}`
          );
        }
        updateData.status = data.status;

        // If status is completed, set completed date
        if (data.status === "completed") {
          updateData.completed_date = new Date().toISOString();
        }
      }
      if (data.target_date) {
        updateData.target_date = data.target_date;
      }
      if (data.completed_date !== undefined) {
        updateData.completed_date = data.completed_date;
      }
      if (data.progress_percentage !== undefined) {
        if (data.progress_percentage < 0 || data.progress_percentage > 100) {
          throw new Error("Progress percentage must be between 0 and 100");
        }
        updateData.progress_percentage = data.progress_percentage;
      }

      // Validate dates
      if (
        updateData.completed_date &&
        updateData.completed_date >
          (updateData.target_date || existing.target_date)
      ) {
        throw new Error("Completed date cannot be after target date");
      }

      // Update milestone
      const { data: milestone, error } = await supabase
        .from("milestones")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        logger.error("Error updating milestone:", error);
        throw new Error("Failed to update milestone");
      }

      logger.info(`Milestone updated: ${milestone.id} - ${milestone.name}`);
      return await this.getMilestoneById(id);
    } catch (error) {
      logger.error("MilestoneService.updateMilestone error:", error);
      throw error;
    }
  }

  /**
   * Updates milestone status
   * @param {string} id - Milestone UUID
   * @param {string} status - New status
   * @returns {Promise<Object>} - Updated milestone
   */
  async updateMilestoneStatus(id, status) {
    try {
      const validStatuses = [
        "not_started",
        "in_progress",
        "completed",
        "delayed",
      ];
      if (!validStatuses.includes(status)) {
        throw new Error("Invalid milestone status");
      }

      // Check if milestone exists
      const existing = await this.getMilestoneById(id);

      // Validate status transition
      if (!MilestoneUtils.validateStatusTransition(existing.status, status)) {
        throw new Error(
          `Invalid status transition from ${existing.status} to ${status}`
        );
      }

      // Prepare update data
      const updateData = { status };

      // If status is completed, set completed date and progress
      if (status === "completed") {
        updateData.completed_date = new Date().toISOString();
        updateData.progress_percentage = 100;
      }

      // If status is not completed, remove completed date
      if (status !== "completed") {
        updateData.completed_date = null;
      }

      const { data: milestone, error } = await supabase
        .from("milestones")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        logger.error("Error updating milestone status:", error);
        throw new Error("Failed to update milestone status");
      }

      logger.info(`Milestone status updated: ${milestone.id} -> ${status}`);
      return await this.getMilestoneById(id);
    } catch (error) {
      logger.error("MilestoneService.updateMilestoneStatus error:", error);
      throw error;
    }
  }

  /**
   * Deletes a milestone
   * @param {string} id - Milestone UUID
   * @returns {Promise<void>}
   */
  async deleteMilestone(id) {
    try {
      // Check if milestone exists
      await this.getMilestoneById(id);

      const { error } = await supabase.from("milestones").delete().eq("id", id);

      if (error) {
        logger.error("Error deleting milestone:", error);
        throw new Error("Failed to delete milestone");
      }

      logger.info(`Milestone deleted: ${id}`);
    } catch (error) {
      logger.error("MilestoneService.deleteMilestone error:", error);
      throw error;
    }
  }

  /**
   * Calculates milestone progress
   * @param {string} id - Milestone UUID
   * @returns {Promise<Object>} - Progress details
   */
  async calculateMilestoneProgress(id) {
    try {
      const milestone = await this.getMilestoneById(id);

      const progress =
        milestone.progress_percentage ||
        MilestoneUtils.calculateTargetDateProgress(milestone);

      return {
        milestone_id: id,
        progress_percentage: progress,
        status: milestone.status,
        days_until_target: MilestoneUtils.calculateDaysUntilTarget(
          milestone.target_date
        ),
        formatted: MilestoneUtils.formatMilestoneProgress(progress),
      };
    } catch (error) {
      logger.error("MilestoneService.calculateMilestoneProgress error:", error);
      throw error;
    }
  }

  /**
   * Checks if milestone is complete
   * @param {string} id - Milestone UUID
   * @returns {Promise<boolean>} - True if complete
   */
  async checkMilestoneCompletion(id) {
    try {
      const milestone = await this.getMilestoneById(id);
      return (
        milestone.status === "completed" ||
        milestone.progress_percentage === 100
      );
    } catch (error) {
      logger.error("MilestoneService.checkMilestoneCompletion error:", error);
      throw error;
    }
  }

  /**
   * Gets overdue milestones
   * @param {string} projectId - Project UUID
   * @returns {Promise<Array>} - Overdue milestones
   */
  async getOverdueMilestones(projectId) {
    try {
      const { data: milestones } = await supabase
        .from("milestones")
        .select("*")
        .eq("project_id", projectId);

      return MilestoneUtils.getOverdueMilestones(milestones || []);
    } catch (error) {
      logger.error("MilestoneService.getOverdueMilestones error:", error);
      throw error;
    }
  }

  /**
   * Gets milestone statistics
   * @param {string} projectId - Project UUID
   * @returns {Promise<Object>} - Milestone statistics
   */
  async getMilestoneStatistics(projectId) {
    try {
      const { data: milestones } = await supabase
        .from("milestones")
        .select("*")
        .eq("project_id", projectId);

      return MilestoneUtils.generateMilestoneSummary(milestones || []);
    } catch (error) {
      logger.error("MilestoneService.getMilestoneStatistics error:", error);
      throw error;
    }
  }

  /**
   * Bulk updates milestone progress
   * @param {string} projectId - Project UUID
   * @param {Array} updates - Array of { id, progress_percentage }
   * @returns {Promise<Array>} - Updated milestones
   */
  async bulkUpdateProgress(projectId, updates) {
    try {
      const results = [];

      for (const update of updates) {
        const { id, progress_percentage } = update;

        // Validate progress
        if (progress_percentage < 0 || progress_percentage > 100) {
          throw new Error(`Invalid progress for milestone ${id}`);
        }

        // Update milestone
        const milestone = await this.updateMilestone(id, {
          progress_percentage,
        });
        results.push(milestone);
      }

      return results;
    } catch (error) {
      logger.error("MilestoneService.bulkUpdateProgress error:", error);
      throw error;
    }
  }
}

const milestoneService = new MilestoneService();

module.exports = milestoneService;
module.exports.milestoneService = milestoneService;
