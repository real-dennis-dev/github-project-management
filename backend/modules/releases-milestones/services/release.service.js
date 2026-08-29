const { supabase } = require("../../../common/config/supabase");
const ReleaseUtils = require("../utils/release.utils");
const logger = require("../../../common/config/logger");
const { DatabaseUtils } = require("../../../common/utils/database.utils");

/**
 * Release Service
 * Handles business logic for releases
 */
class ReleaseService {
  /**
   * Gets releases for a project
   * @param {string} projectId - Project UUID
   * @param {Object} options - Query options
   * @param {string} options.status - Filter by status
   * @param {number} options.page - Page number
   * @param {number} options.limit - Items per page
   * @param {string} options.sortBy - Sort field
   * @param {string} options.sortOrder - Sort order
   * @returns {Promise<Object>} - Releases with pagination
   */
  async getProjectReleases(projectId, options = {}) {
    try {
      const {
        status,
        page = 1,
        limit = 20,
        sortBy = "created_at",
        sortOrder = "DESC",
      } = options;

      // Build query
      let query = supabase
        .from("releases")
        .select(
          `
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
        `,
          { count: "exact" }
        )
        .eq("project_id", projectId);

      // Apply filters
      if (status) {
        const validStatuses = [
          "planned",
          "in_progress",
          "testing",
          "released",
          "cancelled",
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
        logger.error("Error fetching releases:", error);
        throw new Error("Failed to fetch releases");
      }

      // Format response
      const releases = (data || []).map((release) => {
        const features = release.release_features || [];
        const readiness = ReleaseUtils.calculateReleaseReadiness(
          release,
          features
        );

        return {
          ...release,
          features: features.map((rf) => ({
            ...rf.features,
            is_completed: rf.is_completed,
          })),
          readiness,
          total_features: features.length,
          completed_features: features.filter((f) => f.is_completed).length,
        };
      });

      return {
        data: releases,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      };
    } catch (error) {
      logger.error("ReleaseService.getProjectReleases error:", error);
      throw error;
    }
  }

  /**
   * Creates a new release
   * @param {string} projectId - Project UUID
   * @param {Object} data - Release data
   * @returns {Promise<Object>} - Created release
   */
  async createRelease(projectId, data) {
    try {
      // Validate version
      if (!ReleaseUtils.validateSemanticVersion(data.version)) {
        throw new Error("Invalid semantic version format (expected: X.Y.Z)");
      }

      // Check if version already exists
      const { data: existing } = await supabase
        .from("releases")
        .select("id")
        .eq("project_id", projectId)
        .eq("version", data.version)
        .single();

      if (existing) {
        throw new Error(
          `Version ${data.version} already exists for this project`
        );
      }

      // Prepare release data
      const releaseData = {
        project_id: projectId,
        version: data.version,
        description: data.description || null,
        status: data.status || "planned",
        release_date: data.release_date || null,
      };

      // Insert release
      const { data: release, error } = await supabase
        .from("releases")
        .insert([releaseData])
        .select()
        .single();

      if (error) {
        logger.error("Error creating release:", error);
        throw new Error("Failed to create release");
      }

      // Add features if provided
      if (data.features && data.features.length > 0) {
        await this.addFeaturesToRelease(release.id, data.features);
      }

      logger.info(`Release created: ${release.id} - ${release.version}`);

      // Get full release with features
      return await this.getReleaseById(release.id);
    } catch (error) {
      logger.error("ReleaseService.createRelease error:", error);
      throw error;
    }
  }

  /**
   * Gets a release by ID
   * @param {string} id - Release UUID
   * @returns {Promise<Object>} - Release object with features
   */
  async getReleaseById(id) {
    try {
      const { data, error } = await supabase
        .from("releases")
        .select(
          `
          *,
          release_features (
            feature_id,
            is_completed,
            features (
              id,
              title,
              description,
              status,
              difficulty,
              estimated_days
            )
          )
        `
        )
        .eq("id", id)
        .single();

      if (error) {
        logger.error("Error fetching release:", error);
        throw new Error("Release not found");
      }

      // Format response
      const features = data.release_features || [];
      const readiness = ReleaseUtils.calculateReleaseReadiness(data, features);

      return {
        ...data,
        features: features.map((rf) => ({
          ...rf.features,
          is_completed: rf.is_completed,
        })),
        readiness,
        total_features: features.length,
        completed_features: features.filter((f) => f.is_completed).length,
      };
    } catch (error) {
      logger.error("ReleaseService.getReleaseById error:", error);
      throw error;
    }
  }

  /**
   * Updates a release
   * @param {string} id - Release UUID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} - Updated release
   */
  async updateRelease(id, data) {
    try {
      // Check if release exists
      await this.getReleaseById(id);

      // Validate version if provided
      if (data.version && !ReleaseUtils.validateSemanticVersion(data.version)) {
        throw new Error("Invalid semantic version format (expected: X.Y.Z)");
      }

      // Prepare update data
      const updateData = {};

      if (data.version) updateData.version = data.version;
      if (data.description !== undefined) {
        updateData.description = data.description || null;
      }
      if (data.status) {
        const validStatuses = [
          "planned",
          "in_progress",
          "testing",
          "released",
          "cancelled",
        ];
        if (!validStatuses.includes(data.status)) {
          throw new Error("Invalid release status");
        }
        updateData.status = data.status;
      }
      if (data.release_date !== undefined) {
        updateData.release_date = data.release_date || null;
      }

      // Update release
      const { data: release, error } = await supabase
        .from("releases")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        logger.error("Error updating release:", error);
        throw new Error("Failed to update release");
      }

      logger.info(`Release updated: ${release.id} - ${release.version}`);

      // Get updated release with features
      return await this.getReleaseById(id);
    } catch (error) {
      logger.error("ReleaseService.updateRelease error:", error);
      throw error;
    }
  }

  /**
   * Updates release status
   * @param {string} id - Release UUID
   * @param {string} status - New status
   * @returns {Promise<Object>} - Updated release
   */
  async updateReleaseStatus(id, status) {
    try {
      const validStatuses = [
        "planned",
        "in_progress",
        "testing",
        "released",
        "cancelled",
      ];
      if (!validStatuses.includes(status)) {
        throw new Error("Invalid release status");
      }

      // Check if release exists
      await this.getReleaseById(id);

      // If releasing, check if all features are completed
      if (status === "released") {
        const release = await this.getReleaseById(id);
        const { readiness } = release;

        if (readiness.percentage < 100) {
          throw new Error(
            `Cannot release: ${readiness.completed_features}/${readiness.total_features} features completed (${readiness.percentage}%)`
          );
        }
      }

      const { data: release, error } = await supabase
        .from("releases")
        .update({
          status,
          release_date:
            status === "released" ? new Date().toISOString() : undefined,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        logger.error("Error updating release status:", error);
        throw new Error("Failed to update release status");
      }

      logger.info(`Release status updated: ${release.id} -> ${status}`);
      return await this.getReleaseById(id);
    } catch (error) {
      logger.error("ReleaseService.updateReleaseStatus error:", error);
      throw error;
    }
  }

  /**
   * Deletes a release
   * @param {string} id - Release UUID
   * @returns {Promise<void>}
   */
  async deleteRelease(id) {
    try {
      // Check if release exists
      await this.getReleaseById(id);

      // Delete release (cascades to release_features)
      const { error } = await supabase.from("releases").delete().eq("id", id);

      if (error) {
        logger.error("Error deleting release:", error);
        throw new Error("Failed to delete release");
      }

      logger.info(`Release deleted: ${id}`);
    } catch (error) {
      logger.error("ReleaseService.deleteRelease error:", error);
      throw error;
    }
  }

  /**
   * Adds features to a release
   * @param {string} releaseId - Release UUID
   * @param {Array<string>} featureIds - Array of feature UUIDs
   * @returns {Promise<Array>} - Added features
   */
  async addFeaturesToRelease(releaseId, featureIds) {
    try {
      // Check if release exists
      await this.getReleaseById(releaseId);

      // Prepare data for insertion
      const featuresData = featureIds.map((featureId) => ({
        release_id: releaseId,
        feature_id: featureId,
        is_completed: false,
      }));

      // Insert features
      const { data, error } = await supabase
        .from("release_features")
        .insert(featuresData).select(`
          feature_id,
          is_completed,
          features (
            id,
            title,
            description,
            status
          )
        `);

      if (error) {
        logger.error("Error adding features to release:", error);
        throw new Error("Failed to add features to release");
      }

      logger.info(
        `Added ${featuresData.length} features to release ${releaseId}`
      );
      return data;
    } catch (error) {
      logger.error("ReleaseService.addFeaturesToRelease error:", error);
      throw error;
    }
  }

  /**
   * Removes a feature from a release
   * @param {string} releaseId - Release UUID
   * @param {string} featureId - Feature UUID
   * @returns {Promise<void>}
   */
  async removeFeatureFromRelease(releaseId, featureId) {
    try {
      // Check if release exists
      await this.getReleaseById(releaseId);

      // Remove feature
      const { error } = await supabase
        .from("release_features")
        .delete()
        .eq("release_id", releaseId)
        .eq("feature_id", featureId);

      if (error) {
        logger.error("Error removing feature from release:", error);
        throw new Error("Failed to remove feature from release");
      }

      logger.info(`Removed feature ${featureId} from release ${releaseId}`);
    } catch (error) {
      logger.error("ReleaseService.removeFeatureFromRelease error:", error);
      throw error;
    }
  }

  /**
   * Calculates release progress
   * @param {string} releaseId - Release UUID
   * @returns {Promise<Object>} - Release progress
   */
  async calculateReleaseProgress(releaseId) {
    try {
      const release = await this.getReleaseById(releaseId);
      return release.readiness;
    } catch (error) {
      logger.error("ReleaseService.calculateReleaseProgress error:", error);
      throw error;
    }
  }

  /**
   * Generates changelog for a release
   * @param {string} releaseId - Release UUID
   * @returns {Promise<string>} - Changelog text
   */
  async generateChangelog(releaseId) {
    try {
      const release = await this.getReleaseById(releaseId);
      return ReleaseUtils.formatReleaseNotes(release, release.features || []);
    } catch (error) {
      logger.error("ReleaseService.generateChangelog error:", error);
      throw error;
    }
  }

  /**
   * Gets release statistics
   * @param {string} projectId - Project UUID
   * @returns {Promise<Object>} - Release statistics
   */
  async getReleaseStatistics(projectId) {
    try {
      const { data: releases } = await supabase
        .from("releases")
        .select("*")
        .eq("project_id", projectId);

      return ReleaseUtils.generateReleaseSummary(releases || []);
    } catch (error) {
      logger.error("ReleaseService.getReleaseStatistics error:", error);
      throw error;
    }
  }
}

const releaseService = new ReleaseService();

module.exports = releaseService;
module.exports.releaseService = releaseService;
