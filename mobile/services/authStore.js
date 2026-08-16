// services/authStore.js
import storageService from "./storageService";

const AUTH_STORAGE_KEY = "@auth";
const USER_STORAGE_KEY = "@user";

/**
 * Authentication Store Service
 * Manages local storage of auth data
 */
const authStore = {
  /**
   * Save auth data to storage
   * @param {Object} authData - { user, tokens, sessionId }
   * @returns {Promise<void>}
   */
  saveAuthData: async (authData) => {
    try {
      await storageService.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
      if (authData.user) {
        await storageService.setItem(
          USER_STORAGE_KEY,
          JSON.stringify(authData.user)
        );
      }
    } catch (error) {
      console.error("Error saving auth data:", error);
    }
  },

  /**
   * Get auth data from storage
   * @returns {Promise<{ user, tokens, sessionId } | null>}
   */
  getAuthData: async () => {
    try {
      const data = await storageService.getItem(AUTH_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Error getting auth data:", error);
      return null;
    }
  },

  /**
   * Get user data from storage
   * @returns {Promise<User | null>}
   */
  getUser: async () => {
    try {
      const user = await storageService.getItem(USER_STORAGE_KEY);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error("Error getting user:", error);
      return null;
    }
  },

  /**
   * Clear all auth data from storage
   * @returns {Promise<void>}
   */
  clearAuthData: async () => {
    try {
      await storageService.removeItem(AUTH_STORAGE_KEY);
      await storageService.removeItem(USER_STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing auth data:", error);
    }
  },

  /**
   * Check if user is authenticated
   * @returns {Promise<boolean>}
   */
  isAuthenticated: async () => {
    try {
      const authData = await authStore.getAuthData();
      return !!authData && !!authData.user;
    } catch (error) {
      return false;
    }
  },

  /**
   * Update user data in storage
   * @param {User} user - Updated user data
   * @returns {Promise<void>}
   */
  updateUser: async (user) => {
    try {
      await storageService.setItem(USER_STORAGE_KEY, JSON.stringify(user));

      // Also update in auth data
      const authData = await authStore.getAuthData();
      if (authData) {
        authData.user = user;
        await authStore.saveAuthData(authData);
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  },
};

export default authStore;
