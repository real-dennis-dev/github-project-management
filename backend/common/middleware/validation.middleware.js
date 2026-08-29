const Joi = require("joi");

class ValidationMiddleware {
  // Validates request body against Joi schema
  validateRequest(schema) {
    return (req, res, next) => {
      const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        const errors = error.details.map((detail) => ({
          field: detail.path.join("."),
          message: detail.message,
        }));
        return res.status(400).json({ errors });
      }

      req.body = value;
      next();
    };
  }

  // Validates query parameters
  validateQuery(schema) {
    return (req, res, next) => {
      const { error, value } = schema.validate(req.query, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        const errors = error.details.map((detail) => ({
          field: detail.path.join("."),
          message: detail.message,
        }));
        return res.status(400).json({ errors });
      }

      req.query = value;
      next();
    };
  }

  // Validates route parameters
  validateParams(schema) {
    return (req, res, next) => {
      const { error, value } = schema.validate(req.params, {
        abortEarly: false,
      });

      if (error) {
        const errors = error.details.map((detail) => ({
          field: detail.path.join("."),
          message: detail.message,
        }));
        return res.status(400).json({ errors });
      }

      req.params = value;
      next();
    };
  }

  // Common validation schemas
  schemas = {
    id: Joi.string().uuid().required(),
    projectId: Joi.string().uuid().required(),
    pagination: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      sortBy: Joi.string().optional(),
      sortOrder: Joi.string().valid("asc", "desc").default("asc"),
    }),
  };
}

const validationMiddleware = new ValidationMiddleware();

module.exports = validationMiddleware;
module.exports.validationMiddleware = validationMiddleware;
