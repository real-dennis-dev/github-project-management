// screens/auth/RegisterScreen.jsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { Input, Button, Loader } from "../../components/common";
import { validationUtils } from "../../utils/validationUtils";

const RegisterScreen = ({ navigation }) => {
  const { register, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (!validationUtils.validateRequired(formData.fullName)) {
      newErrors.fullName = "Full name is required";
    }

    if (!validationUtils.validateRequired(formData.email)) {
      newErrors.email = "Email is required";
    } else if (!validationUtils.validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!validationUtils.validateRequired(formData.password)) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    const result = await register(formData);

    if (!result.success) {
      Alert.alert("Registration Failed", result.error);
    } else if (result.requires2FA) {
      navigation.navigate("TwoFactorAuth");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Start your journey today</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Full Name"
            value={formData.fullName}
            onChangeText={(text) =>
              setFormData({ ...formData, fullName: text })
            }
            placeholder="Enter your full name"
            error={errors.fullName}
            disabled={isLoading}
          />

          <Input
            label="Username"
            value={formData.username}
            onChangeText={(text) =>
              setFormData({ ...formData, username: text })
            }
            placeholder="Choose a username"
            autoCapitalize="none"
            disabled={isLoading}
          />

          <Input
            label="Email Address"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            disabled={isLoading}
          />

          <Input
            label="Password"
            value={formData.password}
            onChangeText={(text) =>
              setFormData({ ...formData, password: text })
            }
            placeholder="Create a password"
            secureTextEntry
            error={errors.password}
            disabled={isLoading}
          />

          <Input
            label="Confirm Password"
            value={formData.confirmPassword}
            onChangeText={(text) =>
              setFormData({ ...formData, confirmPassword: text })
            }
            placeholder="Confirm your password"
            secureTextEntry
            error={errors.confirmPassword}
            disabled={isLoading}
          />

          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={isLoading}
            disabled={isLoading}
            variant="primary"
            size="large"
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Text
            style={styles.footerLink}
            onPress={() => navigation.navigate("Login")}
          >
            Sign In
          </Text>
        </View>
      </ScrollView>

      {isLoading && <Loader overlay />}
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
    fontSize: 32,
    fontWeight: "bold",
    color: "#0a0a0a",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#737373",
  },
  form: {
    gap: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
    paddingVertical: 16,
  },
  footerText: {
    color: "#737373",
    fontSize: 14,
  },
  footerLink: {
    color: "#ea580c",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default RegisterScreen;
