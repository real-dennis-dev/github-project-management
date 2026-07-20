/**
 * @swagger
 * components:
 *   schemas:
 *     Project:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Project UUID
 *         name:
 *           type: string
 *           description: Project name
 *         description:
 *           type: string
 *           description: Project description
 *         status:
 *           type: string
 *           enum: [planning, in_progress, paused, completed, archived]
 *           description: Project status
 *         priority:
 *           type: string
 *           enum: [low, medium, high, critical]
 *           description: Project priority
 *         completion_percentage:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *           description: Project completion percentage
 *         tech_stack:
 *           type: array
 *           items:
 *             type: string
 *           description: Technology stack used
 *         repository_url:
 *           type: string
 *           format: uri
 *           description: Repository URL
 *         start_date:
 *           type: string
 *           format: date
 *           description: Project start date
 *         target_completion_date:
 *           type: string
 *           format: date
 *           description: Target completion date
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *
 *     Feature:
 *       type: object
 *       required:
 *         - title
 *         - project_id
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         project_id:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         status:
 *           type: string
 *           enum: [planned, in_progress, completed, blocked, cancelled]
 *         difficulty:
 *           type: string
 *           enum: [easy, medium, hard, expert]
 *         estimated_days:
 *           type: integer
 *         order_index:
 *           type: integer
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *
 *     Bug:
 *       type: object
 *       required:
 *         - title
 *         - project_id
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         project_id:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         status:
 *           type: string
 *           enum: [reported, investigating, in_progress, fixed, verified, closed]
 *         priority:
 *           type: string
 *           enum: [low, medium, high, critical]
 *         cause:
 *           type: string
 *         possible_fix:
 *           type: string
 *         reported_by:
 *           type: string
 *         assigned_to:
 *           type: string
 *         completed_at:
 *           type: string
 *           format: date-time
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *
 *     Subtask:
 *       type: object
 *       required:
 *         - title
 *         - feature_id
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         feature_id:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         is_completed:
 *           type: boolean
 *         order_index:
 *           type: integer
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *
 *   responses:
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *         message:
 *           type: string
 *         pagination:
 *           type: object
 *           properties:
 *             page:
 *               type: integer
 *             limit:
 *               type: integer
 *             total:
 *               type: integer
 *             totalPages:
 *               type: integer
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: string
 *         details:
 *           type: array
 *           items:
 *             type: string
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   security:
 *     - bearerAuth: []
 */

export const projectSwagger = {
  // Tags
  tags: [
    {
      name: "Projects",
      description: "Project management endpoints",
    },
    {
      name: "Features",
      description: "Feature management endpoints",
    },
    {
      name: "Bugs",
      description: "Bug tracking endpoints",
    },
    {
      name: "Subtasks",
      description: "Feature subtask endpoints",
    },
  ],

  // Components
  components: {
    schemas: {
      Project: {
        type: "object",
        required: ["name"],
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string", maxLength: 255 },
          description: { type: "string" },
          status: {
            type: "string",
            enum: [
              "planning",
              "in_progress",
              "paused",
              "completed",
              "archived",
            ],
          },
          priority: {
            type: "string",
            enum: ["low", "medium", "high", "critical"],
          },
          completion_percentage: {
            type: "integer",
            minimum: 0,
            maximum: 100,
          },
          tech_stack: {
            type: "array",
            items: { type: "string" },
          },
          repository_url: { type: "string", format: "uri" },
          start_date: { type: "string", format: "date" },
          target_completion_date: { type: "string", format: "date" },
          created_at: { type: "string", format: "date-time" },
          updated_at: { type: "string", format: "date-time" },
        },
      },

      Feature: {
        type: "object",
        required: ["title", "project_id"],
        properties: {
          id: { type: "string", format: "uuid" },
          project_id: { type: "string", format: "uuid" },
          title: { type: "string" },
          description: { type: "string" },
          status: {
            type: "string",
            enum: [
              "planned",
              "in_progress",
              "completed",
              "blocked",
              "cancelled",
            ],
          },
          difficulty: {
            type: "string",
            enum: ["easy", "medium", "hard", "expert"],
          },
          estimated_days: { type: "integer" },
          order_index: { type: "integer" },
          created_at: { type: "string", format: "date-time" },
          updated_at: { type: "string", format: "date-time" },
        },
      },

      Bug: {
        type: "object",
        required: ["title", "project_id"],
        properties: {
          id: { type: "string", format: "uuid" },
          project_id: { type: "string", format: "uuid" },
          title: { type: "string" },
          description: { type: "string" },
          status: {
            type: "string",
            enum: [
              "reported",
              "investigating",
              "in_progress",
              "fixed",
              "verified",
              "closed",
            ],
          },
          priority: {
            type: "string",
            enum: ["low", "medium", "high", "critical"],
          },
          cause: { type: "string" },
          possible_fix: { type: "string" },
          reported_by: { type: "string" },
          assigned_to: { type: "string" },
          completed_at: { type: "string", format: "date-time" },
          created_at: { type: "string", format: "date-time" },
          updated_at: { type: "string", format: "date-time" },
        },
      },

      Subtask: {
        type: "object",
        required: ["title", "feature_id"],
        properties: {
          id: { type: "string", format: "uuid" },
          feature_id: { type: "string", format: "uuid" },
          title: { type: "string" },
          is_completed: { type: "boolean" },
          order_index: { type: "integer" },
          created_at: { type: "string", format: "date-time" },
          updated_at: { type: "string", format: "date-time" },
        },
      },
    },

    responses: {
      SuccessResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: { type: "object" },
          message: { type: "string" },
          pagination: {
            type: "object",
            properties: {
              page: { type: "integer" },
              limit: { type: "integer" },
              total: { type: "integer" },
              totalPages: { type: "integer" },
            },
          },
        },
      },

      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          error: { type: "string" },
          details: {
            type: "array",
            items: { type: "string" },
          },
        },
      },
    },

    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },

  security: [
    {
      bearerAuth: [],
    },
  ],
};
