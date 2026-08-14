import React from "react";
import { View, ActivityIndicator, StyleSheet, Modal, Text } from "react-native";

/**
 * Loader Component
 * @param {Object} props
 * @param {string|number} props.size - small | large | number
 * @param {string} props.color - Color of the loader
 * @param {boolean} props.fullScreen - Full screen overlay
 * @param {boolean} props.overlay - Show overlay background
 * @param {string} props.text - Optional loading text
 * @param {Object} props.style - Custom styles
 * @param {Object} props.containerStyle - Custom container styles
 * @param {Object} props.textStyle - Custom text styles
 * @param {string} props.testID - Test ID for testing
 * @returns {React.ReactElement}
 */
const Loader = ({
  size = "large",
  color = "#ea580c",
  fullScreen = false,
  overlay = true,
  text = "",
  style = {},
  containerStyle = {},
  textStyle = {},
  testID = "",
}) => {
  const loaderContent = (
    <View
      style={[
        styles.container,
        overlay && styles.overlayContainer,
        fullScreen && styles.fullScreen,
        containerStyle,
      ]}
    >
      <View style={[styles.loaderWrapper, style]}>
        <ActivityIndicator size={size} color={color} />
        {text ? <Text style={[styles.text, textStyle]}>{text}</Text> : null}
      </View>
    </View>
  );

  if (fullScreen) {
    return (
      <Modal
        transparent={true}
        animationType="fade"
        visible={true}
        onRequestClose={() => {}}
        testID={testID}
      >
        {loaderContent}
      </Modal>
    );
  }

  return loaderContent;
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  overlayContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  fullScreen: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  loaderWrapper: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    marginTop: 12,
    fontSize: 14,
    color: "#262626",
    textAlign: "center",
  },
});

export default Loader;
