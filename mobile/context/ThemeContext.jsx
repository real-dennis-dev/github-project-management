import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";

// Create context
const ThemeContext = createContext(null);

// Theme definitions
const lightTheme = {
  colors: {
    primary: "#ea580c",
    secondary: "#c2410c",
    background: "#fafafa",
    surface: "#ffffff",
    text: "#171717",
    textSecondary: "#525252",
    border: "#e5e5e5",
    success: "#16a34a",
    error: "#dc2626",
    warning: "#f59e0b",
    info: "#3b82f6",
    card: "#ffffff",
    shadow: "rgba(0, 0, 0, 0.1)",
  },
  isDark: false,
};

const darkTheme = {
  colors: {
    primary: "#fb923c",
    secondary: "#ea580c",
    background: "#171717",
    surface: "#262626",
    text: "#fafafa",
    textSecondary: "#a3a3a3",
    border: "#404040",
    success: "#22c55e",
    error: "#ef4444",
    warning: "#f59e0b",
    info: "#3b82f6",
    card: "#262626",
    shadow: "rgba(0, 0, 0, 0.3)",
  },
  isDark: true,
};

/**
 * Theme Provider Component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.ReactElement}
 */
export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === "dark");

  useEffect(() => {
    loadThemePreference();
  }, []);

  useEffect(() => {
    saveThemePreference(isDarkMode);
  }, [isDarkMode]);

  const loadThemePreference = async () => {
    try {
      const themePreference = await AsyncStorage.getItem("@theme_preference");
      if (themePreference !== null) {
        setIsDarkMode(themePreference === "dark");
      } else {
        // Use system preference
        setIsDarkMode(systemColorScheme === "dark");
      }
    } catch (error) {
      console.error("Theme load error:", error);
    }
  };

  const saveThemePreference = async (darkMode) => {
    try {
      await AsyncStorage.setItem(
        "@theme_preference",
        darkMode ? "dark" : "light"
      );
    } catch (error) {
      console.error("Theme save error:", error);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  const value = {
    theme,
    isDarkMode,
    toggleTheme,
    setDarkMode: setIsDarkMode,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

/**
 * useTheme hook
 * @returns {Object} Theme context value
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export default ThemeContext;
