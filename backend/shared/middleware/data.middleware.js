class DataMiddleware {
  // Adds pagination to queries
  pagination(req, res, next) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Add pagination to request
    req.pagination = {
      page,
      limit,
      offset,
      skip: offset,
      take: limit,
    };

    // Store original query
    const originalQuery = req.query;
    req.query = {
      ...originalQuery,
      limit,
      offset,
    };

    next();
  }

  // Parses filter parameters
  filterParser(req, res, next) {
    const filters = {};
    const excludedParams = ["page", "limit", "sortBy", "sortOrder", "search"];

    for (const [key, value] of Object.entries(req.query)) {
      if (!excludedParams.includes(key) && value !== undefined) {
        // Handle array filters (e.g., status: [active, paused])
        if (value.includes(",")) {
          filters[key] = value.split(",").map((v) => v.trim());
        } else {
          filters[key] = value;
        }
      }
    }

    req.filters = filters;
    next();
  }

  // Parses sort parameters
  sortParser(req, res, next) {
    const sortBy = req.query.sortBy || "created_at";
    const sortOrder = req.query.sortOrder || "desc";
    const sortFields = {};

    // Handle multiple sort fields
    if (sortBy.includes(",")) {
      const fields = sortBy.split(",");
      const orders = sortOrder.split(",");
      fields.forEach((field, index) => {
        sortFields[field.trim()] = orders[index]?.trim() || "asc";
      });
    } else {
      sortFields[sortBy] = sortOrder;
    }

    req.sort = sortFields;
    next();
  }

  // Extracts fields to select
  fieldSelector(req, res, next) {
    const fields = req.query.fields;
    if (fields) {
      req.selectedFields = fields.split(",").map((f) => f.trim());
    } else {
      req.selectedFields = ["*"];
    }
    next();
  }
}

module.exports = new DataMiddleware();
