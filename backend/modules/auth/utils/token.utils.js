const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const logger = require("../../../common/config/logger");

class TokenUtils {
  constructor() {
    this.accessTokenSecret = process.env.JWT_ACCESS_SECRET || "access_secret";
    this.refreshTokenSecret =
      process.env.JWT_REFRESH_SECRET || "refresh_secret";
    this.accessTokenExpiry = process.env.JWT_ACCESS_EXPIRY || "15m";
    this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRY || "7d";
  }

  /**
   * Generate access token
   * @param {Object} payload - Token payload
   * @returns {string} Access token
   */
  generateAccessToken(payload) {
    return jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiry,
    });
  }

  /**
   * Generate refresh token
   * @param {Object} payload - Token payload
   * @returns {string} Refresh token
   */
  generateRefreshToken(payload) {
    return jwt.sign(payload, this.refreshTokenSecret, {
      expiresIn: this.refreshTokenExpiry,
    });
  }

  /**
   * Generate both tokens
   * @param {Object} user - User object
   * @returns {Object} { accessToken, refreshToken, expiresIn }
   */
  generateTokens(user) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role || "user",
    };

    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.getTokenExpirySeconds(this.accessTokenExpiry),
    };
  }

  /**
   * Verify access token
   * @param {string} token - Access token
   * @returns {Object} Decoded token payload
   */
  verifyAccessToken(token) {
    try {
      return jwt.verify(token, this.accessTokenSecret);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        throw new Error("Access token expired");
      }
      throw new Error("Invalid access token");
    }
  }

  /**
   * Verify refresh token
   * @param {string} token - Refresh token
   * @returns {Object} Decoded token payload
   */
  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, this.refreshTokenSecret);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        throw new Error("Refresh token expired");
      }
      throw new Error("Invalid refresh token");
    }
  }

  /**
   * Decode token without verification
   * @param {string} token - JWT token
   * @returns {Object} Decoded payload
   */
  decodeToken(token) {
    return jwt.decode(token);
  }

  /**
   * Generate random token for email verification
   * @param {number} length - Token length
   * @returns {string} Random token
   */
  generateRandomToken(length = 32) {
    return crypto.randomBytes(length).toString("hex");
  }

  /**
   * Generate 6-digit OTP
   * @returns {string} OTP
   */
  generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Hash token for storage
   * @param {string} token - Token to hash
   * @returns {string} Hashed token
   */
  hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  /**
   * Get token expiry in seconds
   * @param {string} expiry - Expiry string (e.g., '15m', '7d')
   * @returns {number} Expiry in seconds
   */
  getTokenExpirySeconds(expiry) {
    const units = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    };

    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) return 900; // Default 15 minutes

    const value = parseInt(match[1]);
    const unit = match[2];
    return value * (units[unit] || 1);
  }

  /**
   * Generate JWT from Supabase session
   * @param {Object} supabaseSession - Supabase session
   * @returns {Object} Tokens
   */
  generateFromSupabaseSession(supabaseSession) {
    if (!supabaseSession || !supabaseSession.user) {
      throw new Error("Invalid session");
    }

    const user = supabaseSession.user;
    return this.generateTokens({
      id: user.id,
      email: user.email,
      role: user.role || "user",
    });
  }

  /**
   * Validate token format
   * @param {string} token - Token to validate
   * @returns {boolean} True if valid format
   */
  validateTokenFormat(token) {
    if (!token || typeof token !== "string") return false;

    // JWT has 3 parts separated by dots
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    // Check if each part is base64url encoded
    const base64urlRegex = /^[A-Za-z0-9_-]+$/;
    return parts.every((part) => base64urlRegex.test(part));
  }

  /**
   * Generate device fingerprint
   * @param {Object} req - Express request object
   * @returns {string} Device fingerprint
   */
  generateDeviceFingerprint(req) {
    const userAgent = req.headers["user-agent"] || "";
    const ipAddress = req.ip || req.connection.remoteAddress || "";

    // Remove port from IP
    const cleanIp = ipAddress.split(":").pop();

    const fingerprint = `${userAgent}|${cleanIp}`;
    return crypto.createHash("md5").update(fingerprint).digest("hex");
  }

  /**
   * Get token expiry date
   * @param {number} secondsFromNow - Seconds from now
   * @returns {Date} Expiry date
   */
  getExpiryDate(secondsFromNow) {
    const date = new Date();
    date.setSeconds(date.getSeconds() + secondsFromNow);
    return date;
  }

  /**
   * Check if token is about to expire
   * @param {string} token - JWT token
   * @param {number} thresholdSeconds - Threshold in seconds
   * @returns {boolean} True if token will expire soon
   */
  isTokenExpiringSoon(token, thresholdSeconds = 60) {
    try {
      const decoded = jwt.decode(token);
      if (!decoded || !decoded.exp) return true;

      const now = Math.floor(Date.now() / 1000);
      return decoded.exp - now < thresholdSeconds;
    } catch (error) {
      return true;
    }
  }

  /**
   * Refresh access token
   * @param {string} refreshToken - Refresh token
   * @param {Object} user - User object
   * @returns {Object} New tokens
   */
  refreshTokens(refreshToken, user) {
    try {
      // Verify refresh token
      this.verifyRefreshToken(refreshToken);

      // Generate new tokens
      return this.generateTokens(user);
    } catch (error) {
      logger.error("Error refreshing tokens:", error);
      throw error;
    }
  }
}

const tokenUtils = new TokenUtils();

module.exports = tokenUtils;
module.exports.tokenUtils = tokenUtils;
