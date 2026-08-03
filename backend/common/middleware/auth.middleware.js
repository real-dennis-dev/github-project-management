const jwt = require("jsonwebtoken");
const { supabase } = require("../config/supabase");
const TokenUtils = require("../../modules/auth/utils/token.utils");
const AuthUtils = require("../../modules/auth/utils/auth.utils");
const SessionService = require("../../modules/auth/services/session.service");
const logger = require("../config/logger");

class AuthMiddleware {
  /**
   * Authenticate user via access token
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Next middleware
   */
  async authenticate(req, res, next) {
    try {
      let token = null;

      // Check cookie first
      if (req.cookies && req.cookies.access_token) {
        token = req.cookies.access_token;
      }
      // Then check Authorization header
      else if (req.headers.authorization) {
        const authHeader = req.headers.authorization;
        if (authHeader.startsWith("Bearer ")) {
          token = authHeader.substring(7);
        }
      }

      if (!token) {
        return res.status(401).json({
          success: false,
          error: "No access token provided",
        });
      }

      try {
        // Verify token
        const decoded = TokenUtils.verifyAccessToken(token);

        // Get user from database
        const user = await AuthUtils.getUserById(decoded.sub);
        if (!user) {
          throw new Error("User not found");
        }

        // Check if account is locked
        if (user.account_locked) {
          return res.status(403).json({
            success: false,
            error: "Account is locked",
          });
        }

        // Set user in request
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
          fullName: user.full_name,
          username: user.username,
          provider: user.provider,
          avatar: user.avatar,
          emailVerified: user.email_verified,
        };

        // Get session from cookie if available
        if (req.cookies && req.cookies.session_id) {
          req.sessionId = req.cookies.session_id;
        }

        next();
      } catch (error) {
        // If token is expired, try to refresh
        if (error.message === "Access token expired") {
          const refreshToken = req.cookies?.refresh_token;
          if (refreshToken) {
            try {
              // Refresh token
              const result = await SessionService.refreshAccessToken(
                refreshToken
              );

              // Set new cookies
              this.setAuthCookies(res, {
                access_token: result.accessToken,
                refresh_token: result.refreshToken,
                session_id: result.sessionId,
              });

              // Get user and continue
              const decoded = TokenUtils.verifyAccessToken(result.accessToken);
              const user = await AuthUtils.getUserById(decoded.sub);

              req.user = {
                id: user.id,
                email: user.email,
                role: user.role,
                fullName: user.full_name,
                username: user.username,
                provider: user.provider,
                avatar: user.avatar,
                emailVerified: user.email_verified,
              };
              req.sessionId = result.sessionId;

              next();
              return;
            } catch (refreshError) {
              return res.status(401).json({
                success: false,
                error: "Session expired. Please login again.",
              });
            }
          }
        }

        throw error;
      }
    } catch (error) {
      logger.error("Authentication error:", error);

      // Clear cookies if invalid
      this.clearAuthCookies(res);

      return res.status(401).json({
        success: false,
        error: error.message || "Authentication failed",
      });
    }
  }

  /**
   * Optional authentication - doesn't require token
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Next middleware
   */
  async optionalAuth(req, res, next) {
    try {
      let token = null;

      if (req.cookies && req.cookies.access_token) {
        token = req.cookies.access_token;
      } else if (req.headers.authorization) {
        const authHeader = req.headers.authorization;
        if (authHeader.startsWith("Bearer ")) {
          token = authHeader.substring(7);
        }
      }

      if (token) {
        try {
          const decoded = TokenUtils.verifyAccessToken(token);
          const user = await AuthUtils.getUserById(decoded.sub);

          if (user && !user.account_locked) {
            req.user = {
              id: user.id,
              email: user.email,
              role: user.role,
              fullName: user.full_name,
              username: user.username,
              provider: user.provider,
              avatar: user.avatar,
              emailVerified: user.email_verified,
            };
          }
        } catch (error) {
          // Silently ignore token errors for optional auth
        }
      }

      next();
    } catch (error) {
      next();
    }
  }

  /**
   * Authorize user by role
   * @param {Array} allowedRoles - Allowed roles
   * @returns {Function} Middleware
   */
  authorize(allowedRoles = []) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: "User not authenticated",
        });
      }

      const userRole = req.user.role;
      const hasPermission =
        allowedRoles.includes(userRole) || userRole === "admin";

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          error: "Insufficient permissions",
        });
      }

      next();
    };
  }

  /**
   * Set authentication cookies
   * @param {Object} res - Express response
   * @param {Object} tokens - Token data
   */
  setAuthCookies(res, { access_token, refresh_token, session_id }) {
    const isProduction = process.env.NODE_ENV === "production";

    if (access_token) {
      res.cookie("access_token", access_token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "strict" : "lax",
        maxAge: 15 * 60 * 1000, // 15 minutes
        path: "/",
      });
    }

    if (refresh_token) {
      res.cookie("refresh_token", refresh_token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "strict" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: "/",
      });
    }

    if (session_id) {
      res.cookie("session_id", session_id, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "strict" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: "/",
      });
    }
  }

  /**
   * Clear authentication cookies
   * @param {Object} res - Express response
   */
  clearAuthCookies(res) {
    const isProduction = process.env.NODE_ENV === "production";

    res.clearCookie("access_token", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "strict" : "lax",
      path: "/",
    });

    res.clearCookie("refresh_token", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "strict" : "lax",
      path: "/",
    });

    res.clearCookie("session_id", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "strict" : "lax",
      path: "/",
    });
  }

  /**
   * Validate session middleware
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Next middleware
   */
  async validateSession(req, res, next) {
    try {
      const sessionId = req.cookies?.session_id;
      const refreshToken = req.cookies?.refresh_token;

      if (!sessionId || !refreshToken) {
        return res.status(401).json({
          success: false,
          error: "No session found",
        });
      }

      const result = await SessionService.validateSession(refreshToken);

      if (!result.session || result.session.id !== sessionId) {
        return res.status(401).json({
          success: false,
          error: "Invalid session",
        });
      }

      req.session = result.session;
      req.user = AuthUtils.sanitizeUser(result.user);

      next();
    } catch (error) {
      logger.error("Session validation error:", error);

      if (error.message === "Session expired") {
        // Clear expired session cookies
        this.clearAuthCookies(res);
      }

      return res.status(401).json({
        success: false,
        error: error.message || "Session validation failed",
      });
    }
  }

  /**
   * Rate limit for auth endpoints
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Next middleware
   */
  authRateLimiter(req, res, next) {
    // Track failed attempts by IP
    const key = `auth_attempts_${req.ip}`;
    const maxAttempts = 10;
    const windowMs = 15 * 60 * 1000; // 15 minutes

    // Implementation using cache or Redis would go here
    // For now, just pass through
    next();
  }
}

module.exports = new AuthMiddleware();
