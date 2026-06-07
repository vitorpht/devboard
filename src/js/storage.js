/**
 * DevBoard — Storage Module
 * Phase 3: LocalStorage persistence layer
 */

const Storage = {
  STORAGE_KEY: "devboard_data",

  DEFAULT_DATA: {
    tasks: [],
    projects: [],
    theme: "light",
  },

  /**
   * Returns a fresh copy of the default data structure
   * @returns {{ tasks: Array, projects: Array, theme: string }}
   */
  getDefaultData() {
    return {
      tasks: [],
      projects: [],
      theme: "light",
    };
  },

  /**
   * Ensures loaded data matches the expected shape
   * @param {object} data
   * @returns {{ tasks: Array, projects: Array, theme: string }}
   */
  normalizeData(data) {
    if (!data || typeof data !== "object") {
      return this.getDefaultData();
    }

    return {
      tasks: Array.isArray(data.tasks) ? data.tasks : [],
      projects: Array.isArray(data.projects) ? data.projects : [],
      theme: typeof data.theme === "string" ? data.theme : "light",
    };
  },

  /**
   * Saves application data to LocalStorage
   * @param {{ tasks: Array, projects: Array, theme: string }} data
   * @returns {boolean} Whether the save succeeded
   */
  saveData(data) {
    try {
      const normalized = this.normalizeData(data);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(normalized));
      return true;
    } catch (error) {
      console.error("[DevBoard Storage] Failed to save data:", error);
      return false;
    }
  },

  /**
   * Loads application data from LocalStorage
   * Initializes storage with defaults if no data exists
   * @returns {{ tasks: Array, projects: Array, theme: string }}
   */
  loadData() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);

      if (raw === null) {
        const defaults = this.getDefaultData();
        this.saveData(defaults);
        return defaults;
      }

      const parsed = JSON.parse(raw);
      const normalized = this.normalizeData(parsed);

      return normalized;
    } catch (error) {
      console.error("[DevBoard Storage] Failed to load data:", error);
      const defaults = this.getDefaultData();
      this.saveData(defaults);
      return defaults;
    }
  },
};
