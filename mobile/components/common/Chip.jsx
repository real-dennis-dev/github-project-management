import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "./Icon";
import { useTheme } from "../../context/ThemeContext";

/**
 * Chip Component
 * @param {Object} props
 * @param {string} props.label - Chip label
 * @param {Function} props.onPress - Press handler
 * @param {Function} props.onDelete - Delete handler
 * @param {boolean} props.selected - Selected state
 * @param {string} props.variant - primary | secondary | success | error | warning
 * @param {string} props.size - small | medium
 * @param {string} props.icon - Icon name
 * @param {Object} props.style - Custom styles
 * @param {Object} props.textStyle - Custom text styles
 * @param {string} props.testID - Test ID for testing
 * @returns {React.ReactElement}
 */
const Chip = ({
  label,
  onPress = null,
  onDelete = null,
  selected = false,
  variant = "primary",
  size = "medium",
  icon = null,
  style = {},
  textStyle = {},
  testID = "",
}) => {
  const { theme } = useTheme();

  // Get variant colors
  const getVariantColors = () => {
    const variants = {
      primary: {
        bg: selected ? theme.colors.primary : "transparent",
        text: selected ? "#ffffff" : theme.colors.primary,
        border: theme.colors.primary,
      },
      secondary: {
        bg: selected ? theme.colors.secondary : "transparent",
        text: selected ? "#ffffff" : theme.colors.secondary,
        border: theme.colors.secondary,
      },
      success: {
        bg: selected ? theme.colors.success : "transparent",
        text: selected ? "#ffffff" : theme.colors.success,
        border: theme.colors.success,
      },
      error: {
        bg: selected ? theme.colors.error : "transparent",
        text: selected ? "#ffffff" : theme.colors.error,
        border: theme.colors.error,
      },
      warning: {
        bg: selected ? theme.colors.warning : "transparent",
        text: selected ? "#ffffff" : theme.colors.warning,
        border: theme.colors.warning,
      },
    };
    return variants[variant] || variants.primary;
  };

  // Get size styles
  const getSizeStyles = () => {
    const sizes = {
      small: {
        paddingVertical: 4,
        paddingHorizontal: 10,
        fontSize: 11,
        iconSize: 14,
        height: 28,
      },
      medium: {
        paddingVertical: 6,
        paddingHorizontal: 14,
        fontSize: 13,
        iconSize: 18,
        height: 36,
      },
    };
    return sizes[size] || sizes.medium;
  };

  const colors = getVariantColors();
  const sizeStyles = getSizeStyles();

  const content = (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
          borderWidth: 1.5,
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          height: sizeStyles.height,
        },
        style,
      ]}
    >
      {icon && (
        <Icon
          name={icon}
          size={sizeStyles.iconSize}
          color={colors.text}
          style={styles.icon}
        />
      )}
      <Text
        style={[
          styles.text,
          {
            color: colors.text,
            fontSize: sizeStyles.fontSize,
          },
          textStyle,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
      {onDelete && (
        <TouchableOpacity
          onPress={onDelete}
          style={styles.deleteButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Icon
            name="close-outline"
            size={sizeStyles.iconSize * 0.8}
            color={colors.text}
          />
        </TouchableOpacity>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={styles.touchable}
        testID={testID}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View testID={testID}>{content}</View>;
};

const styles = StyleSheet.create({
  touchable: {
    alignSelf: "flex-start",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  text: {
    fontWeight: "500",
    textAlign: "center",
  },
  icon: {
    marginRight: 6,
  },
  deleteButton: {
    marginLeft: 6,
  },
});

export default Chip;
