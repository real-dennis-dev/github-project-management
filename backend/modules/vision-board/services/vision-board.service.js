const { supabase } = require("../../../common/config/supabase");
const VisionUtils = require("../utils/vision.utils");
const logger = require("../../../common/config/logger");

/**
 * Vision Board Service
 * Handles business logic for vision goals
 */
class VisionBoardService {
  /**
   * Gets all vision goals with filters
   * @param {Object} options - Query options
   * @param {string} options.status - Filter by status
   * @param {string} options.category - Filter by category
   * @param {number} options.page - Page number
   * @param {number} options.limit - Items per page
   * @param {string} options.sortBy - Sort field
   * @param {string} options.sortOrder - Sort order
   * @returns {Promise<Object>} - Goals with pagination
   */
  async getGoals(options = {}) {
    try {
      const {
        status,
        category,
        page = 1,
        limit = 20,
        sortBy = "priority",
        sortOrder = "DESC",
      } = options;

      // Build query
      let query = supabase.from("vision_board").select(
        `
          *,
          vision_projects (
            project_id,
            projects (
              id,
              name,
              status,
              completion_percentage
            )
          )
        `,
        { count: "exact" }
      );

      // Apply filters
      if (
        status &&
        ["draft", "active", "completed", "archived"].includes(status)
      ) {
        query = query.eq("status", status);
      }

      if (category) {
        query = query.eq("category", category);
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === "ASC" });

      // Apply pagination
      const from = (page - 1) * limit;
      query = query.range(from, from + limit - 1);

      // Execute query
      const { data, error, count } = await query;

      if (error) {
        logger.error("Error fetching vision goals:", error);
        throw new Error("Failed to fetch vision goals");
      }

      // Process and format goals
      const formattedGoals = (data || []).map((goal) => {
        // Extract linked projects
        const linkedProjects = goal.vision_projects || [];
        const projects = linkedProjects
          .map((vp) => vp.projects)
          .filter((p) => p);

        // Calculate progress from linked projects
        const progressData = VisionUtils.calculateGoalProgress(projects);

        return {
          ...goal,
          linked_projects: projects,
          project_count: projects.length,
          progress: progressData.progress,
          progress_data: progressData,
          formatted: VisionUtils.formatVisionGoal({
            ...goal,
            progress: progressData.progress,
            project_count: projects.length,
            linked_projects: projects,
          }),
        };
      });

      return {
        data: formattedGoals,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
        statistics: VisionUtils.getGoalStatistics(data || []),
      };
    } catch (error) {
      logger.error("VisionBoardService.getGoals error:", error);
      throw error;
    }
  }

  /**
   * Creates a new vision goal
   * @param {Object} data - Goal data
   * @returns {Promise<Object>} - Created goal
   */
  async createGoal(data) {
    try {
      // Validate data
      const validation = VisionUtils.validateGoalData(data);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      // Prepare data
      const goalData = {
        goal: data.goal.trim(),
        description: data.description ? data.description.trim() : null,
        target_timeline: data.target_timeline
          ? data.target_timeline.trim()
          : null,
        priority: data.priority || 0,
        category: data.category || null,
        status: data.status || "draft",
      };

      // Insert goal
      const { data: goal, error } = await supabase
        .from("vision_board")
        .insert([goalData])
        .select()
        .single();

      if (error) {
        logger.error("Error creating vision goal:", error);
        throw new Error("Failed to create vision goal");
      }

      logger.info(`Vision goal created: ${goal.id} - ${goal.goal}`);

      return {
        ...goal,
        progress: 0,
        project_count: 0,
        linked_projects: [],
        formatted: VisionUtils.formatVisionGoal({
          ...goal,
          progress: 0,
          project_count: 0,
          linked_projects: [],
        }),
      };
    } catch (error) {
      logger.error("VisionBoardService.createGoal error:", error);
      throw error;
    }
  }

  /**
   * Gets a vision goal by ID
   * @param {string} id - Goal UUID
   * @returns {Promise<Object>} - Goal object
   */
  async getGoalById(id) {
    try {
      const { data, error } = await supabase
        .from("vision_board")
        .select(
          `
          *,
          vision_projects (
            project_id,
            projects (
              id,
              name,
              description,
              status,
              completion_percentage,
              priority,
              start_date,
              target_completion_date,
              created_at
            )
          )
        `
        )
        .eq("id", id)
        .single();

      if (error) {
        logger.error("Error fetching vision goal:", error);
        throw new Error("Vision goal not found");
      }

      // Extract linked projects
      const linkedProjects = data.vision_projects || [];
      const projects = linkedProjects.map((vp) => vp.projects).filter((p) => p);

      // Calculate progress
      const progressData = VisionUtils.calculateGoalProgress(projects);

      const formattedGoal = {
        ...data,
        linked_projects: projects,
        project_count: projects.length,
        progress: progressData.progress,
        progress_data: progressData,
        formatted: VisionUtils.formatVisionGoal({
          ...data,
          progress: progressData.progress,
          project_count: projects.length,
          linked_projects: projects,
        }),
      };

      return formattedGoal;
    } catch (error) {
      logger.error("VisionBoardService.getGoalById error:", error);
      throw error;
    }
  }

  /**
   * Updates a vision goal
   * @param {string} id - Goal UUID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} - Updated goal
   */
  async updateGoal(id, data) {
    try {
      // Check if goal exists
      await this.getGoalById(id);

      // Prepare update data
      const updateData = {};

      if (data.goal) updateData.goal = data.goal.trim();
      if (data.description !== undefined) {
        updateData.description = data.description
          ? data.description.trim()
          : null;
      }
      if (data.target_timeline !== undefined) {
        updateData.target_timeline = data.target_timeline
          ? data.target_timeline.trim()
          : null;
      }
      if (data.priority !== undefined) {
        if (data.priority < 0 || data.priority > 10) {
          throw new Error("Priority must be between 0 and 10");
        }
        updateData.priority = data.priority;
      }
      if (data.category !== undefined) {
        updateData.category = data.category || null;
      }
      if (data.status) {
        const validStatuses = ["draft", "active", "completed", "archived"];
        if (!validStatuses.includes(data.status)) {
          throw new Error("Invalid status value");
        }
        updateData.status = data.status;
      }

      // Update goal
      const { data: goal, error } = await supabase
        .from("vision_board")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        logger.error("Error updating vision goal:", error);
        throw new Error("Failed to update vision goal");
      }

      // Get updated goal with projects
      const updatedGoal = await this.getGoalById(id);

      logger.info(`Vision goal updated: ${goal.id} - ${goal.goal}`);
      return updatedGoal;
    } catch (error) {
      logger.error("VisionBoardService.updateGoal error:", error);
      throw error;
    }
  }

  /**
   * Deletes a vision goal
   * @param {string} id - Goal UUID
   * @returns {Promise<void>}
   */
  async deleteGoal(id) {
    try {
      // Check if goal exists
      await this.getGoalById(id);

      // Delete related vision_projects first (cascade will handle but we do it explicitly)
      await supabase.from("vision_projects").delete().eq("vision_id", id);

      // Delete goal
      const { error } = await supabase
        .from("vision_board")
        .delete()
        .eq("id", id);

      if (error) {
        logger.error("Error deleting vision goal:", error);
        throw new Error("Failed to delete vision goal");
      }

      logger.info(`Vision goal deleted: ${id}`);
    } catch (error) {
      logger.error("VisionBoardService.deleteGoal error:", error);
      throw error;
    }
  }

  /**
   * Links a project to a vision goal
   * @param {string} visionId - Vision goal UUID
   * @param {string} projectId - Project UUID
   * @returns {Promise<Object>} - Link result
   */
  async linkProjectToVision(visionId, projectId) {
    try {
      // Check if vision goal exists
      await this.getGoalById(visionId);

      // Check if project exists
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .select("id, name")
        .eq("id", projectId)
        .single();

      if (projectError || !project) {
        throw new Error("Project not found");
      }

      // Check if link already exists
      const { data: existing, error: checkError } = await supabase
        .from("vision_projects")
        .select("id")
        .eq("vision_id", visionId)
        .eq("project_id", projectId)
        .single();

      if (existing) {
        throw new Error("Project already linked to this vision goal");
      }

      // Create link
      const { data: link, error } = await supabase
        .from("vision_projects")
        .insert([
          {
            vision_id: visionId,
            project_id: projectId,
          },
        ])
        .select()
        .single();

      if (error) {
        logger.error("Error linking project to vision:", error);
        throw new Error("Failed to link project to vision goal");
      }

      logger.info(`Project ${projectId} linked to vision goal ${visionId}`);

      // Get updated goal
      const updatedGoal = await this.getGoalById(visionId);

      return {
        link: link,
        goal: updatedGoal,
        project: project,
      };
    } catch (error) {
      logger.error("VisionBoardService.linkProjectToVision error:", error);
      throw error;
    }
  }

  /**
   * Unlinks a project from a vision goal
   * @param {string} visionId - Vision goal UUID
   * @param {string} projectId - Project UUID
   * @returns {Promise<Object>} - Updated goal
   */
  async unlinkProjectFromVision(visionId, projectId) {
    try {
      // Check if vision goal exists
      await this.getGoalById(visionId);

      // Check if link exists
      const { data: existing, error: checkError } = await supabase
        .from("vision_projects")
        .select("id")
        .eq("vision_id", visionId)
        .eq("project_id", projectId)
        .single();

      if (!existing) {
        throw new Error("Link not found");
      }

      // Delete link
      const { error } = await supabase
        .from("vision_projects")
        .delete()
        .eq("vision_id", visionId)
        .eq("project_id", projectId);

      if (error) {
        logger.error("Error unlinking project from vision:", error);
        throw new Error("Failed to unlink project from vision goal");
      }

      logger.info(`Project ${projectId} unlinked from vision goal ${visionId}`);

      // Get updated goal
      return await this.getGoalById(visionId);
    } catch (error) {
      logger.error("VisionBoardService.unlinkProjectFromVision error:", error);
      throw error;
    }
  }

  /**
   * Calculates goal progress
   * @param {string} visionId - Vision goal UUID
   * @returns {Promise<Object>} - Progress calculation
   */
  async getGoalProgress(visionId) {
    try {
      const goal = await this.getGoalById(visionId);
      return goal.progress_data;
    } catch (error) {
      logger.error("VisionBoardService.getGoalProgress error:", error);
      throw error;
    }
  }

  /**
   * Gets available projects for linking
   * @param {string} visionId - Vision goal UUID
   * @returns {Promise<Array>} - Available projects
   */
  async getAvailableProjects(visionId) {
    try {
      // Get currently linked projects
      const { data: linked } = await supabase
        .from("vision_projects")
        .select("project_id")
        .eq("vision_id", visionId);

      const linkedIds = (linked || []).map((l) => l.project_id);

      // Get all projects not linked
      let query = supabase
        .from("projects")
        .select("id, name, description, status, completion_percentage")
        .order("name");

      if (linkedIds.length > 0) {
        query = query.not("id", "in", `(${linkedIds.join(",")})`);
      }

      const { data, error } = await query;

      if (error) {
        logger.error("Error fetching available projects:", error);
        throw new Error("Failed to fetch available projects");
      }

      return data || [];
    } catch (error) {
      logger.error("VisionBoardService.getAvailableProjects error:", error);
      throw error;
    }
  }

  /**
   * Gets vision goal categories
   * @returns {Promise<Array>} - Categories
   */
  async getCategories() {
    try {
      const { data, error } = await supabase
        .from("vision_board")
        .select("category")
        .not("category", "is", null);

      if (error) {
        logger.error("Error fetching categories:", error);
        throw new Error("Failed to fetch categories");
      }

      const categories = [
        ...new Set(data.map((d) => d.category).filter((c) => c)),
      ];
      return categories.sort();
    } catch (error) {
      logger.error("VisionBoardService.getCategories error:", error);
      throw error;
    }
  }

  /**
   * Gets goal statistics
   * @returns {Promise<Object>} - Statistics
   */
  async getStatistics() {
    try {
      const { data, error } = await supabase.from("vision_board").select("*");

      if (error) {
        logger.error("Error fetching statistics:", error);
        throw new Error("Failed to fetch statistics");
      }

      return VisionUtils.getGoalStatistics(data || []);
    } catch (error) {
      logger.error("VisionBoardService.getStatistics error:", error);
      throw error;
    }
  }
}

const visionBoardService = new VisionBoardService();

module.exports = visionBoardService;
module.exports.visionBoardService = visionBoardService;
