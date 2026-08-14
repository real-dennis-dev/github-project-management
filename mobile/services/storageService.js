import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";

/**
 * Storage Service with support for AsyncStorage and file system
 */
const storageService = {
  /**
   * Store data in AsyncStorage
   * @param {string} key - Storage key
   * @param {any} value - Value to store (will be JSON stringified)
   * @param {Object} options - Storage options
   * @param {number} options.ttl - Time to live in seconds
   * @returns {Promise<void>}
   */
  setItem: async (key, value, options = {}) => {
    try {
      const data = {
        value,
        timestamp: Date.now(),
        ttl: options.ttl || null,
      };
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error("Storage setItem error:", error);
      throw error;
    }
  },

  /**
   * Retrieve data from AsyncStorage
   * @param {string} key - Storage key
   * @param {Object} options - Options
   * @param {boolean} options.ignoreTTL - Ignore TTL expiration
   * @returns {Promise<any>}
   */
  getItem: async (key, options = {}) => {
    try {
      const item = await AsyncStorage.getItem(key);
      if (!item) return null;

      const data = JSON.parse(item);

      // Check TTL
      if (!options.ignoreTTL && data.ttl) {
        const elapsed = (Date.now() - data.timestamp) / 1000;
        if (elapsed > data.ttl) {
          await AsyncStorage.removeItem(key);
          return null;
        }
      }

      return data.value;
    } catch (error) {
      console.error("Storage getItem error:", error);
      return null;
    }
  },

  /**
   * Remove item from AsyncStorage
   * @param {string} key - Storage key
   * @returns {Promise<void>}
   */
  removeItem: async (key) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error("Storage removeItem error:", error);
      throw error;
    }
  },

  /**
   * Clear all AsyncStorage
   * @returns {Promise<void>}
   */
  clearAll: async () => {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error("Storage clearAll error:", error);
      throw error;
    }
  },

  /**
   * Get multiple items
   * @param {string[]} keys - Array of keys
   * @returns {Promise<Array<{ key: string, value: any }>>}
   */
  multiGet: async (keys) => {
    try {
      const items = await AsyncStorage.multiGet(keys);
      return items
        .filter(([_, value]) => value !== null)
        .map(([key, value]) => {
          try {
            const data = JSON.parse(value);
            return { key, value: data.value };
          } catch {
            return { key, value: null };
          }
        });
    } catch (error) {
      console.error("Storage multiGet error:", error);
      throw error;
    }
  },

  /**
   * Set multiple items
   * @param {Array<{ key: string, value: any }>} keyValuePairs
   * @param {Object} options - Storage options
   * @returns {Promise<void>}
   */
  multiSet: async (keyValuePairs, options = {}) => {
    try {
      const pairs = keyValuePairs.map(({ key, value }) => {
        const data = {
          value,
          timestamp: Date.now(),
          ttl: options.ttl || null,
        };
        return [key, JSON.stringify(data)];
      });
      await AsyncStorage.multiSet(pairs);
    } catch (error) {
      console.error("Storage multiSet error:", error);
      throw error;
    }
  },

  /**
   * Get all keys
   * @returns {Promise<string[]>}
   */
  getAllKeys: async () => {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error("Storage getAllKeys error:", error);
      return [];
    }
  },

  /**
   * Store file in file system
   * @param {string} filename - File name
   * @param {string|Blob} content - File content
   * @param {string} directory - Directory name
   * @returns {Promise<string>} - File URI
   */
  storeFile: async (filename, content, directory = "documents") => {
    try {
      const dirUri = `${FileSystem.documentDirectory}${directory}/`;
      const fileUri = `${dirUri}${filename}`;

      // Create directory if it doesn't exist
      const dirInfo = await FileSystem.getInfoAsync(dirUri);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(dirUri, { intermediates: true });
      }

      // Write file
      if (typeof content === "string") {
        await FileSystem.writeAsStringAsync(fileUri, content);
      } else {
        // For blob/binary data
        await FileSystem.writeAsStringAsync(fileUri, content, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }

      return fileUri;
    } catch (error) {
      console.error("Storage storeFile error:", error);
      throw error;
    }
  },

  /**
   * Get file from file system
   * @param {string} fileUri - File URI
   * @param {Object} options - File options
   * @param {string} options.encoding - Encoding type
   * @returns {Promise<string>}
   */
  getFile: async (fileUri, options = {}) => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        throw new Error("File not found");
      }

      if (options.encoding === FileSystem.EncodingType.Base64) {
        return await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }

      return await FileSystem.readAsStringAsync(fileUri);
    } catch (error) {
      console.error("Storage getFile error:", error);
      throw error;
    }
  },

  /**
   * Delete file
   * @param {string} fileUri - File URI
   * @returns {Promise<void>}
   */
  deleteFile: async (fileUri) => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(fileUri);
      }
    } catch (error) {
      console.error("Storage deleteFile error:", error);
      throw error;
    }
  },
};

export default storageService;
