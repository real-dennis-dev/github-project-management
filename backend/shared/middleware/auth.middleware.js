const jwt = require("jsonwebtoken");
const { supabase } = require("../../config/supabase");

class AuthMiddleware {
  // Validates JWT token
  async authenticate(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: "No token provided" });
      }

      const token = authHeader.split(" ")[1];
      if (!token) {
        return res.status(401).json({ error: "Invalid token format" });
      }

      // Verify with Supabase
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);

      if (error || !user) {
        return res.status(401).json({ error: "Invalid or expired token" });
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
      return res.status(401).json({ error: "Authentication failed" });
    }
  }

  // Checks user roles/permissions
  authorize(allowedRoles = []) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const userRole = req.user.role;
      const hasPermission =
        allowedRoles.includes(userRole) || userRole === "admin";

      if (!hasPermission) {
        return res.status(403).json({ error: "Insufficient permissions" });
      }

      next();
    };
  }

  // Refreshes authentication token
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({ error: "Refresh token required" });
      }

      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error) {
        return res.status(401).json({ error: "Invalid refresh token" });
      }

      return res.json({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_in: data.session.expires_in,
      });
    } catch (error) {
      console.error("Token refresh error:", error);
      return res.status(500).json({ error: "Failed to refresh token" });
    }
  }
}

module.exports = new AuthMiddleware();
