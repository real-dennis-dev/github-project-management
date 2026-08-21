// src/components/project-management/index.js

// Main exports
export { default as ProjectService } from "./ProjectService";
export { default as ProjectRoutes } from "./ProjectRoutes";
export { default as useProjects } from "./useProjects";

// Component exports
export { default as ProjectList } from "./ProjectList";
export { default as ProjectDetail } from "./ProjectDetail";
export { default as ProjectForm } from "./ProjectForm";
export { default as ProjectBoard } from "./ProjectBoard";
export { default as ProjectDashboard } from "./ProjectDashboard";
export { default as FeatureForm } from "./FeatureForm";
export { default as BugForm } from "./BugForm";
export { default as SubtaskList } from "./SubtaskList";

// Constants exports
export * from "./ProjectConstants";

// Combined export object
const ProjectManagementModule = {
  ProjectService: require("./ProjectService").default,
  ProjectRoutes: require("./ProjectRoutes").default,
  useProjects: require("./useProjects").default,
  ProjectList: require("./ProjectList").default,
  ProjectDetail: require("./ProjectDetail").default,
  ProjectForm: require("./ProjectForm").default,
  ProjectBoard: require("./ProjectBoard").default,
  ProjectDashboard: require("./ProjectDashboard").default,
  FeatureForm: require("./FeatureForm").default,
  BugForm: require("./BugForm").default,
  SubtaskList: require("./SubtaskList").default,
  ...require("./ProjectConstants"),
};

export default ProjectManagementModule;
