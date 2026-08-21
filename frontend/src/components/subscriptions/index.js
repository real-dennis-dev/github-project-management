// src/components/subscriptions/index.js

// Main exports
export { default as SubscriptionsService } from "./SubscriptionsService";
export { default as SubscriptionsRoutes } from "./SubscriptionsRoutes";
export { default as useSubscriptions } from "./useSubscriptions";

// Release Component exports
export { default as ReleaseList } from "./ReleaseList";
export { default as ReleaseForm } from "./ReleaseForm";
export { default as ReleaseDetail } from "./ReleaseDetail";
export { default as ReleaseProgress } from "./ReleaseProgress";

// Milestone Component exports
export { default as MilestoneList } from "./MilestoneList";
export { default as MilestoneForm } from "./MilestoneForm";
export { default as MilestoneDetail } from "./MilestoneDetail";
export { default as MilestoneProgress } from "./MilestoneProgress";

// Dashboard export
export { default as SubscriptionsDashboard } from "./SubscriptionsDashboard";

// Constants exports
export * from "./SubscriptionsConstants";

// Combined export object
const SubscriptionsModule = {
  SubscriptionsService: require("./SubscriptionsService").default,
  SubscriptionsRoutes: require("./SubscriptionsRoutes").default,
  useSubscriptions: require("./useSubscriptions").default,
  SubscriptionsDashboard: require("./SubscriptionsDashboard").default,
  ReleaseList: require("./ReleaseList").default,
  ReleaseForm: require("./ReleaseForm").default,
  ReleaseDetail: require("./ReleaseDetail").default,
  ReleaseProgress: require("./ReleaseProgress").default,
  MilestoneList: require("./MilestoneList").default,
  MilestoneForm: require("./MilestoneForm").default,
  MilestoneDetail: require("./MilestoneDetail").default,
  MilestoneProgress: require("./MilestoneProgress").default,
  ...require("./SubscriptionsConstants"),
};

export default SubscriptionsModule;
