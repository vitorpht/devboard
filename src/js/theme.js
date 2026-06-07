/**
 * DevBoard — Theme Module
 * Phase 1: Theme toggle placeholder (no dark mode yet)
 */

const Theme = {
  /**
   * Initializes the theme toggle placeholder button
   */
  init() {
    const toggle = document.getElementById("theme-toggle");

    if (!toggle) {
      return;
    }

    toggle.addEventListener("click", function () {
      console.info("[DevBoard] Theme toggle — coming in a future phase");
    });
  },
};
