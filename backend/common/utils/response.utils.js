class ResponseUtils {
  // Sends success response
  sendSuccess(res, data = null, message = "Success", statusCode = 200) {
    const response = {
      success: true,
      message,
      data,
    };
    return res.status(statusCode).json(response);
  }

  // Sends error response
  sendError(res, error = "Error occurred", statusCode = 500, details = null) {
    const response = {
      success: false,
      error: error.message || error,
      ...(details && { details }),
      ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
    };
    return res.status(statusCode).json(response);
  }

  // Sends paginated response
  sendPaginated(res, data, page = 1, limit = 10, total = 0) {
    const totalPages = Math.ceil(total / limit);
    const response = {
      success: true,
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
    return res.json(response);
  }

  // Formats API response
  formatResponse(data, meta = null) {
    const response = {
      data,
    };
    if (meta) {
      response.meta = meta;
    }
    return response;
  }

  // Sends created response
  sendCreated(res, data, message = "Created successfully") {
    return this.sendSuccess(res, data, message, 201);
  }

  // Sends no content response
  sendNoContent(res) {
    return res.status(204).send();
  }

  // Sends validation error response
  sendValidationError(res, errors) {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      errors,
    });
  }

  // Sends unauthorized response
  sendUnauthorized(res, message = "Unauthorized") {
    return res.status(401).json({
      success: false,
      error: message,
    });
  }

  // Sends forbidden response
  sendForbidden(res, message = "Forbidden") {
    return res.status(403).json({
      success: false,
      error: message,
    });
  }
}

module.exports = new ResponseUtils();
const stringUtils = new StringUtils();

module.exports = stringUtils;
module.exports.stringUtils = stringUtils;
