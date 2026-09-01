const AIAssistantService = require("../services/ai-assistant.service");
const AIUtils = require("../utils/ai-assistant.utils");
const { aiSchemas } = require("../validations/ai-assistant.validation");
const ResponseUtils = require("../../../common/utils/response.utils");
const ValidationUtils = require("../../../common/utils/validation.utils");
const logger = require("../../../common/config/logger");

/**
 * AI Assistant Controller
 * Handles HTTP requests for AI assistant
 */
class AIAssistantController {
  /**
   * Ask AI a question
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async askQuestion(req, res) {
    try {
      const { projectId } = req.params;
      const userId = req.user?.id;
      const { question, context } = req.body;

      // Validate UUID
      if (!ValidationUtils.validateUUID(projectId)) {
        return ResponseUtils.sendError(res, "Invalid project ID", 400);
      }

      // Validate request body
      const { error, value } = aiSchemas.askQuestion.validate({
        question,
        context,
      });
      if (error) {
        return ResponseUtils.sendValidationError(res, error.details);
      }

      const result = await AIAssistantService.askQuestion(
        projectId,
        userId,
        value.question,
        value.context
      );

      return ResponseUtils.sendSuccess(
        res,
        result,
        "AI responded successfully"
      );
    } catch (error) {
      logger.error("Error in askQuestion:", error);
      return ResponseUtils.sendError(res, error.message, 400);
    }
  }

  /**
   * Analyze project
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async analyzeProject(req, res) {
    try {
      const { projectId } = req.params;
      const userId = req.user?.id;
      const { focus, depth } = req.body || {};

      // Validate UUID
      if (!ValidationUtils.validateUUID(projectId)) {
        return ResponseUtils.sendError(res, "Invalid project ID", 400);
      }

      // Validate request body
      const { error, value } = aiSchemas.analyzeProject.validate({
        focus,
        depth,
      });
      if (error) {
        return ResponseUtils.sendValidationError(res, error.details);
      }

      const result = await AIAssistantService.analyzeProject(
        projectId,
        userId,
        value
      );

      return ResponseUtils.sendSuccess(
        res,
        result,
        "Project analysis completed successfully"
      );
    } catch (error) {
      logger.error("Error in analyzeProject:", error);
      return ResponseUtils.sendError(res, error.message, 400);
    }
  }

  /**
   * Get conversations
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async getConversations(req, res) {
    try {
      const { projectId } = req.params;
      const queryParams = req.query;
      const userId = req.user?.id;

      // Validate UUID
      if (!ValidationUtils.validateUUID(projectId)) {
        return ResponseUtils.sendError(res, "Invalid project ID", 400);
      }

      // Validate query parameters
      const { error, value } = aiSchemas.getConversations.validate(queryParams);
      if (error) {
        return ResponseUtils.sendValidationError(res, error.details);
      }

      const conversations = await AIAssistantService.getConversations(
        projectId,
        userId,
        value.limit,
        {
          questionContains: value.questionContains,
          fromDate: value.fromDate,
          toDate: value.toDate,
        }
      );

      return ResponseUtils.sendSuccess(
        res,
        conversations,
        "Conversations retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getConversations:", error);
      return ResponseUtils.sendError(res, error.message, 500);
    }
  }

  /**
   * Get conversation by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async getConversation(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      // Validate UUID
      if (!ValidationUtils.validateUUID(id)) {
        return ResponseUtils.sendError(res, "Invalid conversation ID", 400);
      }

      const conversation = await AIAssistantService.getConversation(id);

      if (!conversation) {
        return ResponseUtils.sendError(res, "Conversation not found", 404);
      }

      return ResponseUtils.sendSuccess(
        res,
        conversation,
        "Conversation retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getConversation:", error);
      return ResponseUtils.sendError(res, error.message, 404);
    }
  }

  /**
   * Summarize text
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async summarizeText(req, res) {
    try {
      const { text, maxLength, format } = req.body;
      const userId = req.user?.id;

      // Validate request body
      const { error, value } = aiSchemas.summarizeText.validate({
        text,
        maxLength,
        format,
      });

      if (error) {
        return ResponseUtils.sendValidationError(res, error.details);
      }

      const result = await AIAssistantService.summarizeText(
        value.text,
        value.maxLength,
        value.format
      );

      return ResponseUtils.sendSuccess(
        res,
        result,
        "Text summarized successfully"
      );
    } catch (error) {
      logger.error("Error in summarizeText:", error);
      return ResponseUtils.sendError(res, error.message, 400);
    }
  }

  /**
   * Generate report
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async generateReport(req, res) {
    try {
      const userId = req.user?.id;
      const { projectId } = req.params;
      const { type, format, includeCharts, period } = req.body || {};

      // Validate UUID
      if (!ValidationUtils.validateUUID(projectId)) {
        return ResponseUtils.sendError(res, "Invalid project ID", 400);
      }

      // Validate request body
      const { error, value } = aiSchemas.generateReport.validate({
        type,
        format,
        includeCharts,
        period,
      });

      if (error) {
        return ResponseUtils.sendValidationError(res, error.details);
      }

      const result = await AIAssistantService.generateReport(
        projectId,
        userId,
        value.type,
        {
          format: value.format,
          includeCharts: value.includeCharts,
          period: value.period,
        }
      );

      // Format response based on requested format
      if (value.format === "markdown" || value.format === "html") {
        const formattedResponse = AIUtils.formatResponse(
          result.report,
          value.format
        );
        return ResponseUtils.sendSuccess(
          res,
          formattedResponse,
          "Report generated successfully"
        );
      }

      return ResponseUtils.sendSuccess(
        res,
        result,
        "Report generated successfully"
      );
    } catch (error) {
      logger.error("Error in generateReport:", error);
      return ResponseUtils.sendError(res, error.message, 400);
    }
  }

  /**
   * Suggest next actions
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async suggestNextActions(req, res) {
    try {
      const { projectId } = req.params;
      const userId = req.user?.id;

      // Validate UUID
      if (!ValidationUtils.validateUUID(projectId)) {
        return ResponseUtils.sendError(res, "Invalid project ID", 400);
      }

      const result = await AIAssistantService.suggestNextActions(
        projectId,
        userId
      );

      return ResponseUtils.sendSuccess(
        res,
        result,
        "Next actions suggested successfully"
      );
    } catch (error) {
      logger.error("Error in suggestNextActions:", error);
      return ResponseUtils.sendError(res, error.message, 500);
    }
  }

  /**
   * Analyze trends
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async analyzeTrends(req, res) {
    try {
      const { projectId } = req.params;
      const userId = req.user?.id;

      // Validate UUID
      if (!ValidationUtils.validateUUID(projectId)) {
        return ResponseUtils.sendError(res, "Invalid project ID", 400);
      }

      const result = await AIAssistantService.analyzeTrends(projectId, userId);

      return ResponseUtils.sendSuccess(
        res,
        result,
        "Trend analysis completed successfully"
      );
    } catch (error) {
      logger.error("Error in analyzeTrends:", error);
      return ResponseUtils.sendError(res, error.message, 500);
    }
  }

  /**
   * Get AI availability status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<Object>} - JSON response
   */
  async getStatus(req, res) {
    try {
      const userId = req.user?.id;
      const status = {
        provider: AIAssistantService.provider,
        isFallback: AIAssistantService.isFallback || false,
        model: AIAssistantService.model || "Not configured",
        cacheEnabled: AIAssistantService.cacheEnabled,
        maxTokens: AIAssistantService.maxTokens,
        temperature: AIAssistantService.temperature,
        features: {
          askQuestion: true,
          analyzeProject: true,
          summarizeText: true,
          generateReport: true,
          suggestNextActions: true,
          analyzeTrends: true,
        },
        limits: {
          maxQuestionLength: 5000,
          maxTextLength: 20000,
          maxConversations: 100,
        },
      };

      return ResponseUtils.sendSuccess(
        res,
        status,
        "AI assistant status retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getStatus:", error);
      return ResponseUtils.sendError(res, error.message, 500);
    }
  }

  /**
   * Get global AI dashboard statistics
   *
   * This endpoint intentionally does NOT use req.params.projectId.
   *
   * It aggregates AI activity across all projects for the
   * authenticated user.
   *
   * @param {Object} req
   * @param {Object} res
   * @returns {Promise<Object>}
   */
  async getAIStats(req, res) {
    try {
      /*
       * Depending on your auth middleware, this may be:
       *
       * req.user.id
       * req.user.userId
       * req.user.sub
       *
       * Your existing middleware appears to use req.user.id.
       */
      const userId = req.user?.id;

      if (!userId) {
        return ResponseUtils.sendError(
          res,
          "Authenticated user not found",
          401
        );
      }

      /*
       * Validate query parameters.
       */
      const { error, value } = aiSchemas.getAIStats.validate(req.query, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        return ResponseUtils.sendValidationError(res, error.details);
      }

      /*
       * Get dashboard data.
       */
      const result = await AIAssistantService.getAIStats(userId, value);

      return ResponseUtils.sendSuccess(
        res,
        result,
        "AI dashboard statistics retrieved successfully"
      );
    } catch (error) {
      logger.error("Error in getAIStats:", error);

      return ResponseUtils.sendError(res, error.message, 500);
    }
  }
}

const aIAssistantController = new AIAssistantController();

module.exports = aIAssistantController;
module.exports.aIAssistantController = aIAssistantController;
