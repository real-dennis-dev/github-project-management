import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { Platform } from "react-native";

// Context Providers
import { AuthProvider } from "./src/context/AuthContext";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";
import { ProjectProvider } from "./src/context/ProjectContext";
import { NotificationProvider } from "./src/context/NotificationContext";
import { SettingsProvider, useSettings } from "./src/context/SettingsContext";

// Navigation
import RootNavigator from "./src/navigation/RootNavigator";
import { NAV_THEME } from "./src/config/navigationConfig";

// Error Boundary
import ErrorBoundary from "./src/components/common/ErrorBoundary";

// Database
import databaseService from "./src/services/databaseService";

/**
 * App Content Component
 * Uses theme and settings contexts
 */
const AppContent = () => {
  const { theme, isDarkMode } = useTheme();
  const { settings } = useSettings();

  // Initialize database on app start
  React.useEffect(() => {
    const initDatabase = async () => {
      try {
        await databaseService.initDB();
        console.log("Database initialized successfully");
      } catch (error) {
        console.error("Database initialization error:", error);
      }
    };
    initDatabase();
  }, []);

  // Navigation theme
  const navTheme = {
    ...NAV_THEME.light,
    colors: {
      ...NAV_THEME.light.colors,
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.text,
      border: theme.colors.border,
    },
  };

  return (
    <SafeAreaProvider>
      <StatusBar
        style={isDarkMode ? "light" : "dark"}
        backgroundColor={theme.colors.background}
      />
      <NavigationContainer theme={navTheme}>
        <ErrorBoundary>
          <AuthProvider>
            <ProjectProvider>
              <RootNavigator />
            </ProjectProvider>
          </AuthProvider>
        </ErrorBoundary>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

/**
 * Main App Component
 */
const App = () => {
  return (
    <ErrorBoundary>
      <SettingsProvider>
        <ThemeProvider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </ThemeProvider>
      </SettingsProvider>
    </ErrorBoundary>
  );
};

export default App;
