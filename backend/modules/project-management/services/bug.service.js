const { supabase } = require("../../../common/config/supabase");
const { ValidationUtils } = require("../../../common/utils/validation.utils");
const { DateUtils } = require("../../../common/utils/date.utils");
const { bugStatus, bugPriority } = require("../utils/project.utils");

class BugService {
  /**
   * Gets bugs for a project with filters
   * @param {string} projectId - Project UUID
   * @param {Object} filters - Filter parameters
   * @param {string} filters.status - Bug status filter
   * @param {string} filters.priority - Bug priority filter
   * @param {string} filters.assigned_to - Assignee filter
   * @param {number} filters.page - Page number
   * @param {number} filters.limit - Items per page
   * @returns {Promise<Object>} Bugs with pagination
   */
  async getProjectBugs(projectId, filters = {}) {
    try {
      const { status, priority, assigned_to, page = 1, limit = 10 } = filters;

      let query = supabase
        .from("bugs")
        .select("*", { count: "exact" })
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (status && ValidationUtils.validateEnum(status, bugStatus)) {
        query = query.eq("status", status);
      }

      if (priority && ValidationUtils.validateEnum(priority, bugPriority)) {
        query = query.eq("priority", priority);
      }

      if (assigned_to) {
        query = query.eq("assigned_to", assigned_to);
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      throw new Error(`Error fetching bugs: ${error.message}`);
    }
  }

  /**
   * Gets a bug by ID
   * @param {string} id - Bug UUID
   * @returns {Promise<Object>} Bug
   */
  async getBugById(id) {
    try {
      const { data: bug, error } = await supabase
        .from("bugs")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      return bug;
    } catch (error) {
      throw new Error(`Error fetching bug: ${error.message}`);
    }
  }

  /**
   * Creates a new bug
   * @param {string} projectId - Project UUID
   * @param {Object} data - Bug data
   * @returns {Promise<Object>} Created bug
   */
  async createBug(projectId, data) {
    try {
      // Validate data
      this.validateBugData(data);

      const { data: bug, error } = await supabase
        .from("bugs")
        .insert([
          {
            ...data,
            project_id: projectId,
            status: data.status || "reported",
            priority: data.priority || "medium",
          },
        ])
        .select()
        .single();

      if (error) throw error;

      return bug;
    } catch (error) {
      throw new Error(`Error creating bug: ${error.message}`);
    }
  }

  /**
   * Updates a bug
   * @param {string} id - Bug UUID
   * @param {Object} data - Updated bug data
   * @returns {Promise<Object>} Updated bug
   */
  async updateBug(id, data) {
    try {
      // Validate data
      this.validateBugData(data, true);

      // Check if bug exists
      await this.getBugById(id);

      const { data: bug, error } = await supabase
        .from("bugs")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return bug;
    } catch (error) {
      throw new Error(`Error updating bug: ${error.message}`);
    }
  }

  /**
   * Updates bug status with transition rules
   * @param {string} id - Bug UUID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated bug
   */
  async updateBugStatus(id, status) {
    try {
      if (!ValidationUtils.validateEnum(status, bugStatus)) {
        throw new Error(`Invalid status: ${status}`);
      }

      const bug = await this.getBugById(id);

      // Validate status transition
      this._validateStatusTransition(bug.status, status);

      const updateData = {
        status,
        updated_at: new Date().toISOString(),
      };

      // If status is 'fixed' or 'closed', set completed_at
      if (status === "fixed" || status === "closed") {
        updateData.completed_at = new Date().toISOString();
      }

      const { data: updated, error } = await supabase
        .from("bugs")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return updated;
    } catch (error) {
      throw new Error(`Error updating bug status: ${error.message}`);
    }
  }

  /**
   * Assigns bug to a person
   * @param {string} id - Bug UUID
   * @param {string} assignee - Assignee name/ID
   * @returns {Promise<Object>} Updated bug
   */
  async assignBug(id, assignee) {
    try {
      await this.getBugById(id);

      const { data: bug, error } = await supabase
        .from("bugs")
        .update({
          assigned_to: assignee,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return bug;
    } catch (error) {
      throw new Error(`Error assigning bug: ${error.message}`);
    }
  }

  /**
   * Resolves bug with resolution
   * @param {string} id - Bug UUID
   * @param {string} resolution - Resolution details
   * @returns {Promise<Object>} Resolved bug
   */
  async resolveBug(id, resolution) {
    try {
      const bug = await this.getBugById(id);

      const { data: updated, error } = await supabase
        .from("bugs")
        .update({
          status: "fixed",
          possible_fix: resolution,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return updated;
    } catch (error) {
      throw new Error(`Error resolving bug: ${error.message}`);
    }
  }

  /**
   * Deletes a bug
   * @param {string} id - Bug UUID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteBug(id) {
    try {
      await this.getBugById(id);

      const { error } = await supabase.from("bugs").delete().eq("id", id);

      if (error) throw error;

      return { message: "Bug deleted successfully" };
    } catch (error) {
      throw new Error(`Error deleting bug: ${error.message}`);
    }
  }

  /**
   * Validates bug data
   * @param {Object} data - Bug data
   * @param {boolean} partial - Allow partial validation
   * @returns {Object} Validation result
   */
  validateBugData(data, partial = false) {
    const errors = [];

    if (!partial || data.title !== undefined) {
      if (!data.title || data.title.trim().length === 0) {
        errors.push("Bug title is required");
      }
    }

    if (!partial || data.status !== undefined) {
      if (
        data.status &&
        !ValidationUtils.validateEnum(data.status, bugStatus)
      ) {
        errors.push(
          `Invalid status. Must be one of: ${Object.values(bugStatus).join(
            ", "
          )}`
        );
      }
    }

    if (!partial || data.priority !== undefined) {
      if (
        data.priority &&
        !ValidationUtils.validateEnum(data.priority, bugPriority)
      ) {
        errors.push(
          `Invalid priority. Must be one of: ${Object.values(bugPriority).join(
            ", "
          )}`
        );
      }
    }

    if (errors.length > 0) {
      throw new Error(errors.join(", "));
    }

    return { valid: true };
  }

  /**
   * Private helper to validate status transitions
   * @param {string} currentStatus - Current bug status
   * @param {string} newStatus - New bug status
   */
  _validateStatusTransition(currentStatus, newStatus) {
    const validTransitions = {
      reported: ["investigating", "in_progress", "closed"],
      investigating: ["in_progress", "fixed", "closed"],
      in_progress: ["fixed", "verified", "closed"],
      fixed: ["verified", "closed"],
      verified: ["closed"],
      closed: [],
    };

    if (
      !validTransitions[currentStatus]?.includes(newStatus) &&
      currentStatus !== newStatus
    ) {
      throw new Error(
        `Invalid status transition from ${currentStatus} to ${newStatus}`
      );
    }
  }
}
module.exports = BugService;
