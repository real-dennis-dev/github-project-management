const db = require("../../../common/config/database");
const logger = require("../../../common/config/logger");

const documentationUtils = require("../utils/documentation.utils");

class DocumentationService {
  /**
   * Get project documentation with filters
   * @param {string} projectId - Project ID
   * @param {string} type - Document type filter
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>} - Documentation data
   */
  async getProjectDocumentation(projectId, type = null, pagination = {}) {
    try {
      const {
        limit = 10,
        offset = 0,
        sortBy = "created_at",
        sortOrder = "desc",
      } = pagination;

      let query = db
        .from("documentation")
        .select("*", { count: "exact" })
        .eq("project_id", projectId)
        .order(sortBy, { ascending: sortOrder === "asc" })
        .range(offset, offset + limit - 1);

      if (type && documentationUtils.validateDocumentType(type)) {
        query = query.eq("doc_type", type);
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
      logger.error("Error in getProjectDocumentation:", error);
      throw error;
    }
  }

  /**
   * Create documentation
   * @param {string} projectId - Project ID
   * @param {Object} data - Documentation data
   * @returns {Promise<Object>} - Created documentation
   */
  async createDocumentation(projectId, data) {
    try {
      // Validate data
      const validation = documentationUtils.validateDocumentationData(data);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      // Extract tags from content
      const tags = data.tags || documentationUtils.extractTags(data.content);

      const docData = {
        project_id: projectId,
        title: data.title,
        content: data.content || "",
        doc_type: data.doc_type || "technical",
        version: data.version || 1,
        tags: tags,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const { data: doc, error } = await db
        .from("documentation")
        .insert(docData)
        .select()
        .single();

      if (error) throw error;

      logger.info(`Documentation created: ${doc.id} for project ${projectId}`);
      return doc;
    } catch (error) {
      logger.error("Error in createDocumentation:", error);
      throw error;
    }
  }

  /**
   * Get documentation by ID
   * @param {string} id - Documentation ID
   * @returns {Promise<Object>} - Documentation data
   */
  async getDocumentationById(id) {
    try {
      const { data, error } = await db
        .from("documentation")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      if (!data) throw new Error("Documentation not found");

      return data;
    } catch (error) {
      logger.error("Error in getDocumentationById:", error);
      throw error;
    }
  }

  /**
   * Update documentation
   * @param {string} id - Documentation ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} - Updated documentation
   */
  async updateDocumentation(id, data) {
    try {
      // Get existing document
      const existing = await this.getDocumentationById(id);
      if (!existing) throw new Error("Documentation not found");

      // Validate data
      const validation = documentationUtils.validateDocumentationData(data);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      // Extract tags if content changed
      let tags = data.tags;
      if (data.content && data.content !== existing.content) {
        tags = tags || documentationUtils.extractTags(data.content);
      }

      const updateData = {
        title: data.title || existing.title,
        content: data.content || existing.content,
        doc_type: data.doc_type || existing.doc_type,
        tags: tags || existing.tags,
        version: (existing.version || 0) + 1,
        updated_at: new Date(),
      };

      const { data: updated, error } = await db
        .from("documentation")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      logger.info(
        `Documentation updated: ${id} to version ${updateData.version}`
      );
      return updated;
    } catch (error) {
      logger.error("Error in updateDocumentation:", error);
      throw error;
    }
  }

  /**
   * Delete documentation
   * @param {string} id - Documentation ID
   * @returns {Promise<boolean>} - Deletion success
   */
  async deleteDocumentation(id) {
    try {
      const { error } = await db.from("documentation").delete().eq("id", id);

      if (error) throw error;

      logger.info(`Documentation deleted: ${id}`);
      return true;
    } catch (error) {
      logger.error("Error in deleteDocumentation:", error);
      throw error;
    }
  }

  /**
   * Search documentation
   * @param {string} projectId - Project ID
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Object>} - Search results
   */
  async searchDocumentation(projectId, query, options = {}) {
    try {
      const { limit = 10, offset = 0, doc_type = null } = options;

      let searchQuery = db
        .from("documentation")
        .select("*", { count: "exact" })
        .eq("project_id", projectId);

      if (doc_type) {
        searchQuery = searchQuery.eq("doc_type", doc_type);
      }

      // Text search using PostgreSQL full-text search
      const { data, error, count } = await searchQuery
        .textSearch("title", query, { config: "english" })
        .or(`content.ilike.%${query}%`)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // Add relevance scores
      const results = data.map((doc) => ({
        ...doc,
        relevance: this.calculateRelevance(doc, query),
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
      logger.error("Error in searchDocumentation:", error);
      throw error;
    }
  }

  /**
   * Get documentation versions
   * @param {string} id - Documentation ID
   * @returns {Promise<Array>} - Version history
   */
  async getDocumentationVersions(id) {
    try {
      // Get current document
      const doc = await this.getDocumentationById(id);

      // In a real implementation, you'd have a versions table
      // For now, return current version info
      return [
        {
          version: doc.version,
          title: doc.title,
          content: doc.content,
          updated_at: doc.updated_at,
          tags: doc.tags,
        },
      ];
    } catch (error) {
      logger.error("Error in getDocumentationVersions:", error);
      throw error;
    }
  }

  /**
   * Calculate relevance score for search results
   * @param {Object} doc - Document
   * @param {string} query - Search query
   * @returns {number} - Relevance score
   */
  calculateRelevance(doc, query) {
    const searchTerms = query.toLowerCase().split(/\s+/);
    let score = 0;

    // Title matches are worth more
    const titleLower = doc.title.toLowerCase();
    searchTerms.forEach((term) => {
      if (titleLower.includes(term)) score += 3;
    });

    // Content matches
    const contentLower = doc.content.toLowerCase();
    searchTerms.forEach((term) => {
      const count = (contentLower.match(new RegExp(term, "g")) || []).length;
      score += count;
    });

    // Tag matches
    if (doc.tags) {
      const tagsLower = doc.tags.map((t) => t.toLowerCase());
      searchTerms.forEach((term) => {
        if (tagsLower.includes(term)) score += 2;
      });
    }

    return score;
  }
}

const documentationService = new DocumentationService();

module.exports = documentationService;
module.exports.documentationService = documentationService;
