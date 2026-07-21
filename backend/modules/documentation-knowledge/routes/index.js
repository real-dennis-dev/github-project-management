const express = require("express");

const documentationController = require("../controllers/documentation.controller");
const knowledgeBaseController = require("../controllers/knowledge-base.controller");
const documentationMiddleware = require("../middleware/documentation.middleware");

const { authenticate } = require("../../../common/middleware/auth.middleware");
const {
  validateRequest,
} = require("../../../common/middleware/validation.middleware");

const documentationSchemas = require("../validations/documentation.schema");

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// ========================
// DOCUMENTATION ROUTES
// ========================

// Get project documentation
router.get(
  "/projects/:projectId/documentation",
  documentationMiddleware.validateProjectId,
  documentationMiddleware.logDocumentationAccess,
  documentationController.getDocumentation
);

// Create documentation
router.post(
  "/projects/:projectId/documentation",
  documentationMiddleware.validateProjectId,
  documentationMiddleware.sanitizeDocumentationInput,
  validateRequest(documentationSchemas.createDocumentation),
  documentationController.createDocumentation
);

// Search documentation
router.get(
  "/projects/:projectId/documentation/search",
  documentationMiddleware.validateProjectId,
  validateRequest(documentationSchemas.searchDocumentation, "query"),
  documentationController.searchDocumentation
);

// Get documentation by ID
router.get(
  "/documentation/:id",
  documentationMiddleware.validateDocumentationId,
  documentationMiddleware.checkDocumentationAccess,
  documentationController.getDocumentationById
);

// Update documentation
router.put(
  "/documentation/:id",
  documentationMiddleware.validateDocumentationId,
  documentationMiddleware.checkDocumentationAccess,
  documentationMiddleware.sanitizeDocumentationInput,
  validateRequest(documentationSchemas.updateDocumentation),
  documentationController.updateDocumentation
);

// Delete documentation
router.delete(
  "/documentation/:id",
  documentationMiddleware.validateDocumentationId,
  documentationMiddleware.checkDocumentationAccess,
  documentationController.deleteDocumentation
);

// ========================
// KNOWLEDGE BASE ROUTES
// ========================

// Get knowledge entries
router.get("/knowledge-base", knowledgeBaseController.getKnowledgeEntries);

// Create knowledge entry
router.post(
  "/knowledge-base",
  documentationMiddleware.sanitizeDocumentationInput,
  validateRequest(documentationSchemas.createKnowledge),
  knowledgeBaseController.createKnowledgeEntry
);

// Search knowledge base
router.get(
  "/knowledge-base/search",
  validateRequest(documentationSchemas.searchKnowledge, "query"),
  knowledgeBaseController.searchKnowledge
);

// Get categories
router.get("/knowledge-base/categories", knowledgeBaseController.getCategories);

// Get knowledge entry by ID
router.get("/knowledge-base/:id", knowledgeBaseController.getKnowledgeById);

// Update knowledge entry
router.put(
  "/knowledge-base/:id",
  documentationMiddleware.sanitizeDocumentationInput,
  validateRequest(documentationSchemas.updateKnowledge),
  knowledgeBaseController.updateKnowledgeEntry
);

// Delete knowledge entry
router.delete(
  "/knowledge-base/:id",
  knowledgeBaseController.deleteKnowledgeEntry
);

module.exports = router;
