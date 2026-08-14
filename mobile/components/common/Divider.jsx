import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "../../context/ThemeContext";

/**
 * Divider Component
 * @param {Object} props
 * @param {string} props.orientation - horizontal | vertical
 * @param {string} props.variant - solid | dashed | dotted
 * @param {number} props.thickness - Divider thickness
 * @param {number} props.length - Divider length
 * @param {string} props.color - Divider color
 * @param {Object} props.style - Custom styles
 * @param {string} props.testID - Test ID for testing
 * @returns {React.ReactElement}
 */
const Divider = ({
  orientation = "horizontal",
  variant = "solid",
  thickness = 1,
  length = null,
  color = null,
  style = {},
  testID = "",
}) => {
  const { theme } = useTheme();

  const dividerColor = color || theme.colors.border;

  // Get border style based on variant
  const getBorderStyle = () => {
    switch (variant) {
      case "dashed":
        return "dashed";
      case "dotted":
        return "dotted";
      case "solid":
      default:
        return "solid";
    }
  };

  const isHorizontal = orientation === "horizontal";

  const dividerStyles = {
    backgroundColor: variant === "solid" ? dividerColor : "transparent",
    borderColor: dividerColor,
    borderStyle: getBorderStyle(),
    borderWidth: thickness,
    width: isHorizontal ? length || "100%" : thickness,
    height: isHorizontal ? thickness : length || "100%",
  };

  return (
    <View style={[styles.divider, dividerStyles, style]} testID={testID} />
  );
};

const styles = StyleSheet.create({
  divider: {
    alignSelf: "center",
  },
});

export default Divider;
