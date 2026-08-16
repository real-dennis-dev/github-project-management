// services/authService.js
import apiService from "./apiService";

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
const authService = {
  /**
   * Login with email and password
   * @param {Object} credentials - { email, password, rememberMe }
   * @returns {Promise<{ user, tokens, sessionId }>}
   */
  login: async (credentials) => {
    const response = await apiService.post("/api/auth/login", credentials);
    return response.data;
  },

  /**
   * Register new user
   * @param {Object} userData - { email, password, confirmPassword, fullName, username }
   * @returns {Promise<{ user, requires2FA }>}
   */
  register: async (userData) => {
    const response = await apiService.post("/api/auth/register", userData);
    return response.data;
  },

  /**
   * Login with Google OAuth
   * @param {Object} oauthData - { code, redirectUri }
   * @returns {Promise<{ user, tokens, sessionId }>}
   */
  googleLogin: async (oauthData) => {
    const response = await apiService.post("/api/auth/google", oauthData);
    return response.data;
  },

  /**
   * Login with GitHub OAuth
   * @param {Object} oauthData - { code, redirectUri }
   * @returns {Promise<{ user, tokens, sessionId }>}
   */
  githubLogin: async (oauthData) => {
    const response = await apiService.post("/api/auth/github", oauthData);
    return response.data;
  },

  /**
   * Logout from current session
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  logout: async () => {
    const response = await apiService.post("/api/auth/logout");
    return response.data;
  },

  /**
   * Logout from all sessions
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  logoutAll: async () => {
    const response = await apiService.post("/api/auth/logout/all");
    return response.data;
  },

  /**
   * Logout from specific session
   * @param {string} sessionId - UUID of session to terminate
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  logoutSession: async (sessionId) => {
    const response = await apiService.post(
      `/api/auth/logout/session/${sessionId}`
    );
    return response.data;
  },

  /**
   * Get all active sessions
   * @returns {Promise<Array<Session>>}
   */
  getSessions: async () => {
    const response = await apiService.get("/api/auth/sessions");
    return response.data;
  },

  /**
   * Validate current session
   * @returns {Promise<{ valid: boolean, user?: User }>}
   */
  validateSession: async () => {
    try {
      const response = await apiService.get("/api/auth/validate");
      return { valid: true, user: response.data.user };
    } catch (error) {
      return { valid: false };
    }
  },

  /**
   * Refresh access token
   * @returns {Promise<{ tokens: { accessToken, refreshToken } }>}
   */
  refreshToken: async () => {
    const response = await apiService.post("/api/auth/refresh-token");
    return response.data;
  },

  /**
   * Verify email with token
   * @param {string} token - Verification token
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  verifyEmail: async (token) => {
    const response = await apiService.post("/api/auth/verify-email", { token });
    return response.data;
  },

  /**
   * Resend verification email
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  resendVerification: async () => {
    const response = await apiService.post("/api/auth/resend-verification");
    return response.data;
  },

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  forgotPassword: async (email) => {
    const response = await apiService.post("/api/auth/forgot-password", {
      email,
    });
    return response.data;
  },

  /**
   * Reset password with token
   * @param {Object} data - { token, newPassword, confirmPassword }
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  resetPassword: async (data) => {
    const response = await apiService.post("/api/auth/reset-password", data);
    return response.data;
  },

  /**
   * Change password (authenticated user)
   * @param {Object} data - { currentPassword, newPassword, confirmPassword }
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  changePassword: async (data) => {
    const response = await apiService.post("/api/auth/change-password", data);
    return response.data;
  },
};

export default authService;
