import { DefaultTheme, DarkTheme } from "@react-navigation/native";

/**
 * Navigation theme configuration
 * @param {boolean} isDarkMode - Dark mode flag
 * @returns {Object} Navigation theme
 */
export const navigationTheme = (isDarkMode) => {
  const theme = isDarkMode ? DarkTheme : DefaultTheme;

  return {
    ...theme,
    colors: {
      ...theme.colors,
      primary: "#ea580c",
      background: isDarkMode ? "#171717" : "#fafafa",
      card: isDarkMode ? "#262626" : "#ffffff",
      text: isDarkMode ? "#fafafa" : "#171717",
      border: isDarkMode ? "#404040" : "#e5e5e5",
      notification: "#ea580c",
    },
  };
};

/**
 * Screen options for common navigators
 */
export const screenOptions = {
  headerStyle: {
    backgroundColor: "#ffffff",
  },
  headerTintColor: "#171717",
  headerTitleStyle: {
    fontWeight: "600",
  },
  headerShadowVisible: false,
  headerBackTitleVisible: false,
};

/**
 * Tab navigation options
 */
export const tabOptions = {
  activeTintColor: "#ea580c",
  inactiveTintColor: "#737373",
  labelStyle: {
    fontSize: 12,
    fontWeight: "500",
  },
  style: {
    backgroundColor: "#ffffff",
    borderTopColor: "#e5e5e5",
    paddingBottom: 5,
    paddingTop: 5,
    height: 60,
  },
};
