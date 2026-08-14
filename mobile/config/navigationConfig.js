/**
 * Navigation configuration
 */

// Route names
export const ROUTES = {
  // Auth routes
  LOGIN: "Login",
  REGISTER: "Register",
  FORGOT_PASSWORD: "ForgotPassword",
  RESET_PASSWORD: "ResetPassword",

  // Main routes
  HOME: "Home",
  PROFILE: "Profile",
  SETTINGS: "Settings",
  DASHBOARD: "Dashboard",

  // Project routes
  PROJECTS: "Projects",
  PROJECT_DETAIL: "ProjectDetail",
  PROJECT_CREATE: "ProjectCreate",
  PROJECT_EDIT: "ProjectEdit",

  // Feature routes
  FEATURE_DETAIL: "FeatureDetail",
  FEATURE_CREATE: "FeatureCreate",
  FEATURE_EDIT: "FeatureEdit",

  // Bug routes
  BUG_DETAIL: "BugDetail",
  BUG_CREATE: "BugCreate",
  BUG_EDIT: "BugEdit",

  // Module routes
  GITHUB: "GitHub",
  PROGRESS: "Progress",
  DOCUMENTATION: "Documentation",
  DECISIONS: "Decisions",
  RISKS: "Risks",
  TECH_DEBT: "TechDebt",
  RELEASES: "Releases",
  MILESTONES: "Milestones",
  EXPENSES: "Expenses",
  JOURNAL: "Journal",
  AI_ASSISTANT: "AIAssistant",
  VISION_BOARD: "VisionBoard",

  // Tab routes
  TAB_HOME: "HomeTab",
  TAB_PROJECTS: "ProjectsTab",
  TAB_DASHBOARD: "DashboardTab",
  TAB_SETTINGS: "SettingsTab",
};

// Tab configuration
export const TAB_CONFIG = {
  HOME: {
    name: ROUTES.TAB_HOME,
    label: "Home",
    icon: "home-outline",
    activeIcon: "home",
  },
  PROJECTS: {
    name: ROUTES.TAB_PROJECTS,
    label: "Projects",
    icon: "folder-outline",
    activeIcon: "folder",
  },
  DASHBOARD: {
    name: ROUTES.TAB_DASHBOARD,
    label: "Dashboard",
    icon: "stats-chart-outline",
    activeIcon: "stats-chart",
  },
  SETTINGS: {
    name: ROUTES.TAB_SETTINGS,
    label: "Settings",
    icon: "settings-outline",
    activeIcon: "settings",
  },
};

// Stack configuration
export const STACK_CONFIG = {
  default: {
    headerShown: true,
    headerBackTitle: "Back",
    headerBackTitleVisible: false,
    headerTitleStyle: {
      fontWeight: "600",
    },
    cardStyle: {
      backgroundColor: "#fafafa",
    },
  },
  modal: {
    presentation: "modal",
    headerShown: true,
    cardStyle: {
      backgroundColor: "#fafafa",
    },
  },
  transparent: {
    presentation: "transparentModal",
    headerShown: false,
    cardStyle: {
      backgroundColor: "transparent",
    },
  },
};

// Navigation themes
export const NAV_THEME = {
  light: {
    colors: {
      primary: "#ea580c",
      background: "#fafafa",
      card: "#ffffff",
      text: "#171717",
      border: "#e5e5e5",
      notification: "#ea580c",
    },
  },
  dark: {
    colors: {
      primary: "#fb923c",
      background: "#171717",
      card: "#262626",
      text: "#fafafa",
      border: "#404040",
      notification: "#fb923c",
    },
  },
};

// Navigation screen options
export const SCREEN_OPTIONS = {
  // Default options for all screens
  default: {
    headerStyle: {
      backgroundColor: "#ffffff",
    },
    headerTintColor: "#171717",
    headerTitleStyle: {
      fontWeight: "600",
      fontSize: 18,
    },
    headerBackTitle: "",
    headerBackTitleVisible: false,
    headerShadowVisible: false,
  },

  // Modal options
  modal: {
    headerStyle: {
      backgroundColor: "#ffffff",
    },
    headerTintColor: "#171717",
    headerTitleStyle: {
      fontWeight: "600",
      fontSize: 18,
    },
    presentation: "modal",
    cardStyle: {
      backgroundColor: "#fafafa",
    },
  },

  // Transparent options
  transparent: {
    headerShown: false,
    presentation: "transparentModal",
    cardStyle: {
      backgroundColor: "transparent",
    },
  },
};

// Linking configuration for deep linking
export const LINKING_CONFIG = {
  prefixes: ["app://", "https://app.com"],
  config: {
    screens: {
      Login: "login",
      Register: "register",
      ForgotPassword: "forgot-password",
      ResetPassword: "reset-password/:token",
      Home: "home",
      Projects: "projects",
      ProjectDetail: "project/:id",
      FeatureDetail: "project/:projectId/feature/:id",
      BugDetail: "project/:projectId/bug/:id",
      Documentation: "project/:projectId/documentation",
      Decisions: "project/:projectId/decisions",
      Risks: "project/:projectId/risks",
      TechDebt: "project/:projectId/tech-debt",
      Releases: "project/:projectId/releases",
      Milestones: "project/:projectId/milestones",
      Expenses: "project/:projectId/expenses",
      Journal: "project/:projectId/journal",
      AIAssistant: "project/:projectId/ai",
      VisionBoard: "vision-board",
    },
  },
};

// Navigation animation configs
export const NAV_ANIMATION = {
  fade: {
    animation: "fade",
    config: {
      duration: 300,
    },
  },
  slide: {
    animation: "slide_from_right",
    config: {
      duration: 350,
    },
  },
  slide_bottom: {
    animation: "slide_from_bottom",
    config: {
      duration: 350,
    },
  },
  none: {
    animation: "none",
  },
};

export default {
  ROUTES,
  TAB_CONFIG,
  STACK_CONFIG,
  NAV_THEME,
  SCREEN_OPTIONS,
  LINKING_CONFIG,
  NAV_ANIMATION,
};
