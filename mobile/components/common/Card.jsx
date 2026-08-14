import React from "react";
import { View, TouchableOpacity, StyleSheet, Platform } from "react-native";

/**
 * Card Component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {Function} props.onPress - Press handler (makes card touchable)
 * @param {string} props.variant - default | elevated | outlined
 * @param {number} props.elevation - Elevation level (Android) or shadow intensity (iOS)
 * @param {Object} props.style - Custom styles
 * @param {Object} props.containerStyle - Custom container styles
 * @param {string} props.testID - Test ID for testing
 * @returns {React.ReactElement}
 */
const Card = ({
  children,
  onPress = null,
  variant = "default",
  elevation = 2,
  style = {},
  containerStyle = {},
  testID = "",
}) => {
  // Get variant styles
  const getVariantStyles = () => {
    switch (variant) {
      case "elevated":
        return {
          backgroundColor: "#ffffff",
          ...Platform.select({
            ios: {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 6,
            },
            android: {
              elevation: elevation || 4,
            },
          }),
        };
      case "outlined":
        return {
          backgroundColor: "#ffffff",
          borderWidth: 1.5,
          borderColor: "#e5e5e5",
        };
      default:
        return {
          backgroundColor: "#ffffff",
          borderWidth: 1,
          borderColor: "#f5f5f5",
        };
    }
  };

  const variantStyles = getVariantStyles();

  const cardContent = (
    <View style={[styles.card, variantStyles, style, containerStyle]}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={styles.touchable}
        testID={testID}
      >
        {cardContent}
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.touchable} testID={testID}>
      {cardContent}
    </View>
  );
};

const styles = StyleSheet.create({
  touchable: {
    width: "100%",
  },
  card: {
    borderRadius: 12,
    padding: 16,
    overflow: "hidden",
  },
});

export default Card;
