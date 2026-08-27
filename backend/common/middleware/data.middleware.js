class DataMiddleware {
  // Adds pagination to queries
  pagination(req, res, next) {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 10, 1),
      100
    );

    const offset = (page - 1) * limit;

    req.pagination = {
      page,
      limit,
      offset,
    };

    next();
  }

  // Parses filter parameters
  filterParser(req, res, next) {
    const filters = {};

    const excludedParams = new Set([
      "page",
      "limit",
      "sortBy",
      "sortOrder",
      "search",
      "fields",
    ]);

    for (const [key, value] of Object.entries(req.query)) {
      if (excludedParams.has(key) || value === undefined) {
        continue;
      }

      if (typeof value === "string" && value.includes(",")) {
        filters[key] = value
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean);
      } else {
        filters[key] = value;
      }
    }

    req.filters = filters;

    next();
  }

  // Parses sort parameters
  sortParser(req, res, next) {
    const sortBy = req.query.sortBy || "created_at";
    const sortOrder = String(req.query.sortOrder || "desc").toLowerCase();

    const sortFields = {};

    if (typeof sortBy === "string" && sortBy.includes(",")) {
      const fields = sortBy.split(",");
      const orders = sortOrder.split(",");

      fields.forEach((field, index) => {
        sortFields[field.trim()] = orders[index]?.trim().toLowerCase() || "asc";
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
const stringUtils = new StringUtils();

module.exports = stringUtils;
module.exports.stringUtils = stringUtils;
