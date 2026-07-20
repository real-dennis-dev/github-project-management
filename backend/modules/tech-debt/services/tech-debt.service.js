const { supabase } = require("../../../common/config/supabase");
const TechDebtUtils = require("../utils/tech-debt.utils");
const logger = require("../../../common/config/logger");
const CacheUtils = require("../../../common/utils/cache.utils");

/**
 * Tech Debt Service
 * Handles business logic for tech debt management
 */
class TechDebtService {
  /**
   * Gets tech debt items for a project with filters
   * @param {string} projectId - Project UUID
   * @param {Object} options - Query options
   * @param {string} options.priority - Filter by priority
   * @param {string} options.status - Filter by status
   * @param {string} options.search - Search in title/description
   * @param {number} options.page - Page number
   * @param {number} options.limit - Items per page
   * @param {string} options.sortBy - Sort field
   * @param {string} options.sortOrder - Sort order
   * @returns {Promise<Object>} - Tech debt items with pagination
   */
  async getProjectTechDebt(projectId, options = {}) {
    try {
      const {
        priority,
        status,
        search,
        page = 1,
        limit = 20,
        sortBy = "created_at",
        sortOrder = "DESC",
      } = options;

      // Build cache key
      const cacheKey = `tech_debt:${projectId}:${JSON.stringify(options)}`;

      // Try to get from cache
      const cached = await CacheUtils.getCache(cacheKey);
      if (cached) {
        return cached;
      }

      // Build query
      let query = supabase
        .from("tech_debt")
        .select("*", { count: "exact" })
        .eq("project_id", projectId);

      // Apply filters
      if (priority && TechDebtUtils.validatePriority(priority)) {
        query = query.eq("priority", priority);
      }

      if (status) {
        const validStatuses = [
          "identified",
          "planned",
          "in_progress",
          "resolved",
          "ignored",
        ];
        if (validStatuses.includes(status)) {
          query = query.eq("status", status);
        }
      }

      if (search && search.trim()) {
        const searchTerm = `%${search.trim()}%`;
        query = query.or(
          `title.ilike.${searchTerm},description.ilike.${searchTerm}`
        );
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === "ASC" });

      // Apply pagination
      const from = (page - 1) * limit;
      query = query.range(from, from + limit - 1);

      // Execute query
      const { data, error, count } = await query;

      if (error) {
        logger.error("Error fetching tech debt:", error);
        throw new Error("Failed to fetch tech debt items");
      }

      // Calculate impact for each item
      const itemsWithImpact = (data || []).map((item) => ({
        ...item,
        impact: TechDebtUtils.calculateDebtImpact(item),
        refactoringSuggestion: TechDebtUtils.suggestRefactoringPriority(item),
      }));

      const result = {
        data: itemsWithImpact,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
        metrics: TechDebtUtils.calculateMetrics(data || []),
      };

      // Cache the result (TTL: 5 minutes)
      await CacheUtils.setCache(cacheKey, result, 300);

      return result;
    } catch (error) {
      logger.error("TechDebtService.getProjectTechDebt error:", error);
      throw error;
    }
  }

  /**
   * Creates a new tech debt item
   * @param {string} projectId - Project UUID
   * @param {Object} data - Tech debt data
   * @returns {Promise<Object>} - Created tech debt item
   */
  async createTechDebt(projectId, data) {
    try {
      // Validate data
      const validation = TechDebtUtils.validateTechDebtData({
        ...data,
        project_id: projectId,
      });

      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      // If no effort hours provided, calculate from priority
      let estimatedEffortHours = data.estimated_effort_hours;
      if (estimatedEffortHours === undefined || estimatedEffortHours === null) {
        estimatedEffortHours = TechDebtUtils.calculateEffortHours(
          data.priority || "medium"
        );
      }

      // Prepare data
      const techDebtData = {
        project_id: projectId,
        title: data.title.trim(),
        description: data.description.trim(),
        reason: data.reason.trim(),
        impact: data.impact ? data.impact.trim() : null,
        priority: data.priority || "medium",
        status: data.status || "identified",
        estimated_effort_hours: estimatedEffortHours,
      };

      // Insert tech debt
      const { data: techDebt, error } = await supabase
        .from("tech_debt")
        .insert([techDebtData])
        .select()
        .single();

      if (error) {
        logger.error("Error creating tech debt:", error);
        throw new Error("Failed to create tech debt item");
      }

      // Invalidate cache
      await CacheUtils.invalidateRelated([`tech_debt:${projectId}:*`]);

      logger.info(`Tech debt created: ${techDebt.id} - ${techDebt.title}`);

      return {
        ...techDebt,
        impact: TechDebtUtils.calculateDebtImpact(techDebt),
        refactoringSuggestion:
          TechDebtUtils.suggestRefactoringPriority(techDebt),
      };
    } catch (error) {
      logger.error("TechDebtService.createTechDebt error:", error);
      throw error;
    }
  }

  /**
   * Gets a tech debt item by ID
   * @param {string} id - Tech debt UUID
   * @returns {Promise<Object>} - Tech debt item
   */
  async getTechDebtById(id) {
    try {
      // Try to get from cache
      const cacheKey = `tech_debt:item:${id}`;
      const cached = await CacheUtils.getCache(cacheKey);
      if (cached) {
        return cached;
      }

      const { data, error } = await supabase
        .from("tech_debt")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        logger.error("Error fetching tech debt:", error);
        throw new Error("Tech debt item not found");
      }

      const result = {
        ...data,
        impact: TechDebtUtils.calculateDebtImpact(data),
        refactoringSuggestion: TechDebtUtils.suggestRefactoringPriority(data),
      };

      // Cache the result (TTL: 10 minutes)
      await CacheUtils.setCache(cacheKey, result, 600);

      return result;
    } catch (error) {
      logger.error("TechDebtService.getTechDebtById error:", error);
      throw error;
    }
  }

  /**
   * Updates a tech debt item
   * @param {string} id - Tech debt UUID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} - Updated tech debt item
   */
  async updateTechDebt(id, data) {
    try {
      // Check if tech debt exists
      await this.getTechDebtById(id);

      // Prepare update data
      const updateData = {};

      if (data.title) updateData.title = data.title.trim();
      if (data.description) updateData.description = data.description.trim();
      if (data.reason) updateData.reason = data.reason.trim();
      if (data.impact !== undefined) {
        updateData.impact = data.impact ? data.impact.trim() : null;
      }
      if (data.priority) {
        if (!TechDebtUtils.validatePriority(data.priority)) {
          throw new Error("Invalid priority value");
        }
        updateData.priority = data.priority;

        // Recalculate effort hours if priority changed and no explicit effort provided
        if (data.estimated_effort_hours === undefined) {
          updateData.estimated_effort_hours =
            TechDebtUtils.calculateEffortHours(data.priority);
        }
      }
      if (data.status) {
        const validStatuses = [
          "identified",
          "planned",
          "in_progress",
          "resolved",
          "ignored",
        ];
        if (!validStatuses.includes(data.status)) {
          throw new Error("Invalid status value");
        }
        updateData.status = data.status;
      }
      if (data.estimated_effort_hours !== undefined) {
        if (
          data.estimated_effort_hours !== null &&
          (typeof data.estimated_effort_hours !== "number" ||
            data.estimated_effort_hours < 0)
        ) {
          throw new Error("Estimated effort hours must be a positive number");
        }
        updateData.estimated_effort_hours = data.estimated_effort_hours;
      }

      // Update tech debt
      const { data: techDebt, error } = await supabase
        .from("tech_debt")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        logger.error("Error updating tech debt:", error);
        throw new Error("Failed to update tech debt item");
      }

      // Invalidate cache
      await CacheUtils.invalidateRelated([
        `tech_debt:item:${id}`,
        `tech_debt:${techDebt.project_id}:*`,
      ]);

      logger.info(`Tech debt updated: ${techDebt.id} - ${techDebt.title}`);

      return {
        ...techDebt,
        impact: TechDebtUtils.calculateDebtImpact(techDebt),
        refactoringSuggestion:
          TechDebtUtils.suggestRefactoringPriority(techDebt),
      };
    } catch (error) {
      logger.error("TechDebtService.updateTechDebt error:", error);
      throw error;
    }
  }

  /**
   * Updates tech debt status
   * @param {string} id - Tech debt UUID
   * @param {string} status - New status
   * @returns {Promise<Object>} - Updated tech debt item
   */
  async updateTechDebtStatus(id, status) {
    try {
      const validStatuses = [
        "identified",
        "planned",
        "in_progress",
        "resolved",
        "ignored",
      ];
      if (!validStatuses.includes(status)) {
        throw new Error("Invalid status value");
      }

      // Check if tech debt exists
      await this.getTechDebtById(id);

      const { data: techDebt, error } = await supabase
        .from("tech_debt")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        logger.error("Error updating tech debt status:", error);
        throw new Error("Failed to update tech debt status");
      }

      // Invalidate cache
      await CacheUtils.invalidateRelated([
        `tech_debt:item:${id}`,
        `tech_debt:${techDebt.project_id}:*`,
      ]);

      logger.info(`Tech debt status updated: ${techDebt.id} -> ${status}`);

      return {
        ...techDebt,
        impact: TechDebtUtils.calculateDebtImpact(techDebt),
        refactoringSuggestion:
          TechDebtUtils.suggestRefactoringPriority(techDebt),
      };
    } catch (error) {
      logger.error("TechDebtService.updateTechDebtStatus error:", error);
      throw error;
    }
  }

  /**
   * Deletes a tech debt item
   * @param {string} id - Tech debt UUID
   * @returns {Promise<void>}
   */
  async deleteTechDebt(id) {
    try {
      // Get tech debt to get project_id for cache invalidation
      const { data: techDebt } = await supabase
        .from("tech_debt")
        .select("project_id")
        .eq("id", id)
        .single();

      const { error } = await supabase.from("tech_debt").delete().eq("id", id);

      if (error) {
        logger.error("Error deleting tech debt:", error);
        throw new Error("Failed to delete tech debt item");
      }

      // Invalidate cache
      await CacheUtils.invalidateRelated([
        `tech_debt:item:${id}`,
        `tech_debt:${techDebt?.project_id}:*`,
      ]);

      logger.info(`Tech debt deleted: ${id}`);
    } catch (error) {
      logger.error("TechDebtService.deleteTechDebt error:", error);
      throw error;
    }
  }

  /**
   * Gets tech debt overview with metrics
   * @param {string} projectId - Project UUID
   * @returns {Promise<Object>} - Tech debt overview
   */
  async getTechDebtOverview(projectId) {
    try {
      // Try to get from cache
      const cacheKey = `tech_debt:overview:${projectId}`;
      const cached = await CacheUtils.getCache(cacheKey);
      if (cached) {
        return cached;
      }

      // Get all tech debt items
      const { data, error } = await supabase
        .from("tech_debt")
        .select("*")
        .eq("project_id", projectId);

      if (error) {
        logger.error("Error fetching tech debt for overview:", error);
        throw new Error("Failed to fetch tech debt overview");
      }

      const metrics = TechDebtUtils.calculateMetrics(data || []);

      // Get prioritized items
      const prioritized = TechDebtUtils.prioritizeTechDebt(data || []);

      // Calculate total cost
      const totalCost = (data || []).reduce((sum, item) => {
        const cost = TechDebtUtils.calculateBusinessCost(item);
        return sum + cost.totalCost;
      }, 0);

      // Get items by impact
      const itemsWithImpact = (data || []).map((item) => ({
        ...item,
        impact: TechDebtUtils.calculateDebtImpact(item),
      }));

      const overview = {
        metrics,
        prioritizedItems: prioritized.slice(0, 10),
        totalEstimatedCost: totalCost,
        itemsByImpact: itemsWithImpact,
        summary: TechDebtUtils.generateAISummary(data || []),
        lastUpdated: new Date().toISOString(),
      };

      // Cache the result (TTL: 5 minutes)
      await CacheUtils.setCache(cacheKey, overview, 300);

      return overview;
    } catch (error) {
      logger.error("TechDebtService.getTechDebtOverview error:", error);
      throw error;
    }
  }

  /**
   * Calculates tech debt score for a project
   * @param {string} projectId - Project UUID
   * @returns {Promise<Object>} - Tech debt score
   */
  async calculateTechDebtScore(projectId) {
    try {
      const { data, error } = await supabase
        .from("tech_debt")
        .select("*")
        .eq("project_id", projectId);

      if (error) {
        logger.error("Error calculating tech debt score:", error);
        throw new Error("Failed to calculate tech debt score");
      }

      if (!data || data.length === 0) {
        return {
          score: 0,
          level: "low",
          totalItems: 0,
          criticalItems: 0,
          highItems: 0,
          mediumItems: 0,
          lowItems: 0,
          resolutionRate: 0,
          estimatedEffort: 0,
          recommendations: ["No technical debt identified"],
        };
      }

      const metrics = TechDebtUtils.calculateMetrics(data);
      const totalEffort = metrics.totalEffort;
      const criticalCount = metrics.byPriority.critical || 0;
      const highCount = metrics.byPriority.high || 0;
      const resolvedCount = metrics.byStatus.resolved || 0;
      const totalItems = data.length;

      // Calculate score (0-100)
      let score = 0;

      // Priority weighted score
      const priorityScore =
        (criticalCount * 40 +
          highCount * 30 +
          (metrics.byPriority.medium || 0) * 20 +
          (metrics.byPriority.low || 0) * 10) /
        totalItems;

      // Resolution rate score
      const resolutionScore = metrics.resolutionRate;

      // Effort score (higher effort = higher debt)
      const effortScore = Math.min((totalEffort / 100) * 20, 20);

      score = Math.min(
        Math.round(priorityScore + resolutionScore + effortScore),
        100
      );

      let level = "low";
      if (score > 75) level = "critical";
      else if (score > 50) level = "high";
      else if (score > 25) level = "medium";

      // Generate recommendations
      const recommendations = [];
      if (criticalCount > 0) {
        recommendations.push(
          `Address ${criticalCount} critical tech debt items immediately`
        );
      }
      if (highCount > 0) {
        recommendations.push(
          `Plan to address ${highCount} high priority items in next sprint`
        );
      }
      if (metrics.resolutionRate < 50) {
        recommendations.push(
          "Improve resolution rate by prioritizing and addressing open items"
        );
      }
      if (totalEffort > 100) {
        recommendations.push(
          "Consider allocating dedicated time for tech debt reduction"
        );
      }
      if (recommendations.length === 0) {
        recommendations.push(
          "Continue monitoring and addressing tech debt as identified"
        );
      }

      return {
        score,
        level,
        totalItems,
        criticalItems: criticalCount,
        highItems: highCount,
        mediumItems: metrics.byPriority.medium || 0,
        lowItems: metrics.byPriority.low || 0,
        resolutionRate: metrics.resolutionRate,
        estimatedEffort: totalEffort,
        unresolvedItems: totalItems - resolvedCount,
        recommendations,
      };
    } catch (error) {
      logger.error("TechDebtService.calculateTechDebtScore error:", error);
      throw error;
    }
  }

  /**
   * Suggests refactoring priority for a tech debt item
   * @param {Object} techDebt - Tech debt object
   * @returns {Object} - Refactoring suggestion
   */
  async suggestRefactoringPriority(techDebt) {
    return TechDebtUtils.suggestRefactoringPriority(techDebt);
  }

  /**
   * Gets tech debt statistics for dashboard
   * @param {string} projectId - Project UUID
   * @returns {Promise<Object>} - Statistics
   */
  async getTechDebtStatistics(projectId) {
    try {
      const { data, error } = await supabase
        .from("tech_debt")
        .select("*")
        .eq("project_id", projectId);

      if (error) {
        logger.error("Error fetching tech debt statistics:", error);
        throw new Error("Failed to fetch tech debt statistics");
      }

      const metrics = TechDebtUtils.calculateMetrics(data || []);
      const prioritized = TechDebtUtils.prioritizeTechDebt(data || []);

      // Calculate trend data (simplified)
      const trendData = {
        labels: ["Identified", "In Progress", "Resolved"],
        values: [
          metrics.byStatus.identified || 0,
          metrics.byStatus.in_progress || 0,
          metrics.byStatus.resolved || 0,
        ],
      };

      return {
        metrics,
        topPriorities: prioritized.slice(0, 5),
        trendData,
        totalCost: (data || []).reduce((sum, item) => {
          const cost = TechDebtUtils.calculateBusinessCost(item);
          return sum + cost.totalCost;
        }, 0),
      };
    } catch (error) {
      logger.error("TechDebtService.getTechDebtStatistics error:", error);
      throw error;
    }
  }
}

module.exports = new TechDebtService();
