// src/components/documentation-knowledge/index.js

export { default as DocumentationKnowledgeRoutes } from "./Routes";

// Pages
export { default as DocumentationList } from "./pages/DocumentationList";
export { default as DocumentationDetail } from "./pages/DocumentationDetail";
export { default as DocumentationCreate } from "./pages/DocumentationCreate";
export { default as DocumentationEdit } from "./pages/DocumentationEdit";
export { default as KnowledgeBaseList } from "./pages/KnowledgeBaseList";
export { default as KnowledgeBaseDetail } from "./pages/KnowledgeBaseDetail";
export { default as KnowledgeBaseCreate } from "./pages/KnowledgeBaseCreate";
export { default as KnowledgeBaseEdit } from "./pages/KnowledgeBaseEdit";
export { default as KnowledgeBaseCategories } from "./pages/KnowledgeBaseCategories";

// Components
export { default as DocumentationCard } from "./components/DocumentationCard";
export { default as KnowledgeCard } from "./components/KnowledgeCard";
export { default as DocumentationFilters } from "./components/DocumentationFilters";
export { default as KnowledgeFilters } from "./components/KnowledgeFilters";
export { default as DocumentationSearch } from "./components/DocumentationSearch";
export { default as KnowledgeSearch } from "./components/KnowledgeSearch";
export { default as DocumentViewer } from "./components/DocumentViewer";
export { default as KnowledgeViewer } from "./components/KnowledgeViewer";
export { default as TagManager } from "./components/TagManager";
export { default as VersionHistory } from "./components/VersionHistory";
export { default as CategoryBadge } from "./components/CategoryBadge";

// Services
export * from "./services/documentationService";
export * from "./services/knowledgeBaseService";

// Hooks
export { useDocumentation } from "./hooks/useDocumentation";
export { useKnowledgeBase } from "./hooks/useKnowledgeBase";

// Utils
export * from "./utils/constants";
export * from "./utils/helpers";
