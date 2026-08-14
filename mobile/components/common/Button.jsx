import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

/**
 * Button Component
 * @param {Object} props
 * @param {string} props.title - Button text
 * @param {Function} props.onPress - Press handler
 * @param {string} props.variant - primary | secondary | outline | danger | success | warning
 * @param {string} props.size - small | medium | large
 * @param {boolean} props.loading - Show loading state
 * @param {boolean} props.disabled - Disable button
 * @param {string} props.icon - Icon name from Ionicons
 * @param {string} props.iconPosition - left | right
 * @param {Object} props.style - Custom styles
 * @param {Object} props.textStyle - Custom text styles
 * @param {Object} props.iconStyle - Custom icon styles
 * @param {string} props.accessibilityLabel - Accessibility label
 * @param {string} props.testID - Test ID for testing
 * @returns {React.ReactElement}
 */
const Button = ({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  loading = false,
  disabled = false,
  icon = null,
  iconPosition = "left",
  style = {},
  textStyle = {},
  iconStyle = {},
  accessibilityLabel = "",
  testID = "",
}) => {
  // Get styles based on variant and size
  const getVariantStyles = () => {
    const variants = {
      primary: {
        background: "#ea580c",
        text: "#ffffff",
        border: "#ea580c",
      },
      secondary: {
        background: "#f5f5f5",
        text: "#262626",
        border: "#e5e5e5",
      },
      outline: {
        background: "transparent",
        text: "#ea580c",
        border: "#ea580c",
      },
      danger: {
        background: "#dc2626",
        text: "#ffffff",
        border: "#dc2626",
      },
      success: {
        background: "#16a34a",
        text: "#ffffff",
        border: "#16a34a",
      },
      warning: {
        background: "#f59e0b",
        text: "#ffffff",
        border: "#f59e0b",
      },
    };
    return variants[variant] || variants.primary;
  };

  const getSizeStyles = () => {
    const sizes = {
      small: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        fontSize: 12,
        iconSize: 16,
      },
      medium: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        fontSize: 14,
        iconSize: 20,
      },
      large: {
        paddingVertical: 14,
        paddingHorizontal: 28,
        fontSize: 16,
        iconSize: 24,
      },
    };
    return sizes[size] || sizes.medium;
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  const buttonStyles = {
    backgroundColor: disabled ? "#e5e5e5" : variantStyles.background,
    borderColor: disabled ? "#e5e5e5" : variantStyles.border,
    borderWidth: variant === "outline" ? 2 : 0,
    paddingVertical: sizeStyles.paddingVertical,
    paddingHorizontal: sizeStyles.paddingHorizontal,
    opacity: disabled ? 0.6 : 1,
  };

  const textStyles = {
    color: disabled ? "#a3a3a3" : variantStyles.text,
    fontSize: sizeStyles.fontSize,
    fontWeight: "600",
  };

  const iconSize = sizeStyles.iconSize;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.button, buttonStyles, style]}
      activeOpacity={0.8}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityRole="button"
      testID={testID}
    >
      <View style={styles.contentContainer}>
        {loading ? (
          <ActivityIndicator
            size={size === "small" ? "small" : "small"}
            color={disabled ? "#a3a3a3" : variantStyles.text}
          />
        ) : (
          <>
            {icon && iconPosition === "left" && (
              <Ionicons
                name={icon}
                size={iconSize}
                color={disabled ? "#a3a3a3" : variantStyles.text}
                style={[styles.iconLeft, iconStyle]}
              />
            )}
            {title && (
              <Text
                style={[styles.buttonText, textStyles, textStyle]}
                numberOfLines={1}
              >
                {title}
              </Text>
            )}
            {icon && iconPosition === "right" && (
              <Ionicons
                name={icon}
                size={iconSize}
                color={disabled ? "#a3a3a3" : variantStyles.text}
                style={[styles.iconRight, iconStyle]}
              />
            )}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 40,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    textAlign: "center",
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});

export default Button;
