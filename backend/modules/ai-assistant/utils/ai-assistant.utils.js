const { supabase } = require("../../../common/config/supabase");
const ValidationUtils = require("../../../common/utils/validation.utils");
const logger = require("../../../common/config/logger");

/**
 * AI Assistant Utilities
 * Handles AI-related helper functions
 */
class AIUtils {
  /**
   * Formats project context for AI
   * @param {Object} projectData - Project data
   * @returns {string} - Formatted context
   */
  formatContextForAI(projectData) {
    if (!projectData) {
      return "No project data available.";
    }

    const sections = [];

    // Project Overview
    sections.push(`PROJECT: ${projectData.name || "Unnamed Project"}`);
    sections.push(`Status: ${projectData.status || "unknown"}`);
    sections.push(`Priority: ${projectData.priority || "medium"}`);
    sections.push(`Completion: ${projectData.completion_percentage || 0}%`);
    if (projectData.description) {
      sections.push(`Description: ${projectData.description}`);
    }
    if (projectData.tech_stack && projectData.tech_stack.length > 0) {
      sections.push(`Tech Stack: ${projectData.tech_stack.join(", ")}`);
    }
    if (projectData.start_date) {
      sections.push(`Start Date: ${projectData.start_date}`);
    }
    if (projectData.target_completion_date) {
      sections.push(`Target Completion: ${projectData.target_completion_date}`);
    }
    sections.push("");

    // Features
    if (projectData.features && projectData.features.length > 0) {
      sections.push("FEATURES:");
      const featuresByStatus = {
        completed: projectData.features.filter((f) => f.status === "completed"),
        in_progress: projectData.features.filter(
          (f) => f.status === "in_progress"
        ),
        planned: projectData.features.filter((f) => f.status === "planned"),
        blocked: projectData.features.filter((f) => f.status === "blocked"),
      };

      if (featuresByStatus.completed.length > 0) {
        sections.push(`✓ Completed (${featuresByStatus.completed.length}):`);
        featuresByStatus.completed.forEach((f) => {
          sections.push(`  - ${f.title}`);
        });
      }

      if (featuresByStatus.in_progress.length > 0) {
        sections.push(
          `🔄 In Progress (${featuresByStatus.in_progress.length}):`
        );
        featuresByStatus.in_progress.forEach((f) => {
          sections.push(`  - ${f.title}`);
        });
      }

      if (featuresByStatus.planned.length > 0) {
        sections.push(`📋 Planned (${featuresByStatus.planned.length}):`);
        featuresByStatus.planned.forEach((f) => {
          sections.push(`  - ${f.title}`);
        });
      }

      if (featuresByStatus.blocked.length > 0) {
        sections.push(`🚫 Blocked (${featuresByStatus.blocked.length}):`);
        featuresByStatus.blocked.forEach((f) => {
          sections.push(`  - ${f.title}`);
        });
      }
      sections.push("");
    }

    // Bugs
    if (projectData.bugs && projectData.bugs.length > 0) {
      sections.push("BUGS:");
      const bugsByStatus = {
        open: projectData.bugs.filter((b) =>
          ["reported", "investigating", "in_progress"].includes(b.status)
        ),
        fixed: projectData.bugs.filter((b) =>
          ["fixed", "verified", "closed"].includes(b.status)
        ),
      };

      const criticalBugs = projectData.bugs.filter(
        (b) =>
          b.priority === "critical" &&
          ["reported", "investigating", "in_progress"].includes(b.status)
      );

      if (criticalBugs.length > 0) {
        sections.push(`⚠️ CRITICAL BUGS (${criticalBugs.length}):`);
        criticalBugs.forEach((b) => {
          sections.push(`  - ${b.title} [${b.priority}] - ${b.status}`);
        });
      }

      if (bugsByStatus.open.length > 0) {
        sections.push(`🔴 Open Bugs (${bugsByStatus.open.length}):`);
        bugsByStatus.open.forEach((b) => {
          sections.push(`  - ${b.title} [${b.priority}]`);
        });
      }

      if (bugsByStatus.fixed.length > 0) {
        sections.push(`✅ Fixed Bugs (${bugsByStatus.fixed.length}):`);
        bugsByStatus.fixed.forEach((b) => {
          sections.push(`  - ${b.title}`);
        });
      }
      sections.push("");
    }

    // Decisions
    if (projectData.decisions && projectData.decisions.length > 0) {
      sections.push("RECENT DECISIONS:");
      const recentDecisions = projectData.decisions.slice(0, 5);
      recentDecisions.forEach((d) => {
        sections.push(`  - ${d.title} [${d.impact}]`);
        sections.push(`    Decision: ${d.decision}`);
        sections.push(`    Reason: ${d.reason}`);
      });
      sections.push("");
    }

    // Risks
    if (projectData.risks && projectData.risks.length > 0) {
      sections.push("RISKS:");
      const criticalRisks = projectData.risks.filter(
        (r) => r.risk_level === "critical" && r.status !== "closed"
      );
      const highRisks = projectData.risks.filter(
        (r) => r.risk_level === "high" && r.status !== "closed"
      );

      if (criticalRisks.length > 0) {
        sections.push(`🚨 CRITICAL RISKS (${criticalRisks.length}):`);
        criticalRisks.forEach((r) => {
          sections.push(`  - ${r.title}`);
          if (r.mitigation) sections.push(`    Mitigation: ${r.mitigation}`);
        });
      }

      if (highRisks.length > 0) {
        sections.push(`🔴 High Risks (${highRisks.length}):`);
        highRisks.forEach((r) => {
          sections.push(`  - ${r.title} [${r.status}]`);
        });
      }
      sections.push("");
    }

    // Milestones
    if (projectData.milestones && projectData.milestones.length > 0) {
      sections.push("MILESTONES:");
      projectData.milestones.forEach((m) => {
        const progress = m.progress_percentage || 0;
        const status = m.status || "not_started";
        sections.push(`  - ${m.name}: ${progress}% [${status}]`);
        if (m.target_date) {
          sections.push(`    Target: ${m.target_date}`);
        }
      });
      sections.push("");
    }

    // Tech Debt
    if (projectData.tech_debt && projectData.tech_debt.length > 0) {
      sections.push("TECHNICAL DEBT:");
      const highDebt = projectData.tech_debt.filter(
        (td) => td.priority === "critical" || td.priority === "high"
      );
      if (highDebt.length > 0) {
        sections.push(`⚠️ High Priority Debt (${highDebt.length}):`);
        highDebt.forEach((td) => {
          sections.push(`  - ${td.title} [${td.priority}] - ${td.status}`);
        });
      }
      sections.push("");
    }

    // Statistics
    sections.push("PROJECT STATISTICS:");
    sections.push(`Total Features: ${projectData.features?.length || 0}`);
    sections.push(
      `Completed Features: ${
        projectData.features?.filter((f) => f.status === "completed").length ||
        0
      }`
    );
    sections.push(`Total Bugs: ${projectData.bugs?.length || 0}`);
    sections.push(
      `Open Bugs: ${
        projectData.bugs?.filter((b) => b.status !== "closed").length || 0
      }`
    );
    sections.push(`Total Decisions: ${projectData.decisions?.length || 0}`);
    sections.push(
      `Active Risks: ${
        projectData.risks?.filter((r) => r.status !== "closed").length || 0
      }`
    );
    sections.push(`Total Milestones: ${projectData.milestones?.length || 0}`);
    sections.push(`Tech Debt Items: ${projectData.tech_debt?.length || 0}`);

    return sections.join("\n");
  }

  /**
   * Parses and structures AI response
   * @param {string} response - Raw AI response
   * @param {string} type - Response type
   * @returns {Object} - Structured response
   */
  parseAIResponse(response, type = "general") {
    try {
      // Try to parse as JSON first
      try {
        const parsed = JSON.parse(response);
        return {
          success: true,
          type,
          data: parsed,
          raw: response,
          parsedAt: new Date().toISOString(),
        };
      } catch (e) {
        // Not JSON, structure as text
        const sections = this.extractSections(response);
        const summary = this.extractSummary(response);
        const actions = this.extractActions(response);

        return {
          success: true,
          type,
          data: {
            fullText: response,
            sections,
            summary,
            actions,
            wordCount: response.split(/\s+/).length,
          },
          raw: response,
          parsedAt: new Date().toISOString(),
        };
      }
    } catch (error) {
      logger.error("Error parsing AI response:", error);
      return {
        success: false,
        type,
        error: "Failed to parse AI response",
        raw: response,
        parsedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Extracts sections from text
   * @param {string} text - Text to parse
   * @returns {Array} - Extracted sections
   */
  extractSections(text) {
    const sections = [];
    const lines = text.split("\n");
    let currentSection = { title: "Content", content: [] };

    lines.forEach((line) => {
      // Check if line is a header
      if (line.match(/^#{1,3}\s/)) {
        if (currentSection.content.length > 0) {
          sections.push({
            title: currentSection.title,
            content: currentSection.content.join("\n").trim(),
          });
        }
        currentSection = {
          title: line.replace(/^#{1,3}\s/, "").trim(),
          content: [],
        };
      } else if (line.trim()) {
        currentSection.content.push(line);
      }
    });

    if (currentSection.content.length > 0) {
      sections.push({
        title: currentSection.title,
        content: currentSection.content.join("\n").trim(),
      });
    }

    return sections;
  }

  /**
   * Extracts summary from text
   * @param {string} text - Text to summarize
   * @returns {string} - Extracted summary
   */
  extractSummary(text) {
    const lines = text.split("\n");
    let summary = "";

    // Look for summary section
    const summaryIndex = lines.findIndex(
      (line) =>
        line.toLowerCase().includes("summary") ||
        line.toLowerCase().includes("overview") ||
        line.toLowerCase().includes("executive summary")
    );

    if (summaryIndex !== -1) {
      const summaryLines = [];
      for (let i = summaryIndex + 1; i < lines.length; i++) {
        if (lines[i].trim() === "" || lines[i].match(/^#{1,3}\s/)) break;
        summaryLines.push(lines[i]);
      }
      summary = summaryLines.join("\n").trim();
    }

    // If no summary section, take first few sentences
    if (!summary) {
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
      summary = sentences.slice(0, 3).join(" ");
    }

    return summary;
  }

  /**
   * Extracts actions from text
   * @param {string} text - Text to parse
   * @returns {Array} - Extracted actions
   */
  extractActions(text) {
    const actions = [];
    const lines = text.split("\n");

    lines.forEach((line) => {
      const trimmed = line.trim();

      // Look for action items
      const actionMatch =
        trimmed.match(/^[-*•]\s*(.+)/) ||
        trimmed.match(/^\d+\.\s*(.+)/) ||
        trimmed.match(/^Action:\s*(.+)/) ||
        trimmed.match(
          /^(Recommend|Suggest|Should|Must|Need to|Consider)\s+(.+)/i
        );

      if (actionMatch) {
        const actionText = actionMatch[1] || actionMatch[2] || trimmed;

        // Determine priority
        let priority = "medium";
        if (
          actionText.toLowerCase().includes("critical") ||
          actionText.toLowerCase().includes("urgent") ||
          actionText.toLowerCase().includes("immediate")
        ) {
          priority = "high";
        } else if (
          actionText.toLowerCase().includes("consider") ||
          actionText.toLowerCase().includes("optional")
        ) {
          priority = "low";
        }

        actions.push({
          text: actionText,
          priority,
          source: "ai_suggestion",
        });
      }
    });

    return actions;
  }

  /**
   * Validates user question
   * @param {string} question - Question to validate
   * @returns {Object} - Validation result
   */
  validateQuestion(question) {
    const errors = [];

    if (!question || typeof question !== "string") {
      errors.push("Question is required and must be a string");
    } else {
      if (question.length < 3) {
        errors.push("Question must be at least 3 characters long");
      }
      if (question.length > 5000) {
        errors.push("Question must not exceed 5000 characters");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Extracts project context from database
   * @param {string} projectId - Project UUID
   * @returns {Promise<Object>} - Project context
   */
  async extractProjectContext(projectId) {
    try {
      // Fetch project details
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (projectError) {
        throw projectError;
      }

      // Fetch features
      const { data: features } = await supabase
        .from("features")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      // Fetch bugs
      const { data: bugs } = await supabase
        .from("bugs")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      // Fetch decisions
      const { data: decisions } = await supabase
        .from("decisions")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })
        .limit(10);

      // Fetch risks
      const { data: risks } = await supabase
        .from("risks")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      // Fetch milestones
      const { data: milestones } = await supabase
        .from("milestones")
        .select("*")
        .eq("project_id", projectId)
        .order("target_date", { ascending: true });

      // Fetch tech debt
      const { data: techDebt } = await supabase
        .from("tech_debt")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      // Fetch releases
      const { data: releases } = await supabase
        .from("releases")
        .select("*")
        .eq("project_id", projectId)
        .order("release_date", { ascending: false });

      // Fetch recent activities (using all tables with timestamps)
      const recentActivities = [];

      // Add features
      (features || []).slice(0, 5).forEach((f) => {
        recentActivities.push({
          type: "feature",
          title: f.title,
          status: f.status,
          date: f.updated_at,
        });
      });

      // Add bugs
      (bugs || []).slice(0, 5).forEach((b) => {
        recentActivities.push({
          type: "bug",
          title: b.title,
          status: b.status,
          date: b.updated_at,
        });
      });

      // Add decisions
      (decisions || []).slice(0, 5).forEach((d) => {
        recentActivities.push({
          type: "decision",
          title: d.title,
          impact: d.impact,
          date: d.updated_at,
        });
      });

      // Sort activities by date
      recentActivities.sort((a, b) => new Date(b.date) - new Date(a.date));

      return {
        project,
        features: features || [],
        bugs: bugs || [],
        decisions: decisions || [],
        risks: risks || [],
        milestones: milestones || [],
        techDebt: techDebt || [],
        releases: releases || [],
        recentActivities: recentActivities.slice(0, 10),
      };
    } catch (error) {
      logger.error("Error extracting project context:", error);
      throw new Error("Failed to extract project context");
    }
  }

  /**
   * Sanitizes AI input
   * @param {string} input - Input to sanitize
   * @returns {string} - Sanitized input
   */
  sanitizeAIInput(input) {
    if (!input) return "";

    return input
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .replace(/[^\w\s,.!?'"()-]/g, "") // Remove special characters
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim();
  }

  /**
   * Generates cache key for AI request
   * @param {string} projectId - Project UUID
   * @param {string} question - User question
   * @param {Object} context - Context options
   * @returns {string} - Cache key
   */
  generateCacheKey(projectId, question, context) {
    const contextStr = JSON.stringify(context || {});
    const hash = require("crypto")
      .createHash("md5")
      .update(`${projectId}|${question}|${contextStr}`)
      .digest("hex");
    return `ai:response:${hash}`;
  }

  /**
   * Validates AI response quality
   * @param {string} response - AI response
   * @returns {Object} - Quality assessment
   */
  validateResponseQuality(response) {
    const assessment = {
      isValid: true,
      issues: [],
      metrics: {
        length: 0,
        hasContent: false,
        hasAction: false,
        hasSummary: false,
        isCoherent: true,
      },
    };

    if (!response || typeof response !== "string") {
      assessment.isValid = false;
      assessment.issues.push("Response is empty or invalid");
      return assessment;
    }

    const trimmed = response.trim();
    assessment.metrics.length = trimmed.length;

    if (trimmed.length < 10) {
      assessment.isValid = false;
      assessment.issues.push("Response is too short");
    }

    assessment.metrics.hasContent = trimmed.length > 50;
    assessment.metrics.hasAction =
      /action|recommend|suggest|should|must|need/i.test(trimmed);
    assessment.metrics.hasSummary = /summary|overview|conclusion/i.test(
      trimmed
    );

    // Check for coherence (basic)
    const words = trimmed.split(/\s+/);
    if (words.length < 3) {
      assessment.isValid = false;
      assessment.issues.push("Response lacks coherence");
    }

    return assessment;
  }

  /**
   * Formats response for different output types
   * @param {Object} response - Parsed response
   * @param {string} format - Output format
   * @returns {string|Object} - Formatted response
   */
  formatResponse(response, format = "json") {
    switch (format) {
      case "json":
        return response;

      case "text":
        return response.data?.fullText || response.raw || "";

      case "html":
        const text = response.data?.fullText || response.raw || "";
        return text
          .split("\n")
          .map((line) => {
            if (line.match(/^#{1,3}\s/)) {
              return `<h${line.match(/^(#{1,3})/)[1].length}>${line.replace(
                /^#{1,3}\s/,
                ""
              )}</h${line.match(/^(#{1,3})/)[1].length}>`;
            }
            if (line.match(/^[-*•]\s/)) {
              return `<li>${line.replace(/^[-*•]\s/, "")}</li>`;
            }
            if (line.trim() === "") {
              return "<br/>";
            }
            return `<p>${line}</p>`;
          })
          .join("\n");

      case "markdown":
        return response.data?.fullText || response.raw || "";

      default:
        return response;
    }
  }

  /**
   * Tracks AI usage
   * @param {string} projectId - Project UUID
   * @param {string} userId - User ID
   * @param {string} action - Action type
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<void>}
   */
  async trackUsage(projectId, userId, action, metadata = {}) {
    try {
      const usageData = {
        project_id: projectId,
        user_id: userId,
        action,
        metadata,
        created_at: new Date().toISOString(),
      };

      // Store in a usage table (you may need to create this)
      // Using ai_conversations as a proxy
      const { error } = await supabase.from("ai_conversations").insert([
        {
          project_id: projectId,
          user_id: userId,
          question: `[${action}] ${metadata.question || "No question"}`,
          answer: "[usage tracking]",
          context_data: metadata,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        logger.warn("Failed to track AI usage:", error);
      }
    } catch (error) {
      logger.error("Error tracking AI usage:", error);
    }
  }

  /**
   * Gets conversation history
   * @param {string} projectId - Project UUID
   * @param {number} limit - Limit results
   * @param {Object} filters - Additional filters
   * @returns {Promise<Array>} - Conversation history
   */
  async getConversationHistory(projectId, limit = 20, filters = {}) {
    try {
      let query = supabase
        .from("ai_conversations")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (filters.questionContains) {
        query = query.ilike("question", `%${filters.questionContains}%`);
      }

      if (filters.fromDate) {
        query = query.gte("created_at", filters.fromDate);
      }

      if (filters.toDate) {
        query = query.lte("created_at", filters.toDate);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error("Error getting conversation history:", error);
      return [];
    }
  }
}

module.exports = new AIUtils();
