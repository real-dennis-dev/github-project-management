import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import AuthNavigator from "./AuthNavigator";
import AppNavigator from "./AppNavigator";
import { navigationTheme } from "./navigationConfig";

const Stack = createNativeStackNavigator();

/**
 * Root Navigator
 * Handles authentication flow and main navigation
 * @returns {React.ReactElement}
 */
const RootNavigator = () => {
  const { isAuthenticated, loading } = useAuth();
  const { isDarkMode } = useTheme();

  if (loading) {
    // Return loading screen or splash screen
    return null;
  }

  return (
    <NavigationContainer theme={navigationTheme(isDarkMode)}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      >
        {isAuthenticated ? (
          <Stack.Screen name="App" component={AppNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
