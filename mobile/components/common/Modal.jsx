import React from "react";
import {
  Modal as RNModal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Platform,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

/**
 * Modal Component
 * @param {Object} props
 * @param {boolean} props.visible - Modal visibility
 * @param {Function} props.onClose - Close handler
 * @param {string} props.title - Modal title
 * @param {React.ReactNode} props.children - Modal content
 * @param {string} props.animationType - slide | fade | none
 * @param {boolean} props.transparent - Transparent background
 * @param {boolean} props.closeOnBackdropPress - Close on backdrop press
 * @param {Object} props.modalStyle - Custom modal styles
 * @param {Object} props.containerStyle - Custom container styles
 * @param {Object} props.headerStyle - Custom header styles
 * @param {string} props.closeIcon - Close icon name
 * @param {Function} props.renderHeader - Custom header render
 * @param {string} props.testID - Test ID for testing
 * @returns {React.ReactElement}
 */
const Modal = ({
  visible = false,
  onClose = () => {},
  title = "",
  children = null,
  animationType = "slide",
  transparent = true,
  closeOnBackdropPress = true,
  modalStyle = {},
  containerStyle = {},
  headerStyle = {},
  closeIcon = "close-outline",
  renderHeader = null,
  testID = "",
}) => {
  const handleBackdropPress = () => {
    if (closeOnBackdropPress) {
      onClose();
    }
  };

  return (
    <RNModal
      visible={visible}
      transparent={transparent}
      animationType={animationType}
      onRequestClose={onClose}
      testID={testID}
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View
          style={[styles.overlay, transparent && styles.transparentOverlay]}
        >
          <TouchableWithoutFeedback>
            <View style={[styles.modalContainer, containerStyle]}>
              {renderHeader ? (
                renderHeader()
              ) : (
                <View style={[styles.header, headerStyle]}>
                  <Text style={styles.title}>{title}</Text>
                  <TouchableOpacity
                    onPress={onClose}
                    style={styles.closeButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name={closeIcon} size={24} color="#262626" />
                  </TouchableOpacity>
                </View>
              )}

              <View style={[styles.content, modalStyle]}>{children}</View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  transparentOverlay: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    width: "90%",
    maxWidth: 400,
    maxHeight: "85%",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    minHeight: 56,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#171717",
    flex: 1,
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
  content: {
    padding: 16,
    flexGrow: 1,
  },
});

export default Modal;
