import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import Button from "./Button";
import { useTheme } from "../../context/ThemeContext";

/**
 * EmptyState Component
 * @param {Object} props
 * @param {string} props.title - Empty state title
 * @param {string} props.description - Empty state description
 * @param {string} props.image - Image source
 * @param {string} props.buttonTitle - Button title
 * @param {Function} props.onButtonPress - Button press handler
 * @param {Object} props.style - Custom styles
 * @param {string} props.testID - Test ID for testing
 * @returns {React.ReactElement}
 */
const EmptyState = ({
  title = "Nothing to see here",
  description = "There is no content available at this time.",
  image = null,
  buttonTitle = "",
  onButtonPress = null,
  style = {},
  testID = "",
}) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, style]} testID={testID}>
      {image && (
        <View style={styles.imageContainer}>
          {typeof image === "string" ? (
            <Image
              source={{ uri: image }}
              style={styles.image}
              resizeMode="contain"
            />
          ) : (
            <Image source={image} style={styles.image} resizeMode="contain" />
          )}
        </View>
      )}

      <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>

      {description && (
        <Text
          style={[styles.description, { color: theme.colors.textSecondary }]}
        >
          {description}
        </Text>
      )}

      {buttonTitle && onButtonPress && (
        <Button
          title={buttonTitle}
          onPress={onButtonPress}
          variant="primary"
          size="medium"
          style={styles.button}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  imageContainer: {
    marginBottom: 24,
  },
  image: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  button: {
    minWidth: 120,
  },
});

export default EmptyState;
