// screens/auth/ResetPasswordScreen.jsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { Input, Button, Loader } from "../../components/common";
import authService from "../../services/authService";
import { validationUtils } from "../../utils/validationUtils";

const ResetPasswordScreen = ({ navigation, route }) => {
  const token = route.params?.token || "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (!validationUtils.validateRequired(newPassword)) {
      newErrors.newPassword = "Password is required";
    } else if (newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    } else if (!/[A-Z]/.test(newPassword)) {
      newErrors.newPassword =
        "Password must contain at least one uppercase letter";
    } else if (!/[a-z]/.test(newPassword)) {
      newErrors.newPassword =
        "Password must contain at least one lowercase letter";
    } else if (!/[0-9]/.test(newPassword)) {
      newErrors.newPassword = "Password must contain at least one number";
    }

    if (!validationUtils.validateRequired(confirmPassword)) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    if (!token) {
      Alert.alert("Error", "Invalid reset token");
      return;
    }

    setLoading(true);
    try {
      const response = await authService.resetPassword({
        token,
        newPassword,
        confirmPassword,
      });

      if (response.success) {
        Alert.alert(
          "Password Reset Successful",
          "Your password has been changed successfully. Please login with your new password.",
          [
            {
              text: "Go to Login",
              onPress: () => navigation.navigate("Login"),
            },
          ]
        );
      } else {
        Alert.alert("Error", response.message || "Failed to reset password");
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Set New Password</Text>
          <Text style={styles.subtitle}>
            Your new password must be different from previously used passwords
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Enter new password"
            secureTextEntry
            error={errors.newPassword}
            disabled={loading}
          />

          <Input
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm new password"
            secureTextEntry
            error={errors.confirmPassword}
            disabled={loading}
          />

          <View style={styles.passwordRequirements}>
            <Text style={styles.requirementTitle}>Password Requirements:</Text>
            <View style={styles.requirementItem}>
              <Text
                style={[
                  styles.requirementText,
                  newPassword.length >= 8 && styles.requirementMet,
                ]}
              >
                • At least 8 characters
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <Text
                style={[
                  styles.requirementText,
                  /[A-Z]/.test(newPassword) && styles.requirementMet,
                ]}
              >
                • At least one uppercase letter
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <Text
                style={[
                  styles.requirementText,
                  /[a-z]/.test(newPassword) && styles.requirementMet,
                ]}
              >
                • At least one lowercase letter
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <Text
                style={[
                  styles.requirementText,
                  /[0-9]/.test(newPassword) && styles.requirementMet,
                ]}
              >
                • At least one number
              </Text>
            </View>
          </View>

          <Button
            title="Reset Password"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            variant="primary"
            size="large"
          />

          <Button
            title="Back to Login"
            onPress={() => navigation.navigate("Login")}
            variant="outline"
            size="large"
          />
        </View>
      </ScrollView>

      {loading && <Loader overlay />}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0a0a0a",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#737373",
    lineHeight: 20,
  },
  form: {
    gap: 16,
  },
  passwordRequirements: {
    backgroundColor: "#ffedd5",
    padding: 16,
    borderRadius: 8,
    marginVertical: 4,
  },
  requirementTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#525252",
    marginBottom: 8,
  },
  requirementItem: {
    marginVertical: 2,
  },
  requirementText: {
    fontSize: 13,
    color: "#737373",
  },
  requirementMet: {
    color: "#16a34a",
  },
});

export default ResetPasswordScreen;
