/**
 * DevBoard — Shared Utilities
 */

const Utils = {
  /**
   * Generates a unique identifier
   * @returns {string}
   */
  generateId() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }

    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  },

  /**
   * Escapes HTML to prevent XSS when rendering user content
   * @param {string} text
   * @returns {string}
   */
  escapeHtml(text) {
    const element = document.createElement("div");
    element.textContent = text;
    return element.innerHTML;
  },
};
