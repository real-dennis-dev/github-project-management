import React, { useState, useRef } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import Icon from "./Icon";
import { useTheme } from "../../context/ThemeContext";

/**
 * SearchBar Component
 * @param {Object} props
 * @param {string} props.value - Search value
 * @param {Function} props.onChangeText - Text change handler
 * @param {Function} props.onSearch - Search submit handler
 * @param {Function} props.onClear - Clear handler
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.showCancel - Show cancel button
 * @param {Function} props.onCancel - Cancel handler
 * @param {Object} props.style - Custom styles
 * @param {Object} props.inputStyle - Custom input styles
 * @param {string} props.testID - Test ID for testing
 * @returns {React.ReactElement}
 */
const SearchBar = ({
  value = "",
  onChangeText = () => {},
  onSearch = () => {},
  onClear = () => {},
  placeholder = "Search...",
  showCancel = false,
  onCancel = () => {},
  style = {},
  inputStyle = {},
  testID = "",
}) => {
  const { theme } = useTheme();
  const inputRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const cancelAnimation = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    if (showCancel) {
      Animated.timing(cancelAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (showCancel) {
      Animated.timing(cancelAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleClear = () => {
    onChangeText("");
    onClear();
    inputRef.current?.focus();
  };

  const handleCancel = () => {
    handleClear();
    onCancel();
    inputRef.current?.blur();
  };

  const handleSubmitEditing = () => {
    onSearch(value);
  };

  return (
    <View style={[styles.container, style]} testID={testID}>
      <View
        style={[
          styles.searchContainer,
          {
            backgroundColor: theme.colors.surface,
            borderColor: isFocused ? theme.colors.primary : theme.colors.border,
            borderWidth: isFocused ? 2 : 1,
          },
        ]}
      >
        <Icon
          name="search-outline"
          size={20}
          color={theme.colors.textSecondary}
          style={styles.searchIcon}
        />

        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSecondary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={handleSubmitEditing}
          returnKeyType="search"
          style={[
            styles.input,
            {
              color: theme.colors.text,
            },
            inputStyle,
          ]}
          testID={`${testID}-input`}
        />

        {value.length > 0 && (
          <TouchableOpacity
            onPress={handleClear}
            style={styles.clearButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon
              name="close-circle-outline"
              size={20}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {showCancel && (
        <Animated.View
          style={[
            styles.cancelContainer,
            {
              opacity: cancelAnimation,
              transform: [
                {
                  translateX: cancelAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity onPress={handleCancel}>
            <Text style={[styles.cancelText, { color: theme.colors.primary }]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0,
    minHeight: 30,
  },
  clearButton: {
    padding: 4,
  },
  cancelContainer: {
    marginLeft: 12,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "500",
  },
});

export default SearchBar;
