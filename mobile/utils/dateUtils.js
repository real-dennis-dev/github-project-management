import {
  format,
  parse,
  differenceInDays,
  isToday,
  isYesterday,
  formatDistanceToNow,
  formatDistance,
  addDays,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
} from "date-fns";

/**
 * Date utilities
 */
const dateUtils = {
  /**
   * Format date to string
   * @param {Date|string} date - Date to format
   * @param {string} formatStr - Format string (default: 'MMM dd, yyyy')
   * @returns {string} Formatted date
   */
  formatDate: (date, formatStr = "MMM dd, yyyy") => {
    if (!date) return "";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "";
    return format(dateObj, formatStr);
  },

  /**
   * Format date with time
   * @param {Date|string} date - Date to format
   * @returns {string} Formatted date with time
   */
  formatDateTime: (date) => {
    if (!date) return "";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "";
    return format(dateObj, "MMM dd, yyyy HH:mm");
  },

  /**
   * Parse date string
   * @param {string} dateString - Date string to parse
   * @param {string} formatStr - Format string
   * @returns {Date} Parsed date
   */
  parseDate: (dateString, formatStr = "yyyy-MM-dd") => {
    if (!dateString) return null;
    try {
      return parse(dateString, formatStr, new Date());
    } catch (error) {
      return null;
    }
  },

  /**
   * Get date range between two dates
   * @param {Date|string} start - Start date
   * @param {Date|string} end - End date
   * @param {string} interval - Interval (day, week, month)
   * @returns {Array<Date>} Array of dates in range
   */
  getDateRange: (start, end, interval = "day") => {
    const startDate = typeof start === "string" ? new Date(start) : start;
    const endDate = typeof end === "string" ? new Date(end) : end;

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return [];
    }

    const dates = [];
    let current = new Date(startDate);

    while (current <= endDate) {
      dates.push(new Date(current));

      if (interval === "week") {
        current = addDays(current, 7);
      } else if (interval === "month") {
        current.setMonth(current.getMonth() + 1);
      } else {
        current = addDays(current, 1);
      }
    }

    return dates;
  },

  /**
   * Check if date is today
   * @param {Date|string} date - Date to check
   * @returns {boolean}
   */
  isToday: (date) => {
    if (!date) return false;
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return false;
    return isToday(dateObj);
  },

  /**
   * Check if date is yesterday
   * @param {Date|string} date - Date to check
   * @returns {boolean}
   */
  isYesterday: (date) => {
    if (!date) return false;
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return false;
    return isYesterday(dateObj);
  },

  /**
   * Get relative time from date
   * @param {Date|string} date - Date to compare
   * @param {Object} options - Format options
   * @returns {string} Relative time string
   */
  getRelativeTime: (date, options = {}) => {
    if (!date) return "";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "";
    return formatDistanceToNow(dateObj, { addSuffix: true, ...options });
  },

  /**
   * Format month and year
   * @param {Date|string} date - Date to format
   * @returns {string} Month and year string
   */
  formatMonthYear: (date) => {
    if (!date) return "";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "";
    return format(dateObj, "MMMM yyyy");
  },

  /**
   * Format time only
   * @param {Date|string} date - Date to format
   * @returns {string} Time string
   */
  formatTime: (date) => {
    if (!date) return "";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "";
    return format(dateObj, "HH:mm");
  },

  /**
   * Calculate days between two dates
   * @param {Date|string} date1 - First date
   * @param {Date|string} date2 - Second date
   * @returns {number} Days difference
   */
  daysBetween: (date1, date2) => {
    const d1 = typeof date1 === "string" ? new Date(date1) : date1;
    const d2 = typeof date2 === "string" ? new Date(date2) : date2;
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0;
    return differenceInDays(d2, d1);
  },

  /**
   * Check if date is in range
   * @param {Date|string} date - Date to check
   * @param {Date|string} start - Start of range
   * @param {Date|string} end - End of range
   * @returns {boolean}
   */
  isDateInRange: (date, start, end) => {
    const d = typeof date === "string" ? new Date(date) : date;
    const s = typeof start === "string" ? new Date(start) : start;
    const e = typeof end === "string" ? new Date(end) : end;
    if (isNaN(d.getTime()) || isNaN(s.getTime()) || isNaN(e.getTime()))
      return false;
    return isWithinInterval(d, { start: s, end: e });
  },

  /**
   * Get start of month
   * @param {Date|string} date - Date
   * @returns {Date} Start of month
   */
  startOfMonth: (date) => {
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return new Date();
    return startOfMonth(d);
  },

  /**
   * Get end of month
   * @param {Date|string} date - Date
   * @returns {Date} End of month
   */
  endOfMonth: (date) => {
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return new Date();
    return endOfMonth(d);
  },

  /**
   * Get start of week
   * @param {Date|string} date - Date
   * @param {number} weekStartsOn - Day of week (0 for Sunday, 1 for Monday)
   * @returns {Date} Start of week
   */
  startOfWeek: (date, weekStartsOn = 1) => {
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return new Date();
    return startOfWeek(d, { weekStartsOn });
  },

  /**
   * Get end of week
   * @param {Date|string} date - Date
   * @param {number} weekStartsOn - Day of week (0 for Sunday, 1 for Monday)
   * @returns {Date} End of week
   */
  endOfWeek: (date, weekStartsOn = 1) => {
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return new Date();
    return endOfWeek(d, { weekStartsOn });
  },

  /**
   * Add days to date
   * @param {Date|string} date - Date
   * @param {number} days - Number of days to add
   * @returns {Date} New date
   */
  addDays: (date, days) => {
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return new Date();
    return addDays(d, days);
  },

  /**
   * Subtract days from date
   * @param {Date|string} date - Date
   * @param {number} days - Number of days to subtract
   * @returns {Date} New date
   */
  subDays: (date, days) => {
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return new Date();
    return subDays(d, days);
  },

  /**
   * Get date difference in human readable format
   * @param {Date|string} date - Date
   * @param {Date|string} baseDate - Base date (default: now)
   * @returns {string} Human readable difference
   */
  getTimeDifference: (date, baseDate = new Date()) => {
    const d = typeof date === "string" ? new Date(date) : date;
    const b = typeof baseDate === "string" ? new Date(baseDate) : baseDate;
    if (isNaN(d.getTime()) || isNaN(b.getTime())) return "";
    return formatDistance(d, b, { addSuffix: true });
  },

  /**
   * Check if two dates are the same day
   * @param {Date|string} date1 - First date
   * @param {Date|string} date2 - Second date
   * @returns {boolean}
   */
  isSameDay: (date1, date2) => {
    const d1 = typeof date1 === "string" ? new Date(date1) : date1;
    const d2 = typeof date2 === "string" ? new Date(date2) : date2;
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return false;
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  },
};

export default dateUtils;
