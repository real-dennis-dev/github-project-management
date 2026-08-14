import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import Icon from "./Icon";
import Input from "./Input";
import { useTheme } from "../../context/ThemeContext";

/**
 * Select Component
 * @param {Object} props
 * @param {Array} props.options - Array of options { label, value }
 * @param {string|number} props.value - Selected value
 * @param {Function} props.onChange - Value change handler
 * @param {string} props.label - Input label
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.disabled - Disable select
 * @param {string} props.error - Error message
 * @param {Function} props.renderOption - Custom option render
 * @param {Function} props.renderSelected - Custom selected render
 * @param {Object} props.style - Custom styles
 * @param {string} props.testID - Test ID for testing
 * @returns {React.ReactElement}
 */
const Select = ({
  options = [],
  value = null,
  onChange = () => {},
  label = "",
  placeholder = "Select an option",
  disabled = false,
  error = "",
  renderOption = null,
  renderSelected = null,
  style = {},
  testID = "",
}) => {
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("");

  useEffect(() => {
    if (value) {
      const option = options.find((opt) => opt.value === value);
      setSelectedLabel(option?.label || "");
    } else {
      setSelectedLabel("");
    }
  }, [value, options]);

  const handleSelect = (option) => {
    onChange(option.value);
    setModalVisible(false);
  };

  const handleOpen = () => {
    if (!disabled) {
      setModalVisible(true);
    }
  };

  const handleClose = () => {
    setModalVisible(false);
  };

  // Default option renderer
  const defaultRenderOption = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.optionItem,
        {
          backgroundColor:
            item.value === value ? theme.colors.primary : "transparent",
        },
      ]}
      onPress={() => handleSelect(item)}
    >
      <Text
        style={[
          styles.optionText,
          {
            color: item.value === value ? "#ffffff" : theme.colors.text,
          },
        ]}
      >
        {item.label}
      </Text>
      {item.value === value && (
        <Icon name="checkmark-outline" size={20} color="#ffffff" />
      )}
    </TouchableOpacity>
  );

  // Default selected renderer
  const defaultRenderSelected = () => (
    <View style={styles.selectedContainer}>
      <Text
        style={[
          styles.selectedText,
          {
            color: selectedLabel
              ? theme.colors.text
              : theme.colors.textSecondary,
          },
        ]}
        numberOfLines={1}
      >
        {selectedLabel || placeholder}
      </Text>
      <Icon
        name="chevron-down-outline"
        size={20}
        color={theme.colors.textSecondary}
      />
    </View>
  );

  const OptionRenderer = renderOption || defaultRenderOption;
  const SelectedRenderer = renderSelected || defaultRenderSelected;

  return (
    <View style={[styles.container, style]} testID={testID}>
      {label && (
        <Text style={[styles.label, { color: theme.colors.text }]}>
          {label}
        </Text>
      )}

      <TouchableOpacity
        onPress={handleOpen}
        disabled={disabled}
        style={[
          styles.selectButton,
          {
            borderColor: error ? theme.colors.error : theme.colors.border,
            backgroundColor: disabled
              ? theme.colors.border
              : theme.colors.surface,
            borderWidth: 1,
          },
        ]}
        activeOpacity={0.7}
      >
        <SelectedRenderer />
      </TouchableOpacity>

      {error && (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {error}
        </Text>
      )}

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.modalContent,
                  {
                    backgroundColor: theme.colors.surface,
                    maxHeight: 300,
                  },
                ]}
              >
                <View style={styles.modalHeader}>
                  <Text
                    style={[styles.modalTitle, { color: theme.colors.text }]}
                  >
                    {label || "Select Option"}
                  </Text>
                  <TouchableOpacity onPress={handleClose}>
                    <Icon
                      name="close-outline"
                      size={24}
                      color={theme.colors.text}
                    />
                  </TouchableOpacity>
                </View>

                <FlatList
                  data={options}
                  keyExtractor={(item) => String(item.value)}
                  renderItem={OptionRenderer}
                  contentContainerStyle={styles.optionsList}
                  showsVerticalScrollIndicator={false}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    marginLeft: 2,
  },
  selectButton: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 48,
    justifyContent: "center",
  },
  selectedContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectedText: {
    fontSize: 16,
    flex: 1,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 12,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  optionsList: {
    paddingVertical: 8,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  optionText: {
    fontSize: 14,
    flex: 1,
  },
});

export default Select;
