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
  /**
   * Gets aggregated Vision Board dashboard data.
   *
   * This endpoint intentionally does NOT accept a project ID.
   *
   * It aggregates:
   * - Vision goals
   * - Linked projects
   * - Project completion
   * - Goal status
   * - Goal priority
   * - Goal progress
   *
   * @param {Object} options
   * @returns {Promise<Object>}
   */
  async getDashboard(options = {}) {
    try {
      const { page = 1, limit = 20, sortOrder = "DESC" } = options;

      /*
       * ============================================================
       * 1. Fetch all vision goals
       * ============================================================
       */

      const { data: goals, error: goalsError } = await supabase.from(
        "vision_board"
      ).select(`
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
            created_at,
            updated_at
          )
        )
      `);

      if (goalsError) {
        logger.error("Error fetching dashboard vision goals:", goalsError);

        throw new Error("Failed to fetch vision board dashboard");
      }

      const visionGoals = goals || [];

      /*
       * ============================================================
       * 2. Collect all projects
       *
       * A project can theoretically be linked to multiple
       * vision goals, therefore we deduplicate by project ID.
       * ============================================================
       */

      const projectsMap = new Map();

      visionGoals.forEach((goal) => {
        const links = goal.vision_projects || [];

        links.forEach((link) => {
          if (link.projects && link.projects.id) {
            projectsMap.set(link.projects.id, link.projects);
          }
        });
      });

      const linkedProjects = Array.from(projectsMap.values());

      /*
       * ============================================================
       * 3. Project statistics
       * ============================================================
       */

      const projectStats = {
        total: linkedProjects.length,

        completed: 0,

        in_progress: 0,

        not_started: 0,

        average_completion: 0,
      };

      let totalCompletion = 0;

      linkedProjects.forEach((project) => {
        const completion = Number(project.completion_percentage || 0);

        totalCompletion += completion;

        if (project.status === "completed" || completion >= 100) {
          projectStats.completed++;
        } else if (project.status === "in_progress" || completion > 0) {
          projectStats.in_progress++;
        } else {
          projectStats.not_started++;
        }
      });

      if (linkedProjects.length > 0) {
        projectStats.average_completion = Math.round(
          totalCompletion / linkedProjects.length
        );
      }

      /*
       * ============================================================
       * 4. Goal statistics
       * ============================================================
       */

      const goalStats = {
        total: visionGoals.length,

        draft: 0,

        active: 0,

        completed: 0,

        archived: 0,

        average_priority: 0,

        average_progress: 0,
      };

      let totalPriority = 0;
      let totalProgress = 0;

      visionGoals.forEach((goal) => {
        const status = goal.status || "draft";

        if (Object.prototype.hasOwnProperty.call(goalStats, status)) {
          goalStats[status]++;
        }

        totalPriority += Number(goal.priority || 0);

        /*
         * Progress is calculated from linked projects
         * instead of trusting a stored progress field.
         */

        const links = goal.vision_projects || [];

        const projects = links.map((link) => link.projects).filter(Boolean);

        const progressData = VisionUtils.calculateGoalProgress(projects);

        totalProgress += progressData.progress;
      });

      if (visionGoals.length > 0) {
        goalStats.average_priority =
          Math.round((totalPriority / visionGoals.length) * 10) / 10;

        goalStats.average_progress = Math.round(
          totalProgress / visionGoals.length
        );
      }

      /*
       * ============================================================
       * 5. Calculate ALL projects in the system
       *
       * This is important because the dashboard is across
       * all projects, not just projects linked to a goal.
       * ============================================================
       */

      const { data: allProjects, error: allProjectsError } =
        await supabase.from("projects").select(`
        id,
        name,
        status,
        completion_percentage,
        priority,
        created_at,
        updated_at
      `);

      if (allProjectsError) {
        logger.error(
          "Error fetching all projects for dashboard:",
          allProjectsError
        );

        throw new Error("Failed to fetch project dashboard statistics");
      }

      const projects = allProjects || [];

      /*
       * ============================================================
       * 6. Statistics across ALL projects
       * ============================================================
       */

      const allProjectStats = {
        total: projects.length,

        completed: 0,

        in_progress: 0,

        not_started: 0,

        average_completion: 0,
      };

      let allProjectCompletion = 0;

      projects.forEach((project) => {
        const completion = Number(project.completion_percentage || 0);

        allProjectCompletion += completion;

        if (project.status === "completed" || completion >= 100) {
          allProjectStats.completed++;
        } else if (project.status === "in_progress" || completion > 0) {
          allProjectStats.in_progress++;
        } else {
          allProjectStats.not_started++;
        }
      });

      if (projects.length > 0) {
        allProjectStats.average_completion = Math.round(
          allProjectCompletion / projects.length
        );
      }

      /*
       * ============================================================
       * 7. Find unlinked projects
       * ============================================================
       */

      const linkedProjectIds = new Set(
        linkedProjects.map((project) => project.id)
      );

      const unlinkedProjects = projects.filter(
        (project) => !linkedProjectIds.has(project.id)
      );

      /*
       * ============================================================
       * 8. Build dashboard items
       *
       * Each goal becomes one dashboard item.
       *
       * These are intentionally lightweight because the UI
       * can call GET /vision-board/:id when the user clicks.
       * ============================================================
       */

      let items = visionGoals.map((goal) => {
        const links = goal.vision_projects || [];

        const goalProjects = links.map((link) => link.projects).filter(Boolean);

        const progressData = VisionUtils.calculateGoalProgress(goalProjects);

        /*
         * Determine the latest activity associated
         * with this vision goal.
         */

        const dates = [
          goal.created_at,
          goal.updated_at,

          ...goalProjects.flatMap((project) => [
            project.created_at,
            project.updated_at,
          ]),
        ]
          .filter(Boolean)
          .map((date) => new Date(date))
          .filter((date) => !isNaN(date.getTime()));

        const latestActivity =
          dates.length > 0
            ? new Date(Math.max(...dates.map((date) => date.getTime())))
            : null;

        return {
          id: goal.id,

          type: "vision_goal",

          title: goal.goal,

          description: goal.description || null,

          category: goal.category || "General",

          status: goal.status || "draft",

          priority: Number(goal.priority || 0),

          priority_label: VisionUtils.getPriorityLabel(
            Number(goal.priority || 0)
          ),

          progress: progressData.progress,

          progress_status: progressData.status,

          project_count: goalProjects.length,

          completed_projects: progressData.completedProjects,

          in_progress_projects: progressData.inProgressProjects,

          not_started_projects: progressData.notStartedProjects,

          target_timeline: goal.target_timeline || null,

          created_at: goal.created_at || null,

          updated_at: goal.updated_at || null,

          latest_activity: latestActivity ? latestActivity.toISOString() : null,
        };
      });

      /*
       * ============================================================
       * 9. Sort dashboard items by latest activity
       * ============================================================
       */

      items.sort((a, b) => {
        const dateA = a.latest_activity
          ? new Date(a.latest_activity).getTime()
          : 0;

        const dateB = b.latest_activity
          ? new Date(b.latest_activity).getTime()
          : 0;

        return sortOrder === "ASC" ? dateA - dateB : dateB - dateA;
      });

      /*
       * ============================================================
       * 10. Pagination
       * ============================================================
       */

      const totalItems = items.length;

      const from = (page - 1) * limit;

      const to = from + limit;

      const paginatedItems = items.slice(from, to);

      /*
       * ============================================================
       * 11. Overall progress
       *
       * Based on all projects in the system.
       * ============================================================
       */

      const overallProgress = allProjectStats.average_completion;

      /*
       * ============================================================
       * 12. Return dashboard
       * ============================================================
       */

      return {
        stats: {
          /*
           * Vision goals
           */
          total_goals: goalStats.total,

          draft_goals: goalStats.draft,

          active_goals: goalStats.active,

          completed_goals: goalStats.completed,

          archived_goals: goalStats.archived,

          average_priority: goalStats.average_priority,

          average_goal_progress: goalStats.average_progress,

          /*
           * Projects
           */
          total_projects: allProjectStats.total,

          linked_projects: linkedProjects.length,

          unlinked_projects: unlinkedProjects.length,

          completed_projects: allProjectStats.completed,

          in_progress_projects: allProjectStats.in_progress,

          not_started_projects: allProjectStats.not_started,

          average_project_completion: allProjectStats.average_completion,

          /*
           * Overall dashboard metric
           */
          overall_progress: overallProgress,
        },

        items: paginatedItems,

        pagination: {
          page,

          limit,

          total: totalItems,

          totalPages: Math.ceil(totalItems / limit),
        },

        generated_at: new Date().toISOString(),
      };
    } catch (error) {
      logger.error("VisionBoardService.getDashboard error:", error);

      throw error;
    }
  }
}

const visionBoardService = new VisionBoardService();

module.exports = visionBoardService;
module.exports.visionBoardService = visionBoardService;
