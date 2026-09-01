openapi: 3.0.3
info:
  title: Decision & Risk Statistics API
  version: 1.0.0
  description: API for retrieving decision and risk dashboard statistics across projects.

paths:
  /api/decisions-risks/stats:
    get:
      summary: Get decisions and risks dashboard statistics
      description: >
        Returns aggregated decision and risk statistics across
        all projects available to the authenticated user.
      tags:
        - Decisions & Risks Dashboard
      security:
        - bearerAuth: []
      parameters:
        - in: query
          name: projectId
          required: false
          schema:
            type: string
            format: uuid
          description: Optional project filter
        - in: query
          name: decisionImpact
          required: false
          schema:
            type: string
            enum:
              - low
              - medium
              - high
              - critical
          description: Filter decisions by impact
        - in: query
          name: riskLevel
          required: false
          schema:
            type: string
            enum:
              - low
              - medium
              - high
              - critical
          description: Filter risks by risk level
        - in: query
          name: riskStatus
          required: false
          schema:
            type: string
            enum:
              - identified
              - monitoring
              - mitigated
              - realized
              - closed
          description: Filter risks by status
        - in: query
          name: fromDate
          required: false
          schema:
            type: string
            format: date-time
          description: Start date for dashboard statistics (ISO 8601 format)
        - in: query
          name: toDate
          required: false
          schema:
            type: string
            format: date-time
          description: End date for dashboard statistics (ISO 8601 format)
        - in: query
          name: months
          required: false
          schema:
            type: integer
            minimum: 1
            maximum: 24
            default: 12
          description: Number of months to return in trend data

      responses:
        '200':
          description: Decision and risk dashboard statistics
          content:
            application/json:
              schema:
                type: object
                required:
                  - success
                  - message
                  - data
                properties:
                  success:
                    type: boolean
                    example: true
                  message:
                    type: string
                    example: Decision and risk statistics retrieved successfully
                  data:
                    $ref: '#/components/schemas/DecisionRiskDashboardStats'
        '400':
          description: Validation error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
              examples:
                dateOrderError:
                  value:
                    success: false
                    message: "fromDate must be before or equal to toDate"
        '401':
          description: Unauthorized
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '403':
          description: Forbidden
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '500':
          description: Internal server error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    DecisionRiskDashboardStats:
      type: object
      required:
        - overview
        - decisions
        - risks
        - trends
        - projects
        - items
        - generatedAt
      properties:
        overview:
          type: object
          required:
            - totalDecisions
            - totalRisks
            - criticalDecisions
            - criticalRisks
            - highRisks
            - activeRisks
            - mitigatedRisks
            - realizedRisks
            - closedRisks
            - averageRiskScore
            - overallRiskLevel
            - totalProjects
          properties:
            totalDecisions:
              type: integer
              example: 45
            totalRisks:
              type: integer
              example: 30
            criticalDecisions:
              type: integer
              example: 5
            criticalRisks:
              type: integer
              example: 2
            highRisks:
              type: integer
              example: 8
            activeRisks:
              type: integer
              description: Sum of identified and monitoring risks
              example: 12
            mitigatedRisks:
              type: integer
              example: 10
            realizedRisks:
              type: integer
              example: 3
            closedRisks:
              type: integer
              example: 5
            averageRiskScore:
              type: integer
              example: 42
            overallRiskLevel:
              type: string
              enum: [low, medium, high, critical]
              example: high
            totalProjects:
              type: integer
              example: 6

        decisions:
          type: object
          required:
            - total
            - byImpact
          properties:
            total:
              type: integer
              example: 45
            byImpact:
              type: object
              required:
                - low
                - medium
                - high
                - critical
              properties:
                low:
                  type: integer
                  example: 15
                medium:
                  type: integer
                  example: 15
                high:
                  type: integer
                  example: 10
                critical:
                  type: integer
                  example: 5

        risks:
          type: object
          required:
            - total
            - byLevel
            - byStatus
            - averageScore
            - overallLevel
          properties:
            total:
              type: integer
              example: 30
            byLevel:
              type: object
              required:
                - low
                - medium
                - high
                - critical
              properties:
                low:
                  type: integer
                  example: 8
                medium:
                  type: integer
                  example: 12
                high:
                  type: integer
                  example: 8
                critical:
                  type: integer
                  example: 2
            byStatus:
              type: object
              required:
                - identified
                - monitoring
                - mitigated
                - realized
                - closed
              properties:
                identified:
                  type: integer
                  example: 7
                monitoring:
                  type: integer
                  example: 5
                mitigated:
                  type: integer
                  example: 10
                realized:
                  type: integer
                  example: 3
                closed:
                  type: integer
                  example: 5
            averageScore:
              type: integer
              example: 42
            overallLevel:
              type: string
              enum: [low, medium, high, critical]
              example: high

        trends:
          type: object
          required:
            - months
            - data
          properties:
            months:
              type: integer
              example: 12
            data:
              type: array
              items:
                $ref: '#/components/schemas/TrendItem'

        projects:
          type: array
          items:
            $ref: '#/components/schemas/ProjectStat'

        items:
          type: array
          description: Combined activity feed sorted by timestamp descending
          items:
            oneOf:
              - $ref: '#/components/schemas/DecisionFeedItem'
              - $ref: '#/components/schemas/RiskFeedItem'

        generatedAt:
          type: string
          format: date-time
          example: '2026-03-30T10:15:30.000Z'

    TrendItem:
      type: object
      required:
        - month
        - decisions
        - risks
        - criticalDecisions
        - criticalRisks
      properties:
        month:
          type: string
          pattern: '^\d{4}-\d{2}$'
          example: '2026-02'
        decisions:
          type: integer
          example: 4
        risks:
          type: integer
          example: 3
        criticalDecisions:
          type: integer
          example: 1
        criticalRisks:
          type: integer
          example: 0

    ProjectStat:
      type: object
      required:
        - projectId
        - decisions
        - risks
        - criticalDecisions
        - criticalRisks
        - highRisks
        - riskScoreTotal
        - averageRiskScore
      properties:
        projectId:
          type: string
          format: uuid
          example: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'
        decisions:
          type: integer
          example: 10
        risks:
          type: integer
          example: 5
        criticalDecisions:
          type: integer
          example: 2
        criticalRisks:
          type: integer
          example: 1
        highRisks:
          type: integer
          example: 2
        riskScoreTotal:
          type: integer
          example: 210
        averageRiskScore:
          type: integer
          example: 42

    DecisionFeedItem:
      type: object
      required:
        - type
        - id
        - projectId
        - title
        - severityOrImpact
        - status
        - riskScore
        - timestamp
        - raw
      properties:
        type:
          type: string
          enum: [decision]
          example: decision
        id:
          type: string
          format: uuid
        projectId:
          type: string
          format: uuid
        title:
          type: string
        severityOrImpact:
          type: string
          enum: [low, medium, high, critical]
        status:
          type: 'null'
          nullable: true
          default: null
        riskScore:
          type: 'null'
          nullable: true
          default: null
        timestamp:
          type: string
          format: date-time
        raw:
          type: object
          description: Raw database record from decisions table

    RiskFeedItem:
      type: object
      required:
        - type
        - id
        - projectId
        - title
        - severityOrImpact
        - status
        - riskScore
        - timestamp
        - raw
      properties:
        type:
          type: string
          enum: [risk]
          example: risk
        id:
          type: string
          format: uuid
        projectId:
          type: string
          format: uuid
        title:
          type: string
        severityOrImpact:
          type: string
          enum: [low, medium, high, critical]
        status:
          type: string
          enum: [identified, monitoring, mitigated, realized, closed]
        riskScore:
          type: integer
          example: 65
        timestamp:
          type: string
          format: date-time
        raw:
          type: object
          description: Raw database record from risks table

    ErrorResponse:
      type: object
      required:
        - success
        - message
      properties:
        success:
          type: boolean
          example: false
        message:
          type: string
          example: An error occurred processing your request