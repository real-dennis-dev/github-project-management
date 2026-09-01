const db = require("../../../common/config/database");
const logger = require("../../../common/config/logger");

class DocumentationKnowledgeStatsService {
  /**
   * Get aggregated stats + combined latest items for the dashboard
   * (all documentation across every project + all knowledge-base entries)
   * @param {Object} options - Pagination & sort options
   * @returns {Promise<Object>}
   */
  async getStats(options = {}) {
    try {
      const {
        limit = 20,
        offset = 0,
        sortBy = "updated_at",
        sortOrder = "desc",
      } = options;

      // ---------- 1. Aggregate Stats ----------
      const [
        { count: totalDocs, error: docsCountError },
        { count: totalKnowledge, error: knowledgeCountError },
        { data: docsByType, error: docsByTypeError },
        { data: knowledgeByCategory, error: knowledgeByCategoryError },
      ] = await Promise.all([
        db.from("documentation").select("*", { count: "exact", head: true }),
        db.from("knowledge_base").select("*", { count: "exact", head: true }),
        db
          .from("documentation")
          .select("doc_type")
          .then(async ({ data, error }) => {
            if (error) return { data: null, error };
            const counts = {};
            (data || []).forEach((row) => {
              counts[row.doc_type] = (counts[row.doc_type] || 0) + 1;
            });
            return {
              data: Object.entries(counts).map(([type, count]) => ({
                type,
                count,
              })),
              error: null,
            };
          }),
        db
          .from("knowledge_base")
          .select("category")
          .then(async ({ data, error }) => {
            if (error) return { data: null, error };
            const counts = {};
            (data || []).forEach((row) => {
              counts[row.category] = (counts[row.category] || 0) + 1;
            });
            return {
              data: Object.entries(counts).map(([category, count]) => ({
                category,
                count,
              })),
              error: null,
            };
          }),
      ]);

      if (docsCountError) throw docsCountError;
      if (knowledgeCountError) throw knowledgeCountError;
      if (docsByTypeError) throw docsByTypeError;
      if (knowledgeByCategoryError) throw knowledgeByCategoryError;

      // Recent activity counts (last 7 / 30 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [
        { count: docsLast7 },
        { count: knowledgeLast7 },
        { count: docsLast30 },
        { count: knowledgeLast30 },
      ] = await Promise.all([
        db
          .from("documentation")
          .select("*", { count: "exact", head: true })
          .gte("updated_at", sevenDaysAgo.toISOString()),
        db
          .from("knowledge_base")
          .select("*", { count: "exact", head: true })
          .gte("updated_at", sevenDaysAgo.toISOString()),
        db
          .from("documentation")
          .select("*", { count: "exact", head: true })
          .gte("updated_at", thirtyDaysAgo.toISOString()),
        db
          .from("knowledge_base")
          .select("*", { count: "exact", head: true })
          .gte("updated_at", thirtyDaysAgo.toISOString()),
      ]);

      const stats = {
        totals: {
          documentation: totalDocs || 0,
          knowledge: totalKnowledge || 0,
          combined: (totalDocs || 0) + (totalKnowledge || 0),
        },
        byType: {
          documentation: docsByType || [],
          knowledge: knowledgeByCategory || [],
        },
        recentActivity: {
          last7Days: {
            documentation: docsLast7 || 0,
            knowledge: knowledgeLast7 || 0,
            combined: (docsLast7 || 0) + (knowledgeLast7 || 0),
          },
          last30Days: {
            documentation: docsLast30 || 0,
            knowledge: knowledgeLast30 || 0,
            combined: (docsLast30 || 0) + (knowledgeLast30 || 0),
          },
        },
      };

      // ---------- 2. Combined latest list (sorted) ----------
      // Fetch more than needed so we can merge & sort properly
      const fetchLimit = Math.min(limit + offset + 50, 200); // safety buffer

      const [
        { data: docs, error: docsError },
        { data: knowledge, error: knowledgeError },
      ] = await Promise.all([
        db
          .from("documentation")
          .select(
            "id, project_id, title, doc_type, tags, version, created_at, updated_at"
          )
          .order(sortBy, { ascending: sortOrder === "asc" })
          .limit(fetchLimit),
        db
          .from("knowledge_base")
          .select(
            "id, category, topic, tags, related_links, created_at, updated_at"
          )
          .order(sortBy, { ascending: sortOrder === "asc" })
          .limit(fetchLimit),
      ]);

      if (docsError) throw docsError;
      if (knowledgeError) throw knowledgeError;

      // Normalize into a common shape for the dashboard feed
      const normalizedDocs = (docs || []).map((d) => ({
        id: d.id,
        type: "documentation", // so frontend knows which detail endpoint to call
        title: d.title,
        subtitle: d.doc_type,
        projectId: d.project_id,
        tags: d.tags || [],
        version: d.version,
        createdAt: d.created_at,
        updatedAt: d.updated_at,
        // helper fields for sorting
        _sortDate: d[sortBy] || d.updated_at,
      }));

      const normalizedKnowledge = (knowledge || []).map((k) => ({
        id: k.id,
        type: "knowledge",
        title: k.topic,
        subtitle: k.category,
        projectId: null,
        tags: k.tags || [],
        relatedLinks: k.related_links || [],
        createdAt: k.created_at,
        updatedAt: k.updated_at,
        _sortDate: k[sortBy] || k.updated_at,
      }));

      // Merge + sort
      const combined = [...normalizedDocs, ...normalizedKnowledge]
        .sort((a, b) => {
          const dateA = new Date(a._sortDate).getTime();
          const dateB = new Date(b._sortDate).getTime();
          return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
        })
        .slice(offset, offset + limit)
        .map(({ _sortDate, ...item }) => item); // remove internal sort field

      const totalCombined = (totalDocs || 0) + (totalKnowledge || 0);

      return {
        stats,
        items: combined,
        pagination: {
          total: totalCombined,
          limit,
          offset,
          pages: Math.ceil(totalCombined / limit),
        },
      };
    } catch (error) {
      logger.error("Error in getDocumentationKnowledgeStats:", error);
      throw error;
    }
  }
}

const documentationKnowledgeStatsService =
  new DocumentationKnowledgeStatsService();

module.exports = documentationKnowledgeStatsService;
module.exports.documentationKnowledgeStatsService =
  documentationKnowledgeStatsService;
