// src/components/process/index.js

// Main exports
export { default as ProcessService } from "./ProcessService";
export { default as ProcessRoutes } from "./ProcessRoutes";
export { default as useProcess } from "./useProcess";

// Component exports
export { default as ProgressDashboard } from "./ProgressDashboard";
export { default as TimelineList } from "./TimelineList";
export { default as TimelineForm } from "./TimelineForm";
export { default as TimelineDetail } from "./TimelineDetail";
export { default as ProgressOverview } from "./ProgressOverview";
export { default as ProgressReport } from "./ProgressReport";

// Constants exports
export * from "./ProcessConstants";

// Combined export object
const ProcessModule = {
  ProcessService: require("./ProcessService").default,
  ProcessRoutes: require("./ProcessRoutes").default,
  useProcess: require("./useProcess").default,
  ProgressDashboard: require("./ProgressDashboard").default,
  TimelineList: require("./TimelineList").default,
  TimelineForm: require("./TimelineForm").default,
  TimelineDetail: require("./TimelineDetail").default,
  ProgressOverview: require("./ProgressOverview").default,
  ProgressReport: require("./ProgressReport").default,
  ...require("./ProcessConstants"),
};

export default ProcessModule;
