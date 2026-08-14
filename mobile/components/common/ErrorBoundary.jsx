import React, { Component } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Icon from "./Icon";
import { useTheme } from "../../context/ThemeContext";

/**
 * Error Fallback Component (Function component)
 * @param {Object} props
 * @param {Error} props.error - Error object
 * @param {Function} props.resetError - Reset error function
 * @param {string} props.message - Custom error message
 * @returns {React.ReactElement}
 */
export const ErrorFallback = ({ error, resetError, message }) => {
  const { theme } = useTheme();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.content}>
        <Icon
          name="alert-circle-outline"
          size={64}
          color={theme.colors.error}
        />

        <Text style={[styles.title, { color: theme.colors.text }]}>
          Something went wrong
        </Text>

        {message && (
          <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
            {message}
          </Text>
        )}

        {error && error.message && (
          <View style={styles.errorContainer}>
            <Text
              style={[styles.errorText, { color: theme.colors.textSecondary }]}
            >
              {error.message}
            </Text>
          </View>
        )}

        {resetError && (
          <TouchableOpacity
            style={[
              styles.resetButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={resetError}
          >
            <Text style={styles.resetButtonText}>Try Again</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

/**
 * Error Boundary Component (Class component)
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @param {Function} props.onError - Error handler
 * @param {React.ReactNode} props.fallback - Custom fallback UI
 * @param {string} props.message - Custom error message
 * @param {string} props.testID - Test ID for testing
 * @returns {React.ReactElement}
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      errorInfo,
    });

    // Log error
    console.error("Error Boundary Caught:", error, errorInfo);

    // Call onError handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    const { hasError, error } = this.state;
    const { children, fallback, message, testID } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      return (
        <ErrorFallback
          error={error}
          resetError={this.resetError}
          message={message}
          testID={testID}
        />
      );
    }

    return children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    maxWidth: 400,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },
  errorContainer: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    width: "100%",
  },
  errorText: {
    fontSize: 12,
    fontFamily: "monospace",
    textAlign: "center",
  },
  resetButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 120,
  },
  resetButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default ErrorBoundary;
