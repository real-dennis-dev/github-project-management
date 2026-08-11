// src/components/expense/ExpenseConstants.js

/**
 * Expense Category Configuration
 */
export const CATEGORIES = [
  { value: "hosting", label: "Hosting", icon: "☁️", color: "#4CAF50" },
  { value: "database", label: "Database", icon: "🗄️", color: "#2196F3" },
  { value: "domain", label: "Domain", icon: "🌐", color: "#9C27B0" },
  { value: "api", label: "API", icon: "🔌", color: "#FF9800" },
  { value: "software", label: "Software", icon: "💻", color: "#3F51B5" },
  { value: "hardware", label: "Hardware", icon: "🖥️", color: "#607D8B" },
  { value: "marketing", label: "Marketing", icon: "📣", color: "#E91E63" },
  { value: "other", label: "Other", icon: "📦", color: "#9E9E9E" },
];

/**
 * Get category by value
 */
export const getCategory = (value) => {
  return CATEGORIES.find((cat) => cat.value === value) || CATEGORIES[7];
};

/**
 * Get category label by value
 */
export const getCategoryLabel = (value) => {
  const category = getCategory(value);
  return category ? category.label : value;
};

/**
 * Get category icon by value
 */
export const getCategoryIcon = (value) => {
  const category = getCategory(value);
  return category ? category.icon : "📦";
};

/**
 * Get category color by value
 */
export const getCategoryColor = (value) => {
  const category = getCategory(value);
  return category ? category.color : "#9E9E9E";
};

/**
 * Sort options for expenses
 */
export const SORT_OPTIONS = [
  { value: "expense_date", label: "Date" },
  { value: "amount", label: "Amount" },
  { value: "category", label: "Category" },
  { value: "created_at", label: "Created At" },
];

/**
 * Sort order options
 */
export const SORT_ORDER_OPTIONS = [
  { value: "DESC", label: "Newest First" },
  { value: "ASC", label: "Oldest First" },
];

/**
 * Default pagination settings
 */
export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20,
};

/**
 * Default filter settings
 */
export const DEFAULT_FILTERS = {
  category: "",
  fromDate: "",
  toDate: "",
  minAmount: "",
  maxAmount: "",
  vendor: "",
  recurring: null,
};

/**
 * Expense form initial values
 */
export const EXPENSE_FORM_INITIAL_VALUES = {
  description: "",
  amount: "",
  category: "other",
  expense_date: new Date().toISOString().split("T")[0],
  vendor: "",
  receipt_url: "",
  recurring: false,
};

/**
 * Expense form validation rules
 */
export const EXPENSE_FORM_VALIDATION = {
  description: {
    required: "Description is required",
    minLength: {
      value: 3,
      message: "Description must be at least 3 characters",
    },
    maxLength: {
      value: 500,
      message: "Description must be at most 500 characters",
    },
  },
  amount: {
    required: "Amount is required",
    min: { value: 0.01, message: "Amount must be greater than 0" },
  },
  category: {
    required: "Category is required",
  },
  expense_date: {
    required: "Date is required",
  },
  vendor: {
    maxLength: {
      value: 100,
      message: "Vendor name must be at most 100 characters",
    },
  },
};

/**
 * Export formats
 */
export const EXPORT_FORMATS = [
  { value: "json", label: "JSON" },
  { value: "csv", label: "CSV" },
];
