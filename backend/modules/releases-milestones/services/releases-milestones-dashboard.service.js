const { supabase } = require("../../../common/config/supabase");
const MilestoneUtils = require("../utils/milestone.utils");
const ReleaseUtils = require("../utils/release.utils");
const logger = require("../../../common/config/logger");

class ReleasesMilestonesDashboardService {
  /**
   * Get dashboard statistics and combined
   * releases/milestones activity across ALL projects.
   *
   * No projectId is accepted.
   *
   * @param {Object} options
   * @returns {Promise<Object>}
   */
  async getDashboard(options = {}) {
    try {
      const { page = 1, limit = 20 } = options;

      /*
       * Fetch releases and milestones independently.
       *
       * We intentionally do NOT filter by project_id.
       */

      const [releasesResult, milestonesResult] = await Promise.all([
        supabase.from("releases").select(`
            *,
            release_features (
              feature_id,
              is_completed,
              features (
                id,
                title,
                description,
                status
              )
            )
          `),

        supabase.from("milestones").select("*"),
      ]);

      if (releasesResult.error) {
        logger.error("Dashboard releases query failed:", releasesResult.error);

        throw new Error("Failed to retrieve release dashboard data");
      }

      if (milestonesResult.error) {
        logger.error(
          "Dashboard milestones query failed:",
          milestonesResult.error
        );

        throw new Error("Failed to retrieve milestone dashboard data");
      }

      const releases = releasesResult.data || [];
      const milestones = milestonesResult.data || [];

      /*
       * ============================================
       * RELEASE DASHBOARD ITEMS
       * ============================================
       */

      const releaseItems = releases.map((release) => {
        const features = release.release_features || [];

        const readiness = ReleaseUtils.calculateReleaseReadiness(
          release,
          features
        );

        return {
          id: release.id,

          type: "release",

          project_id: release.project_id,

          title: `Release ${release.version}`,

          description: release.description,

          status: release.status,

          version: release.version,

          release_date: release.release_date,

          created_at: release.created_at,

          updated_at: release.updated_at,

          progress: readiness.percentage,

          readiness,

          total_features: features.length,

          completed_features: features.filter((feature) => feature.is_completed)
            .length,

          /*
           * Used for the combined feed.
           *
           * A release's most relevant date is its
           * updated_at, falling back to release_date
           * and then created_at.
           */
          activity_date:
            release.updated_at || release.release_date || release.created_at,
        };
      });

      /*
       * ============================================
       * MILESTONE DASHBOARD ITEMS
       * ============================================
       */

      const milestoneItems = milestones.map((milestone) => {
        const progress =
          milestone.progress_percentage ||
          MilestoneUtils.calculateTargetDateProgress(milestone);

        let status = milestone.status;

        if (status !== "completed" && progress === 100) {
          status = "completed";
        }

        return {
          id: milestone.id,

          type: "milestone",

          project_id: milestone.project_id,

          title: milestone.name,

          name: milestone.name,

          description: milestone.description,

          status,

          target_date: milestone.target_date,

          completed_date: milestone.completed_date,

          created_at: milestone.created_at,

          updated_at: milestone.updated_at,

          progress,

          progress_percentage: progress,

          days_until_target: MilestoneUtils.calculateDaysUntilTarget(
            milestone.target_date
          ),

          priority: MilestoneUtils.getMilestonePriority({
            ...milestone,
            status,
            progress_percentage: progress,
          }),

          activity_date:
            milestone.updated_at ||
            milestone.target_date ||
            milestone.created_at,
        };
      });

      /*
       * ============================================
       * COMBINED ACTIVITY
       * ============================================
       */

      const combinedItems = [...releaseItems, ...milestoneItems];

      /*
       * Sort newest/latest activity first.
       */
      combinedItems.sort((a, b) => {
        const dateA = new Date(a.activity_date).getTime();
        const dateB = new Date(b.activity_date).getTime();

        return dateB - dateA;
      });

      /*
       * ============================================
       * OVERALL RELEASE STATISTICS
       * ============================================
       */

      const releaseStats = {
        total: releases.length,

        byStatus: {
          planned: 0,
          in_progress: 0,
          testing: 0,
          released: 0,
          cancelled: 0,
        },

        latestRelease: null,

        nextRelease: null,
      };

      releases.forEach((release) => {
        if (
          Object.prototype.hasOwnProperty.call(
            releaseStats.byStatus,
            release.status
          )
        ) {
          releaseStats.byStatus[release.status]++;
        }
      });

      const sortedReleases = [...releases].sort((a, b) => {
        const dateA = new Date(
          a.release_date || a.updated_at || a.created_at
        ).getTime();

        const dateB = new Date(
          b.release_date || b.updated_at || b.created_at
        ).getTime();

        return dateB - dateA;
      });

      const releasedReleases = sortedReleases.filter(
        (release) => release.status === "released"
      );

      const plannedReleases = sortedReleases.filter(
        (release) =>
          release.status === "planned" || release.status === "in_progress"
      );

      releaseStats.latestRelease = releasedReleases[0] || null;

      releaseStats.nextRelease = plannedReleases[0] || null;

      /*
       * ============================================
       * MILESTONE STATISTICS
       * ============================================
       */

      const milestoneStats = {
        total: milestones.length,

        byStatus: {
          not_started: 0,
          in_progress: 0,
          completed: 0,
          delayed: 0,
        },

        averageProgress: 0,

        overdueCount: 0,

        completedCount: 0,

        completionRate: 0,
      };

      let totalProgress = 0;

      milestones.forEach((milestone) => {
        if (
          Object.prototype.hasOwnProperty.call(
            milestoneStats.byStatus,
            milestone.status
          )
        ) {
          milestoneStats.byStatus[milestone.status]++;
        }

        const progress =
          milestone.progress_percentage ||
          MilestoneUtils.calculateTargetDateProgress(milestone);

        totalProgress += progress;
      });

      milestoneStats.completedCount = milestones.filter(
        (milestone) => milestone.status === "completed"
      ).length;

      milestoneStats.overdueCount =
        MilestoneUtils.getOverdueMilestones(milestones).length;

      if (milestones.length > 0) {
        milestoneStats.averageProgress = Math.round(
          totalProgress / milestones.length
        );

        milestoneStats.completionRate = Math.round(
          (milestoneStats.completedCount / milestones.length) * 100
        );
      }

      /*
       * ============================================
       * GLOBAL STATISTICS
       * ============================================
       */

      const totalItems = releases.length + milestones.length;

      const completedItems =
        releases.filter((release) => release.status === "released").length +
        milestones.filter((milestone) => milestone.status === "completed")
          .length;

      const activeItems =
        releases.filter((release) =>
          ["planned", "in_progress", "testing"].includes(release.status)
        ).length +
        milestones.filter((milestone) =>
          ["not_started", "in_progress", "delayed"].includes(milestone.status)
        ).length;

      /*
       * ============================================
       * PAGINATION
       * ============================================
       */

      const totalPages = Math.ceil(combinedItems.length / limit);

      const from = (page - 1) * limit;

      const paginatedItems = combinedItems.slice(from, from + limit);

      return {
        statistics: {
          total_items: totalItems,

          total_releases: releases.length,

          total_milestones: milestones.length,

          completed_items: completedItems,

          active_items: activeItems,

          completion_rate:
            totalItems > 0
              ? Math.round((completedItems / totalItems) * 100)
              : 0,

          releases: releaseStats,

          milestones: milestoneStats,
        },

        items: paginatedItems,

        pagination: {
          page,
          limit,
          total: combinedItems.length,
          totalPages,
        },
      };
    } catch (error) {
      logger.error(
        "ReleasesMilestonesDashboardService.getDashboard error:",
        error
      );

      throw error;
    }
  }
}

module.exports = new ReleasesMilestonesDashboardService();
