// src/components/releases-milestone/index.js

// Main exports
export { default as ReleasesMilestoneService } from "./ReleasesMilestoneService";
export { default as ReleasesMilestoneRoutes } from "./ReleasesMilestoneRoutes";
export { default as useReleasesMilestone } from "./useReleasesMilestone";

// Component exports
export { default as ReleaseList } from "./ReleaseList";
export { default as ReleaseForm } from "./ReleaseForm";
export { default as ReleaseDetail } from "./ReleaseDetail";
export { default as MilestoneList } from "./MilestoneList";
export { default as MilestoneForm } from "./MilestoneForm";
export { default as MilestoneDetail } from "./MilestoneDetail";
export { default as ReleasesDashboard } from "./ReleasesDashboard";

// Constants exports
export * from "./ReleasesMilestoneConstants";

// Combined export object
const ReleasesMilestoneModule = {
  ReleasesMilestoneService: require("./ReleasesMilestoneService").default,
  ReleasesMilestoneRoutes: require("./ReleasesMilestoneRoutes").default,
  useReleasesMilestone: require("./useReleasesMilestone").default,
  ReleaseList: require("./ReleaseList").default,
  ReleaseForm: require("./ReleaseForm").default,
  ReleaseDetail: require("./ReleaseDetail").default,
  MilestoneList: require("./MilestoneList").default,
  MilestoneForm: require("./MilestoneForm").default,
  MilestoneDetail: require("./MilestoneDetail").default,
  ReleasesDashboard: require("./ReleasesDashboard").default,
  ...require("./ReleasesMilestoneConstants"),
};

export default ReleasesMilestoneModule;
