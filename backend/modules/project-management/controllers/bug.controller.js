const BugService = require("../services/bug.service");
const ResponseUtils = require("../../../common/utils/response.utils");
const { Logger } = require("../../../common/config/logger");

const bugService = new BugService();
const response = ResponseUtils;
const logger = Logger;

class BugController {
  // controller methods here

  /**
   * GET /api/projects/:projectId/bugs
   * Get bugs for a project
   */
  async getBugs(req, res, next) {
    try {
      const { projectId } = req.params;
      const filters = {
        status: req.query.status,
        priority: req.query.priority,
        assigned_to: req.query.assigned_to,
        page: req.query.page,
        limit: req.query.limit,
      };

      const result = await bugService.getProjectBugs(projectId, filters);

      logger.info(
        `Fetched ${result.data.length} bugs for project ${projectId}`,
        {
          userId: req.user?.id,
          projectId,
          filters,
        }
      );

      return response.sendSuccess(
        res,
        result.data,
        "Bugs fetched successfully",
        200,
        {
          pagination: result.pagination,
        }
      );
    } catch (error) {
      logger.error("Error in getBugs:", error);
      next(error);
    }
  }

  /**
   * GET /api/bugs/:id
   * Get bug by ID
   */
  async getBugById(req, res, next) {
    try {
      const { id } = req.params;
      const bug = await bugService.getBugById(id);

      logger.info(`Fetched bug: ${id}`, {
        userId: req.user?.id,
        bugId: id,
      });

      return response.sendSuccess(res, bug, "Bug fetched successfully");
    } catch (error) {
      logger.error(`Error in getBugById for ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * POST /api/projects/:projectId/bugs
   * Create a new bug
   */
  async createBug(req, res, next) {
    try {
      const { projectId } = req.params;
      const bugData = req.body;
      const bug = await bugService.createBug(projectId, bugData);

      logger.info(`Created bug: ${bug.id} for project ${projectId}`, {
        userId: req.user?.id,
        projectId,
        bugId: bug.id,
      });

      return response.sendCreated(res, bug, "Bug created successfully");
    } catch (error) {
      logger.error("Error in createBug:", error);
      next(error);
    }
  }

  /**
   * PUT /api/bugs/:id
   * Update bug by ID
   */
  async updateBug(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const bug = await bugService.updateBug(id, updateData);

      logger.info(`Updated bug: ${id}`, {
        userId: req.user?.id,
        bugId: id,
        updates: Object.keys(updateData),
      });

      return response.sendSuccess(res, bug, "Bug updated successfully");
    } catch (error) {
      logger.error(`Error in updateBug for ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * PATCH /api/bugs/:id/status
   * Update bug status
   */
  async updateBugStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return response.sendValidationError(res, ["Status is required"]);
      }

      const bug = await bugService.updateBugStatus(id, status);

      logger.info(`Updated bug status: ${id} -> ${status}`, {
        userId: req.user?.id,
        bugId: id,
        newStatus: status,
      });

      return response.sendSuccess(res, bug, "Bug status updated successfully");
    } catch (error) {
      logger.error(`Error in updateBugStatus for ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * PATCH /api/bugs/:id/assign
   * Assign bug to a person
   */
  async assignBug(req, res, next) {
    try {
      const { id } = req.params;
      const { assignee } = req.body;

      if (!assignee) {
        return response.sendValidationError(res, ["Assignee is required"]);
      }

      const bug = await bugService.assignBug(id, assignee);

      logger.info(`Assigned bug ${id} to ${assignee}`, {
        userId: req.user?.id,
        bugId: id,
        assignee,
      });

      return response.sendSuccess(res, bug, "Bug assigned successfully");
    } catch (error) {
      logger.error(`Error in assignBug for ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * PATCH /api/bugs/:id/resolve
   * Resolve bug
   */
  async resolveBug(req, res, next) {
    try {
      const { id } = req.params;
      const { resolution } = req.body;

      if (!resolution) {
        return response.sendValidationError(res, ["Resolution is required"]);
      }

      const bug = await bugService.resolveBug(id, resolution);

      logger.info(`Resolved bug: ${id}`, {
        userId: req.user?.id,
        bugId: id,
        resolution,
      });

      return response.sendSuccess(res, bug, "Bug resolved successfully");
    } catch (error) {
      logger.error(`Error in resolveBug for ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * DELETE /api/bugs/:id
   * Delete bug by ID
   */
  async deleteBug(req, res, next) {
    try {
      const { id } = req.params;
      const result = await bugService.deleteBug(id);

      logger.info(`Deleted bug: ${id}`, {
        userId: req.user?.id,
        bugId: id,
      });

      return response.sendSuccess(res, result, result.message);
    } catch (error) {
      logger.error(`Error in deleteBug for ${req.params.id}:`, error);
      next(error);
    }
  }
}
module.exports = {
  BugController,
};
