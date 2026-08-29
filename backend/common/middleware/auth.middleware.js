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
      const accessToken = req.cookies?.access_token;
      const refreshToken = req.cookies?.refresh_token;
      const sessionId = req.cookies?.session_id;

      // --------------------------------------------------
      // No authentication cookies at all
      // --------------------------------------------------
      if (!accessToken && !refreshToken && !sessionId) {
        return res.status(401).json({
          success: false,
          error: "Authentication required",
        });
      }

      // --------------------------------------------------
      // 1. Try the short-lived access token first
      // --------------------------------------------------
      if (accessToken) {
        try {
          const decoded = TokenUtils.verifyAccessToken(accessToken);

          const user = await AuthUtils.getUserById(decoded.sub);

          if (!user) {
            return res.status(401).json({
              success: false,
              error: "User not found",
            });
          }

          if (user.account_locked) {
            return res.status(403).json({
              success: false,
              error: "Account is locked",
            });
          }

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

          req.sessionId = sessionId || null;

          return next();
        } catch (error) {
          // Access token expired is expected.
          // Do NOT immediately return 401.
          //
          // Fall through to session validation below.
          if (error.message !== "Access token expired") {
            logger.warn("Invalid access token:", error.message);

            // The access token is invalid/tampered with.
            // We can still attempt authentication through
            // the refresh/session cookies.
          }
        }
      }

      // --------------------------------------------------
      // 2. Access token is expired/missing/invalid.
      //    Fall back to refresh token + session ID.
      // --------------------------------------------------
      if (!refreshToken || !sessionId) {
        return res.status(401).json({
          success: false,
          error: "Session required",
        });
      }

      // --------------------------------------------------
      // 3. Validate the existing session.
      //
      // IMPORTANT:
      // This does NOT refresh the access token.
      // It only verifies that the existing session is valid.
      // --------------------------------------------------
      const result = await SessionService.validateSession(refreshToken);

      if (!result.session) {
        return res.status(401).json({
          success: false,
          error: "Invalid session",
        });
      }

      // Make sure the browser's session_id matches
      // the session associated with the refresh token.
      if (result.session.id !== sessionId) {
        return res.status(401).json({
          success: false,
          error: "Invalid session",
        });
      }

      const user = result.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          error: "User not found",
        });
      }

      if (user.account_locked) {
        return res.status(403).json({
          success: false,
          error: "Account is locked",
        });
      }

      // --------------------------------------------------
      // 4. Authenticate using the validated session.
      // --------------------------------------------------
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

      req.sessionId = sessionId;

      return next();
    } catch (error) {
      logger.error("Authentication error:", error);

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
  /**
   * Optional authentication.
   *
   * Authentication sources:
   * 1. access_token cookie
   * 2. refresh_token + session_id cookies
   *
   * This middleware NEVER:
   * - Reads Authorization headers
   * - Returns 401
   * - Refreshes access tokens
   * - Sets authentication cookies
   *
   * Guests are allowed through with req.user = null.
   */
  async optionalAuth(req, res, next) {
    try {
      // Always initialize this so controllers can safely use req.user
      req.user = null;
      req.session = null;
      req.sessionId = null;

      const accessToken = req.cookies?.access_token;
      const refreshToken = req.cookies?.refresh_token;
      const sessionId = req.cookies?.session_id;

      /*
       * ---------------------------------------------------------
       * 1. Try access token first
       * ---------------------------------------------------------
       *
       * If it is valid, authenticate immediately.
       *
       * If it is expired/invalid, DO NOT refresh here.
       * We simply fall through to refresh_token + session_id.
       */
      if (accessToken) {
        try {
          const decoded = TokenUtils.verifyAccessToken(accessToken);

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

            // Session ID is useful to the rest of the application
            if (sessionId) {
              req.sessionId = sessionId;
            }

            return next();
          }
        } catch (error) {
          /*
           * Access token can be expired because it only lives
           * for 15 minutes.
           *
           * DO NOT refresh it here.
           *
           * Fall through to refresh-token/session validation.
           */
        }
      }

      /*
       * ---------------------------------------------------------
       * 2. Access token unavailable/expired
       * ---------------------------------------------------------
       *
       * Use refresh_token + session_id.
       *
       * This does NOT issue a new access token.
       * It only verifies that the existing session is valid
       * and identifies the user.
       */
      if (refreshToken && sessionId) {
        try {
          const result = await SessionService.validateSession(refreshToken);

          /*
           * Make sure the refresh token actually belongs
           * to the session represented by the session_id cookie.
           */
          if (
            result?.session &&
            result.session.id === sessionId &&
            result.user &&
            !result.user.account_locked
          ) {
            req.session = result.session;
            req.sessionId = result.session.id;

            req.user = {
              id: result.user.id,
              email: result.user.email,
              role: result.user.role,
              fullName: result.user.full_name,
              username: result.user.username,
              provider: result.user.provider,
              avatar: result.user.avatar,
              emailVerified: result.user.email_verified,
            };

            return next();
          }
        } catch (error) {
          /*
           * Invalid/expired refresh token or session.
           *
           * Since this is OPTIONAL authentication,
           * do nothing and continue as a guest.
           */
        }
      }

      /*
       * ---------------------------------------------------------
       * 3. Guest
       * ---------------------------------------------------------
       *
       * No valid authentication was found.
       * That is completely valid for optional authentication.
       */
      req.user = null;
      req.session = null;
      req.sessionId = null;

      return next();
    } catch (error) {
      /*
       * Optional authentication should NEVER prevent the
       * underlying route from executing.
       */
      logger.error("Optional authentication error:", error);

      req.user = null;
      req.session = null;
      req.sessionId = null;

      return next();
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

const authMiddleware = new AuthMiddleware();

module.exports = authMiddleware;
module.exports.authMiddleware = authMiddleware;
