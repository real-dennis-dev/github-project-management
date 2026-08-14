import React, { useState } from "react";
import { View, TextInput, Text, StyleSheet } from "react-native";
import { useTheme } from "../../context/ThemeContext";

/**
 * Textarea Component
 * @param {Object} props
 * @param {string} props.value - Textarea value
 * @param {Function} props.onChangeText - Text change handler
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.label - Textarea label
 * @param {string} props.error - Error message
 * @param {boolean} props.disabled - Disable textarea
 * @param {number} props.maxLength - Maximum character length
 * @param {number} props.numberOfLines - Number of lines to show
 * @param {boolean} props.showCounter - Show character counter
 * @param {Object} props.style - Custom styles
 * @param {Object} props.textareaStyle - Custom textarea styles
 * @param {Object} props.labelStyle - Custom label styles
 * @param {string} props.testID - Test ID for testing
 * @returns {React.ReactElement}
 */
const Textarea = ({
  value = "",
  onChangeText = () => {},
  placeholder = "Enter text...",
  label = "",
  error = "",
  disabled = false,
  maxLength = 500,
  numberOfLines = 4,
  showCounter = true,
  style = {},
  textareaStyle = {},
  labelStyle = {},
  testID = "",
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  // Determine border color based on state
  const getBorderColor = () => {
    if (error) return theme.colors.error;
    if (isFocused) return theme.colors.primary;
    if (disabled) return theme.colors.border;
    return theme.colors.border;
  };

  const remainingChars = maxLength - (value?.length || 0);

  return (
    <View style={[styles.container, style]} testID={testID}>
      {label && (
        <Text style={[styles.label, { color: theme.colors.text }, labelStyle]}>
          {label}
        </Text>
      )}

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textSecondary}
        editable={!disabled}
        maxLength={maxLength}
        multiline
        numberOfLines={numberOfLines}
        onFocus={handleFocus}
        onBlur={handleBlur}
        textAlignVertical="top"
        style={[
          styles.textarea,
          {
            color: theme.colors.text,
            backgroundColor: disabled
              ? theme.colors.border
              : theme.colors.surface,
            borderColor: getBorderColor(),
            borderWidth: 1.5,
            minHeight: numberOfLines * 24 + 24,
          },
          textareaStyle,
        ]}
        testID={`${testID}-input`}
      />

      {error && (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {error}
        </Text>
      )}

      {showCounter && maxLength > 0 && (
        <Text
          style={[
            styles.counter,
            {
              color:
                remainingChars < 20
                  ? theme.colors.error
                  : theme.colors.textSecondary,
            },
          ]}
        >
          {remainingChars} characters remaining
        </Text>
      )}
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
    marginBottom: 6,
    marginLeft: 2,
  },
  textarea: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    lineHeight: 24,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 2,
  },
  counter: {
    fontSize: 11,
    marginTop: 4,
    textAlign: "right",
    marginRight: 4,
  },
});

export default Textarea;
