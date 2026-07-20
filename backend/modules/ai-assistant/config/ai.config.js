/**
 * AI Configuration
 * Configuration for AI assistant services
 */
const config = {
  // AI Provider Configuration
  provider: process.env.AI_PROVIDER || "openai",

  // OpenAI Configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || "gpt-4",
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7,
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 2000,
    organization: process.env.OPENAI_ORG_ID,
  },

  // Anthropic Claude Configuration
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: process.env.ANTHROPIC_MODEL || "claude-3-opus-20240229",
    temperature: parseFloat(process.env.ANTHROPIC_TEMPERATURE) || 0.7,
    maxTokens: parseInt(process.env.ANTHROPIC_MAX_TOKENS) || 2000,
  },

  // Project Context Configuration
  context: {
    includeProjectDetails: true,
    includeFeatures: true,
    includeBugs: true,
    includeDecisions: true,
    includeRisks: true,
    includeMilestones: true,
    includeTechDebt: true,
    maxContextItems: parseInt(process.env.AI_MAX_CONTEXT_ITEMS) || 50,
    contextWindowSize: parseInt(process.env.AI_CONTEXT_WINDOW) || 8000,
  },

  // Response Configuration
  response: {
    cacheEnabled: process.env.AI_CACHE_ENABLED === "true",
    cacheTTL: parseInt(process.env.AI_CACHE_TTL) || 3600,
    maxRetries: parseInt(process.env.AI_MAX_RETRIES) || 3,
    timeout: parseInt(process.env.AI_TIMEOUT) || 30000,
  },

  // Features
  features: {
    enableProjectAnalysis: true,
    enableTrendAnalysis: true,
    enableNextActions: true,
    enableSummarization: true,
    enableReportGeneration: true,
    enableConversationHistory: true,
  },

  // Rate Limiting
  rateLimit: {
    perUser: parseInt(process.env.AI_RATE_LIMIT_USER) || 50,
    perHour: parseInt(process.env.AI_RATE_LIMIT_HOUR) || 200,
    perDay: parseInt(process.env.AI_RATE_LIMIT_DAY) || 500,
  },
};

// AI System Prompts
const systemPrompts = {
  projectAnalysis: `
You are an expert project management assistant analyzing a software project.
Analyze the project data and provide insights on:
1. Overall project health and progress
2. Critical issues and risks
3. Optimization opportunities
4. Recommendations for improvement
5. Team performance indicators
6. Timeline assessment
7. Quality metrics

Be specific, actionable, and data-driven.
  `,

  trendAnalysis: `
You are a data analyst specializing in project trend analysis.
Analyze the project data and identify:
1. Positive and negative trends
2. Patterns in development velocity
3. Bug and feature correlation
4. Risk evolution
5. Quality indicators
6. Team productivity insights

Provide data-backed insights and predictions.
  `,

  nextActions: `
You are a project management assistant suggesting next actions.
Based on the project data, recommend:
1. Immediate actions (next 24 hours)
2. Short-term actions (this week)
3. Medium-term actions (this sprint)
4. Long-term considerations
5. Risk mitigation steps
6. Process improvements

Prioritize actions by impact and urgency.
  `,

  summarization: `
You are a summarization expert. Provide a concise, accurate summary
of the given text while preserving key information and insights.
Maintain a professional, objective tone.
  `,

  reportGeneration: `
You are a business analyst generating project reports.
Create a comprehensive report that includes:
1. Executive Summary
2. Project Status Overview
3. Key Metrics and KPIs
4. Risk Assessment
5. Resource Allocation
6. Milestone Progress
7. Recommendations

Use a professional format with clear sections.
  `,

  generalAssistant: `
You are a helpful AI assistant for project management.
You have access to project data and can answer questions about:
- Project status and progress
- Task and feature implementation
- Bug analysis and solutions
- Technology decisions
- Risk assessment
- Team collaboration
- Process optimization

Provide clear, actionable answers with reasoning.
  `,
};

module.exports = {
  config,
  systemPrompts,
};
