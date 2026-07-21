const logger = require("../../../common/config/logger");

class DocumentationUtils {
  // your methods here

  /**
   * Extract tags from content
   * @param {string} content - Content to extract tags from
   * @param {number} maxTags - Maximum tags to extract
   * @returns {Array<string>} - Array of extracted tags
   */
  extractTags(content, maxTags = 10) {
    if (!content) return [];

    const tagRegex = /#(\w+)/g;
    const matches = content.match(tagRegex) || [];
    const tags = matches.map((tag) => tag.substring(1).toLowerCase());

    // Count occurrences
    const tagCount = {};
    tags.forEach((tag) => {
      tagCount[tag] = (tagCount[tag] || 0) + 1;
    });

    // Sort by count and limit
    return Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxTags)
      .map(([tag]) => tag);
  }

  /**
   * Generate table of contents from content
   * @param {string} content - Content with markdown headings
   * @returns {Array<Object>} - Table of contents items
   */
  generateTableOfContents(content) {
    if (!content) return [];

    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const matches = [...content.matchAll(headingRegex)];

    const toc = matches.map((match) => {
      const level = match[1].length;
      const text = match[2].trim();
      const id = this.slugify(text);
      return { level, text, id };
    });

    return toc;
  }

  /**
   * Validate document type
   * @param {string} type - Document type to validate
   * @returns {boolean} - True if valid
   */
  validateDocumentType(type) {
    const validTypes = [
      "api",
      "erd",
      "flowchart",
      "user_manual",
      "technical",
      "other",
    ];
    return validTypes.includes(type);
  }

  /**
   * Format documentation for export
   * @param {Object} data - Documentation data
   * @param {string} format - Export format (json, markdown, html)
   * @returns {string} - Formatted data
   */
  formatDocumentationForExport(data, format = "json") {
    switch (format) {
      case "json":
        return JSON.stringify(data, null, 2);

      case "markdown":
        const { title, content, doc_type, tags, created_at } = data;
        let markdown = `# ${title}\n\n`;
        markdown += `**Type:** ${doc_type}\n`;
        markdown += `**Tags:** ${tags.join(", ")}\n`;
        markdown += `**Created:** ${new Date(
          created_at
        ).toLocaleDateString()}\n\n`;
        markdown += `---\n\n${content}`;
        return markdown;

      case "html":
        return this.convertToHtml(data);

      default:
        return JSON.stringify(data, null, 2);
    }
  }

  /**
   * Convert documentation to HTML
   * @param {Object} data - Documentation data
   * @returns {string} - HTML string
   */
  convertToHtml(data) {
    const { title, content, doc_type, tags } = data;
    let html = '<!DOCTYPE html><html><head><meta charset="UTF-8">';
    html += `<title>${title}</title>`;
    html +=
      "<style>body{font-family:Arial,sans-serif;max-width:800px;margin:0 auto;padding:20px;}</style>";
    html += "</head><body>";
    html += `<h1>${title}</h1>`;
    html += `<p><strong>Type:</strong> ${doc_type}</p>`;
    if (tags && tags.length) {
      html += `<p><strong>Tags:</strong> ${tags.join(", ")}</p>`;
    }
    html += `<hr>${this.markdownToHtml(content)}`;
    html += "</body></html>";
    return html;
  }

  /**
   * Simple markdown to HTML converter
   * @param {string} content - Markdown content
   * @returns {string} - HTML content
   */
  markdownToHtml(content) {
    if (!content) return "";

    let html = content
      .replace(/^#{6}\s+(.+)$/gm, "<h6>$1</h6>")
      .replace(/^#{5}\s+(.+)$/gm, "<h5>$1</h5>")
      .replace(/^#{4}\s+(.+)$/gm, "<h4>$1</h4>")
      .replace(/^#{3}\s+(.+)$/gm, "<h3>$1</h3>")
      .replace(/^#{2}\s+(.+)$/gm, "<h2>$1</h2>")
      .replace(/^#{1}\s+(.+)$/gm, "<h1>$1</h1>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/`(.+?)`/g, "<code>$1</code>")
      .replace(/\n/g, "<br>");

    return html;
  }

  /**
   * Detect language/code blocks in content
   * @param {string} content - Content to detect
   * @returns {Array<Object>} - Detected code blocks
   */
  detectDocumentationLanguage(content) {
    if (!content) return [];

    const codeBlockRegex = /```(\w+)?\n([\s\S]+?)```/g;
    const matches = [...content.matchAll(codeBlockRegex)];

    return matches.map((match) => ({
      language: match[1] || "plaintext",
      code: match[2].trim(),
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    }));
  }

  /**
   * Generate slug for heading
   * @param {string} text - Text to slugify
   * @returns {string} - Slugified text
   */
  slugify(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
  }

  /**
   * Validate documentation data
   * @param {Object} data - Documentation data
   * @returns {Object} - Validation result
   */
  validateDocumentationData(data) {
    const errors = [];

    if (!data.title || data.title.length < 3) {
      errors.push("Title must be at least 3 characters");
    }

    if (data.doc_type && !this.validateDocumentType(data.doc_type)) {
      errors.push("Invalid document type");
    }

    if (data.version && data.version < 1) {
      errors.push("Version must be at least 1");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Extract keywords from content for search
   * @param {string} content - Content to extract from
   * @param {number} maxKeywords - Maximum keywords
   * @returns {Array<string>} - Extracted keywords
   */
  extractKeywords(content, maxKeywords = 10) {
    if (!content) return [];

    const words = content
      .toLowerCase()
      .replace(/[^a-z\s]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 3);

    const wordCount = {};
    words.forEach((word) => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    return Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxKeywords)
      .map(([word]) => word);
  }

  /**
   * Sanitize content for safe display
   * @param {string} content - Content to sanitize
   * @returns {string} - Sanitized content
   */
  sanitizeContent(content) {
    if (!content) return "";

    return content
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+=/gi, "");
  }
}

module.exports = DocumentationUtils;
