import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Platform,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

/**
 * Toast Component
 * @param {Object} props
 * @param {string} props.message - Toast message
 * @param {string} props.type - success | error | warning | info
 * @param {number} props.duration - Duration in milliseconds
 * @param {string} props.position - top | bottom
 * @param {Function} props.onHide - Hide callback
 * @param {Function} props.onShow - Show callback
 * @param {Object} props.style - Custom styles
 * @param {string} props.testID - Test ID for testing
 * @returns {React.ReactElement}
 */
const Toast = ({
  message = "",
  type = "info",
  duration = 3000,
  position = "top",
  onHide = () => {},
  onShow = () => {},
  style = {},
  testID = "",
}) => {
  const [visible, setVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const timeoutRef = useRef(null);

  // Get styles based on type
  const getTypeStyles = () => {
    const types = {
      success: {
        backgroundColor: "#16a34a",
        icon: "checkmark-circle-outline",
        iconColor: "#ffffff",
      },
      error: {
        backgroundColor: "#dc2626",
        icon: "alert-circle-outline",
        iconColor: "#ffffff",
      },
      warning: {
        backgroundColor: "#f59e0b",
        icon: "warning-outline",
        iconColor: "#ffffff",
      },
      info: {
        backgroundColor: "#3b82f6",
        icon: "information-circle-outline",
        iconColor: "#ffffff",
      },
    };
    return types[type] || types.info;
  };

  const typeStyles = getTypeStyles();

  useEffect(() => {
    if (message) {
      showToast();
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [message]);

  const showToast = () => {
    setVisible(true);
    onShow();

    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto hide after duration
    if (duration > 0) {
      timeoutRef.current = setTimeout(() => {
        hideToast();
      }, duration);
    }
  };

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: position === "top" ? -50 : 50,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      onHide();
    });

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  if (!visible) return null;

  const positionStyle =
    position === "top" ? styles.topPosition : styles.bottomPosition;

  return (
    <SafeAreaView style={[styles.safeArea, positionStyle]}>
      <Animated.View
        style={[
          styles.toastContainer,
          {
            backgroundColor: typeStyles.backgroundColor,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
          style,
        ]}
        testID={testID}
      >
        <View style={styles.contentContainer}>
          <Ionicons
            name={typeStyles.icon}
            size={24}
            color={typeStyles.iconColor}
          />
          <Text style={styles.message}>{message}</Text>
        </View>
        <TouchableOpacity
          onPress={hideToast}
          style={styles.closeButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close-outline" size={24} color="#ffffff" />
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 999,
  },
  topPosition: {
    top: 0,
    paddingTop: Platform.OS === "ios" ? 44 : 0,
  },
  bottomPosition: {
    bottom: 0,
    paddingBottom: Platform.OS === "ios" ? 34 : 16,
  },
  toastContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  message: {
    color: "#ffffff",
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
    fontWeight: "500",
  },
  closeButton: {
    padding: 4,
  },
});

// Toast manager for programmatic usage
let toastRef = null;

export const ToastManager = {
  setRef: (ref) => {
    toastRef = ref;
  },
  show: (message, type = "info", duration = 3000, position = "top") => {
    if (toastRef) {
      toastRef.showToast(message, type, duration, position);
    }
  },
  hide: () => {
    if (toastRef) {
      toastRef.hideToast();
    }
  },
};

export default Toast;
