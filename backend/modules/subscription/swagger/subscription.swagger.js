/**
 * Swagger documentation for Subscription Module
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Plan:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         plan_type:
 *           type: string
 *           enum: [free, basic, pro, enterprise, custom]
 *         price:
 *           type: number
 *           format: float
 *         billing_cycle:
 *           type: string
 *           enum: [monthly, yearly, quarterly]
 *         features:
 *           type: object
 *           additionalProperties:
 *             type: boolean
 *         limits:
 *           type: object
 *           additionalProperties:
 *             type: number
 *         is_active:
 *           type: boolean
 *         is_default:
 *           type: boolean
 *         trial_days:
 *           type: integer
 *         sort_order:
 *           type: integer
 *
 *     Subscription:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         user_id:
 *           type: string
 *           format: uuid
 *         plan_id:
 *           type: string
 *           format: uuid
 *         status:
 *           type: string
 *           enum: [active, inactive, past_due, canceled, trialing, expired]
 *         interval:
 *           type: string
 *           enum: [daily, weekly, monthly, quarterly, yearly]
 *         current_period_start:
 *           type: string
 *           format: date-time
 *         current_period_end:
 *           type: string
 *           format: date-time
 *         cancel_at_period_end:
 *           type: boolean
 *         canceled_at:
 *           type: string
 *           format: date-time
 *         trial_start:
 *           type: string
 *           format: date-time
 *         trial_end:
 *           type: string
 *           format: date-time
 *         metadata:
 *           type: object
 *         plan:
 *           $ref: '#/components/schemas/Plan'
 *
 *     Payment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         subscription_id:
 *           type: string
 *           format: uuid
 *         amount:
 *           type: number
 *           format: float
 *         currency:
 *           type: string
 *         status:
 *           type: string
 *           enum: [pending, succeeded, failed, refunded, charged_back]
 *         stripe_payment_intent_id:
 *           type: string
 *         stripe_invoice_id:
 *           type: string
 *         payment_method_type:
 *           type: string
 *         description:
 *           type: string
 *         receipt_url:
 *           type: string
 *         invoice_url:
 *           type: string
 *         paid_at:
 *           type: string
 *           format: date-time
 *
 *   tags:
 *     name: Subscriptions
 *     description: Subscription management endpoints
 *     name: Plans
 *     description: Plan management endpoints
 *     name: Payments
 *     description: Payment management endpoints
 *     name: Webhooks
 *     description: Webhook endpoints
 */

// Additional Swagger annotations for each endpoint are included in the routes file

module.exports = {};
