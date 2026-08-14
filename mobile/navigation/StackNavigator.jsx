import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { useTheme } from "../context/ThemeContext";

// Screen imports
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import ForgotPasswordScreen from "../screens/auth/ForgotPasswordScreen";
import ResetPasswordScreen from "../screens/auth/ResetPasswordScreen";
import ProjectDetailScreen from "../screens/project/ProjectDetailScreen";
import ProjectCreateScreen from "../screens/project/ProjectCreateScreen";
import ProjectEditScreen from "../screens/project/ProjectEditScreen";
import FeatureDetailScreen from "../screens/project/FeatureDetailScreen";
import BugDetailScreen from "../screens/project/BugDetailScreen";

// Navigation components
import TabNavigator from "./TabNavigator";
import {
  ROUTES,
  STACK_CONFIG,
  SCREEN_OPTIONS,
} from "../config/navigationConfig";

const Stack = createStackNavigator();

/**
 * Main App Stack Navigator
 * @returns {React.ReactElement}
 */
export const AppStack = () => {
  const { theme, isDarkMode } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        ...SCREEN_OPTIONS.default,
        headerStyle: {
          backgroundColor: theme.colors.surface,
          borderBottomColor: theme.colors.border,
          borderBottomWidth: 1,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: "600",
          fontSize: 18,
        },
        cardStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name={ROUTES.PROJECT_DETAIL}
        component={ProjectDetailScreen}
        options={{
          title: "Project Details",
        }}
      />
      <Stack.Screen
        name={ROUTES.PROJECT_CREATE}
        component={ProjectCreateScreen}
        options={{
          title: "Create Project",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name={ROUTES.PROJECT_EDIT}
        component={ProjectEditScreen}
        options={{
          title: "Edit Project",
        }}
      />
      <Stack.Screen
        name={ROUTES.FEATURE_DETAIL}
        component={FeatureDetailScreen}
        options={{
          title: "Feature Details",
        }}
      />
      <Stack.Screen
        name={ROUTES.BUG_DETAIL}
        component={BugDetailScreen}
        options={{
          title: "Bug Details",
        }}
      />
    </Stack.Navigator>
  );
};

/**
 * Auth Stack Navigator
 * @returns {React.ReactElement}
 */
export const AuthStack = () => {
  const { theme, isDarkMode } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        ...SCREEN_OPTIONS.default,
        headerStyle: {
          backgroundColor: theme.colors.surface,
          borderBottomColor: theme.colors.border,
          borderBottomWidth: 1,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: "600",
          fontSize: 18,
        },
        cardStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Stack.Screen
        name={ROUTES.LOGIN}
        component={LoginScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name={ROUTES.REGISTER}
        component={RegisterScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name={ROUTES.FORGOT_PASSWORD}
        component={ForgotPasswordScreen}
        options={{
          title: "Forgot Password",
        }}
      />
      <Stack.Screen
        name={ROUTES.RESET_PASSWORD}
        component={ResetPasswordScreen}
        options={{
          title: "Reset Password",
        }}
      />
    </Stack.Navigator>
  );
};
