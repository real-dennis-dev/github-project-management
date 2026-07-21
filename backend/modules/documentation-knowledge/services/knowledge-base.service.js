const db = require("../../../common/config/database");
const logger = require("../../../common/config/logger");
const documentationUtils = require("../utils/documentation.utils");

class KnowledgeBaseService {
  /**
   * Get knowledge entries with filters
   * @param {Object} filters - Filter options
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>} - Knowledge entries
   */
  async getKnowledgeEntries(filters = {}, pagination = {}) {
    try {
      const {
        limit = 10,
        offset = 0,
        sortBy = "created_at",
        sortOrder = "desc",
      } = pagination;
      const { category = null, tags = null } = filters;

      let query = db
        .from("knowledge_base")
        .select("*", { count: "exact" })
        .order(sortBy, { ascending: sortOrder === "asc" })
        .range(offset, offset + limit - 1);

      if (category) {
        query = query.eq("category", category);
      }

      if (tags) {
        const tagArray = Array.isArray(tags) ? tags : [tags];
        query = query.contains("tags", tagArray);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data,
        pagination: {
          total: count,
          limit,
          offset,
          pages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      logger.error("Error in getKnowledgeEntries:", error);
      throw error;
    }
  }

  /**
   * Create knowledge entry
   * @param {Object} data - Knowledge entry data
   * @returns {Promise<Object>} - Created entry
   */
  async createKnowledgeEntry(data) {
    try {
      // Validate data
      if (!data.category || !data.topic || !data.content) {
        throw new Error("Category, topic, and content are required");
      }

      // Extract tags from content if not provided
      const tags = data.tags || documentationUtils.extractTags(data.content);

      const entryData = {
        category: data.category,
        topic: data.topic,
        content: data.content,
        tags: tags,
        related_links: data.related_links || [],
        created_at: new Date(),
        updated_at: new Date(),
      };

      const { data: entry, error } = await db
        .from("knowledge_base")
        .insert(entryData)
        .select()
        .single();

      if (error) throw error;

      logger.info(`Knowledge entry created: ${entry.id} - ${entry.topic}`);
      return entry;
    } catch (error) {
      logger.error("Error in createKnowledgeEntry:", error);
      throw error;
    }
  }

  /**
   * Get knowledge entry by ID
   * @param {string} id - Entry ID
   * @returns {Promise<Object>} - Knowledge entry
   */
  async getKnowledgeById(id) {
    try {
      const { data, error } = await db
        .from("knowledge_base")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      if (!data) throw new Error("Knowledge entry not found");

      return data;
    } catch (error) {
      logger.error("Error in getKnowledgeById:", error);
      throw error;
    }
  }

  /**
   * Update knowledge entry
   * @param {string} id - Entry ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} - Updated entry
   */
  async updateKnowledgeEntry(id, data) {
    try {
      // Get existing entry
      const existing = await this.getKnowledgeById(id);
      if (!existing) throw new Error("Knowledge entry not found");

      // Extract tags if content changed
      let tags = data.tags;
      if (data.content && data.content !== existing.content) {
        tags = tags || documentationUtils.extractTags(data.content);
      }

      const updateData = {
        category: data.category || existing.category,
        topic: data.topic || existing.topic,
        content: data.content || existing.content,
        tags: tags || existing.tags,
        related_links: data.related_links || existing.related_links,
        updated_at: new Date(),
      };

      const { data: updated, error } = await db
        .from("knowledge_base")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      logger.info(`Knowledge entry updated: ${id}`);
      return updated;
    } catch (error) {
      logger.error("Error in updateKnowledgeEntry:", error);
      throw error;
    }
  }

  /**
   * Delete knowledge entry
   * @param {string} id - Entry ID
   * @returns {Promise<boolean>} - Deletion success
   */
  async deleteKnowledgeEntry(id) {
    try {
      const { error } = await db.from("knowledge_base").delete().eq("id", id);

      if (error) throw error;

      logger.info(`Knowledge entry deleted: ${id}`);
      return true;
    } catch (error) {
      logger.error("Error in deleteKnowledgeEntry:", error);
      throw error;
    }
  }

  /**
   * Search knowledge base
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Object>} - Search results
   */
  async searchKnowledge(query, options = {}) {
    try {
      const { limit = 10, offset = 0, category = null } = options;

      let searchQuery = db
        .from("knowledge_base")
        .select("*", { count: "exact" });

      if (category) {
        searchQuery = searchQuery.eq("category", category);
      }

      const { data, error, count } = await searchQuery
        .textSearch("topic", query, { config: "english" })
        .or(`content.ilike.%${query}%`)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // Add relevance scores
      const results = data.map((entry) => ({
        ...entry,
        relevance: this.calculateRelevance(entry, query),
      }));

      return {
        data: results,
        pagination: {
          total: count,
          limit,
          offset,
          pages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      logger.error("Error in searchKnowledge:", error);
      throw error;
    }
  }

  /**
   * Get all categories
   * @returns {Promise<Array>} - List of categories
   */
  async getCategories() {
    try {
      const { data, error } = await db
        .from("knowledge_base")
        .select("category", { count: "exact" });

      if (error) throw error;

      // Count entries per category
      const categoryCount = {};
      data.forEach((item) => {
        categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
      });

      return Object.entries(categoryCount).map(([category, count]) => ({
        category,
        count,
      }));
    } catch (error) {
      logger.error("Error in getCategories:", error);
      throw error;
    }
  }

  /**
   * Get related entries
   * @param {string} entryId - Entry ID
   * @param {number} limit - Number of related entries
   * @returns {Promise<Array>} - Related entries
   */
  async getRelatedEntries(entryId, limit = 5) {
    try {
      const entry = await this.getKnowledgeById(entryId);
      if (!entry) return [];

      // Find entries with similar tags or category
      let query = db.from("knowledge_base").select("*").neq("id", entryId);

      // If tags exist, try to find related by tags
      if (entry.tags && entry.tags.length > 0) {
        query = query.contains("tags", entry.tags.slice(0, 2));
      } else {
        // Otherwise, use category
        query = query.eq("category", entry.category);
      }

      const { data, error } = await query
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data;
    } catch (error) {
      logger.error("Error in getRelatedEntries:", error);
      throw error;
    }
  }

  /**
   * Calculate relevance score for search results
   * @param {Object} entry - Knowledge entry
   * @param {string} query - Search query
   * @returns {number} - Relevance score
   */
  calculateRelevance(entry, query) {
    const searchTerms = query.toLowerCase().split(/\s+/);
    let score = 0;

    // Topic matches are worth more
    const topicLower = entry.topic.toLowerCase();
    searchTerms.forEach((term) => {
      if (topicLower.includes(term)) score += 3;
    });

    // Content matches
    const contentLower = entry.content.toLowerCase();
    searchTerms.forEach((term) => {
      const count = (contentLower.match(new RegExp(term, "g")) || []).length;
      score += count;
    });

    // Tag matches
    if (entry.tags) {
      const tagsLower = entry.tags.map((t) => t.toLowerCase());
      searchTerms.forEach((term) => {
        if (tagsLower.includes(term)) score += 2;
      });
    }

    return score;
  }
}

module.exports = new KnowledgeBaseService();
