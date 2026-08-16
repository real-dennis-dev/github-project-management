// components/common/ProtectedRoute.jsx
import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { Loader } from "./Loader";

/**
 * Protected Route Component
 * Wraps screens that require authentication
 * @param {Object} props - { children, fallback, loadingFallback }
 * @returns {React.ReactElement}
 */
const ProtectedRoute = ({
  children,
  fallback = null,
  loadingFallback = null,
  redirectTo = "Login",
  navigation,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated && navigation) {
      navigation.navigate(redirectTo);
    }
  }, [isLoading, isAuthenticated, navigation, redirectTo]);

  if (isLoading) {
    return loadingFallback || <Loader fullScreen />;
  }

  if (!isAuthenticated) {
    return (
      fallback || (
        <View style={styles.container}>
          <Text style={styles.text}>Authentication required</Text>
        </View>
      )
    );
  }

  return children;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fafafa",
  },
  text: {
    fontSize: 16,
    color: "#737373",
  },
});

export default ProtectedRoute;
