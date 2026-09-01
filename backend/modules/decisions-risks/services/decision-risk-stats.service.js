const { supabase } = require("../../../common/config/supabase");
const RiskUtils = require("../utils/risk.utils");
const logger = require("../../../common/config/logger");

class DecisionRiskStatsService {
  /**
   * Get dashboard statistics and unified activity feed across all projects.
   *
   * @param {Object} options
   * @param {string} options.decisionImpact
   * @param {string} options.riskLevel
   * @param {string} options.riskStatus
   * @param {Date} options.fromDate
   * @param {Date} options.toDate
   * @param {number} options.months
   */
  async getDecisionRiskStats(options = {}) {
    try {
      const {
        decisionImpact,
        riskLevel,
        riskStatus,
        fromDate,
        toDate,
        months = 12,
      } = options;

      // --------------------------------------------------
      // DECISIONS QUERY (Removed projectId scope)
      // --------------------------------------------------

      let decisionsQuery = supabase.from("decisions").select(`
          id,
          project_id,
          title,
          impact,
          decision_date,
          created_at
        `);

      if (decisionImpact) {
        decisionsQuery = decisionsQuery.eq("impact", decisionImpact);
      }

      if (fromDate) {
        decisionsQuery = decisionsQuery.gte("decision_date", fromDate);
      }

      if (toDate) {
        decisionsQuery = decisionsQuery.lte("decision_date", toDate);
      }

      // --------------------------------------------------
      // RISKS QUERY (Removed projectId scope)
      // --------------------------------------------------

      let risksQuery = supabase.from("risks").select(`
          id,
          project_id,
          title,
          risk_level,
          status,
          created_at
        `);

      if (riskLevel) {
        risksQuery = risksQuery.eq("risk_level", riskLevel);
      }

      if (riskStatus) {
        risksQuery = risksQuery.eq("status", riskStatus);
      }

      if (fromDate) {
        risksQuery = risksQuery.gte("created_at", fromDate);
      }

      if (toDate) {
        risksQuery = risksQuery.lte("created_at", toDate);
      }

      // --------------------------------------------------
      // FETCH BOTH IN PARALLEL
      // --------------------------------------------------

      const [
        { data: decisions, error: decisionsError },
        { data: risks, error: risksError },
      ] = await Promise.all([decisionsQuery, risksQuery]);

      if (decisionsError) {
        logger.error(
          "DecisionRiskStatsService decisions query error:",
          decisionsError
        );

        throw new Error("Failed to fetch decision statistics");
      }

      if (risksError) {
        logger.error("DecisionRiskStatsService risks query error:", risksError);

        throw new Error("Failed to fetch risk statistics");
      }

      const decisionData = decisions || [];
      const riskData = risks || [];

      // --------------------------------------------------
      // DECISION STATISTICS
      // --------------------------------------------------

      const decisionsByImpact = {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0,
      };

      decisionData.forEach((decision) => {
        if (decisionsByImpact[decision.impact] !== undefined) {
          decisionsByImpact[decision.impact]++;
        }
      });

      // --------------------------------------------------
      // RISK STATISTICS
      // --------------------------------------------------

      const risksByLevel = {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0,
      };

      const risksByStatus = {
        identified: 0,
        monitoring: 0,
        mitigated: 0,
        realized: 0,
        closed: 0,
      };

      let totalRiskScore = 0;

      riskData.forEach((risk) => {
        if (risksByLevel[risk.risk_level] !== undefined) {
          risksByLevel[risk.risk_level]++;
        }

        if (risksByStatus[risk.status] !== undefined) {
          risksByStatus[risk.status]++;
        }

        totalRiskScore += RiskUtils.calculateRiskScore(risk);
      });

      const averageRiskScore =
        riskData.length > 0 ? Math.round(totalRiskScore / riskData.length) : 0;

      // --------------------------------------------------
      // OVERALL RISK LEVEL
      // --------------------------------------------------

      let overallRiskLevel = "low";

      if (risksByLevel.critical > 0) {
        overallRiskLevel = "critical";
      } else if (risksByLevel.high > 0) {
        overallRiskLevel = "high";
      } else if (averageRiskScore > 50) {
        overallRiskLevel = "medium";
      }

      // --------------------------------------------------
      // PROJECT BREAKDOWN
      // --------------------------------------------------

      const projectStats = {};

      decisionData.forEach((decision) => {
        if (!projectStats[decision.project_id]) {
          projectStats[decision.project_id] = {
            projectId: decision.project_id,
            decisions: 0,
            risks: 0,
            criticalDecisions: 0,
            criticalRisks: 0,
            highRisks: 0,
            riskScoreTotal: 0,
          };
        }

        projectStats[decision.project_id].decisions++;

        if (decision.impact === "critical") {
          projectStats[decision.project_id].criticalDecisions++;
        }
      });

      riskData.forEach((risk) => {
        if (!projectStats[risk.project_id]) {
          projectStats[risk.project_id] = {
            projectId: risk.project_id,
            decisions: 0,
            risks: 0,
            criticalDecisions: 0,
            criticalRisks: 0,
            highRisks: 0,
            riskScoreTotal: 0,
          };
        }

        const project = projectStats[risk.project_id];

        project.risks++;

        if (risk.risk_level === "critical") {
          project.criticalRisks++;
        }

        if (risk.risk_level === "high") {
          project.highRisks++;
        }

        project.riskScoreTotal += RiskUtils.calculateRiskScore(risk);
      });

      const projects = Object.values(projectStats)
        .map((project) => ({
          ...project,
          averageRiskScore:
            project.risks > 0
              ? Math.round(project.riskScoreTotal / project.risks)
              : 0,
        }))
        .sort((a, b) => {
          if (b.criticalRisks !== a.criticalRisks) {
            return b.criticalRisks - a.criticalRisks;
          }

          return b.averageRiskScore - a.averageRiskScore;
        });

      // --------------------------------------------------
      // MONTHLY TREND
      // --------------------------------------------------

      const trendMap = {};

      const getMonthKey = (date) => {
        const d = new Date(date);

        if (Number.isNaN(d.getTime())) {
          return null;
        }

        return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(
          2,
          "0"
        )}`;
      };

      decisionData.forEach((decision) => {
        const month = getMonthKey(
          decision.decision_date || decision.created_at
        );

        if (!month) return;

        if (!trendMap[month]) {
          trendMap[month] = {
            month,
            decisions: 0,
            risks: 0,
            criticalDecisions: 0,
            criticalRisks: 0,
          };
        }

        trendMap[month].decisions++;

        if (decision.impact === "critical") {
          trendMap[month].criticalDecisions++;
        }
      });

      riskData.forEach((risk) => {
        const month = getMonthKey(risk.created_at);

        if (!month) return;

        if (!trendMap[month]) {
          trendMap[month] = {
            month,
            decisions: 0,
            risks: 0,
            criticalDecisions: 0,
            criticalRisks: 0,
          };
        }

        trendMap[month].risks++;

        if (risk.risk_level === "critical") {
          trendMap[month].criticalRisks++;
        }
      });

      const trend = Object.values(trendMap)
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-months);

      // --------------------------------------------------
      // UNIFIED DECISIONS AND RISKS ITEMS LIST
      // --------------------------------------------------

      const formattedDecisions = decisionData.map((decision) => ({
        type: "decision",
        id: decision.id,
        projectId: decision.project_id,
        title: decision.title,
        severityOrImpact: decision.impact,
        status: null, // Decisions don't carry risk status
        riskScore: null,
        timestamp: decision.decision_date || decision.created_at,
        raw: decision,
      }));

      const formattedRisks = riskData.map((risk) => ({
        type: "risk",
        id: risk.id,
        projectId: risk.project_id,
        title: risk.title,
        severityOrImpact: risk.risk_level,
        status: risk.status,
        riskScore: RiskUtils.calculateRiskScore(risk),
        timestamp: risk.created_at,
        raw: risk,
      }));

      // Combined and sorted newest-first for the dashboard feed
      const items = [...formattedDecisions, ...formattedRisks].sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );

      // --------------------------------------------------
      // RETURN DASHBOARD DATA
      // --------------------------------------------------

      return {
        overview: {
          totalDecisions: decisionData.length,
          totalRisks: riskData.length,
          criticalDecisions: decisionsByImpact.critical,
          criticalRisks: risksByLevel.critical,
          highRisks: risksByLevel.high,
          activeRisks: risksByStatus.identified + risksByStatus.monitoring,
          mitigatedRisks: risksByStatus.mitigated,
          realizedRisks: risksByStatus.realized,
          closedRisks: risksByStatus.closed,
          averageRiskScore,
          overallRiskLevel,
          totalProjects: projects.length,
        },

        decisions: {
          total: decisionData.length,
          byImpact: decisionsByImpact,
        },

        risks: {
          total: riskData.length,
          byLevel: risksByLevel,
          byStatus: risksByStatus,
          averageScore: averageRiskScore,
          overallLevel: overallRiskLevel,
        },

        trends: {
          months,
          data: trend,
        },

        projects,

        // Combined activity feed for the dashboard UI
        items,

        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      logger.error(
        "DecisionRiskStatsService.getDecisionRiskStats error:",
        error
      );

      throw error;
    }
  }
}

module.exports = new DecisionRiskStatsService();
