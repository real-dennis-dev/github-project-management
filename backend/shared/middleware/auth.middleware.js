const jwt = require("jsonwebtoken");
const { supabase } = require("../../config/supabase");

class AuthMiddleware {
  // Validates JWT token from cookie or header
  async authenticate(req, res, next) {
    try {
      let token = null;

      // Check for token in cookies first
      if (req.cookies && req.cookies.access_token) {
        token = req.cookies.access_token;
      }
      // Fallback to Authorization header
      else {
        const authHeader = req.headers.authorization;
        if (authHeader) {
          token = authHeader.split(" ")[1];
        }
      }

      if (!token) {
        return res.status(401).json({
          success: false,
          error: "No token provided",
        });
      }

      // Verify with Supabase
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);

      if (error || !user) {
        return res.status(401).json({
          success: false,
          error: "Invalid or expired token",
        });
      }

      // Get user profile from database
      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Error fetching user profile:", profileError);
      }

      req.user = {
        id: user.id,
        email: user.email,
        role: profile?.role || "user",
        ...profile,
      };

      next();
    } catch (error) {
      console.error("Authentication error:", error);
      return res.status(401).json({
        success: false,
        error: "Authentication failed",
      });
    }
  }

  // Checks user roles/permissions
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

  // Refreshes authentication token and sets cookie
  async refreshToken(req, res) {
    try {
      const refreshToken = req.cookies?.refresh_token || req.body?.refreshToken;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          error: "Refresh token required",
        });
      }

      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error) {
        return res.status(401).json({
          success: false,
          error: "Invalid refresh token",
        });
      }

      // Set new tokens as cookies
      this.setAuthCookies(res, {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_in: data.session.expires_in,
      });

      return res.json({
        success: true,
        message: "Token refreshed successfully",
        data: {
          expires_in: data.session.expires_in,
        },
      });
    } catch (error) {
      console.error("Token refresh error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to refresh token",
      });
    }
  }

  // Set authentication cookies
  setAuthCookies(res, { access_token, refresh_token, expires_in }) {
    const isProduction = process.env.NODE_ENV === "production";

    // Access token cookie (short-lived)
    if (access_token) {
      res.cookie("access_token", access_token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "strict" : "lax",
        maxAge: expires_in * 1000 || 3600000, // Default 1 hour
        path: "/",
      });
    }

    // Refresh token cookie (long-lived)
    if (refresh_token) {
      res.cookie("refresh_token", refresh_token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "strict" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: "/",
      });
    }
  }

  // Clear authentication cookies
  clearAuthCookies(res) {
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      path: "/",
    });

    res.clearCookie("refresh_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      path: "/",
    });
  }

  // Validate session from cookie
  async validateSession(req, res) {
    try {
      const token = req.cookies?.access_token;

      if (!token) {
        return res.status(401).json({
          success: false,
          error: "No session found",
        });
      }

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);

      if (error || !user) {
        return res.status(401).json({
          success: false,
          error: "Invalid session",
        });
      }

      // Get user profile
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      return res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          role: profile?.role || "user",
          ...profile,
        },
      });
    } catch (error) {
      console.error("Session validation error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to validate session",
      });
    }
  }

  // Logout - clear cookies
  async logout(req, res) {
    try {
      // Clear cookies
      this.clearAuthCookies(res);

      // Optionally invalidate session with Supabase
      const token = req.cookies?.access_token;
      if (token) {
        await supabase.auth.admin.signOut(token);
      }

      return res.json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      console.error("Logout error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to logout",
      });
    }
  }
}

module.exports = new AuthMiddleware();
