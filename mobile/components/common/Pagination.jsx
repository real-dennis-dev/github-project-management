import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "./Icon";
import { useTheme } from "../../context/ThemeContext";

/**
 * Pagination Component
 * @param {Object} props
 * @param {number} props.currentPage - Current page number
 * @param {number} props.totalPages - Total number of pages
 * @param {number} props.totalItems - Total number of items
 * @param {number} props.itemsPerPage - Items per page
 * @param {Function} props.onPageChange - Page change handler
 * @param {string} props.size - small | medium
 * @param {Object} props.style - Custom styles
 * @param {string} props.testID - Test ID for testing
 * @returns {React.ReactElement}
 */
const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange = () => {},
  size = "medium",
  style = {},
  testID = "",
}) => {
  const { theme } = useTheme();

  // Get size styles
  const getSizeStyles = () => {
    const sizes = {
      small: {
        buttonSize: 28,
        fontSize: 12,
        iconSize: 16,
        spacing: 2,
      },
      medium: {
        buttonSize: 36,
        fontSize: 14,
        iconSize: 20,
        spacing: 4,
      },
    };
    return sizes[size] || sizes.medium;
  };

  const sizeStyles = getSizeStyles();

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers();

  // Calculate start and end items
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <View style={[styles.container, style]} testID={testID}>
      <View style={styles.paginationContainer}>
        {/* Previous button */}
        <TouchableOpacity
          onPress={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={[
            styles.pageButton,
            {
              width: sizeStyles.buttonSize,
              height: sizeStyles.buttonSize,
              borderRadius: sizeStyles.buttonSize / 2,
              marginHorizontal: sizeStyles.spacing,
            },
            currentPage === 1 && styles.disabledButton,
          ]}
        >
          <Icon
            name="chevron-back-outline"
            size={sizeStyles.iconSize}
            color={currentPage === 1 ? theme.colors.border : theme.colors.text}
          />
        </TouchableOpacity>

        {/* Page numbers */}
        <View style={styles.pageNumbersContainer}>
          {pageNumbers.map((page, index) => (
            <TouchableOpacity
              key={`page-${page}-${index}`}
              onPress={() => typeof page === "number" && handlePageChange(page)}
              disabled={page === "..." || page === currentPage}
              style={[
                styles.pageNumberButton,
                {
                  width: sizeStyles.buttonSize,
                  height: sizeStyles.buttonSize,
                  borderRadius: sizeStyles.buttonSize / 2,
                  marginHorizontal: sizeStyles.spacing / 2,
                  backgroundColor:
                    page === currentPage ? theme.colors.primary : "transparent",
                },
              ]}
            >
              <Text
                style={[
                  styles.pageNumberText,
                  {
                    fontSize: sizeStyles.fontSize,
                    color:
                      page === currentPage
                        ? "#ffffff"
                        : page === "..."
                        ? theme.colors.border
                        : theme.colors.text,
                  },
                ]}
              >
                {page}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Next button */}
        <TouchableOpacity
          onPress={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={[
            styles.pageButton,
            {
              width: sizeStyles.buttonSize,
              height: sizeStyles.buttonSize,
              borderRadius: sizeStyles.buttonSize / 2,
              marginHorizontal: sizeStyles.spacing,
            },
            currentPage === totalPages && styles.disabledButton,
          ]}
        >
          <Icon
            name="chevron-forward-outline"
            size={sizeStyles.iconSize}
            color={
              currentPage === totalPages
                ? theme.colors.border
                : theme.colors.text
            }
          />
        </TouchableOpacity>
      </View>

      {/* Items info */}
      {totalItems > 0 && (
        <Text style={[styles.itemsInfo, { color: theme.colors.textSecondary }]}>
          Showing {startItem} - {endItem} of {totalItems}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 12,
  },
  paginationContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  pageNumbersContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  pageButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    opacity: 0.4,
  },
  pageNumberButton: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 2,
  },
  pageNumberText: {
    fontWeight: "500",
    textAlign: "center",
  },
  itemsInfo: {
    fontSize: 12,
    marginTop: 8,
  },
});

export default Pagination;
