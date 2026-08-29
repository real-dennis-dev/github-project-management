const { supabase } = require("../../../common/config/supabase");
const TokenUtils = require("../utils/token.utils");
const AuthUtils = require("../utils/auth.utils");
const SessionService = require("./session.service");
const logger = require("../../../common/config/logger");

class AuthService {
  /**
   * Login with email and password
   * @param {Object} credentials - { email, password, rememberMe }
   * @param {Object} requestData - { ip, userAgent }
   * @returns {Promise<Object>} Auth result
   */
  async login(credentials, requestData) {
    try {
      const { email, password, rememberMe = false } = credentials;
      const { ip, userAgent } = requestData;

      // Get user from database
      const user = await AuthUtils.getUserByEmail(email);

      if (!user) {
        throw new Error("Invalid email or password");
      }

      // Check if using email provider
      if (user.provider !== "email") {
        throw new Error(`Please login with ${user.provider}`);
      }

      // Check if email is verified
      // if (!user.email_verified) {
      //   throw new Error("Please verify your email before logging in");
      // }

      // Check if account is locked
      if (user.account_locked) {
        throw new Error("Account is locked. Please contact support.");
      }

      // Validate password
      const isValid = await AuthUtils.comparePassword(
        password,
        user.password_hash
      );

      if (!isValid) {
        // Track failed attempts
        await this._handleFailedLogin(user.id);
        throw new Error("Invalid email or password");
      }

      // Generate tokens
      const tokens = TokenUtils.generateTokens(user);

      // Create session
      const expiresIn = rememberMe ? 604800 : 86400; // 7 days or 1 day
      const session = await SessionService.createSession({
        userId: user.id,
        refreshToken: tokens.refreshToken,
        deviceName: SessionService.getDeviceName(userAgent),
        ipAddress: ip,
        userAgent,
        expiresIn,
      });

      // Reset failed login attempts
      await this._resetFailedLoginAttempts(user.id);

      return {
        user: AuthUtils.sanitizeUser(user),
        tokens,
        sessionId: session.id,
        expiresIn,
      };
    } catch (error) {
      logger.error("Error in login:", error);
      throw error;
    }
  }

  /**
   * Register new user
   * @param {Object} userData - { email, password, fullName, username }
   * @returns {Promise<Object>} Registration result
   */
  async register(userData) {
    try {
      const { email, password, fullName, username } = userData;

      // Check if user exists
      const existingUser = await AuthUtils.getUserByEmail(email);
      if (existingUser) {
        throw new Error("User with this email already exists");
      }

      // Check if username is taken
      if (username) {
        const { data } = await supabase
          .from("user_profiles")
          .select("username")
          .eq("username", username)
          .single();

        if (data) {
          throw new Error("Username is already taken");
        }
      }

      // Hash password
      const passwordHash = await AuthUtils.hashPassword(password);

      // Create user in Supabase Auth
      const { data: authUser, error: authError } =
        await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: false,
          user_metadata: {
            full_name: fullName,
            username: username || email.split("@")[0],
          },
        });

      if (authError) {
        throw new Error(`Failed to create user: ${authError.message}`);
      }

      // Create user profile
      const user = await AuthUtils.createUserProfile({
        id: authUser.user.id,
        email,
        fullName,
        username: username || email.split("@")[0],
        passwordHash,
        provider: "email",
        emailVerified: false,
      });

      // Generate verification token
      const verifyToken = await AuthUtils.generateVerificationToken(email);

      // Send verification email (implement in notification service)
      // await NotificationService.sendVerificationEmail(email, verifyToken);

      return {
        user: AuthUtils.sanitizeUser(user),
        message: "Registration successful. Please verify your email.",
        requiresVerification: true,
      };
    } catch (error) {
      logger.error("Error in register:", error);
      throw error;
    }
  }

  /**
   * Login with OAuth provider
   * @param {string} provider - Provider name (google, github)
   * @param {Object} oauthData - OAuth user data
   * @param {Object} requestData - { ip, userAgent }
   * @returns {Promise<Object>} Auth result
   */
  async oauthLogin(provider, oauthData, requestData) {
    try {
      const { ip, userAgent } = requestData;

      // Get or create user
      const user = await AuthUtils.getOrCreateOAuthUser(oauthData, provider);

      // Generate tokens
      const tokens = TokenUtils.generateTokens(user);

      // Create session
      const session = await SessionService.createSession({
        userId: user.id,
        refreshToken: tokens.refreshToken,
        deviceName: SessionService.getDeviceName(userAgent),
        ipAddress: ip,
        userAgent,
        expiresIn: 604800, // 7 days
      });

      return {
        user: AuthUtils.sanitizeUser(user),
        tokens,
        sessionId: session.id,
        expiresIn: 604800,
      };
    } catch (error) {
      logger.error("Error in oauthLogin:", error);
      throw error;
    }
  }

  /**
   * Logout user
   * @param {string} userId - User UUID
   * @param {string} sessionId - Session UUID
   * @returns {Promise<void>}
   */
  async logout(userId, sessionId) {
    try {
      await SessionService.terminateSession(sessionId, userId);
    } catch (error) {
      logger.error("Error in logout:", error);
      throw error;
    }
  }

  /**
   * Logout from all sessions
   * @param {string} userId - User UUID
   * @param {string} currentSessionId - Current session ID
   * @returns {Promise<void>}
   */
  async logoutAll(userId, currentSessionId) {
    try {
      await SessionService.terminateAllSessions(userId, currentSessionId);
    } catch (error) {
      logger.error("Error in logoutAll:", error);
      throw error;
    }
  }

  /**
   * Refresh access token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} New tokens
   */
  async refreshToken(refreshToken) {
    try {
      return await SessionService.refreshAccessToken(refreshToken);
    } catch (error) {
      logger.error("Error in refreshToken:", error);
      throw error;
    }
  }

  /**
   * Get user sessions
   * @param {string} userId - User UUID
   * @param {string} currentSessionId - Current session ID
   * @returns {Promise<Array>} User sessions
   */
  async getUserSessions(userId, currentSessionId) {
    try {
      return await SessionService.getUserSessions(userId, currentSessionId);
    } catch (error) {
      logger.error("Error in getUserSessions:", error);
      throw error;
    }
  }

  /**
   * Verify email
   * @param {string} token - Verification token
   * @returns {Promise<Object>} Verification result
   */
  async verifyEmail(token) {
    try {
      const result = await AuthUtils.verifyEmailToken(token);

      // Update user profile
      await AuthUtils.verifyUserEmail(result.userId);

      return {
        success: true,
        message: "Email verified successfully",
      };
    } catch (error) {
      logger.error("Error in verifyEmail:", error);
      throw error;
    }
  }

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise<Object>} Result
   */
  async requestPasswordReset(email) {
    try {
      const user = await AuthUtils.getUserByEmail(email);
      if (!user) {
        throw new Error("User not found");
      }

      const token = await AuthUtils.generateResetToken(email);

      // Send reset email (implement in notification service)
      // await NotificationService.sendPasswordResetEmail(email, token);

      return {
        success: true,
        message: "Password reset link sent to your email",
      };
    } catch (error) {
      logger.error("Error in requestPasswordReset:", error);
      throw error;
    }
  }

  /**
   * Reset password
   * @param {string} token - Reset token
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Result
   */
  async resetPassword(token, newPassword) {
    try {
      const result = await AuthUtils.verifyResetToken(token);

      const user = await AuthUtils.getUserByEmail(result.email);
      if (!user) {
        throw new Error("User not found");
      }

      // Hash new password
      const passwordHash = await AuthUtils.hashPassword(newPassword);

      // Update password
      await AuthUtils.updateUserPassword(user.id, passwordHash);

      // Mark token as used
      await AuthUtils.markResetTokenUsed(token);

      // Terminate all sessions
      await SessionService.terminateAllUserSessions(user.id);

      return {
        success: true,
        message: "Password reset successfully",
      };
    } catch (error) {
      logger.error("Error in resetPassword:", error);
      throw error;
    }
  }

  /**
   * Change password
   * @param {string} userId - User UUID
   * @param {Object} data - { currentPassword, newPassword }
   * @returns {Promise<Object>} Result
   */
  async changePassword(userId, data) {
    try {
      const { currentPassword, newPassword } = data;

      const user = await AuthUtils.getUserById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Validate current password
      const isValid = await AuthUtils.comparePassword(
        currentPassword,
        user.password_hash
      );

      if (!isValid) {
        throw new Error("Current password is incorrect");
      }

      // Hash new password
      const passwordHash = await AuthUtils.hashPassword(newPassword);

      // Update password
      await AuthUtils.updateUserPassword(userId, passwordHash);

      // Terminate all sessions except current
      // (current session will be handled by controller)

      return {
        success: true,
        message: "Password changed successfully",
      };
    } catch (error) {
      logger.error("Error in changePassword:", error);
      throw error;
    }
  }

  /**
   * Handle failed login
   * @private
   */
  async _handleFailedLogin(userId) {
    try {
      const { data: user } = await supabase
        .from("user_profiles")
        .select("failed_login_attempts, account_locked")
        .eq("id", userId)
        .single();

      if (user) {
        const attempts = (user.failed_login_attempts || 0) + 1;
        const updateData = { failed_login_attempts: attempts };

        // Lock account after 5 attempts
        if (attempts >= 5) {
          updateData.account_locked = true;
          logger.warn(`Account locked for user ${userId}`);
        }

        await supabase
          .from("user_profiles")
          .update(updateData)
          .eq("id", userId);
      }
    } catch (error) {
      logger.error("Error handling failed login:", error);
    }
  }

  /**
   * Reset failed login attempts
   * @private
   */
  async _resetFailedLoginAttempts(userId) {
    try {
      await supabase
        .from("user_profiles")
        .update({
          failed_login_attempts: 0,
          account_locked: false,
        })
        .eq("id", userId);
    } catch (error) {
      logger.error("Error resetting failed login attempts:", error);
    }
  }

  /**
   * Get user by session
   * @param {string} sessionId - Session UUID
   * @returns {Promise<Object>} User data
   */
  async getUserBySession(sessionId) {
    try {
      const session = await SessionModel.getSessionById(sessionId);
      if (!session) {
        throw new Error("Session not found");
      }

      const user = await AuthUtils.getUserById(session.user_id);
      if (!user) {
        throw new Error("User not found");
      }

      return AuthUtils.sanitizeUser(user);
    } catch (error) {
      logger.error("Error getting user by session:", error);
      throw error;
    }
  }
}

const authService = new AuthService();

module.exports = authService;
module.exports.authService = authService;
