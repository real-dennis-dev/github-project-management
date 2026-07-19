class StringUtils {
  // Truncates string
  truncateString(str, length = 50, suffix = "...") {
    if (!str) return "";
    if (str.length <= length) return str;
    return str.substring(0, length) + suffix;
  }

  // Creates URL slug
  slugify(str) {
    if (!str) return "";
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  // Capitalizes string
  capitalize(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  // Capitalizes each word
  capitalizeWords(str) {
    if (!str) return "";
    return str
      .split(" ")
      .map((word) => this.capitalize(word))
      .join(" ");
  }

  // Extracts text from HTML
  extractTextFromHTML(html) {
    if (!html) return "";
    return html
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  // Sanitizes string
  sanitizeString(str) {
    if (!str) return "";
    return str.replace(/[&<>"']/g, (char) => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      };
      return entities[char] || char;
    });
  }

  // Generates random string
  generateRandomString(length = 10) {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Checks if string is empty
  isEmpty(str) {
    return !str || str.trim().length === 0;
  }

  // Truncates by words
  truncateByWords(str, wordCount = 20, suffix = "...") {
    if (!str) return "";
    const words = str.split(" ");
    if (words.length <= wordCount) return str;
    return words.slice(0, wordCount).join(" ") + suffix;
  }
}

module.exports = new StringUtils();
