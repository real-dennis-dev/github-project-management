// src/modules/progress-timeline/swagger/progress.swagger.js
module.exports = {
  // GET timeline
  "/api/projects/{projectId}/timeline": {
    get: {
      tags: ["Progress & Timeline"],
      summary: "Get project timeline with filtering",
      description:
        "Retrieve all timeline entries for a project with optional filtering, pagination, and sorting.",
      parameters: [
        {
          name: "projectId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "Project ID",
        },
        {
          name: "from_date",
          in: "query",
          schema: { type: "string", format: "date" },
          description: "Start date (ISO format)",
        },
        {
          name: "to_date",
          in: "query",
          schema: { type: "string", format: "date" },
          description: "End date (ISO format)",
        },
        {
          name: "feature_name",
          in: "query",
          schema: { type: "string" },
          description: "Filter by feature name",
        },
        {
          name: "page",
          in: "query",
          schema: { type: "integer", default: 1 },
          description: "Page number",
        },
        {
          name: "limit",
          in: "query",
          schema: { type: "integer", default: 20 },
          description: "Items per page",
        },
        {
          name: "sort_by",
          in: "query",
          schema: {
            type: "string",
            enum: [
              "month_year",
              "feature_name",
              "progress_percentage",
              "created_at",
            ],
            default: "month_year",
          },
        },
        {
          name: "sort_order",
          in: "query",
          schema: { type: "string", enum: ["asc", "desc"], default: "asc" },
        },
      ],
      responses: {
        200: {
          description: "Timeline data retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string", format: "uuid" },
                        project_id: { type: "string", format: "uuid" },
                        month_year: { type: "string", format: "date" },
                        feature_name: { type: "string" },
                        progress_percentage: {
                          type: "integer",
                          minimum: 0,
                          maximum: 100,
                        },
                        status: {
                          type: "object",
                          properties: {
                            label: { type: "string" },
                            class: { type: "string" },
                            icon: { type: "string" },
                          },
                        },
                        formattedMonth: { type: "string" },
                        created_at: { type: "string", format: "date-time" },
                        updated_at: { type: "string", format: "date-time" },
                      },
                    },
                  },
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
            },
          },
        },
        400: { description: "Invalid request parameters" },
        401: { description: "Unauthorized" },
        404: { description: "Project not found" },
      },
      security: [{ bearerAuth: [] }],
    },
    post: {
      tags: ["Progress & Timeline"],
      summary: "Add timeline entry",
      description:
        "Create a new timeline entry for a project. If an entry for the same month and feature exists, it will be updated instead.",
      parameters: [
        {
          name: "projectId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "Project ID",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["month_year", "feature_name", "progress_percentage"],
              properties: {
                month_year: {
                  type: "string",
                  format: "date",
                  description: "First day of the month (YYYY-MM-DD)",
                },
                feature_name: {
                  type: "string",
                  maxLength: 255,
                  description: "Name of the feature",
                },
                progress_percentage: {
                  type: "integer",
                  minimum: 0,
                  maximum: 100,
                  description: "Progress percentage",
                },
              },
              example: {
                month_year: "2026-01-01",
                feature_name: "User Authentication",
                progress_percentage: 75,
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Timeline entry created or updated",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string" },
                  isUpdate: { type: "boolean" },
                  data: {
                    type: "object",
                    properties: {
                      id: { type: "string", format: "uuid" },
                      project_id: { type: "string", format: "uuid" },
                      month_year: { type: "string", format: "date" },
                      feature_name: { type: "string" },
                      progress_percentage: { type: "integer" },
                      status: {
                        type: "object",
                        properties: {
                          label: { type: "string" },
                          class: { type: "string" },
                          icon: { type: "string" },
                        },
                      },
                      formattedMonth: { type: "string" },
                      created_at: { type: "string", format: "date-time" },
                      updated_at: { type: "string", format: "date-time" },
                    },
                  },
                },
              },
            },
          },
        },
        400: { description: "Validation error" },
        401: { description: "Unauthorized" },
        404: { description: "Project not found" },
      },
      security: [{ bearerAuth: [] }],
    },
  },

  // PUT timeline entry
  "/api/timeline/{id}": {
    put: {
      tags: ["Progress & Timeline"],
      summary: "Update timeline entry",
      description: "Update an existing timeline entry.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "Timeline entry ID",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                month_year: {
                  type: "string",
                  format: "date",
                  description: "First day of the month",
                },
                feature_name: {
                  type: "string",
                  maxLength: 255,
                },
                progress_percentage: {
                  type: "integer",
                  minimum: 0,
                  maximum: 100,
                },
              },
              example: {
                progress_percentage: 85,
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Timeline entry updated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string" },
                  data: {
                    type: "object",
                    properties: {
                      id: { type: "string", format: "uuid" },
                      project_id: { type: "string", format: "uuid" },
                      month_year: { type: "string", format: "date" },
                      feature_name: { type: "string" },
                      progress_percentage: { type: "integer" },
                      status: { type: "object" },
                      formattedMonth: { type: "string" },
                      created_at: { type: "string", format: "date-time" },
                      updated_at: { type: "string", format: "date-time" },
                    },
                  },
                },
              },
            },
          },
        },
        400: { description: "Validation error" },
        401: { description: "Unauthorized" },
        404: { description: "Timeline entry not found" },
      },
      security: [{ bearerAuth: [] }],
    },
    delete: {
      tags: ["Progress & Timeline"],
      summary: "Delete timeline entry",
      description: "Delete a timeline entry by ID.",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "Timeline entry ID",
        },
      ],
      responses: {
        200: {
          description: "Timeline entry deleted successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string" },
                  data: {
                    type: "object",
                    properties: {
                      id: { type: "string", format: "uuid" },
                    },
                  },
                },
              },
            },
          },
        },
        401: { description: "Unauthorized" },
        404: { description: "Timeline entry not found" },
      },
      security: [{ bearerAuth: [] }],
    },
  },

  // Progress Overview
  "/api/projects/{projectId}/progress-overview": {
    get: {
      tags: ["Progress & Timeline"],
      summary: "Get progress overview",
      description:
        "Get comprehensive progress overview for a project including charts, trends, and statistics.",
      parameters: [
        {
          name: "projectId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "Project ID",
        },
        {
          name: "months",
          in: "query",
          schema: { type: "integer", default: 12 },
          description: "Number of months to analyze",
        },
      ],
      responses: {
        200: {
          description: "Progress overview retrieved",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      project: {
                        type: "object",
                        properties: {
                          id: { type: "string", format: "uuid" },
                          name: { type: "string" },
                          status: { type: "string" },
                          completion_percentage: { type: "integer" },
                        },
                      },
                      overview: {
                        type: "object",
                        properties: {
                          overall: { type: "integer" },
                          average: { type: "integer" },
                          totalFeatures: { type: "integer" },
                          completedFeatures: { type: "integer" },
                          completionRate: { type: "integer" },
                        },
                      },
                      chartData: {
                        type: "object",
                        properties: {
                          labels: { type: "array", items: { type: "string" } },
                          datasets: { type: "array" },
                          features: {
                            type: "array",
                            items: { type: "string" },
                          },
                        },
                      },
                      featureTrends: {
                        type: "object",
                      },
                      latestEntries: {
                        type: "object",
                      },
                      aggregatedData: {
                        type: "object",
                      },
                    },
                  },
                },
              },
            },
          },
        },
        401: { description: "Unauthorized" },
        404: { description: "Project not found" },
      },
      security: [{ bearerAuth: [] }],
    },
  },

  // Monthly Progress
  "/api/projects/{projectId}/monthly-progress": {
    get: {
      tags: ["Progress & Timeline"],
      summary: "Get monthly progress",
      description: "Get detailed progress for a specific month.",
      parameters: [
        {
          name: "projectId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "Project ID",
        },
        {
          name: "month",
          in: "query",
          required: true,
          schema: { type: "string", format: "date" },
          description: "Month to analyze (YYYY-MM-DD)",
        },
        {
          name: "feature_name",
          in: "query",
          schema: { type: "string" },
          description: "Filter by specific feature",
        },
      ],
      responses: {
        200: {
          description: "Monthly progress retrieved",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      month: { type: "string" },
                      monthYear: { type: "string" },
                      entries: { type: "array" },
                      stats: {
                        type: "object",
                        properties: {
                          total: { type: "integer" },
                          average: { type: "integer" },
                          totalProgress: { type: "integer" },
                          previousMonth: {
                            type: "object",
                            properties: {
                              average: { type: "integer" },
                              entries: { type: "integer" },
                            },
                          },
                          change: { type: "integer" },
                          changePercentage: { type: "integer" },
                        },
                      },
                      features: { type: "array", items: { type: "string" } },
                      aggregated: { type: "object" },
                    },
                  },
                },
              },
            },
          },
        },
        400: { description: "Month parameter required" },
        401: { description: "Unauthorized" },
        404: { description: "Project not found" },
      },
      security: [{ bearerAuth: [] }],
    },
  },

  // Progress Report
  "/api/projects/{projectId}/progress-report": {
    get: {
      tags: ["Progress & Timeline"],
      summary: "Generate progress report",
      description: "Generate a detailed progress report for a project.",
      parameters: [
        {
          name: "projectId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "Project ID",
        },
        {
          name: "months",
          in: "query",
          schema: { type: "integer", default: 12 },
          description: "Number of months to include",
        },
        {
          name: "format",
          in: "query",
          schema: {
            type: "string",
            enum: ["json", "csv", "pdf"],
            default: "json",
          },
          description: "Report format",
        },
      ],
      responses: {
        200: {
          description: "Report generated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "object",
                    properties: {
                      generatedAt: { type: "string", format: "date-time" },
                      project: {
                        type: "object",
                        properties: {
                          id: { type: "string", format: "uuid" },
                          name: { type: "string" },
                          status: { type: "string" },
                          completion: { type: "integer" },
                        },
                      },
                      summary: {
                        type: "object",
                        properties: {
                          overallProgress: { type: "integer" },
                          totalFeatures: { type: "integer" },
                          completedFeatures: { type: "integer" },
                          completionRate: { type: "integer" },
                          averageProgress: { type: "integer" },
                        },
                      },
                      chartData: { type: "object" },
                      aggregatedData: { type: "object" },
                      featureBreakdown: { type: "object" },
                      monthlyTimeline: { type: "array" },
                      statistics: {
                        type: "object",
                        properties: {
                          totalEntries: { type: "integer" },
                          dateRange: {
                            type: "object",
                            properties: {
                              from: { type: "string" },
                              to: { type: "string" },
                            },
                          },
                          features: { type: "integer" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        401: { description: "Unauthorized" },
        404: { description: "Project not found" },
      },
      security: [{ bearerAuth: [] }],
    },
  },

  // Bulk Add
  "/api/projects/{projectId}/timeline/bulk": {
    post: {
      tags: ["Progress & Timeline"],
      summary: "Bulk add timeline entries",
      description: "Add multiple timeline entries at once.",
      parameters: [
        {
          name: "projectId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
          description: "Project ID",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["entries"],
              properties: {
                entries: {
                  type: "array",
                  items: {
                    type: "object",
                    required: [
                      "month_year",
                      "feature_name",
                      "progress_percentage",
                    ],
                    properties: {
                      month_year: { type: "string", format: "date" },
                      feature_name: { type: "string" },
                      progress_percentage: {
                        type: "integer",
                        minimum: 0,
                        maximum: 100,
                      },
                    },
                  },
                },
              },
              example: {
                entries: [
                  {
                    month_year: "2026-01-01",
                    feature_name: "User Authentication",
                    progress_percentage: 75,
                  },
                  {
                    month_year: "2026-01-01",
                    feature_name: "Payment Integration",
                    progress_percentage: 50,
                  },
                ],
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Entries created successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string" },
                  data: {
                    type: "object",
                    properties: {
                      entries: { type: "array" },
                      count: { type: "integer" },
                    },
                  },
                },
              },
            },
          },
        },
        400: { description: "Validation error" },
        401: { description: "Unauthorized" },
        404: { description: "Project not found" },
      },
      security: [{ bearerAuth: [] }],
    },
  },
};

// Swagger configuration to be added to main swagger setup
export const swaggerConfig = {
  openapi: "3.0.0",
  info: {
    title: "Progress & Timeline API",
    version: "1.0.0",
    description: "API for managing project progress and timeline",
    contact: {
      name: "API Support",
      email: "support@example.com",
    },
  },
  servers: [
    {
      url: "http://localhost:3000/api",
      description: "Development server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      TimelineEntry: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          project_id: { type: "string", format: "uuid" },
          month_year: { type: "string", format: "date" },
          feature_name: { type: "string" },
          progress_percentage: { type: "integer", minimum: 0, maximum: 100 },
          created_at: { type: "string", format: "date-time" },
          updated_at: { type: "string", format: "date-time" },
        },
      },
      CreateTimelineEntry: {
        type: "object",
        required: ["month_year", "feature_name", "progress_percentage"],
        properties: {
          month_year: { type: "string", format: "date" },
          feature_name: { type: "string" },
          progress_percentage: { type: "integer", minimum: 0, maximum: 100 },
        },
      },
      UpdateTimelineEntry: {
        type: "object",
        properties: {
          month_year: { type: "string", format: "date" },
          feature_name: { type: "string" },
          progress_percentage: { type: "integer", minimum: 0, maximum: 100 },
        },
      },
      ProgressStatus: {
        type: "object",
        properties: {
          label: { type: "string" },
          class: { type: "string" },
          icon: { type: "string" },
        },
      },
      Pagination: {
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
  paths: progressSwagger,
};
