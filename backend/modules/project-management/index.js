import express from "express";
import projectRoutes from "./project.routes.js";
import featureRoutes from "./feature.routes.js";
import bugRoutes from "./bug.routes.js";

const router = express.Router();

// Mount routes
router.use("/projects", projectRoutes);
router.use("/", featureRoutes);
router.use("/", bugRoutes);

export default router;
