import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";

// Create context
const SettingsContext = createContext(null);

/**
 * Settings Provider Component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.ReactElement}
 */
export const SettingsProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [settings, setSettings] = useState({
    // Theme settings
    darkMode: false,
    autoTheme: true,

    // Notification settings
    pushNotifications: true,
    emailNotifications: true,
    inAppNotifications: true,

    // Security settings
    biometricAuth: false,
    sessionTimeout: 30, // minutes

    // Data settings
    autoSync: true,
    syncInterval: 60, // minutes
    cacheEnabled: true,
    cacheSize: 50, // MB

    // Display settings
    compactView: false,
    showAnimations: true,
    fontSize: "medium", // small | medium | large

    // Language settings
    language: "en",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12h", // 12h | 24h

    // Privacy settings
    shareAnalytics: true,
    shareCrashReports: true,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  /**
   * Load settings from storage
   */
  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const storedSettings = await AsyncStorage.getItem("@app_settings");
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        setSettings((prev) => ({
          ...prev,
          ...parsedSettings,
        }));
      }
    } catch (err) {
      console.error("Error loading settings:", err);
      setError("Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Save settings to storage
   * @param {Object} newSettings - New settings to save
   */
  const saveSettings = useCallback(
    async (newSettings) => {
      try {
        const updatedSettings = { ...settings, ...newSettings };
        setSettings(updatedSettings);
        await AsyncStorage.setItem(
          "@app_settings",
          JSON.stringify(updatedSettings)
        );
        return true;
      } catch (err) {
        console.error("Error saving settings:", err);
        setError("Failed to save settings");
        return false;
      }
    },
    [settings]
  );

  /**
   * Update a single setting
   * @param {string} key - Setting key
   * @param {any} value - Setting value
   */
  const updateSetting = useCallback(
    async (key, value) => {
      const updatedSettings = { ...settings, [key]: value };
      await saveSettings(updatedSettings);
    },
    [settings, saveSettings]
  );

  /**
   * Reset settings to defaults
   */
  const resetSettings = useCallback(async () => {
    const defaultSettings = {
      darkMode: false,
      autoTheme: true,
      pushNotifications: true,
      emailNotifications: true,
      inAppNotifications: true,
      biometricAuth: false,
      sessionTimeout: 30,
      autoSync: true,
      syncInterval: 60,
      cacheEnabled: true,
      cacheSize: 50,
      compactView: false,
      showAnimations: true,
      fontSize: "medium",
      language: "en",
      dateFormat: "MM/DD/YYYY",
      timeFormat: "12h",
      shareAnalytics: true,
      shareCrashReports: true,
    };

    setSettings(defaultSettings);
    await AsyncStorage.setItem(
      "@app_settings",
      JSON.stringify(defaultSettings)
    );
  }, []);

  /**
   * Check if dark mode is enabled
   * @returns {boolean} Is dark mode
   */
  const isDarkMode = useCallback(() => {
    if (settings.autoTheme) {
      return systemColorScheme === "dark";
    }
    return settings.darkMode;
  }, [settings.darkMode, settings.autoTheme, systemColorScheme]);

  /**
   * Toggle dark mode
   */
  const toggleDarkMode = useCallback(async () => {
    const newDarkMode = !settings.darkMode;
    await updateSetting("darkMode", newDarkMode);
  }, [settings.darkMode, updateSetting]);

  /**
   * Toggle auto theme
   */
  const toggleAutoTheme = useCallback(async () => {
    const newAutoTheme = !settings.autoTheme;
    await updateSetting("autoTheme", newAutoTheme);
  }, [settings.autoTheme, updateSetting]);

  /**
   * Get current theme based on settings
   * @returns {string} Current theme
   */
  const getCurrentTheme = useCallback(() => {
    return isDarkMode() ? "dark" : "light";
  }, [isDarkMode]);

  const value = {
    settings,
    loading,
    error,
    isDarkMode: isDarkMode(),
    currentTheme: getCurrentTheme(),
    updateSetting,
    saveSettings,
    resetSettings,
    toggleDarkMode,
    toggleAutoTheme,
    reloadSettings: loadSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

/**
 * useSettings hook
 * @returns {Object} Settings context value
 */
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};

export default SettingsContext;
