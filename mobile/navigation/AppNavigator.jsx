import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

// Import screens
import HomeScreen from "../screens/main/HomeScreen";
import ProfileScreen from "../screens/main/ProfileScreen";
import SettingsScreen from "../screens/main/SettingsScreen";
import ProjectListScreen from "../screens/project/ProjectListScreen";
import ProjectDetailScreen from "../screens/project/ProjectDetailScreen";
import ProjectCreateScreen from "../screens/project/ProjectCreateScreen";
import ProjectEditScreen from "../screens/project/ProjectEditScreen";
import DashboardScreen from "../screens/project/DashboardScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

/**
 * Project Stack Navigator
 * @returns {React.ReactElement}
 */
const ProjectStack = () => {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.text,
        headerShadowVisible: false,
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="ProjectList"
        component={ProjectListScreen}
        options={{ title: "Projects" }}
      />
      <Stack.Screen
        name="ProjectDetail"
        component={ProjectDetailScreen}
        options={{ title: "Project Details" }}
      />
      <Stack.Screen
        name="ProjectCreate"
        component={ProjectCreateScreen}
        options={{ title: "Create Project" }}
      />
      <Stack.Screen
        name="ProjectEdit"
        component={ProjectEditScreen}
        options={{ title: "Edit Project" }}
      />
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: "Dashboard" }}
      />
    </Stack.Navigator>
  );
};

/**
 * App Navigator with Bottom Tabs
 * @returns {React.ReactElement}
 */
const AppNavigator = () => {
  const { theme, isDarkMode } = useTheme();

  const tabBarOptions = {
    activeTintColor: theme.colors.primary,
    inactiveTintColor: theme.colors.textSecondary,
    style: {
      backgroundColor: theme.colors.surface,
      borderTopColor: theme.colors.border,
      paddingBottom: 5,
      paddingTop: 5,
      height: 60,
    },
    labelStyle: {
      fontSize: 12,
      fontWeight: "500",
    },
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Projects") {
            iconName = focused ? "folder" : "folder-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          } else if (route.name === "Settings") {
            iconName = focused ? "settings" : "settings-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: tabBarOptions.activeTintColor,
        tabBarInactiveTintColor: tabBarOptions.inactiveTintColor,
        tabBarStyle: tabBarOptions.style,
        tabBarLabelStyle: tabBarOptions.labelStyle,
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Projects" component={ProjectStack} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

export default AppNavigator;
