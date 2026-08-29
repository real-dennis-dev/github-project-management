const bcrypt = require("bcryptjs");
const { randomBytes } = require("crypto");
const { supabase } = require("../../../common/config/supabase");
const logger = require("../../../common/config/logger");

class AuthUtils {
  /**
   * Hash password
   * @param {string} password - Plain text password
   * @returns {Promise<string>} Hashed password
   */
  async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  /**
   * Compare password with hash
   * @param {string} password - Plain text password
   * @param {string} hash - Hashed password
   * @returns {Promise<boolean>} True if match
   */
  async comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
  }

  /**
   * Get user by email
   * @param {string} email - User email
   * @returns {Promise<Object>} User data
   */
  async getUserByEmail(email) {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("email", email)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null;
        throw error;
      }
      return data;
    } catch (error) {
      logger.error("Error getting user by email:", error);
      throw error;
    }
  }

  /**
   * Get user by ID
   * @param {string} userId - User UUID
   * @returns {Promise<Object>} User data
   */
  async getUserById(userId) {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null;
        throw error;
      }
      return data;
    } catch (error) {
      logger.error("Error getting user by ID:", error);
      throw error;
    }
  }

  /**
   * Create user profile
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user
   */
  async createUserProfile(userData) {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .insert([
          {
            id: userData.id,
            email: userData.email,
            full_name: userData.fullName,
            username: userData.username,
            role: userData.role || "user",
            provider: userData.provider || "email",
            email_verified: userData.emailVerified || false,
            avatar: userData.avatar || null,
            password_hash: userData.passwordHash || null,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error("Error creating user profile:", error);
      throw error;
    }
  }

  /**
   * Update user profile
   * @param {string} userId - User UUID
   * @param {Object} updates - Update data
   * @returns {Promise<Object>} Updated user
   */
  async updateUserProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .update(updates)
        .eq("id", userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error("Error updating user profile:", error);
      throw error;
    }
  }

  /**
   * Verify email
   * @param {string} userId - User UUID
   * @returns {Promise<void>}
   */
  async verifyUserEmail(userId) {
    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({ email_verified: true })
        .eq("id", userId);

      if (error) throw error;
    } catch (error) {
      logger.error("Error verifying user email:", error);
      throw error;
    }
  }

  /**
   * Update user password
   * @param {string} userId - User UUID
   * @param {string} hashedPassword - Hashed password
   * @returns {Promise<void>}
   */
  async updateUserPassword(userId, hashedPassword) {
    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({ password_hash: hashedPassword })
        .eq("id", userId);

      if (error) throw error;
    } catch (error) {
      logger.error("Error updating user password:", error);
      throw error;
    }
  }

  /**
   * Get or create user from OAuth
   * @param {Object} oauthData - OAuth user data
   * @param {string} provider - Provider name
   * @returns {Promise<Object>} User data
   */
  async getOrCreateOAuthUser(oauthData, provider) {
    try {
      const { email, name, avatar, id: providerId } = oauthData;

      // Check if user exists by email
      let user = await this.getUserByEmail(email);

      if (user) {
        // Update provider info if needed
        if (!user.provider || user.provider !== provider) {
          user = await this.updateUserProfile(user.id, {
            provider,
            avatar: avatar || user.avatar,
            provider_id: providerId,
          });
        }
        return user;
      }

      // Create new user
      const userId = crypto.randomUUID();
      const userData = {
        id: userId,
        email,
        fullName: name || email.split("@")[0],
        provider,
        provider_id: providerId,
        emailVerified: true,
        avatar,
      };

      return await this.createUserProfile(userData);
    } catch (error) {
      logger.error("Error getting/creating OAuth user:", error);
      throw error;
    }
  }

  /**
   * Generate email verification token
   * @param {string} email - User email
   * @returns {Promise<string>} Verification token
   */
  async generateVerificationToken(email) {
    try {
      const token = randomBytes(32).toString("hex");

      // Store token in database
      const { error } = await supabase.from("email_verifications").insert([
        {
          email,
          token,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
      ]);

      if (error) throw error;
      return token;
    } catch (error) {
      logger.error("Error generating verification token:", error);
      throw error;
    }
  }

  /**
   * Verify email token
   * @param {string} token - Verification token
   * @returns {Promise<Object>} Verification result
   */
  async verifyEmailToken(token) {
    try {
      const { data, error } = await supabase
        .from("email_verifications")
        .select("*")
        .eq("token", token)
        .single();

      if (error || !data) {
        throw new Error("Invalid verification token");
      }

      // Check if expired
      if (new Date(data.expires_at) < new Date()) {
        throw new Error("Verification token expired");
      }

      // Check if already used
      if (data.used_at) {
        throw new Error("Verification token already used");
      }

      // Mark as used
      await supabase
        .from("email_verifications")
        .update({ used_at: new Date().toISOString() })
        .eq("id", data.id);

      return { email: data.email, userId: data.user_id };
    } catch (error) {
      logger.error("Error verifying email token:", error);
      throw error;
    }
  }

  /**
   * Generate password reset token
   * @param {string} email - User email
   * @returns {Promise<string>} Reset token
   */
  async generateResetToken(email) {
    try {
      const token = crypto.randomBytes(32).toString("hex");

      const { error } = await supabase.from("password_resets").insert([
        {
          email,
          token,
          expires_at: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour
        },
      ]);

      if (error) throw error;
      return token;
    } catch (error) {
      logger.error("Error generating reset token:", error);
      throw error;
    }
  }

  /**
   * Verify reset token
   * @param {string} token - Reset token
   * @returns {Promise<Object>} Reset result
   */
  async verifyResetToken(token) {
    try {
      const { data, error } = await supabase
        .from("password_resets")
        .select("*")
        .eq("token", token)
        .single();

      if (error || !data) {
        throw new Error("Invalid reset token");
      }

      // Check if expired
      if (new Date(data.expires_at) < new Date()) {
        throw new Error("Reset token expired");
      }

      // Check if already used
      if (data.used_at) {
        throw new Error("Reset token already used");
      }

      return { email: data.email };
    } catch (error) {
      logger.error("Error verifying reset token:", error);
      throw error;
    }
  }

  /**
   * Mark reset token as used
   * @param {string} token - Reset token
   * @returns {Promise<void>}
   */
  async markResetTokenUsed(token) {
    try {
      const { error } = await supabase
        .from("password_resets")
        .update({ used_at: new Date().toISOString() })
        .eq("token", token);

      if (error) throw error;
    } catch (error) {
      logger.error("Error marking reset token used:", error);
      throw error;
    }
  }

  /**
   * Check if email is allowed (basic validation)
   * @param {string} email - Email to check
   * @returns {boolean} True if allowed
   */
  isEmailAllowed(email) {
    // Block disposable email domains (simplified)
    const disposableDomains = [
      "tempmail.com",
      "throwaway.com",
      "guerrillamail.com",
      "mailinator.com",
      "10minutemail.com",
      "yopmail.com",
    ];

    const domain = email.split("@")[1];
    return !disposableDomains.includes(domain);
  }

  /**
   * Sanitize user data for response
   * @param {Object} user - User object
   * @returns {Object} Sanitized user
   */
  sanitizeUser(user) {
    const { password_hash, ...sanitized } = user;
    return {
      id: sanitized.id,
      email: sanitized.email,
      fullName: sanitized.full_name,
      username: sanitized.username,
      role: sanitized.role,
      provider: sanitized.provider,
      avatar: sanitized.avatar,
      emailVerified: sanitized.email_verified,
      createdAt: sanitized.created_at,
      updatedAt: sanitized.updated_at,
    };
  }
}

const authUtils = new AuthUtils();

module.exports = authUtils;
module.exports.authUtils = authUtils;
