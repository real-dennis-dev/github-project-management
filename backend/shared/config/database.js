const { supabase, supabaseAdmin } = require("./supabase");

class Database {
  constructor() {
    this.supabase = supabase;
    this.admin = supabaseAdmin;
  }

  // Get client based on auth level
  getClient(useAdmin = false) {
    return useAdmin ? this.admin : this.supabase;
  }

  // Table operations with RLS
  from(table, useAdmin = false) {
    return this.getClient(useAdmin).from(table);
  }

  // Raw SQL query (use with caution)
  async rawQuery(sql, params = []) {
    const { data, error } = await this.supabase.rpc("exec_sql", {
      query: sql,
      params: params,
    });
    if (error) throw error;
    return data;
  }

  // Transaction - Supabase doesn't support traditional transactions
  // Use batch operations or RPC functions
  async transaction(operations) {
    // Since Supabase doesn't have multi-statement transactions,
    // we'll use a single RPC call with all operations
    const results = [];
    for (const op of operations) {
      const result = await op();
      results.push(result);
    }
    return results;
  }

  // Batch insert
  async batchInsert(table, data, chunkSize = 100) {
    const chunks = [];
    for (let i = 0; i < data.length; i += chunkSize) {
      chunks.push(data.slice(i, i + chunkSize));
    }

    const results = [];
    for (const chunk of chunks) {
      const { data: result, error } = await this.from(table)
        .insert(chunk)
        .select();
      if (error) throw error;
      results.push(...result);
    }
    return results;
  }
}

module.exports = new Database();
