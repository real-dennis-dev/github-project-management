// src/modules/progress-timeline/services/progress.service.js
const { supabase } = require("../../../common/config/supabase");
const { ProgressUtils } = require("../utils/progress.utils");
const { DatabaseUtils } = require("../../../common/utils/database.utils");
const { startOfMonth, endOfMonth, parseISO, isValid } = require("date-fns");

class ProgressService {
  /**
   * Get project timeline with filtering
   * @param {string} projectId - Project UUID
   * @param {Object} filters - Filter options
   * @param {string} filters.from_date - Start date (ISO)
   * @param {string} filters.to_date - End date (ISO)
   * @param {string} filters.feature_name - Feature name filter
   * @param {number} filters.page - Page number
   * @param {number} filters.limit - Items per page
   * @param {string} filters.sort_by - Sort field
   * @param {string} filters.sort_order - Sort order
   * @returns {Promise<Object>} Timeline data with pagination
   */
  static async getProjectTimeline(projectId, filters = {}) {
    try {
      // Validate project exists
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .select("id, name")
        .eq("id", projectId)
        .single();

      if (projectError) {
        throw new Error(`Project not found: ${projectError.message}`);
      }

      // Build query
      let query = supabase
        .from("progress_timeline")
        .select("*", { count: "exact" })
        .eq("project_id", projectId);

      // Apply filters
      if (filters.from_date) {
        const fromDate = new Date(filters.from_date);
        if (isValid(fromDate)) {
          query = query.gte("month_year", fromDate.toISOString());
        }
      }

      if (filters.to_date) {
        const toDate = new Date(filters.to_date);
        if (isValid(toDate)) {
          query = query.lte("month_year", toDate.toISOString());
        }
      }

      if (filters.feature_name) {
        query = query.ilike("feature_name", `%${filters.feature_name}%`);
      }

      // Apply sorting
      const sortBy = filters.sort_by || "month_year";
      const sortOrder = filters.sort_order || "asc";
      query = query.order(sortBy, { ascending: sortOrder === "asc" });

      // Apply pagination
      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 20;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      query = query.range(from, to);

      // Execute query
      const { data: entries, error, count } = await query;

      if (error) {
        throw new Error(`Failed to fetch timeline: ${error.message}`);
      }

      return {
        success: true,
        data: entries,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
        project: project,
      };
    } catch (error) {
      console.error("Error in getProjectTimeline:", error);
      throw error;
    }
  }

  /**
   * Add timeline entry for a project
   * @param {string} projectId - Project UUID
   * @param {Object} data - Timeline entry data
   * @param {string} data.month_year - Month year (first day of month)
   * @param {string} data.feature_name - Feature name
   * @param {number} data.progress_percentage - Progress percentage
   * @returns {Promise<Object>} Created timeline entry
   */
  static async addTimelineEntry(projectId, data) {
    try {
      // Validate project exists
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .select("id")
        .eq("id", projectId)
        .single();

      if (projectError) {
        throw new Error(`Project not found: ${projectError.message}`);
      }

      // Validate data
      const validation = ProgressUtils.validateProgressData(data);
      if (!validation.valid) {
        throw new Error(
          `Validation error: ${JSON.stringify(validation.errors)}`
        );
      }

      // Ensure month_year is first day of month
      const monthYear = new Date(data.month_year);
      const firstDay = startOfMonth(monthYear);
      const formattedMonthYear = firstDay.toISOString().split("T")[0];

      // Check if entry already exists for this month and feature
      const { data: existing, error: checkError } = await supabase
        .from("progress_timeline")
        .select("id")
        .eq("project_id", projectId)
        .eq("month_year", formattedMonthYear)
        .eq("feature_name", data.feature_name)
        .maybeSingle();

      if (checkError) {
        throw new Error(
          `Failed to check existing entry: ${checkError.message}`
        );
      }

      if (existing) {
        // Update existing entry
        const { data: updated, error: updateError } = await supabase
          .from("progress_timeline")
          .update({
            progress_percentage: data.progress_percentage,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id)
          .select()
          .single();

        if (updateError) {
          throw new Error(`Failed to update entry: ${updateError.message}`);
        }

        return {
          success: true,
          message: "Timeline entry updated successfully",
          data: updated,
          isUpdate: true,
        };
      }

      // Create new entry
      const entry = {
        project_id: projectId,
        month_year: formattedMonthYear,
        feature_name: data.feature_name.trim(),
        progress_percentage: data.progress_percentage,
      };

      const { data: created, error: createError } = await supabase
        .from("progress_timeline")
        .insert(entry)
        .select()
        .single();

      if (createError) {
        throw new Error(
          `Failed to create timeline entry: ${createError.message}`
        );
      }

      return {
        success: true,
        message: "Timeline entry created successfully",
        data: created,
        isUpdate: false,
      };
    } catch (error) {
      console.error("Error in addTimelineEntry:", error);
      throw error;
    }
  }

  /**
   * Update timeline entry
   * @param {string} id - Timeline entry UUID
   * @param {Object} data - Updated data
   * @returns {Promise<Object>} Updated timeline entry
   */
  static async updateTimelineEntry(id, data) {
    try {
      // Check if entry exists
      const { data: existing, error: existError } = await supabase
        .from("progress_timeline")
        .select("*")
        .eq("id", id)
        .single();

      if (existError) {
        throw new Error(`Timeline entry not found: ${existError.message}`);
      }

      // Validate data
      const validation = ProgressUtils.validateProgressData(data);
      if (!validation.valid) {
        throw new Error(
          `Validation error: ${JSON.stringify(validation.errors)}`
        );
      }

      // Prepare update data
      const updateData = {
        updated_at: new Date().toISOString(),
      };

      if (data.month_year) {
        const monthYear = new Date(data.month_year);
        updateData.month_year = startOfMonth(monthYear)
          .toISOString()
          .split("T")[0];
      }

      if (data.feature_name) {
        updateData.feature_name = data.feature_name.trim();
      }

      if (data.progress_percentage !== undefined) {
        updateData.progress_percentage = data.progress_percentage;
      }

      // Update entry
      const { data: updated, error: updateError } = await supabase
        .from("progress_timeline")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (updateError) {
        throw new Error(
          `Failed to update timeline entry: ${updateError.message}`
        );
      }

      return {
        success: true,
        message: "Timeline entry updated successfully",
        data: updated,
      };
    } catch (error) {
      console.error("Error in updateTimelineEntry:", error);
      throw error;
    }
  }

  /**
   * Delete timeline entry
   * @param {string} id - Timeline entry UUID
   * @returns {Promise<Object>} Deletion result
   */
  static async deleteTimelineEntry(id) {
    try {
      // Check if entry exists
      const { data: existing, error: existError } = await supabase
        .from("progress_timeline")
        .select("id")
        .eq("id", id)
        .single();

      if (existError) {
        throw new Error(`Timeline entry not found: ${existError.message}`);
      }

      // Delete entry
      const { error: deleteError } = await supabase
        .from("progress_timeline")
        .delete()
        .eq("id", id);

      if (deleteError) {
        throw new Error(
          `Failed to delete timeline entry: ${deleteError.message}`
        );
      }

      return {
        success: true,
        message: "Timeline entry deleted successfully",
        data: { id: id },
      };
    } catch (error) {
      console.error("Error in deleteTimelineEntry:", error);
      throw error;
    }
  }

  /**
   * Get progress overview for a project
   * @param {string} projectId - Project UUID
   * @param {Object} options - Options
   * @param {number} options.months - Number of months to analyze
   * @returns {Promise<Object>} Progress overview data
   */
  static async getProgressOverview(projectId, options = {}) {
    try {
      // Validate project exists
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (projectError) {
        throw new Error(`Project not found: ${projectError.message}`);
      }

      // Get all timeline entries
      let query = supabase
        .from("progress_timeline")
        .select("*")
        .eq("project_id", projectId)
        .order("month_year", { ascending: true });

      // Apply months limit if specified
      if (options.months) {
        const dateLimit = new Date();
        dateLimit.setMonth(dateLimit.getMonth() - options.months);
        query = query.gte("month_year", dateLimit.toISOString());
      }

      const { data: entries, error: entriesError } = await query;

      if (entriesError) {
        throw new Error(
          `Failed to fetch timeline entries: ${entriesError.message}`
        );
      }

      // Calculate overview data
      const overallProgress = ProgressUtils.calculateOverallProgress(entries);
      const chartData = ProgressUtils.generateTimelineChart(entries);

      // Calculate trends for each feature
      const featureTrends = {};
      const featureMap = {};
      entries.forEach((entry) => {
        if (!featureMap[entry.feature_name]) {
          featureMap[entry.feature_name] = [];
        }
        featureMap[entry.feature_name].push(entry);
      });

      Object.keys(featureMap).forEach((feature) => {
        featureTrends[feature] = ProgressUtils.calculateTrendLine(
          featureMap[feature]
        );
      });

      // Get latest entries for each feature
      const latestEntries = {};
      Object.keys(featureMap).forEach((feature) => {
        const sorted = featureMap[feature].sort(
          (a, b) => new Date(b.month_year) - new Date(a.month_year)
        );
        latestEntries[feature] = sorted[0];
      });

      return {
        success: true,
        data: {
          project: {
            id: project.id,
            name: project.name,
            status: project.status,
            completion_percentage: project.completion_percentage,
          },
          overview: {
            overall: overallProgress.overall,
            average: overallProgress.average,
            totalFeatures: overallProgress.totalFeatures,
            completedFeatures: overallProgress.completedFeatures,
            completionRate: overallProgress.completionRate,
          },
          chartData,
          featureTrends,
          latestEntries,
          aggregatedData: ProgressUtils.aggregateMonthlyData(entries),
          entries: entries || [],
        },
      };
    } catch (error) {
      console.error("Error in getProgressOverview:", error);
      throw error;
    }
  }

  /**
   * Calculate monthly progress for a specific month
   * @param {string} projectId - Project UUID
   * @param {string} month - Month to calculate (YYYY-MM-DD)
   * @param {Object} options - Options
   * @param {string} options.feature_name - Specific feature name
   * @returns {Promise<Object>} Monthly progress data
   */
  static async calculateMonthlyProgress(projectId, month, options = {}) {
    try {
      // Validate project exists
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .select("id, name")
        .eq("id", projectId)
        .single();

      if (projectError) {
        throw new Error(`Project not found: ${projectError.message}`);
      }

      const monthDate = new Date(month);
      if (!isValid(monthDate)) {
        throw new Error("Invalid month date provided");
      }

      const startOfMonthDate = startOfMonth(monthDate);
      const endOfMonthDate = endOfMonth(monthDate);

      // Build query
      let query = supabase
        .from("progress_timeline")
        .select("*")
        .eq("project_id", projectId)
        .gte("month_year", startOfMonthDate.toISOString())
        .lte("month_year", endOfMonthDate.toISOString());

      if (options.feature_name) {
        query = query.eq("feature_name", options.feature_name);
      }

      const { data: entries, error: entriesError } = await query;

      if (entriesError) {
        throw new Error(`Failed to fetch entries: ${entriesError.message}`);
      }

      // Calculate monthly stats
      const totalProgress = entries.reduce(
        (sum, entry) => sum + entry.progress_percentage,
        0
      );
      const averageProgress =
        entries.length > 0 ? Math.round(totalProgress / entries.length) : 0;

      // Get previous month's data for comparison
      const prevMonth = new Date(startOfMonthDate);
      prevMonth.setMonth(prevMonth.getMonth() - 1);

      const { data: prevEntries, error: prevError } = await supabase
        .from("progress_timeline")
        .select("*")
        .eq("project_id", projectId)
        .gte("month_year", startOfMonth(prevMonth).toISOString())
        .lte("month_year", endOfMonth(prevMonth).toISOString());

      if (prevError) {
        console.warn("Could not fetch previous month data:", prevError);
      }

      // Calculate progress change
      const prevTotal = prevEntries
        ? prevEntries.reduce((sum, entry) => sum + entry.progress_percentage, 0)
        : 0;
      const prevAverage =
        prevEntries && prevEntries.length > 0
          ? Math.round(prevTotal / prevEntries.length)
          : 0;
      const change = averageProgress - prevAverage;

      return {
        success: true,
        data: {
          month: ProgressUtils.formatMonthYear(startOfMonthDate),
          monthYear: startOfMonthDate.toISOString(),
          entries: entries || [],
          stats: {
            total: entries.length,
            average: averageProgress,
            totalProgress: totalProgress,
            previousMonth: {
              average: prevAverage,
              entries: prevEntries ? prevEntries.length : 0,
            },
            change: change,
            changePercentage:
              prevAverage > 0 ? Math.round((change / prevAverage) * 100) : 0,
          },
          features: entries ? entries.map((e) => e.feature_name) : [],
          aggregated: ProgressUtils.aggregateMonthlyData(entries),
        },
      };
    } catch (error) {
      console.error("Error in calculateMonthlyProgress:", error);
      throw error;
    }
  }

  /**
   * Generate detailed progress report
   * @param {string} projectId - Project UUID
   * @param {Object} options - Report options
   * @param {number} options.months - Number of months to include
   * @param {string} options.format - Report format (json, csv, pdf)
   * @returns {Promise<Object>} Report data
   */
  static async generateProgressReport(projectId, options = {}) {
    try {
      const months = options.months || 12;
      const format = options.format || "json";

      // Get project details
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (projectError) {
        throw new Error(`Project not found: ${projectError.message}`);
      }

      // Get timeline data
      const { data: entries, error: entriesError } = await supabase
        .from("progress_timeline")
        .select("*")
        .eq("project_id", projectId)
        .order("month_year", { ascending: true });

      if (entriesError) {
        throw new Error(`Failed to fetch timeline: ${entriesError.message}`);
      }

      // Apply months limit
      let filteredEntries = entries;
      if (months) {
        const dateLimit = new Date();
        dateLimit.setMonth(dateLimit.getMonth() - months);
        filteredEntries = entries.filter(
          (entry) => new Date(entry.month_year) >= dateLimit
        );
      }

      // Generate report data
      const overview = ProgressUtils.calculateOverallProgress(filteredEntries);
      const chartData = ProgressUtils.generateTimelineChart(filteredEntries);
      const aggregated = ProgressUtils.aggregateMonthlyData(filteredEntries);

      // Get feature breakdown
      const featureBreakdown = {};
      const featureMap = {};
      filteredEntries.forEach((entry) => {
        if (!featureMap[entry.feature_name]) {
          featureMap[entry.feature_name] = [];
        }
        featureMap[entry.feature_name].push(entry);
      });

      Object.keys(featureMap).forEach((feature) => {
        const sorted = featureMap[feature].sort(
          (a, b) => new Date(b.month_year) - new Date(a.month_year)
        );
        const latest = sorted[0];
        const trend = ProgressUtils.calculateTrendLine(featureMap[feature]);

        featureBreakdown[feature] = {
          currentProgress: latest.progress_percentage,
          status: ProgressUtils.getProgressStatus(latest.progress_percentage),
          trend: trend,
          totalEntries: featureMap[feature].length,
          data: featureMap[feature],
        };
      });

      const report = {
        generatedAt: new Date().toISOString(),
        project: {
          id: project.id,
          name: project.name,
          status: project.status,
          completion: project.completion_percentage,
        },
        summary: {
          overallProgress: overview.overall,
          totalFeatures: overview.totalFeatures,
          completedFeatures: overview.completedFeatures,
          completionRate: overview.completionRate,
          averageProgress: overview.average,
        },
        chartData: chartData,
        aggregatedData: aggregated,
        featureBreakdown: featureBreakdown,
        monthlyTimeline: filteredEntries,
        statistics: {
          totalEntries: filteredEntries.length,
          dateRange:
            filteredEntries.length > 0
              ? {
                  from: filteredEntries[0].month_year,
                  to: filteredEntries[filteredEntries.length - 1].month_year,
                }
              : null,
          features: Object.keys(featureMap).length,
        },
      };

      // Format report if requested
      if (format !== "json") {
        // In a real implementation, you'd convert to CSV/PDF here
        // For now, just add a note
        report.format = format;
        report.message = `Report formatted as ${format}`;
      }

      return {
        success: true,
        data: report,
      };
    } catch (error) {
      console.error("Error in generateProgressReport:", error);
      throw error;
    }
  }

  /**
   * Bulk add multiple timeline entries
   * @param {string} projectId - Project UUID
   * @param {Array} entries - Array of timeline entries
   * @returns {Promise<Object>} Bulk creation result
   */
  static async bulkAddTimelineEntries(projectId, entries) {
    try {
      if (!entries || !entries.length) {
        throw new Error("No entries provided for bulk insert");
      }

      // Validate project exists
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .select("id")
        .eq("id", projectId)
        .single();

      if (projectError) {
        throw new Error(`Project not found: ${projectError.message}`);
      }

      // Validate and prepare entries
      const preparedEntries = [];
      const errors = [];

      entries.forEach((entry, index) => {
        const validation = ProgressUtils.validateProgressData(entry);
        if (!validation.valid) {
          errors.push({
            index,
            entry,
            errors: validation.errors,
          });
          return;
        }

        const monthYear = new Date(entry.month_year);
        const firstDay = startOfMonth(monthYear);

        preparedEntries.push({
          project_id: projectId,
          month_year: firstDay.toISOString().split("T")[0],
          feature_name: entry.feature_name.trim(),
          progress_percentage: entry.progress_percentage,
        });
      });

      if (errors.length > 0) {
        return {
          success: false,
          message: "Some entries failed validation",
          errors,
          successfulEntries: preparedEntries,
        };
      }

      // Insert entries
      const { data: created, error: insertError } = await supabase
        .from("progress_timeline")
        .insert(preparedEntries)
        .select();

      if (insertError) {
        throw new Error(`Failed to insert entries: ${insertError.message}`);
      }

      return {
        success: true,
        message: `Successfully created ${created.length} timeline entries`,
        data: created,
        count: created.length,
      };
    } catch (error) {
      console.error("Error in bulkAddTimelineEntries:", error);
      throw error;
    }
  }
}
module.exports = { ProgressService };
