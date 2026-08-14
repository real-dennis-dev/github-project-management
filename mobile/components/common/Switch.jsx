import React from "react";
import { Switch as RNSwitch, StyleSheet } from "react-native";
import { useTheme } from "../../context/ThemeContext";

/**
 * Switch Component
 * @param {Object} props
 * @param {boolean} props.value - Switch value
 * @param {Function} props.onValueChange - Value change handler
 * @param {boolean} props.disabled - Disable switch
 * @param {string} props.trackColor - Track color
 * @param {string} props.thumbColor - Thumb color
 * @param {Object} props.style - Custom styles
 * @param {string} props.testID - Test ID for testing
 * @returns {React.ReactElement}
 */
const Switch = ({
  value = false,
  onValueChange = () => {},
  disabled = false,
  trackColor = null,
  thumbColor = null,
  style = {},
  testID = "",
}) => {
  const { theme } = useTheme();

  return (
    <RNSwitch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{
        false: trackColor || theme.colors.border,
        true: trackColor || theme.colors.primary,
      }}
      thumbColor={thumbColor || "#ffffff"}
      style={[styles.switch, style]}
      testID={testID}
    />
  );
};

const styles = StyleSheet.create({
  switch: {
    transform: [{ scale: 0.9 }],
  },
});

export default Switch;
