const express = require("express");
const router = express.Router();

// Import controllers
const SubscriptionController = require("../controllers/subscription.controller");
const PlanController = require("../controllers/plan.controller");
const WebhookController = require("../controllers/webhook.controller");

// Import middleware
const {
  authenticate,
  authorize,
} = require("../../../common/middleware/auth.middleware");
const {
  validateRequest,
  validateQuery,
} = require("../../../common/middleware/validation.middleware");
const {
  pagination,
  filterParser,
  sortParser,
} = require("../../../common/middleware/data.middleware");
const {
  rateLimiter,
} = require("../../../common/middleware/security.middleware");

// Import validation schemas
const {
  subscriptionSchemas,
  planSchemas,
} = require("../validations/subscription.validation");

// ============================================
// SUBSCRIPTION ROUTES
// ============================================

router.get(
  "/subscriptions",
  authenticate,
  pagination,
  filterParser,
  sortParser,
  validateQuery(subscriptionSchemas.getSubscriptions),
  SubscriptionController.getUserSubscriptions.bind(SubscriptionController)
);

router.get(
  "/subscriptions/current",
  authenticate,
  SubscriptionController.getCurrentSubscription.bind(SubscriptionController)
);

router.post(
  "/subscriptions",
  authenticate,
  rateLimiter(),
  validateRequest(subscriptionSchemas.createSubscription),
  SubscriptionController.createSubscription.bind(SubscriptionController)
);

router.get(
  "/subscriptions/:id",
  authenticate,
  SubscriptionController.getSubscriptionById.bind(SubscriptionController)
);

router.put(
  "/subscriptions/:id",
  authenticate,
  validateRequest(subscriptionSchemas.updateSubscription),
  SubscriptionController.updateSubscription.bind(SubscriptionController)
);

router.post(
  "/subscriptions/:id/cancel",
  authenticate,
  validateRequest(subscriptionSchemas.cancelSubscription),
  SubscriptionController.cancelSubscription.bind(SubscriptionController)
);

router.get(
  "/subscriptions/feature/:featureName/check",
  authenticate,
  SubscriptionController.checkFeatureAccess.bind(SubscriptionController)
);

router.get(
  "/subscriptions/features/usage",
  authenticate,
  SubscriptionController.getFeatureUsage.bind(SubscriptionController)
);

// ============================================
// PLAN ROUTES
// ============================================

router.get(
  "/plans",
  authenticate,
  authorize(["admin", "project_manager"]),
  PlanController.getPlans.bind(PlanController)
);

router.get("/plans/public", PlanController.getPublicPlans.bind(PlanController));

router.get(
  "/plans/default",
  PlanController.getDefaultPlan.bind(PlanController)
);

router.get(
  "/plans/options",
  PlanController.getPlanOptions.bind(PlanController)
);

router.get(
  "/plans/:id",
  authenticate,
  PlanController.getPlanById.bind(PlanController)
);

router.post(
  "/plans",
  authenticate,
  authorize(["admin"]),
  validateRequest(planSchemas.createPlan),
  PlanController.createPlan.bind(PlanController)
);

router.put(
  "/plans/:id",
  authenticate,
  authorize(["admin"]),
  validateRequest(planSchemas.updatePlan),
  PlanController.updatePlan.bind(PlanController)
);

router.delete(
  "/plans/:id",
  authenticate,
  authorize(["admin"]),
  PlanController.deletePlan.bind(PlanController)
);

// ============================================
// WEBHOOK ROUTES
// ============================================

router.post(
  "/webhooks/stripe",
  express.raw({ type: "application/json" }),
  WebhookController.handleStripeWebhook.bind(WebhookController)
);

router.post(
  "/webhooks/:eventType",
  WebhookController.handleWebhook.bind(WebhookController)
);

router.get(
  "/webhooks/events",
  authenticate,
  authorize(["admin"]),
  WebhookController.getWebhookEvents.bind(WebhookController)
);

router.post(
  "/webhooks/:id/retry",
  authenticate,
  authorize(["admin"]),
  WebhookController.retryWebhook.bind(WebhookController)
);

module.exports = router;
