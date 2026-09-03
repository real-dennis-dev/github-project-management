const { supabase } = require("../../../common/config/supabase");
const SessionModel = require("../models/session.model");
const TokenUtils = require("../utils/token.utils");
const AuthUtils = require("../utils/auth.utils");
const logger = require("../../../common/config/logger");

class SessionService {
  /**
   * Create new session
   * @param {Object} params - Session parameters
   * @returns {Promise<Object>} Created session
   */
  async createSession(params) {
    try {
      const {
        userId,
        refreshToken,
        deviceName,
        ipAddress,
        userAgent,
        expiresIn,
      } = params;

      const expiresAt = TokenUtils.getExpiryDate(expiresIn || 604800); // 7 days

      const session = await SessionModel.createSession({
        userId,
        refreshToken,
        deviceName: deviceName || this.getDeviceName(userAgent),
        ipAddress,
        userAgent,
        expiresAt,
      });

      return session;
    } catch (error) {
      logger.error("Error creating session:", error);
      throw error;
    }
  }

  /**
   * Get device name from user agent
   * @param {string} userAgent - User agent string
   * @returns {string} Device name
   */
  getDeviceName(userAgent) {
    if (!userAgent) return "Unknown Device";

    if (userAgent.includes("Chrome")) return "Chrome Browser";
    if (userAgent.includes("Firefox")) return "Firefox Browser";
    if (userAgent.includes("Safari") && !userAgent.includes("Chrome"))
      return "Safari Browser";
    if (userAgent.includes("Edge")) return "Edge Browser";
    if (userAgent.includes("Mobile")) return "Mobile Device";
    if (userAgent.includes("Tablet")) return "Tablet Device";
    if (userAgent.includes("curl")) return "Curl Request";
    if (userAgent.includes("Postman")) return "Postman";

    return "Unknown Browser";
  }

  /**
   * Get user sessions
   * @param {string} userId - User UUID
   * @param {string} currentSessionId - Current session ID
   * @returns {Promise<Array>} User sessions
   */
  async getUserSessions(userId, currentSessionId = null) {
    try {
      const sessions = await SessionModel.getUserSessions(userId);

      // Format sessions for response
      return sessions.map((session) => ({
        id: session.id,
        deviceName: session.device_name,
        ipAddress: session.ip_address,
        userAgent: session.user_agent,
        lastActive: session.last_active,
        expiresAt: session.expires_at,
        isCurrent: session.id === currentSessionId,
      }));
    } catch (error) {
      logger.error("Error getting user sessions:", error);
      throw error;
    }
  }

  /**
   * Validate session
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} Session validation result
   */
  async validateSession(refreshToken) {
    try {
      // Verify refresh token
      const payload = TokenUtils.verifyRefreshToken(refreshToken);

      // Get session from database
      const session = await SessionModel.getSessionByRefreshToken(refreshToken);

      if (!session) {
        throw new Error("Session not found");
      }

      // Check if expired
      if (new Date(session.expires_at) < new Date()) {
        await SessionModel.deleteSession(session.id);
        throw new Error("Session expired");
      }

      // Check if user exists
      const user = await AuthUtils.getUserById(session.user_id);
      if (!user) {
        await SessionModel.deleteSession(session.id);
        throw new Error("User not found");
      }

      // Update last active
      await SessionModel.updateSessionActivity(session.id);

      return {
        session,
        user,
        payload,
      };
    } catch (error) {
      logger.error("Error validating session:", error);
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} New tokens
   */
  async refreshAccessToken(refreshToken) {
    try {
      const result = await this.validateSession(refreshToken);

      // Generate new tokens
      const tokens = TokenUtils.generateTokens(result.user);

      // Extend session by 7 days from now
      const newExpiresAt = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ).toISOString();

      // Create new session with new refresh token
      await SessionModel.updateSession(result.session.id, {
        refresh_token: tokens.refreshToken,
        last_active: new Date().toISOString(),
        expires_at: newExpiresAt,
      });

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
        sessionId: result.session.id,
      };
    } catch (error) {
      logger.error("Error refreshing access token:", error);
      throw error;
    }
  }

  /**
   * Terminate a session
   * @param {string} sessionId - Session UUID
   * @param {string} userId - User UUID (for authorization)
   * @returns {Promise<void>}
   */
  async terminateSession(sessionId, userId) {
    try {
      // Check if session belongs to user
      const session = await SessionModel.getSessionById(sessionId);

      if (!session) {
        throw new Error("Session not found");
      }

      if (session.user_id !== userId) {
        throw new Error("Unauthorized to terminate this session");
      }

      await SessionModel.deleteSession(sessionId);
    } catch (error) {
      logger.error("Error terminating session:", error);
      throw error;
    }
  }

  /**
   * Terminate all sessions except current
   * @param {string} userId - User UUID
   * @param {string} currentSessionId - Current session ID
   * @returns {Promise<void>}
   */
  async terminateAllSessions(userId, currentSessionId) {
    try {
      await SessionModel.deleteAllSessionsExcept(userId, currentSessionId);
    } catch (error) {
      logger.error("Error terminating all sessions:", error);
      throw error;
    }
  }

  /**
   * Terminate all sessions for a user
   * @param {string} userId - User UUID
   * @returns {Promise<void>}
   */
  async terminateAllUserSessions(userId) {
    try {
      const sessions = await SessionModel.getUserSessions(userId);

      for (const session of sessions) {
        await SessionModel.deleteSession(session.id);
      }
    } catch (error) {
      logger.error("Error terminating all user sessions:", error);
      throw error;
    }
  }

  /**
   * Cleanup expired sessions
   * @returns {Promise<number>} Number of deleted sessions
   */
  async cleanupExpiredSessions() {
    try {
      return await SessionModel.deleteExpiredSessions();
    } catch (error) {
      logger.error("Error cleaning up expired sessions:", error);
      throw error;
    }
  }

  /**
   * Get session statistics
   * @returns {Promise<Object>} Session statistics
   */
  async getSessionStats() {
    try {
      const { data, error } = await supabase
        .from("user_sessions")
        .select("id, last_active, expires_at");

      if (error) throw error;

      const now = new Date();
      const active =
        data?.filter((s) => new Date(s.expires_at) > now).length || 0;

      const expired =
        data?.filter((s) => new Date(s.expires_at) <= now).length || 0;

      return {
        total: data?.length || 0,
        active,
        expired,
        activePercentage: data?.length
          ? ((active / data.length) * 100).toFixed(1)
          : 0,
      };
    } catch (error) {
      logger.error("Error getting session stats:", error);
      throw error;
    }
  }
}

const sessionService = new SessionService();

module.exports = sessionService;
module.exports.sessionService = sessionService;
