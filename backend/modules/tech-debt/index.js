const router = require("./routes");
const TechDebtService = require("./services/tech-debt.service");
const TechDebtUtils = require("./utils/tech-debt.utils");

module.exports = {
  router,
  TechDebtService,
  TechDebtUtils,
};
