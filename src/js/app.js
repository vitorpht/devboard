/**
 * DevBoard — Main Application Entry Point
 * Phase 3: Bootstraps persistence layer on startup
 */

(function () {
  "use strict";

  /** @type {{ tasks: Array, projects: Array, theme: string } | null} */
  let appData = null;

  /**
   * Initialize the DevBoard application
   */
  function init() {
    const dashboard = document.getElementById("dashboard");

    if (!dashboard) {
      console.warn("[DevBoard] Dashboard container not found.");
      return;
    }

    appData = Storage.loadData();
    console.info("[DevBoard] Application initialized — Phase 3", appData);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
