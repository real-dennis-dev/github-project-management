const { supabase } = require("../../../common/config/supabase");
const DatabaseUtils = require("../../../common/utils/database.utils");
const { ValidationUtils } = require("../../../common/utils/validation.utils");
const { DateUtils } = require("../../../common/utils/date.utils");
const { projectStatus, projectPriority } = require("../utils/project.utils");

class ProjectService {
  /**
   * Gets all projects with filters
   * @param {Object} params - Filter parameters
   * @param {string} params.status - Project status filter
   * @param {string} params.priority - Project priority filter
   * @param {string} params.startDate - Start date for range filter
   * @param {string} params.endDate - End date for range filter
   * @param {string} params.search - Search term for name/description
   * @param {number} params.page - Page number for pagination
   * @param {number} params.limit - Items per page
   * @param {string} params.sortBy - Sort field
   * @param {string} params.sortOrder - Sort order (asc/desc)
   * @returns {Promise<Object>} Projects with pagination metadata
   */
  async getAllProjects(params = {}) {
    try {
      const {
        status,
        priority,
        startDate,
        endDate,
        search,
        page = 1,
        limit = 10,
        sortBy = "created_at",
        sortOrder = "desc",
      } = params;

      let query = supabase.from("projects").select("*", { count: "exact" });

      // Apply filters
      if (status && ValidationUtils.validateEnum(status, projectStatus)) {
        query = query.eq("status", status);
      }

      if (priority && ValidationUtils.validateEnum(priority, projectPriority)) {
        query = query.eq("priority", priority);
      }

      if (startDate && endDate) {
        query = query.gte("start_date", startDate).lte("start_date", endDate);
      }

      if (search) {
        query = query.or(
          `name.ilike.%${search}%,description.ilike.%${search}%`
        );
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === "asc" });

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      // Calculate completion for each project
      const projectsWithCompletion = await Promise.all(
        data.map(async (project) => {
          const completion = await this.calculateProjectCompletion(project.id);
          return { ...project, completion_percentage: completion };
        })
      );

      return {
        data: projectsWithCompletion,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      throw new Error(`Error fetching projects: ${error.message}`);
    }
  }

  /**
   * Gets a single project by ID with relations
   * @param {string} id - Project UUID
   * @returns {Promise<Object>} Project with related data
   */
  async getProjectById(id) {
    try {
      // Get project
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

      if (projectError) throw projectError;

      // Get related features
      const { data: features, error: featuresError } = await supabase
        .from("features")
        .select("*")
        .eq("project_id", id)
        .order("order_index", { ascending: true });

      if (featuresError) throw featuresError;

      // Get related bugs
      const { data: bugs, error: bugsError } = await supabase
        .from("bugs")
        .select("*")
        .eq("project_id", id)
        .order("created_at", { ascending: false });

      if (bugsError) throw bugsError;

      // Get related milestones
      const { data: milestones, error: milestonesError } = await supabase
        .from("milestones")
        .select("*")
        .eq("project_id", id)
        .order("target_date", { ascending: true });

      if (milestonesError) throw milestonesError;

      // Calculate analytics
      const analytics = await this.getProjectAnalytics(id);

      return {
        ...project,
        features,
        bugs,
        milestones,
        analytics,
      };
    } catch (error) {
      throw new Error(`Error fetching project: ${error.message}`);
    }
  }

  /**
   * Creates a new project
   * @param {Object} data - Project data
   * @param {string} data.name - Project name
   * @param {string} data.description - Project description
   * @param {string} data.status - Project status
   * @param {string} data.priority - Project priority
   * @param {Array<string>} data.tech_stack - Tech stack array
   * @param {string} data.repository_url - Repository URL
   * @param {string} data.start_date - Start date
   * @param {string} data.target_completion_date - Target completion date
   * @returns {Promise<Object>} Created project
   */
  async createProject(data) {
    try {
      // Validate data
      this.validateProjectData(data);

      // Check for duplicate name
      const { data: existing, error: checkError } = await supabase
        .from("projects")
        .select("id")
        .eq("name", data.name)
        .maybeSingle();

      if (checkError) throw checkError;
      if (existing) throw new Error("Project with this name already exists");

      // Create project
      const { data: project, error } = await supabase
        .from("projects")
        .insert([
          {
            ...data,
            status: data.status || "planning",
            priority: data.priority || "medium",
            completion_percentage: 0,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      return project;
    } catch (error) {
      throw new Error(`Error creating project: ${error.message}`);
    }
  }

  /**
   * Updates a project
   * @param {string} id - Project UUID
   * @param {Object} data - Updated project data
   * @returns {Promise<Object>} Updated project
   */
  async updateProject(id, data) {
    try {
      // Validate data
      this.validateProjectData(data, true);

      // Check if project exists
      await this.getProjectById(id);

      // Update project
      const { data: project, error } = await supabase
        .from("projects")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return project;
    } catch (error) {
      throw new Error(`Error updating project: ${error.message}`);
    }
  }

  /**
   * Updates project status
   * @param {string} id - Project UUID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated project
   */
  async updateProjectStatus(id, status) {
    try {
      // Validate status
      if (!ValidationUtils.validateEnum(status, projectStatus)) {
        throw new Error(`Invalid status: ${status}`);
      }

      // Check if project exists
      await this.getProjectById(id);

      // Update status
      const { data: project, error } = await supabase
        .from("projects")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return project;
    } catch (error) {
      throw new Error(`Error updating project status: ${error.message}`);
    }
  }

  /**
   * Deletes a project (soft delete by archiving)
   * @param {string} id - Project UUID
   * @param {boolean} hardDelete - If true, permanently delete
   * @returns {Promise<Object>} Deletion result
   */
  async deleteProject(id, hardDelete = false) {
    try {
      // Check if project exists
      await this.getProjectById(id);

      if (hardDelete) {
        // Hard delete - cascade will handle related records
        const { error } = await supabase.from("projects").delete().eq("id", id);

        if (error) throw error;

        return { message: "Project permanently deleted" };
      } else {
        // Soft delete - archive status
        const { data: project, error } = await supabase
          .from("projects")
          .update({
            status: "archived",
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;

        return { message: "Project archived", project };
      }
    } catch (error) {
      throw new Error(`Error deleting project: ${error.message}`);
    }
  }

  /**
   * Gets project analytics
   * @param {string} id - Project UUID
   * @returns {Promise<Object>} Project metrics
   */
  async getProjectAnalytics(id) {
    try {
      // Get features stats
      const { data: features, error: featuresError } = await supabase
        .from("features")
        .select("status")
        .eq("project_id", id);

      if (featuresError) throw featuresError;

      // Get bugs stats
      const { data: bugs, error: bugsError } = await supabase
        .from("bugs")
        .select("status, priority")
        .eq("project_id", id);

      if (bugsError) throw bugsError;

      // Get milestones stats
      const { data: milestones, error: milestonesError } = await supabase
        .from("milestones")
        .select("status, progress_percentage")
        .eq("project_id", id);

      if (milestonesError) throw milestonesError;

      // Calculate completion
      const completion = await this.calculateProjectCompletion(id);

      return {
        completion_percentage: completion,
        feature_stats: this._calculateFeatureStats(features),
        bug_stats: this._calculateBugStats(bugs),
        milestone_stats: this._calculateMilestoneStats(milestones),
        total_features: features.length,
        total_bugs: bugs.length,
        total_milestones: milestones.length,
      };
    } catch (error) {
      throw new Error(`Error getting project analytics: ${error.message}`);
    }
  }

  /**
   * Calculates project completion percentage
   * @param {string} projectId - Project UUID
   * @returns {Promise<number>} Completion percentage
   */
  async calculateProjectCompletion(projectId) {
    try {
      const { data: features, error } = await supabase
        .from("features")
        .select("status")
        .eq("project_id", projectId);

      if (error) throw error;

      if (features.length === 0) return 0;

      const completed = features.filter((f) => f.status === "completed").length;
      return Math.round((completed / features.length) * 100);
    } catch (error) {
      throw new Error(`Error calculating project completion: ${error.message}`);
    }
  }

  /**
   * Validates project data
   * @param {Object} data - Project data to validate
   * @param {boolean} partial - Allow partial validation
   * @returns {Object} Validation result
   */
  validateProjectData(data, partial = false) {
    const errors = [];

    if (!partial || data.name !== undefined) {
      if (!data.name || data.name.trim().length === 0) {
        errors.push("Project name is required");
      }
      if (data.name && data.name.length > 255) {
        errors.push("Project name must be less than 255 characters");
      }
    }

    if (!partial || data.status !== undefined) {
      if (
        data.status &&
        !ValidationUtils.validateEnum(data.status, projectStatus)
      ) {
        errors.push(
          `Invalid status. Must be one of: ${Object.values(projectStatus).join(
            ", "
          )}`
        );
      }
    }

    if (!partial || data.priority !== undefined) {
      if (
        data.priority &&
        !ValidationUtils.validateEnum(data.priority, projectPriority)
      ) {
        errors.push(
          `Invalid priority. Must be one of: ${Object.values(
            projectPriority
          ).join(", ")}`
        );
      }
    }

    if (!partial || data.completion_percentage !== undefined) {
      if (
        data.completion_percentage !== undefined &&
        (data.completion_percentage < 0 || data.completion_percentage > 100)
      ) {
        errors.push("Completion percentage must be between 0 and 100");
      }
    }

    if (!partial || data.start_date !== undefined) {
      if (data.start_date && !ValidationUtils.validateDate(data.start_date)) {
        errors.push("Invalid start date format");
      }
    }

    if (!partial || data.target_completion_date !== undefined) {
      if (
        data.target_completion_date &&
        !ValidationUtils.validateDate(data.target_completion_date)
      ) {
        errors.push("Invalid target completion date format");
      }
    }

    if (!partial || data.repository_url !== undefined) {
      if (
        data.repository_url &&
        !ValidationUtils.validateURL(data.repository_url)
      ) {
        errors.push("Invalid repository URL");
      }
    }

    if (errors.length > 0) {
      throw new Error(errors.join(", "));
    }

    return { valid: true };
  }

  /**
   * Private helper to calculate feature stats
   * @param {Array} features - Features array
   * @returns {Object} Feature statistics
   */
  _calculateFeatureStats(features) {
    const stats = {};
    const statuses = [
      "planned",
      "in_progress",
      "completed",
      "blocked",
      "cancelled",
    ];

    statuses.forEach((status) => {
      stats[status] = features.filter((f) => f.status === status).length;
    });

    return stats;
  }

  /**
   * Private helper to calculate bug stats
   * @param {Array} bugs - Bugs array
   * @returns {Object} Bug statistics
   */
  _calculateBugStats(bugs) {
    const stats = {
      by_status: {},
      by_priority: {},
    };

    const statuses = [
      "reported",
      "investigating",
      "in_progress",
      "fixed",
      "verified",
      "closed",
    ];
    const priorities = ["low", "medium", "high", "critical"];

    statuses.forEach((status) => {
      stats.by_status[status] = bugs.filter((b) => b.status === status).length;
    });

    priorities.forEach((priority) => {
      stats.by_priority[priority] = bugs.filter(
        (b) => b.priority === priority
      ).length;
    });

    return stats;
  }

  /**
   * Private helper to calculate milestone stats
   * @param {Array} milestones - Milestones array
   * @returns {Object} Milestone statistics
   */
  _calculateMilestoneStats(milestones) {
    const stats = {};
    const statuses = ["not_started", "in_progress", "completed", "delayed"];

    statuses.forEach((status) => {
      stats[status] = milestones.filter((m) => m.status === status).length;
    });

    return stats;
  }
}
module.exports = { ProjectService };
