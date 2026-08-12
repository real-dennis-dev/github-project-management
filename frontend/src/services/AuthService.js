// src/components/auth/AuthService.js

import axiosInstance from "./axiosInstance";

/**
 * Authentication Service
 * Handles all authentication API calls
 */
class AuthService {
  /**
   * Login with email and password
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @param {boolean} credentials.rememberMe - Remember me flag
   * @returns {Promise<Object>} - Login response
   */
  async login(credentials) {
    const response = await axiosInstance.post("/auth/login", credentials);
    return response.data;
  }

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.email - User email
   * @param {string} userData.password - User password
   * @param {string} userData.confirmPassword - Confirm password
   * @param {string} userData.fullName - User full name
   * @param {string} userData.username - User username (optional)
   * @returns {Promise<Object>} - Registration response
   */
  async register(userData) {
    const response = await axiosInstance.post("/auth/register", userData);
    return response.data;
  }

  /**
   * Login with Google OAuth
   * @param {string} code - OAuth authorization code
   * @param {string} redirectUri - Redirect URI
   * @returns {Promise<Object>} - Login response
   */
  async loginWithGoogle(code, redirectUri) {
    const response = await axiosInstance.post("/auth/google", {
      provider: "google",
      code,
      redirectUri,
    });
    return response.data;
  }

  /**
   * Login with GitHub OAuth
   * @param {string} code - OAuth authorization code
   * @param {string} redirectUri - Redirect URI
   * @returns {Promise<Object>} - Login response
   */
  async loginWithGithub(code, redirectUri) {
    const response = await axiosInstance.post("/auth/github", {
      provider: "github",
      code,
      redirectUri,
    });
    return response.data;
  }

  /**
   * Logout from current session
   * @returns {Promise<Object>} - Logout response
   */
  async logout() {
    const response = await axiosInstance.post("/auth/logout");
    return response.data;
  }

  /**
   * Logout from all sessions
   * @returns {Promise<Object>} - Logout response
   */
  async logoutAll() {
    const response = await axiosInstance.post("/auth/logout/all");
    return response.data;
  }

  /**
   * Logout from a specific session
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object>} - Logout response
   */
  async logoutSession(sessionId) {
    const response = await axiosInstance.post(
      `/auth/logout/session/${sessionId}`
    );
    return response.data;
  }

  /**
   * Get all active sessions
   * @returns {Promise<Object>} - Sessions response
   */
  async getSessions() {
    const response = await axiosInstance.get("/auth/sessions");
    return response.data;
  }
  /**
   * Get current authenticated user (or null for guests)
   * @returns {Promise<Object>}
   */
  async getCurrentUser() {
    const response = await axiosInstance.get("/auth/me");
    return response.data;
  }
  /**
   * Validate current session
   * @returns {Promise<Object>} - Validation response
   */
  async validateSession() {
    const response = await axiosInstance.get("/auth/validate");
    return response.data;
  }

  /**
   * Refresh access token
   * @returns {Promise<Object>} - Refresh response
   */
  async refreshToken() {
    const response = await axiosInstance.post("/auth/refresh-token");
    return response.data;
  }

  /**
   * Verify email address
   * @param {string} token - Verification token
   * @returns {Promise<Object>} - Verification response
   */
  async verifyEmail(token) {
    const response = await axiosInstance.post("/auth/verify-email", { token });
    return response.data;
  }

  /**
   * Resend verification email
   * @returns {Promise<Object>} - Resend response
   */
  async resendVerification() {
    const response = await axiosInstance.post("/auth/resend-verification");
    return response.data;
  }

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise<Object>} - Reset request response
   */
  async forgotPassword(email) {
    const response = await axiosInstance.post("/auth/forgot-password", {
      email,
    });
    return response.data;
  }

  /**
   * Reset password with token
   * @param {string} token - Reset token
   * @param {string} newPassword - New password
   * @param {string} confirmPassword - Confirm password
   * @returns {Promise<Object>} - Reset response
   */
  async resetPassword(token, newPassword, confirmPassword) {
    const response = await axiosInstance.post("/auth/reset-password", {
      token,
      newPassword,
      confirmPassword,
    });
    return response.data;
  }

  /**
   * Change password (authenticated)
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @param {string} confirmPassword - Confirm password
   * @returns {Promise<Object>} - Change password response
   */
  async changePassword(currentPassword, newPassword, confirmPassword) {
    const response = await axiosInstance.post("/auth/change-password", {
      currentPassword,
      newPassword,
      confirmPassword,
    });
    return response.data;
  }
}

// Create and export a singleton instance
const authService = new AuthService();
export default authService;
