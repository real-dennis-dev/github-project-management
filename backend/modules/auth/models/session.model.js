const { supabase } = require("../../../common/config/supabase");
const logger = require("../../../common/config/logger");

class SessionModel {
  /**
   * Create a new session
   * @param {Object} sessionData - Session data
   * @returns {Promise<Object>} Created session
   */
  async createSession(sessionData) {
    try {
      const { data, error } = await supabase
        .from("user_sessions")
        .insert([
          {
            user_id: sessionData.userId,
            refresh_token: sessionData.refreshToken,
            device_name: sessionData.deviceName || "Unknown Device",
            ip_address: sessionData.ipAddress,
            user_agent: sessionData.userAgent,
            expires_at: sessionData.expiresAt,
            last_active: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error("Error creating session:", error);
      throw error;
    }
  }

  /**
   * Get session by refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} Session data
   */
  async getSessionByRefreshToken(refreshToken) {
    try {
      const { data, error } = await supabase
        .from("user_sessions")
        .select("*")
        .eq("refresh_token", refreshToken)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null;
        throw error;
      }
      return data;
    } catch (error) {
      logger.error("Error getting session by refresh token:", error);
      throw error;
    }
  }

  /**
   * Get session by ID
   * @param {string} sessionId - Session UUID
   * @returns {Promise<Object>} Session data
   */
  async getSessionById(sessionId) {
    try {
      const { data, error } = await supabase
        .from("user_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null;
        throw error;
      }
      return data;
    } catch (error) {
      logger.error("Error getting session by ID:", error);
      throw error;
    }
  }

  /**
   * Get all sessions for a user
   * @param {string} userId - User UUID
   * @returns {Promise<Array>} User sessions
   */
  async getUserSessions(userId) {
    try {
      const { data, error } = await supabase
        .from("user_sessions")
        .select("*")
        .eq("user_id", userId)
        .order("last_active", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error("Error getting user sessions:", error);
      throw error;
    }
  }

  /**
   * Update session last active time
   * @param {string} sessionId - Session UUID
   * @returns {Promise<void>}
   */
  async updateSessionActivity(sessionId) {
    try {
      const { error } = await supabase
        .from("user_sessions")
        .update({ last_active: new Date().toISOString() })
        .eq("id", sessionId);

      if (error) throw error;
    } catch (error) {
      logger.error("Error updating session activity:", error);
      throw error;
    }
  }

  /**
   * Delete a session
   * @param {string} sessionId - Session UUID
   * @returns {Promise<void>}
   */
  async deleteSession(sessionId) {
    try {
      const { error } = await supabase
        .from("user_sessions")
        .delete()
        .eq("id", sessionId);

      if (error) throw error;
    } catch (error) {
      logger.error("Error deleting session:", error);
      throw error;
    }
  }

  /**
   * Delete all sessions for a user except current
   * @param {string} userId - User UUID
   * @param {string} currentSessionId - Current session ID to keep
   * @returns {Promise<void>}
   */
  async deleteAllSessionsExcept(userId, currentSessionId) {
    try {
      const { error } = await supabase
        .from("user_sessions")
        .delete()
        .eq("user_id", userId)
        .neq("id", currentSessionId);

      if (error) throw error;
    } catch (error) {
      logger.error("Error deleting all sessions:", error);
      throw error;
    }
  }

  /**
   * Delete expired sessions
   * @returns {Promise<number>} Number of deleted sessions
   */
  async deleteExpiredSessions() {
    try {
      const { data, error } = await supabase
        .from("user_sessions")
        .delete()
        .lt("expires_at", new Date().toISOString())
        .select();

      if (error) throw error;
      return data?.length || 0;
    } catch (error) {
      logger.error("Error deleting expired sessions:", error);
      throw error;
    }
  }

  /**
   * Cleanup old sessions (keep only recent N sessions per user)
   * @param {number} maxSessionsPerUser - Maximum sessions to keep
   * @returns {Promise<number>} Number of deleted sessions
   */
  async cleanupOldSessions(maxSessionsPerUser = 10) {
    try {
      // Get users with more than maxSessionsPerUser sessions
      const { data: users, error } = await supabase
        .from("user_sessions")
        .select("user_id, count(*)")
        .group_by("user_id")
        .having("count(*) > ?", maxSessionsPerUser);

      if (error) throw error;

      let totalDeleted = 0;

      for (const user of users || []) {
        // Get sessions to delete (oldest first)
        const { data: sessions } = await supabase
          .from("user_sessions")
          .select("id")
          .eq("user_id", user.user_id)
          .order("last_active", { ascending: true })
          .range(0, user.count - maxSessionsPerUser - 1);

        if (sessions && sessions.length > 0) {
          const ids = sessions.map((s) => s.id);
          const { error: deleteError } = await supabase
            .from("user_sessions")
            .delete()
            .in("id", ids);

          if (!deleteError) {
            totalDeleted += ids.length;
          }
        }
      }

      return totalDeleted;
    } catch (error) {
      logger.error("Error cleaning up old sessions:", error);
      throw error;
    }
  }
}

module.exports = new SessionModel();
