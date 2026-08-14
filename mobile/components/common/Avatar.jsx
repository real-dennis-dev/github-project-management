import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";

/**
 * Avatar Component
 * @param {Object} props
 * @param {string} props.source - Image source URI
 * @param {string} props.name - User name for initials
 * @param {number} props.size - Avatar size
 * @param {string} props.variant - circle | rounded | square
 * @param {Function} props.onPress - Press handler
 * @param {boolean} props.editable - Show edit icon
 * @param {string} props.testID - Test ID for testing
 * @param {Object} props.style - Custom styles
 * @returns {React.ReactElement}
 */
const Avatar = ({
  source = null,
  name = "",
  size = 50,
  variant = "circle",
  onPress = null,
  editable = false,
  testID = "",
  style = {},
}) => {
  const { theme } = useTheme();

  // Get initials from name
  const getInitials = () => {
    if (!name) return "?";
    const names = name.trim().split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (
      names[0].charAt(0) + names[names.length - 1].charAt(0)
    ).toUpperCase();
  };

  // Get random background color from name
  const getBackgroundColor = () => {
    if (!name) return theme.colors.primary;

    const colors = [
      "#ea580c",
      "#c2410c",
      "#16a34a",
      "#dc2626",
      "#3b82f6",
      "#8b5cf6",
      "#ec4899",
      "#14b8a6",
      "#f59e0b",
      "#6366f1",
      "#ef4444",
      "#22d3ee",
    ];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Get border radius based on variant
  const getBorderRadius = () => {
    switch (variant) {
      case "rounded":
        return 8;
      case "square":
        return 0;
      case "circle":
      default:
        return size / 2;
    }
  };

  const borderRadius = getBorderRadius();
  const backgroundColor = getBackgroundColor();

  const content = (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius,
          backgroundColor: source ? "transparent" : backgroundColor,
        },
        style,
      ]}
    >
      {source ? (
        <Image
          source={typeof source === "string" ? { uri: source } : source}
          style={[
            styles.image,
            {
              width: size,
              height: size,
              borderRadius,
            },
          ]}
          testID={testID}
        />
      ) : (
        <Text
          style={[
            styles.initials,
            {
              fontSize: size * 0.4,
              color: "#ffffff",
            },
          ]}
        >
          {getInitials()}
        </Text>
      )}

      {editable && (
        <View
          style={[
            styles.editOverlay,
            {
              width: size,
              height: size,
              borderRadius,
            },
          ]}
        >
          <View style={styles.editIconContainer}>
            <Ionicons name="camera-outline" size={size * 0.3} color="#ffffff" />
          </View>
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  image: {
    resizeMode: "cover",
  },
  initials: {
    fontWeight: "600",
    textAlign: "center",
  },
  editOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  editIconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Avatar;
