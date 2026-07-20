const { supabase } = require("../../../common/config/supabase");
const RiskUtils = require("../utils/risk.utils");
const logger = require("../../../common/config/logger");

/**
 * Risk Service
 * Handles business logic for risks
 */
class RiskService {
  /**
   * Gets risks for a project with filters
   * @param {string} projectId - Project UUID
   * @param {Object} options - Query options
   * @param {string} options.level - Filter by risk level
   * @param {string} options.status - Filter by status
   * @param {number} options.page - Page number
   * @param {number} options.limit - Items per page
   * @param {string} options.sortBy - Sort field
   * @param {string} options.sortOrder - Sort order
   * @returns {Promise<Object>} - Risks with pagination
   */
  async getProjectRisks(projectId, options = {}) {
    try {
      const {
        level,
        status,
        page = 1,
        limit = 20,
        sortBy = "created_at",
        sortOrder = "DESC",
      } = options;

      // Build query
      let query = supabase
        .from("risks")
        .select("*", { count: "exact" })
        .eq("project_id", projectId);

      // Apply filters
      if (level && RiskUtils.validateRiskLevel(level)) {
        query = query.eq("risk_level", level);
      }

      if (status) {
        const validStatuses = [
          "identified",
          "monitoring",
          "mitigated",
          "realized",
          "closed",
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
        logger.error("Error fetching risks:", error);
        throw new Error("Failed to fetch risks");
      }

      // Calculate risk scores for each risk
      const risksWithScore = (data || []).map((risk) => ({
        ...risk,
        risk_score: RiskUtils.calculateRiskScore(risk),
      }));

      return {
        data: risksWithScore,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      };
    } catch (error) {
      logger.error("RiskService.getProjectRisks error:", error);
      throw error;
    }
  }

  /**
   * Creates a new risk
   * @param {string} projectId - Project UUID
   * @param {Object} data - Risk data
   * @returns {Promise<Object>} - Created risk
   */
  async createRisk(projectId, data) {
    try {
      // Validate data
      const validation = RiskUtils.validateRiskData(data);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      // Prepare data
      const riskData = {
        project_id: projectId,
        title: data.title.trim(),
        description: data.description ? data.description.trim() : null,
        risk_level: data.risk_level || "medium",
        status: data.status || "identified",
        reason: data.reason ? data.reason.trim() : null,
        mitigation: data.mitigation ? data.mitigation.trim() : null,
      };

      // Insert risk
      const { data: risk, error } = await supabase
        .from("risks")
        .insert([riskData])
        .select()
        .single();

      if (error) {
        logger.error("Error creating risk:", error);
        throw new Error("Failed to create risk");
      }

      logger.info(`Risk created: ${risk.id} - ${risk.title}`);
      return {
        ...risk,
        risk_score: RiskUtils.calculateRiskScore(risk),
      };
    } catch (error) {
      logger.error("RiskService.createRisk error:", error);
      throw error;
    }
  }

  /**
   * Gets a risk by ID
   * @param {string} id - Risk UUID
   * @returns {Promise<Object>} - Risk object
   */
  async getRiskById(id) {
    try {
      const { data, error } = await supabase
        .from("risks")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        logger.error("Error fetching risk:", error);
        throw new Error("Risk not found");
      }

      return {
        ...data,
        risk_score: RiskUtils.calculateRiskScore(data),
      };
    } catch (error) {
      logger.error("RiskService.getRiskById error:", error);
      throw error;
    }
  }

  /**
   * Updates a risk
   * @param {string} id - Risk UUID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} - Updated risk
   */
  async updateRisk(id, data) {
    try {
      // Check if risk exists
      await this.getRiskById(id);

      // Prepare update data
      const updateData = {};

      if (data.title) updateData.title = data.title.trim();
      if (data.description !== undefined) {
        updateData.description = data.description
          ? data.description.trim()
          : null;
      }
      if (data.risk_level) {
        if (!RiskUtils.validateRiskLevel(data.risk_level)) {
          throw new Error("Invalid risk level");
        }
        updateData.risk_level = data.risk_level;
      }
      if (data.status) {
        const validStatuses = [
          "identified",
          "monitoring",
          "mitigated",
          "realized",
          "closed",
        ];
        if (!validStatuses.includes(data.status)) {
          throw new Error("Invalid status value");
        }
        updateData.status = data.status;
      }
      if (data.reason !== undefined) {
        updateData.reason = data.reason ? data.reason.trim() : null;
      }
      if (data.mitigation !== undefined) {
        updateData.mitigation = data.mitigation ? data.mitigation.trim() : null;
      }

      // Update risk
      const { data: risk, error } = await supabase
        .from("risks")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        logger.error("Error updating risk:", error);
        throw new Error("Failed to update risk");
      }

      logger.info(`Risk updated: ${risk.id} - ${risk.title}`);
      return {
        ...risk,
        risk_score: RiskUtils.calculateRiskScore(risk),
      };
    } catch (error) {
      logger.error("RiskService.updateRisk error:", error);
      throw error;
    }
  }

  /**
   * Updates risk status
   * @param {string} id - Risk UUID
   * @param {string} status - New status
   * @returns {Promise<Object>} - Updated risk
   */
  async updateRiskStatus(id, status) {
    try {
      const validStatuses = [
        "identified",
        "monitoring",
        "mitigated",
        "realized",
        "closed",
      ];
      if (!validStatuses.includes(status)) {
        throw new Error("Invalid status value");
      }

      // Check if risk exists
      await this.getRiskById(id);

      const { data: risk, error } = await supabase
        .from("risks")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        logger.error("Error updating risk status:", error);
        throw new Error("Failed to update risk status");
      }

      logger.info(`Risk status updated: ${risk.id} -> ${status}`);
      return {
        ...risk,
        risk_score: RiskUtils.calculateRiskScore(risk),
      };
    } catch (error) {
      logger.error("RiskService.updateRiskStatus error:", error);
      throw error;
    }
  }

  /**
   * Deletes a risk
   * @param {string} id - Risk UUID
   * @returns {Promise<void>}
   */
  async deleteRisk(id) {
    try {
      // Check if risk exists
      await this.getRiskById(id);

      const { error } = await supabase.from("risks").delete().eq("id", id);

      if (error) {
        logger.error("Error deleting risk:", error);
        throw new Error("Failed to delete risk");
      }

      logger.info(`Risk deleted: ${id}`);
    } catch (error) {
      logger.error("RiskService.deleteRisk error:", error);
      throw error;
    }
  }

  /**
   * Gets risks by status
   * @param {string} projectId - Project UUID
   * @param {string} status - Risk status
   * @returns {Promise<Array>} - Risks with given status
   */
  async getRisksByStatus(projectId, status) {
    try {
      const validStatuses = [
        "identified",
        "monitoring",
        "mitigated",
        "realized",
        "closed",
      ];
      if (!validStatuses.includes(status)) {
        throw new Error("Invalid status value");
      }

      const { data, error } = await supabase
        .from("risks")
        .select("*")
        .eq("project_id", projectId)
        .eq("status", status)
        .order("risk_level", { ascending: false });

      if (error) {
        logger.error("Error fetching risks by status:", error);
        throw new Error("Failed to fetch risks");
      }

      return (data || []).map((risk) => ({
        ...risk,
        risk_score: RiskUtils.calculateRiskScore(risk),
      }));
    } catch (error) {
      logger.error("RiskService.getRisksByStatus error:", error);
      throw error;
    }
  }

  /**
   * Generates risk assessment report
   * @param {string} projectId - Project UUID
   * @returns {Promise<Object>} - Risk report
   */
  async generateRiskReport(projectId) {
    try {
      // Get all risks for project
      const { data: risks } = await supabase
        .from("risks")
        .select("*")
        .eq("project_id", projectId)
        .order("risk_level", { ascending: false });

      if (!risks || risks.length === 0) {
        return {
          total: 0,
          summary: "No risks identified",
          riskMatrix: RiskUtils.generateRiskMatrix([]),
          statistics: {
            total: 0,
            byLevel: { low: 0, medium: 0, high: 0, critical: 0 },
            byStatus: {
              identified: 0,
              monitoring: 0,
              mitigated: 0,
              realized: 0,
              closed: 0,
            },
            averageScore: 0,
          },
          prioritizedRisks: [],
          mitigationStrategies: {},
        };
      }

      // Add risk scores
      const risksWithScores = risks.map((risk) => ({
        ...risk,
        risk_score: RiskUtils.calculateRiskScore(risk),
      }));

      // Calculate statistics
      const statistics = RiskUtils.generateRiskSummary(risks);

      // Generate risk matrix
      const riskMatrix = RiskUtils.generateRiskMatrix(risks);

      // Get prioritized risks
      const prioritizedRisks = RiskUtils.prioritizeRisks(risksWithScores);

      // Generate mitigation strategies
      const mitigationStrategies = risks.reduce((acc, risk) => {
        acc[risk.id] = RiskUtils.getMitigationStrategies(risk);
        return acc;
      }, {});

      return {
        total: risks.length,
        summary: `Total risks: ${risks.length} (${
          statistics.criticalRisks || 0
        } critical)`,
        riskMatrix,
        statistics,
        prioritizedRisks: prioritizedRisks.slice(0, 10),
        mitigationStrategies,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      logger.error("RiskService.generateRiskReport error:", error);
      throw error;
    }
  }

  /**
   * Calculates overall risk score for a project
   * @param {string} projectId - Project UUID
   * @returns {Promise<Object>} - Risk score summary
   */
  async calculateProjectRiskScore(projectId) {
    try {
      const { data: risks } = await supabase
        .from("risks")
        .select("*")
        .eq("project_id", projectId);

      if (!risks || risks.length === 0) {
        return {
          totalScore: 0,
          averageScore: 0,
          criticalCount: 0,
          highCount: 0,
          riskLevel: "low",
        };
      }

      const scores = risks.map((r) => RiskUtils.calculateRiskScore(r));
      const totalScore = scores.reduce((sum, s) => sum + s, 0);
      const averageScore = Math.round(totalScore / risks.length);

      const criticalCount = risks.filter(
        (r) => r.risk_level === "critical"
      ).length;
      const highCount = risks.filter((r) => r.risk_level === "high").length;

      let riskLevel = "low";
      if (criticalCount > 0) riskLevel = "critical";
      else if (highCount > 0) riskLevel = "high";
      else if (averageScore > 50) riskLevel = "medium";

      return {
        totalScore,
        averageScore,
        criticalCount,
        highCount,
        riskLevel,
        totalRisks: risks.length,
      };
    } catch (error) {
      logger.error("RiskService.calculateProjectRiskScore error:", error);
      throw error;
    }
  }
}

module.exports = new RiskService();
