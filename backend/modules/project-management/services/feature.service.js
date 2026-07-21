const { supabase } = require("../../../common/config/supabase");
const { ValidationUtils } = require("../../../common/utils/validation.utils");
const { featureStatus, featureDifficulty } = require("../utils/project.utils");

class FeatureService {
  /**
   * Gets features for a project with filters
   * @param {string} projectId - Project UUID
   * @param {Object} filters - Filter parameters
   * @param {string} filters.status - Feature status filter
   * @param {string} filters.difficulty - Feature difficulty filter
   * @param {number} filters.page - Page number
   * @param {number} filters.limit - Items per page
   * @param {string} filters.sortBy - Sort field
   * @param {string} filters.sortOrder - Sort order
   * @returns {Promise<Object>} Features with pagination
   */
  async getProjectFeatures(projectId, filters = {}) {
    try {
      const {
        status,
        difficulty,
        page = 1,
        limit = 10,
        sortBy = "order_index",
        sortOrder = "asc",
      } = filters;

      let query = supabase
        .from("features")
        .select("*, feature_subtasks(*)", { count: "exact" })
        .eq("project_id", projectId);

      if (status && ValidationUtils.validateEnum(status, featureStatus)) {
        query = query.eq("status", status);
      }

      if (
        difficulty &&
        ValidationUtils.validateEnum(difficulty, featureDifficulty)
      ) {
        query = query.eq("difficulty", difficulty);
      }

      query = query.order(sortBy, { ascending: sortOrder === "asc" });

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
      throw new Error(`Error fetching features: ${error.message}`);
    }
  }

  /**
   * Creates a new feature
   * @param {string} projectId - Project UUID
   * @param {Object} data - Feature data
   * @returns {Promise<Object>} Created feature
   */
  async createFeature(projectId, data) {
    try {
      // Validate data
      this.validateFeatureData(data);

      // Get max order_index
      const { data: maxOrder, error: orderError } = await supabase
        .from("features")
        .select("order_index")
        .eq("project_id", projectId)
        .order("order_index", { ascending: false })
        .limit(1);

      if (orderError) throw orderError;

      const orderIndex =
        maxOrder && maxOrder.length > 0 ? maxOrder[0].order_index + 1 : 0;

      // Create feature
      const { data: feature, error } = await supabase
        .from("features")
        .insert([
          {
            ...data,
            project_id: projectId,
            order_index: orderIndex,
            status: data.status || "planned",
          },
        ])
        .select()
        .single();

      if (error) throw error;

      return feature;
    } catch (error) {
      throw new Error(`Error creating feature: ${error.message}`);
    }
  }

  /**
   * Gets a feature by ID
   * @param {string} id - Feature UUID
   * @returns {Promise<Object>} Feature with subtasks
   */
  async getFeatureById(id) {
    try {
      const { data: feature, error } = await supabase
        .from("features")
        .select("*, feature_subtasks(*)")
        .eq("id", id)
        .single();

      if (error) throw error;

      return feature;
    } catch (error) {
      throw new Error(`Error fetching feature: ${error.message}`);
    }
  }

  /**
   * Updates a feature
   * @param {string} id - Feature UUID
   * @param {Object} data - Updated feature data
   * @returns {Promise<Object>} Updated feature
   */
  async updateFeature(id, data) {
    try {
      // Validate data
      this.validateFeatureData(data, true);

      // Check if feature exists
      await this.getFeatureById(id);

      const { data: feature, error } = await supabase
        .from("features")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return feature;
    } catch (error) {
      throw new Error(`Error updating feature: ${error.message}`);
    }
  }

  /**
   * Updates feature status
   * @param {string} id - Feature UUID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated feature
   */
  async updateFeatureStatus(id, status) {
    try {
      if (!ValidationUtils.validateEnum(status, featureStatus)) {
        throw new Error(`Invalid status: ${status}`);
      }

      await this.getFeatureById(id);

      const { data: feature, error } = await supabase
        .from("features")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return feature;
    } catch (error) {
      throw new Error(`Error updating feature status: ${error.message}`);
    }
  }

  /**
   * Deletes a feature and its subtasks
   * @param {string} id - Feature UUID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteFeature(id) {
    try {
      await this.getFeatureById(id);

      const { error } = await supabase.from("features").delete().eq("id", id);

      if (error) throw error;

      return { message: "Feature deleted successfully" };
    } catch (error) {
      throw new Error(`Error deleting feature: ${error.message}`);
    }
  }

  /**
   * Reorders features
   * @param {string} projectId - Project UUID
   * @param {Array<string>} orderedIds - Ordered feature IDs
   * @returns {Promise<Object>} Reorder result
   */
  async reorderFeatures(projectId, orderedIds) {
    try {
      // Verify all features belong to project
      const { data: features, error: checkError } = await supabase
        .from("features")
        .select("id")
        .eq("project_id", projectId);

      if (checkError) throw checkError;

      const featureIds = features.map((f) => f.id);
      const allExist = orderedIds.every((id) => featureIds.includes(id));

      if (!allExist || orderedIds.length !== featureIds.length) {
        throw new Error("Invalid feature order - some features missing");
      }

      // Update order_index for each feature
      const updates = orderedIds.map((id, index) => ({
        id,
        order_index: index,
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase.from("features").upsert(updates);

      if (error) throw error;

      return { message: "Features reordered successfully" };
    } catch (error) {
      throw new Error(`Error reordering features: ${error.message}`);
    }
  }

  /**
   * Validates feature data
   * @param {Object} data - Feature data
   * @param {boolean} partial - Allow partial validation
   * @returns {Object} Validation result
   */
  validateFeatureData(data, partial = false) {
    const errors = [];

    if (!partial || data.title !== undefined) {
      if (!data.title || data.title.trim().length === 0) {
        errors.push("Feature title is required");
      }
    }

    if (!partial || data.status !== undefined) {
      if (
        data.status &&
        !ValidationUtils.validateEnum(data.status, featureStatus)
      ) {
        errors.push(
          `Invalid status. Must be one of: ${Object.values(featureStatus).join(
            ", "
          )}`
        );
      }
    }

    if (!partial || data.difficulty !== undefined) {
      if (
        data.difficulty &&
        !ValidationUtils.validateEnum(data.difficulty, featureDifficulty)
      ) {
        errors.push(
          `Invalid difficulty. Must be one of: ${Object.values(
            featureDifficulty
          ).join(", ")}`
        );
      }
    }

    if (!partial || data.estimated_days !== undefined) {
      if (data.estimated_days !== undefined && data.estimated_days <= 0) {
        errors.push("Estimated days must be greater than 0");
      }
    }

    if (errors.length > 0) {
      throw new Error(errors.join(", "));
    }

    return { valid: true };
  }
}

module.exports = { FeatureService };
