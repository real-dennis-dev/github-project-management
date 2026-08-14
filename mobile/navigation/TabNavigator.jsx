import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

// Screen imports
import HomeScreen from "../screens/main/HomeScreen";
import ProjectsScreen from "../screens/main/ProjectsScreen";
import DashboardScreen from "../screens/main/DashboardScreen";
import SettingsScreen from "../screens/main/SettingsScreen";

// Navigation components
import { ROUTES, TAB_CONFIG } from "../config/navigationConfig";
import { useTheme } from "../context/ThemeContext";

const Tab = createBottomTabNavigator();

/**
 * Tab Navigator Component
 * @returns {React.ReactElement}
 */
const TabNavigator = () => {
  const { theme, isDarkMode } = useTheme();

  // Get tab bar icon
  const getTabBarIcon = (routeName, focused, color, size) => {
    const tabConfig = Object.values(TAB_CONFIG).find(
      (tab) => tab.name === routeName
    );
    if (!tabConfig) return null;

    const iconName = focused ? tabConfig.activeIcon : tabConfig.icon;
    return <Ionicons name={iconName} size={size} color={color} />;
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) =>
          getTabBarIcon(route.name, focused, color, size),
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
        headerShown: false,
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: "600",
        },
      })}
    >
      <Tab.Screen
        name={ROUTES.TAB_HOME}
        component={HomeScreen}
        options={{
          title: "Home",
        }}
      />
      <Tab.Screen
        name={ROUTES.TAB_PROJECTS}
        component={ProjectsScreen}
        options={{
          title: "Projects",
        }}
      />
      <Tab.Screen
        name={ROUTES.TAB_DASHBOARD}
        component={DashboardScreen}
        options={{
          title: "Dashboard",
        }}
      />
      <Tab.Screen
        name={ROUTES.TAB_SETTINGS}
        component={SettingsScreen}
        options={{
          title: "Settings",
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
