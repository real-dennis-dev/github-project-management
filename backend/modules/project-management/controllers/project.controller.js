const { ProjectService } = require("../services/project.service");
const { ResponseUtils } = require("../../../common/utils/response.utils");
const { Logger } = require("../../../common/config/logger");

const projectService = new ProjectService();
const response = new ResponseUtils();
const logger = Logger;

class ProjectController {
  /**
   * GET /api/projects
   * Get all projects with filters
   */
  async getAllProjects(req, res, next) {
    try {
      const params = {
        status: req.query.status,
        priority: req.query.priority,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        search: req.query.search,
        page: req.query.page,
        limit: req.query.limit,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder,
      };

      const result = await projectService.getAllProjects(params);

      logger.info(`Fetched ${result.data.length} projects`, {
        userId: req.user?.id,
        filters: params,
      });

      return response.sendSuccess(
        res,
        result.data,
        "Projects fetched successfully",
        200,
        {
          pagination: result.pagination,
        }
      );
    } catch (error) {
      logger.error("Error in getAllProjects:", error);
      next(error);
    }
  }

  /**
   * GET /api/projects/:id
   * Get project by ID with relations
   */
  async getProjectById(req, res, next) {
    try {
      const { id } = req.params;
      const project = await projectService.getProjectById(id);

      logger.info(`Fetched project: ${id}`, {
        userId: req.user?.id,
        projectId: id,
      });

      return response.sendSuccess(res, project, "Project fetched successfully");
    } catch (error) {
      logger.error(`Error in getProjectById for ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * POST /api/projects
   * Create a new project
   */
  async createProject(req, res, next) {
    try {
      const projectData = req.body;
      const project = await projectService.createProject(projectData);

      logger.info(`Created project: ${project.id}`, {
        userId: req.user?.id,
        projectId: project.id,
        projectName: project.name,
      });

      return response.sendCreated(res, project, "Project created successfully");
    } catch (error) {
      logger.error("Error in createProject:", error);
      next(error);
    }
  }

  /**
   * PUT /api/projects/:id
   * Update project by ID
   */
  async updateProject(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const project = await projectService.updateProject(id, updateData);

      logger.info(`Updated project: ${id}`, {
        userId: req.user?.id,
        projectId: id,
        updates: Object.keys(updateData),
      });

      return response.sendSuccess(res, project, "Project updated successfully");
    } catch (error) {
      logger.error(`Error in updateProject for ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * PATCH /api/projects/:id/status
   * Update project status
   */
  async updateProjectStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return response.sendValidationError(res, ["Status is required"]);
      }

      const project = await projectService.updateProjectStatus(id, status);

      logger.info(`Updated project status: ${id} -> ${status}`, {
        userId: req.user?.id,
        projectId: id,
        newStatus: status,
      });

      return response.sendSuccess(
        res,
        project,
        "Project status updated successfully"
      );
    } catch (error) {
      logger.error(`Error in updateProjectStatus for ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * DELETE /api/projects/:id
   * Delete project by ID
   */
  async deleteProject(req, res, next) {
    try {
      const { id } = req.params;
      const { hardDelete } = req.query;

      const result = await projectService.deleteProject(
        id,
        hardDelete === "true"
      );

      logger.info(`Deleted project: ${id}`, {
        userId: req.user?.id,
        projectId: id,
        hardDelete: hardDelete === "true",
      });

      return response.sendSuccess(res, result, result.message);
    } catch (error) {
      logger.error(`Error in deleteProject for ${req.params.id}:`, error);
      next(error);
    }
  }

  /**
   * GET /api/projects/:id/analytics
   * Get project analytics
   */
  async getProjectAnalytics(req, res, next) {
    try {
      const { id } = req.params;
      const analytics = await projectService.getProjectAnalytics(id);

      logger.info(`Fetched analytics for project: ${id}`, {
        userId: req.user?.id,
        projectId: id,
      });

      return response.sendSuccess(
        res,
        analytics,
        "Project analytics fetched successfully"
      );
    } catch (error) {
      logger.error(`Error in getProjectAnalytics for ${req.params.id}:`, error);
      next(error);
    }
  }
}

module.exports = {
  ProjectController,
};
