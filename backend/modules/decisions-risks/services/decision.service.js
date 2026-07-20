const { supabase } = require("../../../common/config/supabase");
const DecisionUtils = require("../utils/decision.utils");
const logger = require("../../../common/config/logger");

/**
 * Decision Service
 * Handles business logic for decisions
 */
class DecisionService {
  /**
   * Gets decisions for a project with filters
   * @param {string} projectId - Project UUID
   * @param {Object} options - Query options
   * @param {string} options.impact - Filter by impact
   * @param {Date} options.fromDate - Filter from date
   * @param {Date} options.toDate - Filter to date
   * @param {number} options.page - Page number
   * @param {number} options.limit - Items per page
   * @param {string} options.sortBy - Sort field
   * @param {string} options.sortOrder - Sort order
   * @returns {Promise<Object>} - Decisions with pagination
   */
  async getProjectDecisions(projectId, options = {}) {
    try {
      const {
        impact,
        fromDate,
        toDate,
        page = 1,
        limit = 20,
        sortBy = "created_at",
        sortOrder = "DESC",
      } = options;

      // Build query
      let query = supabase
        .from("decisions")
        .select("*", { count: "exact" })
        .eq("project_id", projectId);

      // Apply filters
      if (impact && DecisionUtils.validateImpact(impact)) {
        query = query.eq("impact", impact);
      }

      if (fromDate) {
        query = query.gte("decision_date", fromDate);
      }

      if (toDate) {
        query = query.lte("decision_date", toDate);
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === "ASC" });

      // Apply pagination
      const from = (page - 1) * limit;
      query = query.range(from, from + limit - 1);

      // Execute query
      const { data, error, count } = await query;

      if (error) {
        logger.error("Error fetching decisions:", error);
        throw new Error("Failed to fetch decisions");
      }

      return {
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      };
    } catch (error) {
      logger.error("DecisionService.getProjectDecisions error:", error);
      throw error;
    }
  }

  /**
   * Creates a new decision
   * @param {string} projectId - Project UUID
   * @param {Object} data - Decision data
   * @returns {Promise<Object>} - Created decision
   */
  async createDecision(projectId, data) {
    try {
      // Validate data
      const validation = DecisionUtils.validateDecisionData({
        ...data,
        project_id: projectId,
      });

      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      // Prepare data
      const decisionData = {
        project_id: projectId,
        title: data.title.trim(),
        description: data.description.trim(),
        decision: data.decision.trim(),
        reason: data.reason.trim(),
        impact: data.impact || "medium",
        alternatives: data.alternatives ? data.alternatives.trim() : null,
        decision_date:
          data.decision_date || new Date().toISOString().split("T")[0],
      };

      // Insert decision
      const { data: decision, error } = await supabase
        .from("decisions")
        .insert([decisionData])
        .select()
        .single();

      if (error) {
        logger.error("Error creating decision:", error);
        throw new Error("Failed to create decision");
      }

      logger.info(`Decision created: ${decision.id} - ${decision.title}`);
      return decision;
    } catch (error) {
      logger.error("DecisionService.createDecision error:", error);
      throw error;
    }
  }

  /**
   * Gets a decision by ID
   * @param {string} id - Decision UUID
   * @returns {Promise<Object>} - Decision object
   */
  async getDecisionById(id) {
    try {
      const { data, error } = await supabase
        .from("decisions")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        logger.error("Error fetching decision:", error);
        throw new Error("Decision not found");
      }

      return data;
    } catch (error) {
      logger.error("DecisionService.getDecisionById error:", error);
      throw error;
    }
  }

  /**
   * Updates a decision
   * @param {string} id - Decision UUID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} - Updated decision
   */
  async updateDecision(id, data) {
    try {
      // Check if decision exists
      const existing = await this.getDecisionById(id);
      if (!existing) {
        throw new Error("Decision not found");
      }

      // Prepare update data
      const updateData = {};

      if (data.title) updateData.title = data.title.trim();
      if (data.description) updateData.description = data.description.trim();
      if (data.decision) updateData.decision = data.decision.trim();
      if (data.reason) updateData.reason = data.reason.trim();
      if (data.impact) {
        if (!DecisionUtils.validateImpact(data.impact)) {
          throw new Error("Invalid impact value");
        }
        updateData.impact = data.impact;
      }
      if (data.alternatives !== undefined) {
        updateData.alternatives = data.alternatives
          ? data.alternatives.trim()
          : null;
      }
      if (data.decision_date) {
        updateData.decision_date = data.decision_date;
      }

      // Update decision
      const { data: decision, error } = await supabase
        .from("decisions")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        logger.error("Error updating decision:", error);
        throw new Error("Failed to update decision");
      }

      logger.info(`Decision updated: ${decision.id} - ${decision.title}`);
      return decision;
    } catch (error) {
      logger.error("DecisionService.updateDecision error:", error);
      throw error;
    }
  }

  /**
   * Deletes a decision
   * @param {string} id - Decision UUID
   * @returns {Promise<void>}
   */
  async deleteDecision(id) {
    try {
      // Check if decision exists
      await this.getDecisionById(id);

      const { error } = await supabase.from("decisions").delete().eq("id", id);

      if (error) {
        logger.error("Error deleting decision:", error);
        throw new Error("Failed to delete decision");
      }

      logger.info(`Decision deleted: ${id}`);
    } catch (error) {
      logger.error("DecisionService.deleteDecision error:", error);
      throw error;
    }
  }

  /**
   * Gets decisions by date range
   * @param {string} projectId - Project UUID
   * @param {Date} fromDate - Start date
   * @param {Date} toDate - End date
   * @returns {Promise<Array>} - Decisions in date range
   */
  async getDecisionsByDate(projectId, fromDate, toDate) {
    try {
      let query = supabase
        .from("decisions")
        .select("*")
        .eq("project_id", projectId)
        .gte("decision_date", fromDate)
        .lte("decision_date", toDate)
        .order("decision_date", { ascending: false });

      const { data, error } = await query;

      if (error) {
        logger.error("Error fetching decisions by date:", error);
        throw new Error("Failed to fetch decisions");
      }

      return data || [];
    } catch (error) {
      logger.error("DecisionService.getDecisionsByDate error:", error);
      throw error;
    }
  }

  /**
   * Generates decision report
   * @param {string} projectId - Project UUID
   * @returns {Promise<Object>} - Decision report
   */
  async generateDecisionReport(projectId) {
    try {
      // Get all decisions for project
      const { data: decisions } = await supabase
        .from("decisions")
        .select("*")
        .eq("project_id", projectId)
        .order("decision_date", { ascending: false });

      if (!decisions || decisions.length === 0) {
        return {
          total: 0,
          summary: "No decisions made yet",
          statistics: {
            total: 0,
            byImpact: { low: 0, medium: 0, high: 0, critical: 0 },
            recentDecisions: [],
          },
          decisions: [],
        };
      }

      // Calculate statistics
      const statistics = DecisionUtils.calculateStatistics(decisions);

      // Format decisions for report
      const formattedDecisions = decisions.map((d) =>
        DecisionUtils.formatDecisionForExport(d)
      );

      return {
        total: decisions.length,
        summary: `Total decisions: ${decisions.length} (${
          statistics.byImpact.critical || 0
        } critical)`,
        statistics,
        decisions: formattedDecisions,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      logger.error("DecisionService.generateDecisionReport error:", error);
      throw error;
    }
  }

  /**
   * Gets decision statistics
   * @param {string} projectId - Project UUID
   * @returns {Promise<Object>} - Decision statistics
   */
  async getDecisionStatistics(projectId) {
    try {
      const { data: decisions } = await supabase
        .from("decisions")
        .select("*")
        .eq("project_id", projectId);

      return DecisionUtils.calculateStatistics(decisions || []);
    } catch (error) {
      logger.error("DecisionService.getDecisionStatistics error:", error);
      throw error;
    }
  }
}

module.exports = new DecisionService();
