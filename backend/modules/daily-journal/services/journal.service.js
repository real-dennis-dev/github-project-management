const { supabase } = require("../../../common/config/supabase");
const JournalUtils = require("../utils/journal.utils");
const DateUtils = require("../../../common/utils/date.utils");
const logger = require("../../../common/config/logger");

/**
 * Journal Service
 * Handles business logic for journal entries
 */
class JournalService {
  /**
   * Gets journal entries for a project with filters
   * @param {string} projectId - Project UUID
   * @param {Object} options - Query options
   * @param {Date} options.fromDate - Filter from date
   * @param {Date} options.toDate - Filter to date
   * @param {string} options.mood - Filter by mood
   * @param {number} options.page - Page number
   * @param {number} options.limit - Items per page
   * @param {string} options.sortBy - Sort field
   * @param {string} options.sortOrder - Sort order
   * @returns {Promise<Object>} - Journal entries with pagination
   */
  async getJournalEntries(projectId, options = {}) {
    try {
      const {
        fromDate,
        toDate,
        mood,
        page = 1,
        limit = 20,
        sortBy = "entry_date",
        sortOrder = "DESC",
      } = options;

      // Build query
      let query = supabase
        .from("daily_journal")
        .select("*", { count: "exact" })
        .eq("project_id", projectId);

      // Apply filters
      if (fromDate) {
        query = query.gte("entry_date", fromDate);
      }

      if (toDate) {
        query = query.lte("entry_date", toDate);
      }

      if (mood && JournalUtils.validateMood(mood)) {
        query = query.eq("mood", mood);
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === "ASC" });

      // Apply pagination
      const from = (page - 1) * limit;
      query = query.range(from, from + limit - 1);

      // Execute query
      const { data, error, count } = await query;

      if (error) {
        logger.error("Error fetching journal entries:", error);
        throw new Error("Failed to fetch journal entries");
      }

      // Format entries
      const formattedData = (data || []).map((entry) =>
        JournalUtils.formatJournalEntry(entry)
      );

      return {
        data: formattedData,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      };
    } catch (error) {
      logger.error("JournalService.getJournalEntries error:", error);
      throw error;
    }
  }

  /**
   * Creates a new journal entry
   * @param {string} projectId - Project UUID
   * @param {Object} data - Journal entry data
   * @returns {Promise<Object>} - Created journal entry
   */
  async createJournalEntry(projectId, data) {
    try {
      // Validate data
      const validation = JournalUtils.validateJournalData({
        ...data,
        project_id: projectId,
      });

      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      // Check if entry exists for this date
      const entryDate =
        data.entry_date || new Date().toISOString().split("T")[0];

      const { data: existing } = await supabase
        .from("daily_journal")
        .select("id")
        .eq("project_id", projectId)
        .eq("entry_date", entryDate)
        .single();

      if (existing) {
        throw new Error(`Journal entry already exists for ${entryDate}`);
      }

      // Prepare data
      const journalData = {
        project_id: projectId,
        entry_date: entryDate,
        finished_today: data.finished_today ? data.finished_today.trim() : null,
        problems: data.problems ? data.problems.trim() : null,
        tomorrow_plan: data.tomorrow_plan ? data.tomorrow_plan.trim() : null,
        mood: data.mood || "😐",
        notes: data.notes ? data.notes.trim() : null,
      };

      // Insert journal entry
      const { data: entry, error } = await supabase
        .from("daily_journal")
        .insert([journalData])
        .select()
        .single();

      if (error) {
        logger.error("Error creating journal entry:", error);
        throw new Error("Failed to create journal entry");
      }

      logger.info(
        `Journal entry created: ${entry.id} for date ${entry.entry_date}`
      );
      return JournalUtils.formatJournalEntry(entry);
    } catch (error) {
      logger.error("JournalService.createJournalEntry error:", error);
      throw error;
    }
  }

  /**
   * Gets a journal entry by ID
   * @param {string} id - Journal entry UUID
   * @returns {Promise<Object>} - Journal entry
   */
  async getJournalEntryById(id) {
    try {
      const { data, error } = await supabase
        .from("daily_journal")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        logger.error("Error fetching journal entry:", error);
        throw new Error("Journal entry not found");
      }

      return JournalUtils.formatJournalEntry(data);
    } catch (error) {
      logger.error("JournalService.getJournalEntryById error:", error);
      throw error;
    }
  }

  /**
   * Updates a journal entry
   * @param {string} id - Journal entry UUID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} - Updated journal entry
   */
  async updateJournalEntry(id, data) {
    try {
      // Check if entry exists
      await this.getJournalEntryById(id);

      // Validate data
      const validation = JournalUtils.validateJournalData(data);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      // Prepare update data
      const updateData = {};

      if (data.entry_date) updateData.entry_date = data.entry_date;
      if (data.finished_today !== undefined) {
        updateData.finished_today = data.finished_today
          ? data.finished_today.trim()
          : null;
      }
      if (data.problems !== undefined) {
        updateData.problems = data.problems ? data.problems.trim() : null;
      }
      if (data.tomorrow_plan !== undefined) {
        updateData.tomorrow_plan = data.tomorrow_plan
          ? data.tomorrow_plan.trim()
          : null;
      }
      if (data.mood) {
        if (!JournalUtils.validateMood(data.mood)) {
          throw new Error("Invalid mood value");
        }
        updateData.mood = data.mood;
      }
      if (data.notes !== undefined) {
        updateData.notes = data.notes ? data.notes.trim() : null;
      }

      // Update journal entry
      const { data: entry, error } = await supabase
        .from("daily_journal")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        logger.error("Error updating journal entry:", error);
        throw new Error("Failed to update journal entry");
      }

      logger.info(`Journal entry updated: ${entry.id}`);
      return JournalUtils.formatJournalEntry(entry);
    } catch (error) {
      logger.error("JournalService.updateJournalEntry error:", error);
      throw error;
    }
  }

  /**
   * Deletes a journal entry
   * @param {string} id - Journal entry UUID
   * @returns {Promise<void>}
   */
  async deleteJournalEntry(id) {
    try {
      // Check if entry exists
      await this.getJournalEntryById(id);

      const { error } = await supabase
        .from("daily_journal")
        .delete()
        .eq("id", id);

      if (error) {
        logger.error("Error deleting journal entry:", error);
        throw new Error("Failed to delete journal entry");
      }

      logger.info(`Journal entry deleted: ${id}`);
    } catch (error) {
      logger.error("JournalService.deleteJournalEntry error:", error);
      throw error;
    }
  }

  /**
   * Gets journal entry for a specific date
   * @param {string} projectId - Project UUID
   * @param {Date|string} date - Date to look up
   * @returns {Promise<Object>} - Journal entry for the date
   */
  async getJournalByDate(projectId, date) {
    try {
      const dateStr =
        typeof date === "string" ? date : date.toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("daily_journal")
        .select("*")
        .eq("project_id", projectId)
        .eq("entry_date", dateStr)
        .maybeSingle();

      if (error) {
        logger.error("Error fetching journal by date:", error);
        throw new Error("Failed to fetch journal entry");
      }

      if (!data) {
        return null;
      }

      return JournalUtils.formatJournalEntry(data);
    } catch (error) {
      logger.error("JournalService.getJournalByDate error:", error);
      throw error;
    }
  }

  /**
   * Gets journal statistics and analytics
   * @param {string} projectId - Project UUID
   * @returns {Promise<Object>} - Journal statistics
   */
  async getJournalStats(projectId) {
    try {
      // Get all entries for project
      const { data: entries, error } = await supabase
        .from("daily_journal")
        .select("*")
        .eq("project_id", projectId)
        .order("entry_date", { ascending: false });

      if (error) {
        logger.error("Error fetching journal stats:", error);
        throw new Error("Failed to fetch journal statistics");
      }

      if (!entries || entries.length === 0) {
        return {
          totalEntries: 0,
          moodTrend: JournalUtils.calculateMoodTrend([]),
          streak: JournalUtils.calculateStreak([]),
          weeklySummary: JournalUtils.generateWeeklySummary([]),
        };
      }

      // Calculate mood trend
      const moodTrend = JournalUtils.calculateMoodTrend(entries);

      // Calculate streak
      const streak = JournalUtils.calculateStreak(entries);

      // Get recent entries for weekly summary
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const weekEntries = entries.filter(
        (e) => new Date(e.entry_date) >= weekAgo
      );

      const weeklySummary = JournalUtils.generateWeeklySummary(weekEntries);

      // Additional statistics
      const totalEntries = entries.length;

      // Entry completion stats
      const withFinished = entries.filter(
        (e) => e.finished_today && e.finished_today.trim()
      ).length;
      const withProblems = entries.filter(
        (e) => e.problems && e.problems.trim()
      ).length;
      const withPlans = entries.filter(
        (e) => e.tomorrow_plan && e.tomorrow_plan.trim()
      ).length;
      const withNotes = entries.filter((e) => e.notes && e.notes.trim()).length;

      // Get date range
      const dates = entries.map((e) => new Date(e.entry_date));
      const oldestDate = new Date(Math.min(...dates));
      const newestDate = new Date(Math.max(...dates));

      // Mood distribution
      const moodDistribution = entries.reduce((acc, e) => {
        const mood = e.mood || "😐";
        acc[mood] = (acc[mood] || 0) + 1;
        return acc;
      }, {});

      return {
        totalEntries,
        dateRange: {
          start: oldestDate.toISOString().split("T")[0],
          end: newestDate.toISOString().split("T")[0],
          days:
            Math.ceil((newestDate - oldestDate) / (1000 * 60 * 60 * 24)) + 1,
        },
        completionStats: {
          withFinished: Math.round((withFinished / totalEntries) * 100),
          withProblems: Math.round((withProblems / totalEntries) * 100),
          withPlans: Math.round((withPlans / totalEntries) * 100),
          withNotes: Math.round((withNotes / totalEntries) * 100),
        },
        moodDistribution,
        moodTrend,
        streak,
        weeklySummary,
        recentEntries: entries
          .slice(0, 5)
          .map((e) => JournalUtils.formatJournalEntry(e)),
      };
    } catch (error) {
      logger.error("JournalService.getJournalStats error:", error);
      throw error;
    }
  }

  /**
   * Gets journal entries by month
   * @param {string} projectId - Project UUID
   * @param {number} year - Year
   * @param {number} month - Month (1-12)
   * @returns {Promise<Array>} - Journal entries for the month
   */
  async getJournalEntriesByMonth(projectId, year, month) {
    try {
      const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
      const endDate = new Date(year, month, 0).toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("daily_journal")
        .select("*")
        .eq("project_id", projectId)
        .gte("entry_date", startDate)
        .lte("entry_date", endDate)
        .order("entry_date", { ascending: true });

      if (error) {
        logger.error("Error fetching journal entries by month:", error);
        throw new Error("Failed to fetch journal entries");
      }

      return (data || []).map((entry) =>
        JournalUtils.formatJournalEntry(entry)
      );
    } catch (error) {
      logger.error("JournalService.getJournalEntriesByMonth error:", error);
      throw error;
    }
  }

  /**
   * Gets or creates journal entry for today
   * @param {string} projectId - Project UUID
   * @returns {Promise<Object>} - Today's journal entry
   */
  async getOrCreateTodayEntry(projectId) {
    try {
      const today = new Date().toISOString().split("T")[0];

      let entry = await this.getJournalByDate(projectId, today);

      if (!entry) {
        // Create empty entry for today
        entry = await this.createJournalEntry(projectId, {
          entry_date: today,
          finished_today: "",
          problems: "",
          tomorrow_plan: "",
          mood: "😐",
          notes: "",
        });
      }

      return entry;
    } catch (error) {
      logger.error("JournalService.getOrCreateTodayEntry error:", error);
      throw error;
    }
  }

  /**
   * Gets dashboard-level journal statistics across all
   * projects belonging to the authenticated user.
   *
   * This method intentionally does NOT accept projectId.
   *
   * @param {string} userId - Authenticated user ID
   * @param {Object} options - Dashboard options
   * @param {number} options.page - Page number
   * @param {number} options.limit - Projects per page
   * @param {Date|string} options.fromDate - Optional start date
   * @param {Date|string} options.toDate - Optional end date
   *
   * @returns {Promise<Object>} Dashboard statistics
   */
  async getDashboardStats(userId, options = {}) {
    try {
      const { page = 1, limit = 20, fromDate, toDate } = options;

      if (!userId) {
        throw new Error("Authenticated user is required");
      }

      /*
       * ---------------------------------------------------------
       * 1. Get projects belonging to the authenticated user
       * ---------------------------------------------------------
       *
       * This assumes projects.owner_id identifies the project owner.
       *
       * If your application uses project_members instead,
       * replace this query with your membership query.
       */
      const { data: projects, error: projectsError } = await supabase
        .from("projects")
        .select(
          `
          id,
          name,
          description,
          owner_id,
          created_at,
          updated_at
        `
        )
        .eq("owner_id", userId)
        .order("updated_at", {
          ascending: false,
        });

      if (projectsError) {
        logger.error(
          "Error fetching user projects for journal dashboard:",
          projectsError
        );

        throw new Error("Failed to fetch user projects");
      }

      if (!projects || projects.length === 0) {
        return {
          stats: this.getEmptyDashboardStats(),
          projects: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
          },
        };
      }

      const projectIds = projects.map((project) => project.id);

      /*
       * ---------------------------------------------------------
       * 2. Get all journal entries for those projects
       * ---------------------------------------------------------
       */
      let journalQuery = supabase
        .from("daily_journal")
        .select("*")
        .in("project_id", projectIds)
        .order("entry_date", {
          ascending: false,
        });

      if (fromDate) {
        journalQuery = journalQuery.gte("entry_date", fromDate);
      }

      if (toDate) {
        journalQuery = journalQuery.lte("entry_date", toDate);
      }

      const { data: entries, error: journalError } = await journalQuery;

      if (journalError) {
        logger.error(
          "Error fetching journal entries for dashboard:",
          journalError
        );

        throw new Error("Failed to fetch journal dashboard data");
      }

      const journalEntries = entries || [];

      /*
       * ---------------------------------------------------------
       * 3. Group journal entries by project
       * ---------------------------------------------------------
       */
      const entriesByProject = {};

      for (const projectId of projectIds) {
        entriesByProject[projectId] = [];
      }

      for (const entry of journalEntries) {
        if (!entriesByProject[entry.project_id]) {
          entriesByProject[entry.project_id] = [];
        }

        entriesByProject[entry.project_id].push(entry);
      }

      /*
       * ---------------------------------------------------------
       * 4. Calculate GLOBAL statistics
       * ---------------------------------------------------------
       */
      const totalEntries = journalEntries.length;

      const projectsWithEntries = projects.filter(
        (project) =>
          entriesByProject[project.id] &&
          entriesByProject[project.id].length > 0
      ).length;

      const projectsWithoutEntries = projects.length - projectsWithEntries;

      const withFinished = journalEntries.filter(
        (entry) => entry.finished_today && entry.finished_today.trim()
      ).length;

      const withProblems = journalEntries.filter(
        (entry) => entry.problems && entry.problems.trim()
      ).length;

      const withPlans = journalEntries.filter(
        (entry) => entry.tomorrow_plan && entry.tomorrow_plan.trim()
      ).length;

      const withNotes = journalEntries.filter(
        (entry) => entry.notes && entry.notes.trim()
      ).length;

      /*
       * ---------------------------------------------------------
       * 5. Global mood statistics
       * ---------------------------------------------------------
       */
      const moodDistribution = journalEntries.reduce((acc, entry) => {
        const mood = entry.mood || "😐";

        acc[mood] = (acc[mood] || 0) + 1;

        return acc;
      }, {});

      const moodTrend = JournalUtils.calculateMoodTrend(journalEntries);

      /*
       * ---------------------------------------------------------
       * 6. Global streak
       * ---------------------------------------------------------
       */
      const streak = JournalUtils.calculateStreak(journalEntries);

      /*
       * ---------------------------------------------------------
       * 7. Latest journal activity
       * ---------------------------------------------------------
       */
      const latestEntry = journalEntries.length > 0 ? journalEntries[0] : null;

      /*
       * ---------------------------------------------------------
       * 8. Oldest journal activity
       * ---------------------------------------------------------
       */
      const sortedAscending = [...journalEntries].sort(
        (a, b) => new Date(a.entry_date) - new Date(b.entry_date)
      );

      const oldestEntry =
        sortedAscending.length > 0 ? sortedAscending[0] : null;

      /*
       * ---------------------------------------------------------
       * 9. Build statistics for EVERY project
       * ---------------------------------------------------------
       */
      const projectStats = projects.map((project) => {
        const projectEntries = entriesByProject[project.id] || [];

        const projectLatestEntry =
          projectEntries.length > 0 ? projectEntries[0] : null;

        const projectStatsData =
          this.calculateProjectDashboardStats(projectEntries);

        return {
          project: {
            id: project.id,
            name: project.name,
            description: project.description || null,
          },

          stats: projectStatsData,

          latestActivity: projectLatestEntry
            ? {
                type: "journal_entry",
                date: projectLatestEntry.entry_date,
                createdAt: projectLatestEntry.created_at,
                journalId: projectLatestEntry.id,
              }
            : null,

          latestEntry: projectLatestEntry
            ? JournalUtils.formatJournalEntry(projectLatestEntry)
            : null,
        };
      });

      /*
       * ---------------------------------------------------------
       * 10. Sort projects by latest journal activity
       * ---------------------------------------------------------
       *
       * Projects with journal activity come first.
       * Projects without entries are placed at the bottom.
       */
      projectStats.sort((a, b) => {
        const dateA = a.latestActivity
          ? new Date(a.latestActivity.date).getTime()
          : 0;

        const dateB = b.latestActivity
          ? new Date(b.latestActivity.date).getTime()
          : 0;

        return dateB - dateA;
      });

      /*
       * ---------------------------------------------------------
       * 11. Paginate project statistics
       * ---------------------------------------------------------
       */
      const totalProjects = projectStats.length;

      const from = (page - 1) * limit;

      const paginatedProjects = projectStats.slice(from, from + limit);

      /*
       * ---------------------------------------------------------
       * 12. Build dashboard statistics
       * ---------------------------------------------------------
       */
      const stats = {
        projects: {
          total: projects.length,
          withEntries: projectsWithEntries,
          withoutEntries: projectsWithoutEntries,
        },

        journal: {
          totalEntries,

          latestEntry: latestEntry
            ? {
                id: latestEntry.id,
                projectId: latestEntry.project_id,
                date: latestEntry.entry_date,
              }
            : null,

          oldestEntry: oldestEntry
            ? {
                id: oldestEntry.id,
                projectId: oldestEntry.project_id,
                date: oldestEntry.entry_date,
              }
            : null,
        },

        completionStats: {
          withFinished: totalEntries
            ? Math.round((withFinished / totalEntries) * 100)
            : 0,

          withProblems: totalEntries
            ? Math.round((withProblems / totalEntries) * 100)
            : 0,

          withPlans: totalEntries
            ? Math.round((withPlans / totalEntries) * 100)
            : 0,

          withNotes: totalEntries
            ? Math.round((withNotes / totalEntries) * 100)
            : 0,
        },

        mood: {
          distribution: moodDistribution,
          trend: moodTrend,
        },

        streak,

        dateRange: {
          start: oldestEntry
            ? new Date(oldestEntry.entry_date).toISOString().split("T")[0]
            : null,

          end: latestEntry
            ? new Date(latestEntry.entry_date).toISOString().split("T")[0]
            : null,
        },
      };

      return {
        stats,

        projects: paginatedProjects,

        pagination: {
          page,
          limit,
          total: totalProjects,
          totalPages: Math.ceil(totalProjects / limit),
        },
      };
    } catch (error) {
      logger.error("JournalService.getDashboardStats error:", error);

      throw error;
    }
  }

  /**
   * Calculates statistics for one project.
   *
   * @param {Array} entries - Project journal entries
   * @returns {Object} Project statistics
   */
  calculateProjectDashboardStats(entries) {
    if (!entries || entries.length === 0) {
      return {
        totalEntries: 0,

        completion: {
          finished: 0,
          problems: 0,
          plans: 0,
          notes: 0,
        },

        mood: {
          distribution: {},
          trend: JournalUtils.calculateMoodTrend([]),
        },

        streak: JournalUtils.calculateStreak([]),

        latestEntryDate: null,
      };
    }

    const totalEntries = entries.length;

    const finished = entries.filter(
      (entry) => entry.finished_today && entry.finished_today.trim()
    ).length;

    const problems = entries.filter(
      (entry) => entry.problems && entry.problems.trim()
    ).length;

    const plans = entries.filter(
      (entry) => entry.tomorrow_plan && entry.tomorrow_plan.trim()
    ).length;

    const notes = entries.filter(
      (entry) => entry.notes && entry.notes.trim()
    ).length;

    const moodDistribution = entries.reduce((acc, entry) => {
      const mood = entry.mood || "😐";

      acc[mood] = (acc[mood] || 0) + 1;

      return acc;
    }, {});

    return {
      totalEntries,

      completion: {
        finished: Math.round((finished / totalEntries) * 100),

        problems: Math.round((problems / totalEntries) * 100),

        plans: Math.round((plans / totalEntries) * 100),

        notes: Math.round((notes / totalEntries) * 100),
      },

      mood: {
        distribution: moodDistribution,

        trend: JournalUtils.calculateMoodTrend(entries),
      },

      streak: JournalUtils.calculateStreak(entries),

      latestEntryDate: entries[0]?.entry_date || null,
    };
  }

  /**
   * Empty dashboard response.
   */
  getEmptyDashboardStats() {
    return {
      projects: {
        total: 0,
        withEntries: 0,
        withoutEntries: 0,
      },

      journal: {
        totalEntries: 0,
        latestEntry: null,
        oldestEntry: null,
      },

      completionStats: {
        withFinished: 0,
        withProblems: 0,
        withPlans: 0,
        withNotes: 0,
      },

      mood: {
        distribution: {},
        trend: JournalUtils.calculateMoodTrend([]),
      },

      streak: JournalUtils.calculateStreak([]),

      dateRange: {
        start: null,
        end: null,
      },
    };
  }
}

const journalService = new JournalService();

module.exports = journalService;
module.exports.journalService = journalService;
