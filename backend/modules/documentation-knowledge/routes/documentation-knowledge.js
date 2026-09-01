const express = require("express");

const DocumentationController = require("../controllers/documentation.controller");
const KnowledgeBaseController = require("../controllers/knowledge-base.controller");
const DocumentationMiddleware = require("../middleware/documentation.middleware");

const AuthMiddleware = require("../../../common/middleware/auth.middleware");
const ValidationMiddleware = require("../../../common/middleware/validation.middleware");

const documentationSchemas = require("../validations/documentation.schema");

const router = express.Router();

// Apply authentication to all routes
router.use(AuthMiddleware.authenticate);

// ========================
// DOCUMENTATION ROUTES
// ========================

// Get project documentation
router.get(
  "/projects/:projectId/documentation",
  DocumentationMiddleware.validateProjectId,
  DocumentationMiddleware.logDocumentationAccess,
  DocumentationController.getDocumentation
);

// Create documentation
router.post(
  "/projects/:projectId/documentation",
  DocumentationMiddleware.validateProjectId,
  DocumentationMiddleware.sanitizeDocumentationInput,
  ValidationMiddleware.validateRequest(
    documentationSchemas.createDocumentation
  ),
  DocumentationController.createDocumentation
);

// Search documentation
router.get(
  "/projects/:projectId/documentation/search",
  DocumentationMiddleware.validateProjectId,
  ValidationMiddleware.validateRequest(
    documentationSchemas.searchDocumentation,
    "query"
  ),
  DocumentationController.searchDocumentation
);

// Get documentation by ID
router.get(
  "/documentation/:id",
  DocumentationMiddleware.validateDocumentationId,
  DocumentationMiddleware.checkDocumentationAccess,
  DocumentationController.getDocumentationById
);

// Update documentation
router.put(
  "/documentation/:id",
  DocumentationMiddleware.validateDocumentationId,
  DocumentationMiddleware.checkDocumentationAccess,
  DocumentationMiddleware.sanitizeDocumentationInput,
  ValidationMiddleware.validateRequest(
    documentationSchemas.updateDocumentation
  ),
  DocumentationController.updateDocumentation
);

// Delete documentation
router.delete(
  "/documentation/:id",
  DocumentationMiddleware.validateDocumentationId,
  DocumentationMiddleware.checkDocumentationAccess,
  DocumentationController.deleteDocumentation
);

// ========================
// KNOWLEDGE BASE ROUTES
// ========================

// Get knowledge entries
router.get("/knowledge-base", KnowledgeBaseController.getKnowledgeEntries);

// Create knowledge entry
router.post(
  "/knowledge-base",
  DocumentationMiddleware.sanitizeDocumentationInput,
  ValidationMiddleware.validateRequest(documentationSchemas.createKnowledge),
  KnowledgeBaseController.createKnowledgeEntry
);

// Search knowledge base
router.get(
  "/knowledge-base/search",
  ValidationMiddleware.validateRequest(
    documentationSchemas.searchKnowledge,
    "query"
  ),
  KnowledgeBaseController.searchKnowledge
);

// Get categories
router.get("/knowledge-base/categories", KnowledgeBaseController.getCategories);

// Get knowledge entry by ID
router.get("/knowledge-base/:id", KnowledgeBaseController.getKnowledgeById);

// Update knowledge entry
router.put(
  "/knowledge-base/:id",
  DocumentationMiddleware.sanitizeDocumentationInput,
  ValidationMiddleware.validateRequest(documentationSchemas.updateKnowledge),
  KnowledgeBaseController.updateKnowledgeEntry
);

// Delete knowledge entry
router.delete(
  "/knowledge-base/:id",
  KnowledgeBaseController.deleteKnowledgeEntry
);

router.get(
  "/documentation-knowledge/stats",
  validateRequest(documentationSchemas.getDocumentationKnowledgeStats, "query"),
  documentationMiddleware.logDocumentationAccess, // optional
  documentationController.getDocumentationKnowledgeStats
);

module.exports = router;
