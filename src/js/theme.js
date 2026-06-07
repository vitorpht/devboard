/**
 * DevBoard — Theme Module
 */

const Theme = {
  /** @type {{ tasks: Array, projects: Array, theme: string } | null} */
  appData: null,

  /**
   * Initializes the theme module with application data
   * @param {{ tasks: Array, projects: Array, theme: string }} appData
   */
  init(appData) {
    this.appData = appData;
    this.initializeTheme();
    this.bindToggle();
  },

  /**
   * Reads saved theme and applies it on page load
   */
  initializeTheme() {
    if (!this.appData) {
      this.applyTheme("light");
      return;
    }

    const theme = this.normalizeTheme(this.appData.theme);
    this.appData.theme = theme;
    this.applyTheme(theme);
  },

  /**
   * Normalizes theme value to a valid option
   * @param {string} theme
   * @returns {"light" | "dark"}
   */
  normalizeTheme(theme) {
    return theme === "dark" ? "dark" : "light";
  },

  /**
   * Applies the selected theme to the document
   * @param {"light" | "dark"} theme
   */
  applyTheme(theme) {
    const normalized = this.normalizeTheme(theme);
    const root = document.documentElement;

    root.classList.add("theme-transition");
    root.classList.toggle("dark", normalized === "dark");
    root.setAttribute("data-theme", normalized);

    if (this.appData) {
      this.appData.theme = normalized;
    }

    this.updateToggleUI(normalized);

    window.setTimeout(function () {
      root.classList.remove("theme-transition");
    }, 350);
  },

  /**
   * Toggles between light and dark mode
   */
  toggleTheme() {
    if (!this.appData) {
      return;
    }

    const nextTheme = this.appData.theme === "dark" ? "light" : "dark";
    this.appData.theme = nextTheme;
    Storage.saveData(this.appData);
    this.applyTheme(nextTheme);
  },

  /**
   * Updates the theme toggle button label and icons
   * @param {"light" | "dark"} theme
   */
  updateToggleUI(theme) {
    const toggle = document.getElementById("theme-toggle");
    const moonIcon = document.getElementById("theme-icon-moon");
    const sunIcon = document.getElementById("theme-icon-sun");
    const label = document.getElementById("theme-toggle-label");

    if (!toggle) {
      return;
    }

    const isDark = theme === "dark";

    if (moonIcon && sunIcon) {
      moonIcon.classList.toggle("hidden", isDark);
      sunIcon.classList.toggle("hidden", !isDark);
    }

    if (label) {
      label.textContent = isDark ? "Light Mode" : "Dark Mode";
    }

    toggle.setAttribute(
      "aria-label",
      isDark ? "Switch to light mode" : "Switch to dark mode"
    );
  },

  /**
   * Binds click event to the theme toggle button
   */
  bindToggle() {
    const toggle = document.getElementById("theme-toggle");

    if (!toggle) {
      return;
    }

    toggle.addEventListener("click", function () {
      Theme.toggleTheme();
    });
  },
};
