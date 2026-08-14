import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

/**
 * Input Component
 * @param {Object} props
 * @param {string} props.value - Input value
 * @param {Function} props.onChangeText - Text change handler
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.secureTextEntry - Hide text
 * @param {string} props.error - Error message
 * @param {boolean} props.disabled - Disable input
 * @param {string} props.label - Input label
 * @param {string} props.icon - Icon name from Ionicons
 * @param {string} props.keyboardType - Keyboard type
 * @param {string} props.autoCapitalize - Auto capitalize
 * @param {boolean} props.multiline - Multi-line input
 * @param {number} props.numberOfLines - Number of lines for multiline
 * @param {string} props.returnKeyType - Return key type
 * @param {Function} props.onSubmitEditing - Submit edit handler
 * @param {Function} props.onFocus - Focus handler
 * @param {Function} props.onBlur - Blur handler
 * @param {Object} props.style - Custom styles
 * @param {Object} props.inputStyle - Custom input styles
 * @param {Object} props.labelStyle - Custom label styles
 * @param {string} props.testID - Test ID for testing
 * @returns {React.ReactElement}
 */
const Input = ({
  value = "",
  onChangeText = () => {},
  placeholder = "",
  secureTextEntry = false,
  error = "",
  disabled = false,
  label = "",
  icon = null,
  keyboardType = "default",
  autoCapitalize = "sentences",
  multiline = false,
  numberOfLines = 1,
  returnKeyType = "done",
  onSubmitEditing = () => {},
  onFocus = () => {},
  onBlur = () => {},
  style = {},
  inputStyle = {},
  labelStyle = {},
  testID = "",
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(!secureTextEntry);

  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur(e);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Determine border color based on state
  const getBorderColor = () => {
    if (error) return "#dc2626";
    if (isFocused) return "#ea580c";
    if (disabled) return "#e5e5e5";
    return "#d1d5db";
  };

  return (
    <View style={[styles.container, style]}>
      {label ? (
        <Text
          style={[styles.label, labelStyle, disabled && styles.labelDisabled]}
        >
          {label}
        </Text>
      ) : null}

      <View
        style={[
          styles.inputWrapper,
          {
            borderColor: getBorderColor(),
            backgroundColor: disabled ? "#f5f5f5" : "#ffffff",
          },
          multiline && styles.multilineWrapper,
        ]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={disabled ? "#a3a3a3" : "#737373"}
            style={styles.iconLeft}
          />
        )}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#a3a3a3"
          secureTextEntry={secureTextEntry && !showPassword}
          editable={!disabled}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={[
            styles.input,
            multiline && styles.multilineInput,
            inputStyle,
            disabled && styles.inputDisabled,
          ]}
          testID={testID}
        />

        {secureTextEntry && (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={styles.eyeIcon}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#737373"
            />
          </TouchableOpacity>
        )}
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={16} color="#dc2626" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#262626",
    marginBottom: 6,
    marginLeft: 2,
  },
  labelDisabled: {
    color: "#a3a3a3",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    minHeight: 48,
    paddingHorizontal: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  multilineWrapper: {
    minHeight: 80,
    alignItems: "flex-start",
    paddingTop: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#171717",
    paddingVertical: 10,
    paddingHorizontal: 0,
    minHeight: 40,
  },
  multilineInput: {
    textAlignVertical: "top",
    paddingVertical: 6,
    minHeight: 60,
  },
  inputDisabled: {
    color: "#a3a3a3",
  },
  iconLeft: {
    marginRight: 10,
  },
  eyeIcon: {
    padding: 4,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginLeft: 2,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 12,
    marginLeft: 4,
  },
});

export default Input;
