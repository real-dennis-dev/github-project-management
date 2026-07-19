const db = require("../../config/database");

class DatabaseUtils {
  // Database connection (already handled by config)
  connectDB() {
    return db;
  }

  // Builds SQL queries
  queryBuilder(table) {
    return {
      table,
      select: (columns = "*") => {
        return db.from(table).select(columns);
      },
      where: (column, operator, value) => {
        return db.from(table).select("*").eq(column, value);
      },
      insert: (data) => {
        return db.from(table).insert(data);
      },
      update: (data) => {
        return db.from(table).update(data);
      },
      delete: () => {
        return db.from(table).delete();
      },
    };
  }

  // Handles database transactions
  async transaction(operations) {
    return db.transaction(operations);
  }

  // Executes raw SQL queries
  async rawQuery(sql, params = []) {
    return db.rawQuery(sql, params);
  }

  // Batch inserts data
  async batchInsert(table, data, chunkSize = 100) {
    return db.batchInsert(table, data, chunkSize);
  }

  // Builds query with filters and sorting
  buildQuery(table, filters = {}, sort = {}, pagination = {}) {
    let query = db.from(table);

    // Apply filters
    for (const [key, value] of Object.entries(filters)) {
      if (Array.isArray(value)) {
        query = query.in(key, value);
      } else {
        query = query.eq(key, value);
      }
    }

    // Apply sorting
    for (const [key, order] of Object.entries(sort)) {
      query = query.order(key, { ascending: order === "asc" });
    }

    // Apply pagination
    if (pagination.limit) {
      query = query.limit(pagination.limit);
    }
    if (pagination.offset) {
      query = query.range(
        pagination.offset,
        pagination.offset + (pagination.limit || 10) - 1
      );
    }

    return query;
  }

  // Soft delete (adds deleted_at)
  async softDelete(table, id) {
    const { data, error } = await db
      .from(table)
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
    return data;
  }

  // Hard delete
  async hardDelete(table, id) {
    const { data, error } = await db.from(table).delete().eq("id", id);
    if (error) throw error;
    return data;
  }

  // Upsert
  async upsert(table, data, conflictKey = "id") {
    const { data: result, error } = await db
      .from(table)
      .upsert(data, { onConflict: conflictKey })
      .select();
    if (error) throw error;
    return result;
  }
}

module.exports = new DatabaseUtils();
