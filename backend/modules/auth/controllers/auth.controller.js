const AuthService = require("../services/auth.service");
const AuthMiddleware = require("../../../common/middleware/auth.middleware");
const ResponseUtils = require("../../../common/utils/response.utils");
const logger = require("../../../common/config/logger");

class AuthController {
  /**
   * Login with email and password
   */
  async login(req, res) {
    try {
      const { email, password, rememberMe } = req.body;

      const result = await AuthService.login(
        { email, password, rememberMe },
        {
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.headers["user-agent"],
        }
      );

      // Set cookies
      AuthMiddleware.setAuthCookies(res, {
        access_token: result.tokens.accessToken,
        refresh_token: result.tokens.refreshToken,
        session_id: result.sessionId,
      });

      // Also send in response body for mobile apps
      return ResponseUtils.sendSuccess(
        res,
        {
          user: result.user,
          tokens: result.tokens,
          sessionId: result.sessionId,
        },
        "Login successful"
      );
    } catch (error) {
      logger.error("Login error:", error);
      return ResponseUtils.sendError(res, error.message, 401);
    }
  }

  /**
   * Register new user
   */
  async register(req, res) {
    try {
      const result = await AuthService.register(req.body);

      return ResponseUtils.sendSuccess(res, result, result.message, 201);
    } catch (error) {
      logger.error("Registration error:", error);
      return ResponseUtils.sendError(res, error.message, 400);
    }
  }

  /**
   * Login with Google
   */
  async googleLogin(req, res) {
    try {
      const { code, redirectUri } = req.body;

      // Exchange code for access token
      // const oauthData = await this._exchangeGoogleCode(code, redirectUri);

      // For demo, use mock data
      const mockOauthData = {
        email: "user@gmail.com",
        name: "Google User",
        avatar: "https://lh3.googleusercontent.com/...",
        id: "google_123",
      };

      const result = await AuthService.oauthLogin("google", mockOauthData, {
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers["user-agent"],
      });

      AuthMiddleware.setAuthCookies(res, {
        access_token: result.tokens.accessToken,
        refresh_token: result.tokens.refreshToken,
        session_id: result.sessionId,
      });

      return ResponseUtils.sendSuccess(
        res,
        {
          user: result.user,
          tokens: result.tokens,
        },
        "Google login successful"
      );
    } catch (error) {
      logger.error("Google login error:", error);
      return ResponseUtils.sendError(res, error.message, 400);
    }
  }

  /**
   * Login with GitHub
   */
  async githubLogin(req, res) {
    try {
      const { code, redirectUri } = req.body;

      // Exchange code for access token
      // const oauthData = await this._exchangeGithubCode(code, redirectUri);

      // For demo, use mock data
      const mockOauthData = {
        email: "user@github.com",
        name: "GitHub User",
        avatar: "https://avatars.githubusercontent.com/...",
        id: "github_123",
      };

      const result = await AuthService.oauthLogin("github", mockOauthData, {
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers["user-agent"],
      });

      AuthMiddleware.setAuthCookies(res, {
        access_token: result.tokens.accessToken,
        refresh_token: result.tokens.refreshToken,
        session_id: result.sessionId,
      });

      return ResponseUtils.sendSuccess(
        res,
        {
          user: result.user,
          tokens: result.tokens,
        },
        "GitHub login successful"
      );
    } catch (error) {
      logger.error("GitHub login error:", error);
      return ResponseUtils.sendError(res, error.message, 400);
    }
  }

  /**
   * Logout from current session
   */
  async logout(req, res) {
    try {
      const userId = req.user?.id;
      const sessionId = req.sessionId;

      if (userId && sessionId) {
        await AuthService.logout(userId, sessionId);
      }

      AuthMiddleware.clearAuthCookies(res);

      return ResponseUtils.sendSuccess(res, null, "Logged out successfully");
    } catch (error) {
      logger.error("Logout error:", error);
      AuthMiddleware.clearAuthCookies(res);
      return ResponseUtils.sendError(res, error.message, 500);
    }
  }

  /**
   * Logout from all sessions
   */
  async logoutAll(req, res) {
    try {
      const userId = req.user?.id;
      const sessionId = req.sessionId;

      if (!userId) {
        throw new Error("User not authenticated");
      }

      await AuthService.logoutAll(userId, sessionId);
      AuthMiddleware.clearAuthCookies(res);

      return ResponseUtils.sendSuccess(
        res,
        null,
        "Logged out from all sessions"
      );
    } catch (error) {
      logger.error("Logout all error:", error);
      return ResponseUtils.sendError(res, error.message, 500);
    }
  }

  /**
   * Logout from specific session
   */
  async logoutSession(req, res) {
    try {
      const { sessionId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        throw new Error("User not authenticated");
      }

      await AuthService.logout(userId, sessionId);

      return ResponseUtils.sendSuccess(
        res,
        null,
        "Session terminated successfully"
      );
    } catch (error) {
      logger.error("Logout session error:", error);
      return ResponseUtils.sendError(res, error.message, 400);
    }
  }
  /**
   * Get current authenticated user
   * Can also be accessed by guests.
   *
   * @route GET /api/auth/me
   * @access Public / Optional Auth
   */
  async getCurrentUser(req, res) {
    try {
      // optionalAuth middleware puts the user on req.user
      // when a valid authenticated session exists.
      const user = req.user || null;

      return ResponseUtils.sendSuccess(
        res,
        user,
        user ? "Current user retrieved successfully" : "No authenticated user"
      );
    } catch (error) {
      logger.error("Get current user error:", error);

      return ResponseUtils.sendError(
        res,
        "Unable to retrieve current user",
        500
      );
    }
  }

  /**
   * Get all user sessions
   */
  async getSessions(req, res) {
    try {
      const userId = req.user?.id;
      const currentSessionId = req.sessionId;

      if (!userId) {
        throw new Error("User not authenticated");
      }

      const sessions = await AuthService.getUserSessions(
        userId,
        currentSessionId
      );

      return ResponseUtils.sendSuccess(
        res,
        sessions,
        "Sessions retrieved successfully"
      );
    } catch (error) {
      logger.error("Get sessions error:", error);
      return ResponseUtils.sendError(res, error.message, 500);
    }
  }

  /**
   * Validate current session
   */
  async validateSession(req, res) {
    try {
      const user = req.user;

      if (!user) {
        return ResponseUtils.sendError(res, "No valid session", 401);
      }

      return ResponseUtils.sendSuccess(res, user, "Session valid");
    } catch (error) {
      logger.error("Validate session error:", error);
      return ResponseUtils.sendError(res, error.message, 401);
    }
  }

  /**
   * Get current authentication state
   * Used for public pages where authentication is optional
   */
  async getAuthState(req, res) {
    try {
      const user = req.user || null;

      return ResponseUtils.sendSuccess(
        res,
        {
          authenticated: !!user,
          user,
        },
        "Authentication state retrieved"
      );
    } catch (error) {
      logger.error("Get auth state error:", error);

      // Do not fail public pages because of auth state errors
      return ResponseUtils.sendSuccess(
        res,
        {
          authenticated: false,
          user: null,
        },
        "No active session"
      );
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(req, res) {
    try {
      const refreshToken = req.cookies?.refresh_token || req.body?.refreshToken;

      if (!refreshToken) {
        return ResponseUtils.sendError(res, "Refresh token required", 400);
      }

      const result = await AuthService.refreshToken(refreshToken);

      AuthMiddleware.setAuthCookies(res, {
        access_token: result.accessToken,
        refresh_token: result.refreshToken,
        session_id: result.sessionId,
      });

      return ResponseUtils.sendSuccess(
        res,
        {
          accessToken: result.accessToken,
          expiresIn: result.expiresIn,
        },
        "Token refreshed successfully"
      );
    } catch (error) {
      logger.error("Refresh token error:", error);
      AuthMiddleware.clearAuthCookies(res);
      return ResponseUtils.sendError(res, error.message, 401);
    }
  }

  /**
   * Verify email
   */
  async verifyEmail(req, res) {
    try {
      const { token } = req.body;

      const result = await AuthService.verifyEmail(token);

      return ResponseUtils.sendSuccess(res, result, result.message);
    } catch (error) {
      logger.error("Verify email error:", error);
      return ResponseUtils.sendError(res, error.message, 400);
    }
  }

  /**
   * Request password reset
   */
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      const result = await AuthService.requestPasswordReset(email);

      return ResponseUtils.sendSuccess(res, result, result.message);
    } catch (error) {
      logger.error("Forgot password error:", error);
      return ResponseUtils.sendError(res, error.message, 400);
    }
  }

  /**
   * Reset password
   */
  async resetPassword(req, res) {
    try {
      const { token, newPassword, confirmPassword } = req.body;

      if (newPassword !== confirmPassword) {
        return ResponseUtils.sendError(res, "Passwords do not match", 400);
      }

      const result = await AuthService.resetPassword(token, newPassword);

      // Clear all existing sessions
      AuthMiddleware.clearAuthCookies(res);

      return ResponseUtils.sendSuccess(res, result, result.message);
    } catch (error) {
      logger.error("Reset password error:", error);
      return ResponseUtils.sendError(res, error.message, 400);
    }
  }

  /**
   * Change password (authenticated)
   */
  async changePassword(req, res) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return ResponseUtils.sendError(res, "User not authenticated", 401);
      }

      const { currentPassword, newPassword, confirmPassword } = req.body;

      if (newPassword !== confirmPassword) {
        return ResponseUtils.sendError(res, "Passwords do not match", 400);
      }

      const result = await AuthService.changePassword(userId, {
        currentPassword,
        newPassword,
      });

      // Clear all sessions except current
      await AuthService.logoutAll(userId, req.sessionId);

      return ResponseUtils.sendSuccess(res, result, result.message);
    } catch (error) {
      logger.error("Change password error:", error);
      return ResponseUtils.sendError(res, error.message, 400);
    }
  }
}

const authController = new AuthController();

module.exports = authController;
module.exports.authController = authController;
