import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";

/**
 * Icon Component - Wrapper for Ionicons with theme support
 * @param {Object} props
 * @param {string} props.name - Icon name from Ionicons
 * @param {number} props.size - Icon size
 * @param {string} props.color - Icon color (overrides theme)
 * @param {string} props.variant - primary | secondary | text | textSecondary | success | error | warning
 * @param {Object} props.style - Custom styles
 * @param {Function} props.onPress - Press handler
 * @param {string} props.testID - Test ID for testing
 * @returns {React.ReactElement}
 */
const Icon = ({
  name,
  size = 24,
  color = null,
  variant = "text",
  style = {},
  onPress = null,
  testID = "",
}) => {
  const { theme } = useTheme();

  // Get color based on variant
  const getColor = () => {
    if (color) return color;

    const variantColors = {
      primary: theme.colors.primary,
      secondary: theme.colors.secondary,
      text: theme.colors.text,
      textSecondary: theme.colors.textSecondary,
      success: theme.colors.success,
      error: theme.colors.error,
      warning: theme.colors.warning,
    };

    return variantColors[variant] || variantColors.text;
  };

  const iconColor = getColor();

  if (onPress) {
    return (
      <Ionicons
        name={name}
        size={size}
        color={iconColor}
        style={style}
        onPress={onPress}
        testID={testID}
      />
    );
  }

  return (
    <Ionicons
      name={name}
      size={size}
      color={iconColor}
      style={style}
      testID={testID}
    />
  );
};

export default Icon;
