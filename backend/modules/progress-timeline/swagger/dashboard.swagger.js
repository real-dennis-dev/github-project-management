// Inside progressSwagger object

'/api/progress-timeline/stats': {
  get: {
    tags: ['Progress & Timeline'],
    summary: 'Get global progress timeline stats (Dashboard)',
    description:
      'Returns aggregated statistics across ALL projects + a list of project-level stats sorted by latest activity. Ideal for the main dashboard. Click a project to navigate to its detailed overview.',
    parameters: [
      {
        name: 'months',
        in: 'query',
        schema: { type: 'integer', default: 12, minimum: 1, maximum: 60 },
        description: 'How many months of data to include'
      },
      {
        name: 'limit',
        in: 'query',
        schema: { type: 'integer', default: 20, minimum: 1, maximum: 100 },
        description: 'Max number of projects to return in the list'
      },
      {
        name: 'sort_by',
        in: 'query',
        schema: {
          type: 'string',
          enum: ['latest_activity', 'overall_progress', 'total_features', 'completed_features', 'project_name'],
          default: 'latest_activity'
        }
      },
      {
        name: 'sort_order',
        in: 'query',
        schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' }
      },
      {
        name: 'search',
        in: 'query',
        schema: { type: 'string' },
        description: 'Search projects by name'
      }
    ],
    responses: {
      200: {
        description: 'Dashboard stats retrieved successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string' },
                data: {
                  type: 'object',
                  properties: {
                    globalStats: {
                      type: 'object',
                      properties: {
                        totalProjects: { type: 'integer' },
                        totalEntries: { type: 'integer' },
                        totalFeatures: { type: 'integer' },
                        completedFeatures: { type: 'integer' },
                        overallAverageProgress: { type: 'integer' },
                        completionRate: { type: 'integer' },
                        dateRange: {
                          type: 'object',
                          properties: {
                            from: { type: 'string', format: 'date' },
                            to: { type: 'string', format: 'date' }
                          }
                        }
                      }
                    },
                    projects: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          project: {
                            type: 'object',
                            properties: {
                              id: { type: 'string', format: 'uuid' },
                              name: { type: 'string' },
                              status: { type: 'string' },
                              completion_percentage: { type: 'integer' }
                            }
                          },
                          stats: {
                            type: 'object',
                            properties: {
                              overallProgress: { type: 'integer' },
                              averageProgress: { type: 'integer' },
                              totalFeatures: { type: 'integer' },
                              completedFeatures: { type: 'integer' },
                              completionRate: { type: 'integer' },
                              totalEntries: { type: 'integer' }
                            }
                          },
                          latestActivity: {
                            type: 'object',
                            properties: {
                              date: { type: 'string', format: 'date-time' },
                              feature: { type: 'string' },
                              progress: { type: 'integer' },
                              month_year: { type: 'string', format: 'date' }
                            }
                          },
                          recentEntries: {
                            type: 'array',
                            items: { type: 'object' }
                          }
                        }
                      }
                    },
                    chartData: { type: 'object' },
                    meta: {
                      type: 'object',
                      properties: {
                        totalProjectsMatched: { type: 'integer' },
                        returned: { type: 'integer' },
                        sort_by: { type: 'string' },
                        sort_order: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      400: { description: 'Invalid query parameters' },
      401: { description: 'Unauthorized' }
    },
    security: [{ bearerAuth: [] }]
  }
}