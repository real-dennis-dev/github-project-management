import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";

/**
 * Storage utility functions
 */
const storageUtils = {
  /**
   * Get storage size
   * @returns {Promise<{ used: number, total: number }>}
   */
  getStorageInfo: async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      let totalSize = 0;

      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        totalSize += value ? value.length * 2 : 0; // Approximate size in bytes
      }

      // Get file system info
      let fileSystemSize = 0;
      try {
        const dirInfo = await FileSystem.getInfoAsync(
          FileSystem.documentDirectory
        );
        if (dirInfo.exists && dirInfo.size) {
          fileSystemSize = dirInfo.size;
        }
      } catch (error) {
        console.warn("File system info not available:", error);
      }

      return {
        used: totalSize + fileSystemSize,
        total: Platform.OS === "ios" ? 64 * 1024 * 1024 * 1024 : undefined, // 64GB approx
        formattedUsed: formatBytes(totalSize + fileSystemSize),
      };
    } catch (error) {
      console.error("Error getting storage info:", error);
      return null;
    }
  },

  /**
   * Clear all application data
   * @param {Object} options - Options
   * @param {boolean} options.keepAuth - Keep authentication data
   * @param {boolean} options.keepSettings - Keep settings data
   * @returns {Promise<void>}
   */
  clearAllData: async (options = {}) => {
    try {
      const { keepAuth = false, keepSettings = false } = options;
      const keysToKeep = [];

      if (keepAuth) {
        keysToKeep.push("@auth_token", "@refresh_token", "@user");
      }
      if (keepSettings) {
        keysToKeep.push("@settings", "@theme_preference", "@notifications");
      }

      const allKeys = await AsyncStorage.getAllKeys();
      const keysToDelete = allKeys.filter((key) => !keysToKeep.includes(key));

      if (keysToDelete.length > 0) {
        await AsyncStorage.multiRemove(keysToDelete);
      }

      // Clear file system cache
      try {
        const cacheDir = `${FileSystem.cacheDirectory}`;
        const dirInfo = await FileSystem.getInfoAsync(cacheDir);
        if (dirInfo.exists) {
          await FileSystem.deleteAsync(cacheDir);
        }
      } catch (error) {
        console.warn("Cache directory not available:", error);
      }
    } catch (error) {
      console.error("Error clearing storage:", error);
      throw error;
    }
  },

  /**
   * Migrate data from old storage to new storage
   * @param {Object} oldStorage - Old storage keys mapping
   * @param {Object} newStorage - New storage keys mapping
   * @returns {Promise<void>}
   */
  migrateData: async (oldStorage = {}, newStorage = {}) => {
    try {
      for (const [oldKey, newKey] of Object.entries(oldStorage)) {
        const value = await AsyncStorage.getItem(oldKey);
        if (value !== null) {
          await AsyncStorage.setItem(newKey, value);
          await AsyncStorage.removeItem(oldKey);
        }
      }
    } catch (error) {
      console.error("Error migrating data:", error);
      throw error;
    }
  },

  /**
   * Check if storage key exists
   * @param {string} key - Storage key
   * @returns {Promise<boolean>}
   */
  keyExists: async (key) => {
    try {
      const value = await AsyncStorage.getItem(key);
      return value !== null;
    } catch (error) {
      console.error("Error checking key:", error);
      return false;
    }
  },

  /**
   * Get all keys with prefix
   * @param {string} prefix - Key prefix
   * @returns {Promise<Array<string>>}
   */
  getKeysWithPrefix: async (prefix) => {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      return allKeys.filter((key) => key.startsWith(prefix));
    } catch (error) {
      console.error("Error getting keys:", error);
      return [];
    }
  },

  /**
   * Remove all keys with prefix
   * @param {string} prefix - Key prefix
   * @returns {Promise<void>}
   */
  removeKeysWithPrefix: async (prefix) => {
    try {
      const keys = await storageUtils.getKeysWithPrefix(prefix);
      if (keys.length > 0) {
        await AsyncStorage.multiRemove(keys);
      }
    } catch (error) {
      console.error("Error removing keys:", error);
      throw error;
    }
  },

  /**
   * Set item with TTL
   * @param {string} key - Storage key
   * @param {any} value - Value to store
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<void>}
   */
  setItemWithTTL: async (key, value, ttl) => {
    try {
      const data = {
        value,
        expires: Date.now() + ttl * 1000,
      };
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error("Error setting item with TTL:", error);
      throw error;
    }
  },

  /**
   * Get item with TTL
   * @param {string} key - Storage key
   * @returns {Promise<any>}
   */
  getItemWithTTL: async (key) => {
    try {
      const item = await AsyncStorage.getItem(key);
      if (!item) return null;

      const data = JSON.parse(item);
      if (data.expires && Date.now() > data.expires) {
        await AsyncStorage.removeItem(key);
        return null;
      }

      return data.value;
    } catch (error) {
      console.error("Error getting item with TTL:", error);
      return null;
    }
  },
};

/**
 * Format bytes to human readable string
 * @param {number} bytes - Bytes to format
 * @param {number} decimals - Decimal places
 * @returns {string} Formatted string
 */
const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

export default storageUtils;
