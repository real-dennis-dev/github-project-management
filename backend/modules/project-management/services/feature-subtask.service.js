const { supabase } = require("../../../common/config/supabase");
const { ValidationUtils } = require("../../../common/utils/validation.utils");

class FeatureSubtaskService {
  /**
   * Gets subtasks for a feature
   * @param {string} featureId - Feature UUID
   * @param {Object} filters - Filter parameters
   * @param {boolean} filters.is_completed - Filter by completion status
   * @param {number} filters.page - Page number
   * @param {number} filters.limit - Items per page
   * @returns {Promise<Object>} Subtasks with pagination
   */
  async getSubtasks(featureId, filters = {}) {
    try {
      const { is_completed, page = 1, limit = 10 } = filters;

      let query = supabase
        .from("feature_subtasks")
        .select("*", { count: "exact" })
        .eq("feature_id", featureId)
        .order("order_index", { ascending: true });

      if (is_completed !== undefined) {
        query = query.eq("is_completed", is_completed);
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
      throw new Error(`Error fetching subtasks: ${error.message}`);
    }
  }

  /**
   * Creates a subtask
   * @param {string} featureId - Feature UUID
   * @param {Object} data - Subtask data
   * @returns {Promise<Object>} Created subtask
   */
  async createSubtask(featureId, data) {
    try {
      // Validate data
      this.validateSubtaskData(data);

      // Get max order_index
      const { data: maxOrder, error: orderError } = await supabase
        .from("feature_subtasks")
        .select("order_index")
        .eq("feature_id", featureId)
        .order("order_index", { ascending: false })
        .limit(1);

      if (orderError) throw orderError;

      const orderIndex =
        maxOrder && maxOrder.length > 0 ? maxOrder[0].order_index + 1 : 0;

      const { data: subtask, error } = await supabase
        .from("feature_subtasks")
        .insert([
          {
            ...data,
            feature_id: featureId,
            order_index: orderIndex,
            is_completed: data.is_completed || false,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      return subtask;
    } catch (error) {
      throw new Error(`Error creating subtask: ${error.message}`);
    }
  }

  /**
   * Updates a subtask
   * @param {string} id - Subtask UUID
   * @param {Object} data - Updated subtask data
   * @returns {Promise<Object>} Updated subtask
   */
  async updateSubtask(id, data) {
    try {
      // Validate data
      this.validateSubtaskData(data, true);

      // Check if subtask exists
      await this.getSubtaskById(id);

      const { data: subtask, error } = await supabase
        .from("feature_subtasks")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return subtask;
    } catch (error) {
      throw new Error(`Error updating subtask: ${error.message}`);
    }
  }

  /**
   * Toggles subtask completion
   * @param {string} id - Subtask UUID
   * @returns {Promise<Object>} Updated subtask
   */
  async toggleSubtaskCompletion(id) {
    try {
      const subtask = await this.getSubtaskById(id);

      const { data: updated, error } = await supabase
        .from("feature_subtasks")
        .update({
          is_completed: !subtask.is_completed,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Update feature completion status if all subtasks are complete
      await this._updateFeatureCompletionStatus(subtask.feature_id);

      return updated;
    } catch (error) {
      throw new Error(`Error toggling subtask: ${error.message}`);
    }
  }

  /**
   * Deletes a subtask
   * @param {string} id - Subtask UUID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteSubtask(id) {
    try {
      const subtask = await this.getSubtaskById(id);

      const { error } = await supabase
        .from("feature_subtasks")
        .delete()
        .eq("id", id);

      if (error) throw error;

      return { message: "Subtask deleted successfully" };
    } catch (error) {
      throw new Error(`Error deleting subtask: ${error.message}`);
    }
  }

  /**
   * Gets a subtask by ID
   * @param {string} id - Subtask UUID
   * @returns {Promise<Object>} Subtask
   */
  async getSubtaskById(id) {
    try {
      const { data: subtask, error } = await supabase
        .from("feature_subtasks")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      return subtask;
    } catch (error) {
      throw new Error(`Error fetching subtask: ${error.message}`);
    }
  }

  /**
   * Validates subtask data
   * @param {Object} data - Subtask data
   * @param {boolean} partial - Allow partial validation
   * @returns {Object} Validation result
   */
  validateSubtaskData(data, partial = false) {
    const errors = [];

    if (!partial || data.title !== undefined) {
      if (!data.title || data.title.trim().length === 0) {
        errors.push("Subtask title is required");
      }
    }

    if (errors.length > 0) {
      throw new Error(errors.join(", "));
    }

    return { valid: true };
  }

  /**
   * Private helper to update feature completion status
   * @param {string} featureId - Feature UUID
   */
  async _updateFeatureCompletionStatus(featureId) {
    try {
      const { data: subtasks, error } = await supabase
        .from("feature_subtasks")
        .select("is_completed")
        .eq("feature_id", featureId);

      if (error) throw error;

      const allCompleted = subtasks.every((st) => st.is_completed);
      const anyCompleted = subtasks.some((st) => st.is_completed);

      let status = "planned";
      if (allCompleted && subtasks.length > 0) {
        status = "completed";
      } else if (anyCompleted) {
        status = "in_progress";
      }

      await supabase
        .from("features")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", featureId);
    } catch (error) {
      console.error("Error updating feature completion status:", error);
    }
  }
}
module.exports = { FeatureSubtaskService };
