import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../context/ThemeContext";

/**
 * Badge Component
 * @param {Object} props
 * @param {string|number} props.label - Badge label
 * @param {string} props.variant - primary | secondary | success | error | warning | info | neutral
 * @param {string} props.size - small | medium | large
 * @param {boolean} props.outline - Outline variant
 * @param {Object} props.style - Custom styles
 * @param {Object} props.textStyle - Custom text styles
 * @param {string} props.testID - Test ID for testing
 * @returns {React.ReactElement}
 */
const Badge = ({
  label,
  variant = "primary",
  size = "medium",
  outline = false,
  style = {},
  textStyle = {},
  testID = "",
}) => {
  const { theme } = useTheme();

  // Get variant colors
  const getVariantColors = () => {
    const variants = {
      primary: {
        bg: theme.colors.primary,
        text: "#ffffff",
        border: theme.colors.primary,
      },
      secondary: {
        bg: theme.colors.secondary,
        text: "#ffffff",
        border: theme.colors.secondary,
      },
      success: {
        bg: theme.colors.success,
        text: "#ffffff",
        border: theme.colors.success,
      },
      error: {
        bg: theme.colors.error,
        text: "#ffffff",
        border: theme.colors.error,
      },
      warning: {
        bg: theme.colors.warning,
        text: "#ffffff",
        border: theme.colors.warning,
      },
      info: {
        bg: theme.colors.info,
        text: "#ffffff",
        border: theme.colors.info,
      },
      neutral: {
        bg: theme.colors.border,
        text: theme.colors.textSecondary,
        border: theme.colors.border,
      },
    };
    return variants[variant] || variants.primary;
  };

  // Get size styles
  const getSizeStyles = () => {
    const sizes = {
      small: {
        paddingVertical: 2,
        paddingHorizontal: 8,
        fontSize: 10,
        borderRadius: 4,
      },
      medium: {
        paddingVertical: 4,
        paddingHorizontal: 12,
        fontSize: 12,
        borderRadius: 6,
      },
      large: {
        paddingVertical: 6,
        paddingHorizontal: 16,
        fontSize: 14,
        borderRadius: 8,
      },
    };
    return sizes[size] || sizes.medium;
  };

  const colors = getVariantColors();
  const sizeStyles = getSizeStyles();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: outline ? "transparent" : colors.bg,
          borderColor: colors.border,
          borderWidth: outline ? 1.5 : 0,
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          borderRadius: sizeStyles.borderRadius,
        },
        style,
      ]}
      testID={testID}
    >
      <Text
        style={[
          styles.text,
          {
            color: outline ? colors.border : colors.text,
            fontSize: sizeStyles.fontSize,
          },
          textStyle,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontWeight: "600",
    textAlign: "center",
  },
});

export default Badge;
