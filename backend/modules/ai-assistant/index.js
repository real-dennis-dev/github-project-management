const router = require("./routes");
const AIAssistantService = require("./services/ai-assistant.service");
const AIUtils = require("./utils/ai-assistant.utils");
const { config, systemPrompts } = require("./config/ai.config");

module.exports = {
  router,
  AIAssistantService,
  AIUtils,
  config,
  systemPrompts,
};
