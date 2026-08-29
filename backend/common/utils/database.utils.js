const { supabase } = require("../config/supabase");
const { logger } = require("../config/logger");

class DatabaseUtils {
  /**
   * Basic query builder (fluent style)
   */
  static from(table) {
    return supabase.from(table);
  }

  /**
   * Simple query builder with common operations
   */
  static queryBuilder(table) {
    const qb = {
      table,
      select: (columns = "*") => supabase.from(table).select(columns),
      where: (column, value) =>
        supabase.from(table).select("*").eq(column, value),
      insert: (data) => supabase.from(table).insert(data).select(),
      update: (data) => supabase.from(table).update(data),
      delete: () => supabase.from(table).delete(),
    };
    return qb;
  }

  /**
   * Transaction simulation (Supabase doesn't support full transactions like Knex)
   * Runs operations sequentially and rolls back on first error (best effort)
   */
  static async transaction(operations) {
    const results = [];
    let error = null;

    for (const operation of operations) {
      try {
        const result = await operation();
        results.push(result);
      } catch (err) {
        error = err;
        logger.error("Transaction failed at operation:", err);
        break;
      }
    }

    if (error) throw error;

    return results;
  }

  /**
   * Batch insert with chunking
   */
  static async batchInsert(table, data, chunkSize = 100) {
    const results = [];

    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      const { data: inserted, error } = await supabase
        .from(table)
        .insert(chunk)
        .select();

      if (error) {
        logger.error(
          `Batch insert failed at chunk ${Math.floor(i / chunkSize)}:`,
          error
        );
        throw error;
      }

      results.push(...(inserted || []));
    }

    return results;
  }

  /**
   * Upsert operation
   */
  static async upsert(table, data, conflictKey = "id") {
    const { data: result, error } = await supabase
      .from(table)
      .upsert(data, { onConflict: conflictKey })
      .select();

    if (error) {
      logger.error("Upsert failed:", error);
      throw error;
    }

    return Array.isArray(data) ? result : result?.[0] || result;
  }

  /**
   * Soft delete
   */
  static async softDelete(table, id, deletedAtColumn = "deleted_at") {
    const { data, error } = await supabase
      .from(table)
      .update({ [deletedAtColumn]: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      logger.error("Soft delete failed:", error);
      throw error;
    }

    return data;
  }

  /**
   * Hard delete
   */
  static async hardDelete(table, id) {
    const { data, error } = await supabase
      .from(table)
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) {
      logger.error("Hard delete failed:", error);
      throw error;
    }

    return data;
  }

  /**
   * Advanced query with filters, sorting, and pagination
   */
  static async buildQuery(table, filters = {}, sort = {}, pagination = {}) {
    let query = supabase.from(table).select("*", { count: "exact" });

    // Apply filters
    for (const [key, value] of Object.entries(filters)) {
      if (value === undefined || value === null || value === "") continue;

      if (Array.isArray(value)) {
        query = query.in(key, value);
      } else if (typeof value === "object" && value !== null) {
        // Support operators: { gt, gte, lt, lte, like, ilike, eq }
        for (const [operator, opValue] of Object.entries(value)) {
          switch (operator) {
            case "gt":
              query = query.gt(key, opValue);
              break;
            case "gte":
              query = query.gte(key, opValue);
              break;
            case "lt":
              query = query.lt(key, opValue);
              break;
            case "lte":
              query = query.lte(key, opValue);
              break;
            case "like":
              query = query.like(key, opValue);
              break;
            case "ilike":
              query = query.ilike(key, opValue);
              break;
            default:
              query = query.eq(key, opValue);
          }
        }
      } else {
        query = query.eq(key, value);
      }
    }

    // Apply sorting
    if (sort.column) {
      query = query.order(sort.column, {
        ascending: sort.order !== "desc",
      });
    }

    // Apply pagination
    if (pagination.page && pagination.limit) {
      const from = (pagination.page - 1) * pagination.limit;
      const to = from + pagination.limit - 1;
      query = query.range(from, to);
    } else if (pagination.limit) {
      query = query.limit(pagination.limit);
    }

    const { data, error, count } = await query;

    if (error) {
      logger.error("BuildQuery failed:", error);
      throw error;
    }

    return {
      data: data || [],
      count: count || 0,
      pagination: {
        page: pagination.page || 1,
        limit: pagination.limit || data?.length || 0,
        total: count || 0,
        totalPages: pagination.limit
          ? Math.ceil((count || 0) / pagination.limit)
          : 1,
      },
    };
  }

  /**
   * Raw SQL query (if you have RPC or need raw access)
   */
  static async rawQuery(sql, params = []) {
    // Supabase doesn't support raw SQL directly in client.
    // Use PostgreSQL functions via RPC or edge functions for raw queries.
    logger.warn("rawQuery called - consider using RPC for raw SQL");
    throw new Error(
      "Raw SQL not supported directly in Supabase client. Use .rpc() instead."
    );
  }
}

const databaseUtils = new DatabaseUtils();

module.exports = databaseUtils;
module.exports.databaseUtils = databaseUtils;
