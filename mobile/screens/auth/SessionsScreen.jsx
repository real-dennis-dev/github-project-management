// screens/auth/SessionsScreen.jsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { Button, Loader, Card } from "../../components/common";
import { formatUtils, dateUtils } from "../../utils";

const SessionsScreen = () => {
  const { user, sessions, getSessions, logoutSession, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    await getSessions();
    setLoading(false);
  };

  const handleLogoutSession = async (sessionId) => {
    Alert.alert(
      "Logout Device",
      "Are you sure you want to logout this device?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await logoutSession(sessionId);
          },
        },
      ]
    );
  };

  const handleLogoutAll = async () => {
    Alert.alert(
      "Logout All Devices",
      "This will logout all devices including this one. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout All",
          style: "destructive",
          onPress: async () => {
            setIsLoggingOut(true);
            await logout(true);
            setIsLoggingOut(false);
          },
        },
      ]
    );
  };

  const renderSessionItem = ({ item }) => (
    <Card style={styles.sessionCard}>
      <View style={styles.sessionHeader}>
        <View style={styles.deviceInfo}>
          <Text style={styles.deviceName}>
            {item.deviceName || "Unknown Device"}
          </Text>
          {item.isCurrent && (
            <View style={styles.currentBadge}>
              <Text style={styles.currentBadgeText}>Current</Text>
            </View>
          )}
        </View>
        <Text style={styles.ipAddress}>IP: {item.ipAddress}</Text>
      </View>

      <View style={styles.sessionDetails}>
        <Text style={styles.sessionText}>
          Last Active: {dateUtils.getRelativeTime(item.lastActive)}
        </Text>
        <Text style={styles.sessionText}>
          Expires: {dateUtils.formatDate(item.expiresAt, "PPP")}
        </Text>
        <Text style={styles.sessionText}>
          User Agent: {item.userAgent || "N/A"}
        </Text>
      </View>

      {!item.isCurrent && (
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => handleLogoutSession(item.id)}
        >
          <Text style={styles.logoutButtonText}>Logout Session</Text>
        </TouchableOpacity>
      )}
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Loader />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Active Sessions</Text>
        <Text style={styles.subtitle}>
          Manage your active sessions across all devices
        </Text>
      </View>

      <FlatList
        data={sessions}
        renderItem={renderSessionItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No active sessions found</Text>
          </View>
        }
      />

      <View style={styles.footer}>
        <Button
          title="Logout All Devices"
          onPress={handleLogoutAll}
          variant="danger"
          size="medium"
          loading={isLoggingOut}
          disabled={isLoggingOut}
        />
        <Button
          title="Refresh Sessions"
          onPress={loadSessions}
          variant="outline"
          size="medium"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: 24,
    paddingTop: 20,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0a0a0a",
  },
  subtitle: {
    fontSize: 14,
    color: "#737373",
    marginTop: 4,
  },
  listContent: {
    padding: 16,
  },
  sessionCard: {
    padding: 16,
    marginBottom: 12,
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  deviceInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0a0a0a",
  },
  currentBadge: {
    backgroundColor: "#16a34a",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  currentBadgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "600",
  },
  ipAddress: {
    fontSize: 12,
    color: "#737373",
  },
  sessionDetails: {
    gap: 4,
  },
  sessionText: {
    fontSize: 13,
    color: "#525252",
  },
  logoutButton: {
    marginTop: 12,
    padding: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#dc2626",
    borderRadius: 8,
  },
  logoutButtonText: {
    color: "#dc2626",
    fontSize: 14,
    fontWeight: "500",
  },
  footer: {
    padding: 16,
    gap: 12,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#a3a3a3",
  },
});

export default SessionsScreen;
