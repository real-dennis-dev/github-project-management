const express = require("express");

const projectRoutes = require("./project.routes");
const featureRoutes = require("./feature.routes");
const bugRoutes = require("./bug.routes");

const router = express.Router();

// Mount routes
router.use("/projects", projectRoutes);
router.use("/", featureRoutes);
router.use("/", bugRoutes);

module.exports = router;
