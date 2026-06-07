/**
 * DevBoard — Storage Module
 * Phase 2: LocalStorage persistence layer
 */

const Storage = {
  STORAGE_KEY: "devboard_data",

  /**
   * Returns a fresh copy of the default application data structure
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
   * Validates and normalizes data to match the expected structure
   * @param {unknown} data
   * @returns {{ tasks: Array, projects: Array, theme: string }}
   */
  normalizeData(data) {
    const defaults = this.getDefaultData();

    if (!data || typeof data !== "object") {
      return defaults;
    }

    return {
      tasks: Array.isArray(data.tasks) ? data.tasks : defaults.tasks,
      projects: Array.isArray(data.projects) ? data.projects : defaults.projects,
      theme: data.theme === "dark" ? "dark" : "light",
    };
  },

  /**
   * Saves application data to LocalStorage
   * @param {{ tasks: Array, projects: Array, theme: string }} data
   * @returns {boolean}
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
   * Ensures LocalStorage contains a valid data structure
   * Creates defaults when empty; preserves existing valid data
   * @returns {{ tasks: Array, projects: Array, theme: string }}
   */
  initializeStorage() {
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
      console.error("[DevBoard Storage] Invalid data, reinitializing:", error);
      const defaults = this.getDefaultData();
      this.saveData(defaults);
      return defaults;
    }
  },

  /**
   * Loads application data from LocalStorage
   * @returns {{ tasks: Array, projects: Array, theme: string }}
   */
  loadData() {
    this.initializeStorage();

    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);

      if (raw === null) {
        return this.getDefaultData();
      }

      return this.normalizeData(JSON.parse(raw));
    } catch (error) {
      console.error("[DevBoard Storage] Failed to load data:", error);
      const defaults = this.getDefaultData();
      this.saveData(defaults);
      return defaults;
    }
  },
};
