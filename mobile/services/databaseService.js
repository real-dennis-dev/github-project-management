import * as SQLite from "expo-sqlite";
import { Platform } from "react-native";

// Database instance
let db = null;

/**
 * Database Service with SQLite wrapper
 */
const databaseService = {
  /**
   * Initialize database
   * @param {string} dbName - Database name
   * @param {number} version - Database version
   * @returns {Promise<boolean>}
   */
  initDB: async (dbName = "app.db", version = 1) => {
    try {
      if (Platform.OS === "web") {
        // For web, use in-memory database
        db = SQLite.openDatabaseSync(dbName);
      } else {
        db = SQLite.openDatabaseSync(dbName);
      }

      // Enable foreign keys
      await db.execAsync("PRAGMA foreign_keys = ON;");

      console.log("Database initialized successfully");
      return true;
    } catch (error) {
      console.error("Database init error:", error);
      return false;
    }
  },

  /**
   * Execute query and return results
   * @param {string} sql - SQL query
   * @param {Array} params - Query parameters
   * @returns {Promise<Array>}
   */
  query: async (sql, params = []) => {
    try {
      if (!db) {
        await databaseService.initDB();
      }

      const result = await db.execAsync(sql, params);
      return result || [];
    } catch (error) {
      console.error("Database query error:", error);
      throw error;
    }
  },

  /**
   * Get first result from query
   * @param {string} sql - SQL query
   * @param {Array} params - Query parameters
   * @returns {Promise<Object|null>}
   */
  queryOne: async (sql, params = []) => {
    try {
      const results = await databaseService.query(sql, params);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error("Database queryOne error:", error);
      throw error;
    }
  },

  /**
   * Insert data into table
   * @param {string} table - Table name
   * @param {Object} data - Data to insert
   * @returns {Promise<number>} - Inserted ID
   */
  insert: async (table, data) => {
    try {
      const columns = Object.keys(data);
      const values = Object.values(data);
      const placeholders = columns.map(() => "?").join(", ");

      const sql = `INSERT INTO ${table} (${columns.join(
        ", "
      )}) VALUES (${placeholders})`;
      const result = await databaseService.query(sql, values);

      return result.lastInsertRowId || result.insertId || null;
    } catch (error) {
      console.error("Database insert error:", error);
      throw error;
    }
  },

  /**
   * Insert multiple records
   * @param {string} table - Table name
   * @param {Array<Object>} dataArray - Array of data objects
   * @returns {Promise<Array<number>>} - Array of inserted IDs
   */
  insertBatch: async (table, dataArray) => {
    try {
      const ids = [];
      await databaseService.transaction(async (tx) => {
        for (const data of dataArray) {
          const id = await tx.insert(table, data);
          ids.push(id);
        }
      });
      return ids;
    } catch (error) {
      console.error("Database insertBatch error:", error);
      throw error;
    }
  },

  /**
   * Update data in table
   * @param {string} table - Table name
   * @param {Object} data - Data to update
   * @param {Object} where - Where conditions
   * @returns {Promise<boolean>}
   */
  update: async (table, data, where) => {
    try {
      const setClause = Object.keys(data)
        .map((key) => `${key} = ?`)
        .join(", ");

      const whereClause = Object.keys(where)
        .map((key) => `${key} = ?`)
        .join(" AND ");

      const values = [...Object.values(data), ...Object.values(where)];
      const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;

      const result = await databaseService.query(sql, values);
      return result.rowsAffected > 0;
    } catch (error) {
      console.error("Database update error:", error);
      throw error;
    }
  },

  /**
   * Delete data from table
   * @param {string} table - Table name
   * @param {Object} where - Where conditions
   * @returns {Promise<boolean>}
   */
  delete: async (table, where) => {
    try {
      const whereClause = Object.keys(where)
        .map((key) => `${key} = ?`)
        .join(" AND ");

      const values = Object.values(where);
      const sql = `DELETE FROM ${table} WHERE ${whereClause}`;

      const result = await databaseService.query(sql, values);
      return result.rowsAffected > 0;
    } catch (error) {
      console.error("Database delete error:", error);
      throw error;
    }
  },

  /**
   * Execute transaction
   * @param {Function} operations - Function containing transaction operations
   * @returns {Promise<any>}
   */
  transaction: async (operations) => {
    try {
      if (!db) {
        await databaseService.initDB();
      }

      await db.execAsync("BEGIN TRANSACTION");

      try {
        // Create a transaction object with wrapped methods
        const tx = {
          query: async (sql, params = []) => {
            return await db.execAsync(sql, params);
          },
          queryOne: async (sql, params = []) => {
            const results = await db.execAsync(sql, params);
            return results.length > 0 ? results[0] : null;
          },
          insert: async (table, data) => {
            const columns = Object.keys(data);
            const values = Object.values(data);
            const placeholders = columns.map(() => "?").join(", ");

            const sql = `INSERT INTO ${table} (${columns.join(
              ", "
            )}) VALUES (${placeholders})`;
            const result = await db.execAsync(sql, values);
            return result.lastInsertRowId || result.insertId || null;
          },
          update: async (table, data, where) => {
            const setClause = Object.keys(data)
              .map((key) => `${key} = ?`)
              .join(", ");

            const whereClause = Object.keys(where)
              .map((key) => `${key} = ?`)
              .join(" AND ");

            const values = [...Object.values(data), ...Object.values(where)];
            const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;

            const result = await db.execAsync(sql, values);
            return result.rowsAffected > 0;
          },
          delete: async (table, where) => {
            const whereClause = Object.keys(where)
              .map((key) => `${key} = ?`)
              .join(" AND ");

            const values = Object.values(where);
            const sql = `DELETE FROM ${table} WHERE ${whereClause}`;

            const result = await db.execAsync(sql, values);
            return result.rowsAffected > 0;
          },
        };

        const result = await operations(tx);
        await db.execAsync("COMMIT");
        return result;
      } catch (error) {
        await db.execAsync("ROLLBACK");
        throw error;
      }
    } catch (error) {
      console.error("Database transaction error:", error);
      throw error;
    }
  },

  /**
   * Close database connection
   * @returns {Promise<void>}
   */
  close: async () => {
    try {
      if (db) {
        await db.closeAsync();
        db = null;
      }
    } catch (error) {
      console.error("Database close error:", error);
      throw error;
    }
  },

  /**
   * Check if database is initialized
   * @returns {boolean}
   */
  isInitialized: () => {
    return db !== null;
  },
};

export default databaseService;
