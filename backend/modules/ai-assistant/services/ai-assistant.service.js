const { supabase } = require("../../../common/config/supabase");
const AIUtils = require("../utils/ai-assistant.utils");
const { config, systemPrompts } = require("../config/ai.config");
const logger = require("../../../common/config/logger");
const CacheUtils = require("../../../common/utils/cache.utils");
const ResponseUtils = require("../../../common/utils/response.utils");

/**
 * AI Assistant Service
 * Handles AI-related business logic
 */
class AIAssistantService {
  constructor() {
    this.provider = config.provider;
    this.cacheEnabled = config.response.cacheEnabled;
    this.cacheTTL = config.response.cacheTTL;
    this.maxRetries = config.response.maxRetries;
    this.timeout = config.response.timeout;

    // Initialize AI provider
    if (this.provider === "openai") {
      this.initializeOpenAI();
    } else if (this.provider === "anthropic") {
      this.initializeAnthropic();
    } else {
      this.initializeFallbackAI();
    }
  }

  /**
   * Initializes OpenAI client
   */
  initializeOpenAI() {
    try {
      const OpenAI = require("openai");
      this.client = new OpenAI({
        apiKey: config.openai.apiKey,
        organization: config.openai.organization,
        timeout: this.timeout,
      });
      this.model = config.openai.model;
      this.temperature = config.openai.temperature;
      this.maxTokens = config.openai.maxTokens;
      logger.info("OpenAI client initialized successfully");
    } catch (error) {
      logger.error("Failed to initialize OpenAI client:", error);
      this.initializeFallbackAI();
    }
  }

  /**
   * Initializes Anthropic client
   */
  initializeAnthropic() {
    try {
      const Anthropic = require("@anthropic-ai/sdk");
      this.client = new Anthropic({
        apiKey: config.anthropic.apiKey,
        timeout: this.timeout,
      });
      this.model = config.anthropic.model;
      this.temperature = config.anthropic.temperature;
      this.maxTokens = config.anthropic.maxTokens;
      logger.info("Anthropic client initialized successfully");
    } catch (error) {
      logger.error("Failed to initialize Anthropic client:", error);
      this.initializeFallbackAI();
    }
  }

  /**
   * Initializes fallback AI (mock)
   */
  initializeFallbackAI() {
    logger.warn("Using fallback AI provider (mock)");
    this.client = null;
    this.isFallback = true;
  }

  /**
   * Sends prompt to AI provider
   * @param {string} prompt - Prompt to send
   * @param {Object} options - Additional options
   * @returns {Promise<string>} - AI response
   */
  async sendPrompt(prompt, options = {}) {
    // Check cache first
    if (this.cacheEnabled) {
      const cacheKey = `ai:prompt:${Buffer.from(prompt).toString("base64")}`;
      const cached = await CacheUtils.getCache(cacheKey);
      if (cached) {
        logger.info("Returning cached AI response");
        return cached;
      }
    }

    // If using fallback, return mock response
    if (this.isFallback) {
      return this.getMockResponse(prompt);
    }

    // Send to AI provider with retry
    let lastError = null;
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.callAIProvider(prompt, options);

        // Cache successful response
        if (this.cacheEnabled) {
          const cacheKey = `ai:prompt:${Buffer.from(prompt).toString(
            "base64"
          )}`;
          await CacheUtils.setCache(cacheKey, response, this.cacheTTL);
        }

        return response;
      } catch (error) {
        lastError = error;
        logger.warn(`AI attempt ${attempt} failed:`, error.message);
        if (attempt < this.maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    // If all retries failed
    logger.error("All AI attempts failed:", lastError);
    return this.getFallbackResponse(prompt);
  }

  /**
   * Calls specific AI provider
   * @param {string} prompt - Prompt to send
   * @param {Object} options - Additional options
   * @returns {Promise<string>} - AI response
   */
  async callAIProvider(prompt, options = {}) {
    if (this.provider === "openai") {
      return this.callOpenAI(prompt, options);
    } else if (this.provider === "anthropic") {
      return this.callAnthropic(prompt, options);
    } else {
      throw new Error("No valid AI provider configured");
    }
  }

  /**
   * Calls OpenAI API
   * @param {string} prompt - Prompt to send
   * @param {Object} options - Additional options
   * @returns {Promise<string>} - AI response
   */
  async callOpenAI(prompt, options = {}) {
    try {
      const response = await this.client.chat.completions.create({
        model: options.model || this.model,
        temperature: options.temperature || this.temperature,
        max_tokens: options.maxTokens || this.maxTokens,
        messages: [
          {
            role: "system",
            content: options.systemPrompt || systemPrompts.generalAssistant,
          },
          { role: "user", content: prompt },
        ],
      });

      return response.choices[0].message.content;
    } catch (error) {
      logger.error("OpenAI API error:", error);
      throw new Error(`OpenAI error: ${error.message}`);
    }
  }

  /**
   * Calls Anthropic API
   * @param {string} prompt - Prompt to send
   * @param {Object} options - Additional options
   * @returns {Promise<string>} - AI response
   */
  async callAnthropic(prompt, options = {}) {
    try {
      const response = await this.client.messages.create({
        model: options.model || this.model,
        temperature: options.temperature || this.temperature,
        max_tokens: options.maxTokens || this.maxTokens,
        system: options.systemPrompt || systemPrompts.generalAssistant,
        messages: [{ role: "user", content: prompt }],
      });

      return response.content[0].text;
    } catch (error) {
      logger.error("Anthropic API error:", error);
      throw new Error(`Anthropic error: ${error.message}`);
    }
  }

  /**
   * Gets mock response for testing
   * @param {string} prompt - Prompt
   * @returns {string} - Mock response
   */
  getMockResponse(prompt) {
    const responses = {
      "project analysis": `
PROJECT ANALYSIS REPORT

Project Status: On Track (78% complete)
Key Metrics:
- Features: 12/15 completed (80%)
- Bugs: 8 open / 24 resolved
- Sprint Health: Good
- Risk Level: Medium

Recommendations:
1. Focus on resolving critical bugs this week
2. Complete remaining features for sprint
3. Schedule architecture review
4. Plan for next release
      `,
      "trend analysis": `
TREND ANALYSIS

Positive Trends:
✅ Feature completion rate: +15% last sprint
✅ Bug resolution: -20% open bugs
✅ Team velocity: Stable at 85%

Negative Trends:
⚠️ Tech debt accumulation: +3 items
⚠️ Risk realization: 2 risks materialized
⚠️ Decision delays: 5 pending decisions

Predictions:
- Next sprint velocity: 80-85 points
- Project completion: 4-6 weeks
- Risk level: Stable
      `,
      "next actions": `
NEXT ACTIONS

Immediate (Next 24 Hours):
1. Fix critical database connection issue
2. Review security vulnerability
3. Resolve blocking bug #234

Short-term (This Week):
1. Complete user authentication module
2. Write API documentation
3. Perform code review

Medium-term (This Sprint):
1. Implement notification system
2. Performance optimization
3. Integrate with external API

Long-term (Next Quarter):
1. Architecture improvement
2. Team training
3. Infrastructure scaling
      `,
    };

    // Find matching response
    const lowerPrompt = prompt.toLowerCase();
    for (const [key, value] of Object.entries(responses)) {
      if (lowerPrompt.includes(key)) {
        return value;
      }
    }

    // Default response
    return `Based on your query "${prompt}", here is the AI response.

This is a mock response for testing purposes. Please configure your AI provider for real responses.

Current configuration:
- Provider: ${this.provider}
- Model: ${this.model || "Not set"}
- Temperature: ${this.temperature}

To get real AI responses, set up your API keys in the environment variables.`;
  }

  /**
   * Gets fallback response
   * @param {string} prompt - Prompt
   * @returns {string} - Fallback response
   */
  getFallbackResponse(prompt) {
    return `Unable to get AI response. Please check your configuration.

Error: AI provider not available or failed.
Provider: ${this.provider}
Model: ${this.model || "Not configured"}

Please ensure:
1. API keys are properly set
2. Network connectivity is available
3. Service is operational

Your question: ${prompt.substring(0, 100)}...
`;
  }

  /**
   * Asks AI with project context
   * @param {string} projectId - Project UUID
   * @param {string} question - User question
   * @param {Object} contextOptions - Context options
   * @returns {Promise<Object>} - AI response
   */
  async askQuestion(projectId, question, contextOptions = {}) {
    try {
      // Validate question
      const validation = AIUtils.validateQuestion(question);
      if (!validation.isValid) {
        throw new Error(`Invalid question: ${validation.errors.join(", ")}`);
      }

      // Sanitize question
      const sanitizedQuestion = AIUtils.sanitizeAIInput(question);

      // Check cache
      const cacheKey = AIUtils.generateCacheKey(
        projectId,
        sanitizedQuestion,
        contextOptions
      );
      if (this.cacheEnabled) {
        const cached = await CacheUtils.getCache(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      }

      // Extract project context
      const projectContext = await AIUtils.extractProjectContext(projectId);
      const contextText = AIUtils.formatContextForAI(projectContext);

      // Build prompt
      const prompt = `
Project Context:
${contextText}

User Question:
${sanitizedQuestion}

Please provide a clear, actionable response based on the project context.
If you need more information, ask clarifying questions.
`;

      // Send to AI
      const response = await this.sendPrompt(prompt, {
        systemPrompt: systemPrompts.generalAssistant,
      });

      // Parse response
      const parsedResponse = AIUtils.parseAIResponse(response, "question");

      // Validate response quality
      const quality = AIUtils.validateResponseQuality(
        parsedResponse.data?.fullText || response
      );

      // Prepare result
      const result = {
        question: sanitizedQuestion,
        response: parsedResponse,
        quality,
        timestamp: new Date().toISOString(),
        context: {
          projectName: projectContext.project.name,
          projectStatus: projectContext.project.status,
          featuresCount: projectContext.features.length,
          bugsCount: projectContext.bugs.length,
        },
      };

      // Cache result
      if (this.cacheEnabled && quality.isValid) {
        await CacheUtils.setCache(
          cacheKey,
          JSON.stringify(result),
          this.cacheTTL
        );
      }

      // Track usage
      await AIUtils.trackUsage(projectId, "unknown", "ask_question", {
        question: sanitizedQuestion,
        responseLength: response.length,
        quality: quality.isValid,
      });

      return result;
    } catch (error) {
      logger.error("Error in askQuestion:", error);
      throw error;
    }
  }

  /**
   * Analyzes project and provides insights
   * @param {string} projectId - Project UUID
   * @param {Object} options - Analysis options
   * @returns {Promise<Object>} - Project analysis
   */
  async analyzeProject(projectId, options = {}) {
    try {
      const { focus = "overall", depth = "standard" } = options;

      // Extract project context
      const projectContext = await AIUtils.extractProjectContext(projectId);
      const contextText = AIUtils.formatContextForAI(projectContext);

      // Select system prompt based on focus
      let systemPrompt = systemPrompts.projectAnalysis;
      if (focus === "risks") {
        systemPrompt = systemPrompts.trendAnalysis;
      } else if (focus === "performance") {
        systemPrompt = systemPrompts.reportGeneration;
      }

      // Build prompt
      const prompt = `
Focus Area: ${focus}
Analysis Depth: ${depth}

Project Data:
${contextText}

Provide a comprehensive analysis with:
1. Key findings
2. Critical issues
3. Opportunities
4. Recommendations
5. Risk assessment
6. Performance metrics
7. Action items

Be specific and actionable.
`;

      // Send to AI
      const response = await this.sendPrompt(prompt, {
        systemPrompt,
        maxTokens: this.maxTokens * 2, // Allow more tokens for analysis
      });

      // Parse response
      const parsedResponse = AIUtils.parseAIResponse(response, "analysis");

      // Generate summary
      const summary = AIUtils.extractSummary(response);
      const actions = AIUtils.extractActions(response);

      // Prepare result
      const result = {
        projectId,
        focus,
        depth,
        analysis: parsedResponse,
        summary,
        actions,
        metrics: {
          features: projectContext.features.length,
          bugs: projectContext.bugs.length,
          decisions: projectContext.decisions.length,
          risks: projectContext.risks.length,
          milestones: projectContext.milestones.length,
        },
        timestamp: new Date().toISOString(),
      };

      // Track usage
      await AIUtils.trackUsage(projectId, "unknown", "analyze_project", {
        focus,
        depth,
        responseLength: response.length,
      });

      return result;
    } catch (error) {
      logger.error("Error in analyzeProject:", error);
      throw error;
    }
  }

  /**
   * Gets conversation history
   * @param {string} projectId - Project UUID
   * @param {number} limit - Limit results
   * @param {Object} filters - Additional filters
   * @returns {Promise<Array>} - Conversation history
   */
  async getConversations(projectId, limit = 20, filters = {}) {
    try {
      return await AIUtils.getConversationHistory(projectId, limit, filters);
    } catch (error) {
      logger.error("Error in getConversations:", error);
      throw error;
    }
  }

  /**
   * Gets a single conversation by ID
   * @param {string} id - Conversation ID
   * @returns {Promise<Object>} - Conversation
   */
  async getConversation(id) {
    try {
      const { data, error } = await supabase
        .from("ai_conversations")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      logger.error("Error in getConversation:", error);
      throw error;
    }
  }

  /**
   * Summarizes text using AI
   * @param {string} text - Text to summarize
   * @param {number} maxLength - Maximum length
   * @param {string} format - Output format
   * @returns {Promise<Object>} - Summary
   */
  async summarizeText(text, maxLength = 500, format = "paragraph") {
    try {
      // Validate text
      if (!text || text.length < 10) {
        throw new Error("Text must be at least 10 characters long");
      }

      // Sanitize text
      const sanitizedText = AIUtils.sanitizeAIInput(text);

      // Build prompt
      const prompt = `
Text to summarize:
${sanitizedText}

Requirements:
- Maximum length: ${maxLength} characters
- Format: ${format}
- Maintain key points
- Preserve important details
- Use clear, concise language
`;

      // Send to AI
      const response = await this.sendPrompt(prompt, {
        systemPrompt: systemPrompts.summarization,
        maxTokens: Math.min(this.maxTokens, Math.ceil(maxLength / 2)),
      });

      // Parse response
      const parsedResponse = AIUtils.parseAIResponse(response, "summary");

      const result = {
        originalLength: text.length,
        summaryLength: response.length,
        summary: parsedResponse,
        format,
        timestamp: new Date().toISOString(),
      };

      // Track usage
      await AIUtils.trackUsage(null, "unknown", "summarize_text", {
        originalLength: text.length,
        summaryLength: response.length,
        format,
      });

      return result;
    } catch (error) {
      logger.error("Error in summarizeText:", error);
      throw error;
    }
  }

  /**
   * Generates AI-powered report
   * @param {string} projectId - Project UUID
   * @param {string} type - Report type
   * @param {Object} options - Report options
   * @returns {Promise<Object>} - Generated report
   */
  async generateReport(projectId, type = "comprehensive", options = {}) {
    try {
      // Extract project context
      const projectContext = await AIUtils.extractProjectContext(projectId);
      const contextText = AIUtils.formatContextForAI(projectContext);

      // Select system prompt based on type
      let systemPrompt = systemPrompts.reportGeneration;
      let prompt = "";

      switch (type) {
        case "executive":
          systemPrompt = `
You are an executive reporting expert. Create a concise executive report.
Focus on:
1. Strategic overview
2. Key achievements
3. Critical issues
4. Resource utilization
5. Strategic recommendations
6. Executive summary
          `;
          prompt = `Generate an executive report for this project:\n\n${contextText}`;
          break;

        case "technical":
          systemPrompt = `
You are a technical analyst. Create a detailed technical report.
Focus on:
1. Architecture overview
2. Technical debt assessment
3. Code quality metrics
4. Performance indicators
5. Security assessment
6. Technical recommendations
          `;
          prompt = `Generate a technical report for this project:\n\n${contextText}`;
          break;

        case "risk":
          systemPrompt = `
You are a risk management expert. Create a risk assessment report.
Focus on:
1. Risk identification
2. Risk analysis
3. Risk prioritization
4. Mitigation strategies
5. Risk monitoring plan
6. Contingency planning
          `;
          prompt = `Generate a risk assessment report for this project:\n\n${contextText}`;
          break;

        case "progress":
          systemPrompt = `
You are a project progress analyst. Create a progress report.
Focus on:
1. Overall progress
2. Milestone achievements
3. Blockers and issues
4. Team performance
5. Timeline assessment
6. Recommendations
          `;
          prompt = `Generate a progress report for this project:\n\n${contextText}`;
          break;

        default:
          prompt = `Generate a comprehensive project report:\n\n${contextText}`;
      }

      // Include options
      if (options.period) {
        prompt += `\n\nReporting Period: ${options.period.startDate} to ${options.period.endDate}`;
      }

      if (options.includeCharts) {
        prompt += "\n\nInclude data visualizations and charts in the report.";
      }

      // Send to AI
      const response = await this.sendPrompt(prompt, {
        systemPrompt,
        maxTokens: this.maxTokens * 3, // Allow more tokens for reports
      });

      // Parse response
      const parsedResponse = AIUtils.parseAIResponse(response, "report");

      // Extract sections
      const sections = AIUtils.extractSections(response);

      // Prepare result
      const result = {
        projectId,
        type,
        report: parsedResponse,
        sections,
        summary: AIUtils.extractSummary(response),
        metrics: {
          features: projectContext.features.length,
          bugs: projectContext.bugs.length,
          decisions: projectContext.decisions.length,
          risks: projectContext.risks.length,
          milestones: projectContext.milestones.length,
        },
        options,
        generatedAt: new Date().toISOString(),
      };

      // Track usage
      await AIUtils.trackUsage(projectId, "unknown", "generate_report", {
        type,
        responseLength: response.length,
        sectionsCount: sections.length,
      });

      return result;
    } catch (error) {
      logger.error("Error in generateReport:", error);
      throw error;
    }
  }

  /**
   * Suggests next actions for a project
   * @param {string} projectId - Project UUID
   * @returns {Promise<Object>} - Suggested actions
   */
  async suggestNextActions(projectId) {
    try {
      // Extract project context
      const projectContext = await AIUtils.extractProjectContext(projectId);
      const contextText = AIUtils.formatContextForAI(projectContext);

      // Build prompt
      const prompt = `
Project Data:
${contextText}

Based on this project data, suggest the most important next actions.
Categorize actions by:
1. Immediate (within 24 hours)
2. Short-term (this week)
3. Medium-term (this sprint)
4. Long-term (next quarter)

For each action, include:
- Description
- Priority (High/Medium/Low)
- Estimated effort
- Expected impact
`;

      // Send to AI
      const response = await this.sendPrompt(prompt, {
        systemPrompt: systemPrompts.nextActions,
        maxTokens: this.maxTokens * 1.5,
      });

      // Parse response
      const parsedResponse = AIUtils.parseAIResponse(response, "actions");

      // Extract actions
      const actions = AIUtils.extractActions(response);

      // Categorize actions
      const categorizedActions = {
        immediate: actions.filter(
          (a) =>
            a.text.toLowerCase().includes("immediate") ||
            a.text.toLowerCase().includes("urgent") ||
            a.text.toLowerCase().includes("today")
        ),
        shortTerm: actions.filter(
          (a) =>
            a.text.toLowerCase().includes("this week") ||
            a.text.toLowerCase().includes("short term")
        ),
        mediumTerm: actions.filter(
          (a) =>
            a.text.toLowerCase().includes("this sprint") ||
            a.text.toLowerCase().includes("medium term")
        ),
        longTerm: actions.filter(
          (a) =>
            a.text.toLowerCase().includes("next quarter") ||
            a.text.toLowerCase().includes("long term")
        ),
        other: actions,
      };

      const result = {
        projectId,
        actions: categorizedActions,
        summary: AIUtils.extractSummary(response),
        fullResponse: parsedResponse,
        timestamp: new Date().toISOString(),
      };

      // Track usage
      await AIUtils.trackUsage(projectId, "unknown", "suggest_next_actions", {
        actionsCount: actions.length,
      });

      return result;
    } catch (error) {
      logger.error("Error in suggestNextActions:", error);
      throw error;
    }
  }

  /**
   * Analyzes project trends
   * @param {string} projectId - Project UUID
   * @returns {Promise<Object>} - Trend analysis
   */
  async analyzeTrends(projectId) {
    try {
      // Extract project context
      const projectContext = await AIUtils.extractProjectContext(projectId);
      const contextText = AIUtils.formatContextForAI(projectContext);

      // Build prompt
      const prompt = `
Project Data:
${contextText}

Analyze the trends in this project and provide insights on:
1. Development velocity trends
2. Bug patterns and trends
3. Feature completion trends
4. Risk evolution
5. Quality indicators
6. Team productivity trends
7. Predictions for the next 2-4 weeks

Include specific metrics and data points to support your analysis.
`;

      // Send to AI
      const response = await this.sendPrompt(prompt, {
        systemPrompt: systemPrompts.trendAnalysis,
        maxTokens: this.maxTokens * 1.5,
      });

      // Parse response
      const parsedResponse = AIUtils.parseAIResponse(response, "trends");

      // Extract trends
      const trends = {
        positive: [],
        negative: [],
        neutral: [],
      };

      const lines = response.split("\n");
      lines.forEach((line) => {
        const lower = line.toLowerCase();
        if (
          lower.includes("positive") ||
          lower.includes("improved") ||
          lower.includes("increase")
        ) {
          trends.positive.push(line.trim());
        } else if (
          lower.includes("negative") ||
          lower.includes("decline") ||
          lower.includes("decrease")
        ) {
          trends.negative.push(line.trim());
        } else if (lower.includes("stable") || lower.includes("unchanged")) {
          trends.neutral.push(line.trim());
        }
      });

      const result = {
        projectId,
        trends,
        summary: AIUtils.extractSummary(response),
        metrics: {
          features: projectContext.features.length,
          bugs: projectContext.bugs.length,
          decisions: projectContext.decisions.length,
          risks: projectContext.risks.length,
        },
        predictions: this.extractPredictions(response),
        fullResponse: parsedResponse,
        timestamp: new Date().toISOString(),
      };

      // Track usage
      await AIUtils.trackUsage(projectId, "unknown", "analyze_trends", {
        responseLength: response.length,
      });

      return result;
    } catch (error) {
      logger.error("Error in analyzeTrends:", error);
      throw error;
    }
  }

  /**
   * Extracts predictions from text
   * @param {string} text - Text to parse
   * @returns {Array} - Predictions
   */
  extractPredictions(text) {
    const predictions = [];
    const lines = text.split("\n");

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (
        trimmed.toLowerCase().includes("predict") ||
        trimmed.toLowerCase().includes("forecast") ||
        trimmed.toLowerCase().includes("expected")
      ) {
        predictions.push(trimmed);
      }
    });

    return predictions;
  }
}

const aIAssistantService = new AIAssistantService();

module.exports = aIAssistantService;
module.exports.aIAssistantService = aIAssistantService;
