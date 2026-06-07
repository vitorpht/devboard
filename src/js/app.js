/**
 * DevBoard — Main Application Entry Point
 * Phase 1: Dashboard layout initialization
 */

(function () {
  "use strict";

  /**
   * Initialize responsive sidebar toggle for mobile
   */
  function initSidebar() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebar-overlay");
    const toggle = document.getElementById("sidebar-toggle");

    if (!sidebar || !overlay || !toggle) {
      return;
    }

    function openSidebar() {
      sidebar.classList.add("is-open");
      overlay.classList.add("is-visible");
      overlay.classList.remove("hidden");
      toggle.setAttribute("aria-expanded", "true");
    }

    function closeSidebar() {
      sidebar.classList.remove("is-open");
      overlay.classList.remove("is-visible");
      overlay.classList.add("hidden");
      toggle.setAttribute("aria-expanded", "false");
    }

    toggle.addEventListener("click", function () {
      if (sidebar.classList.contains("is-open")) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });

    overlay.addEventListener("click", closeSidebar);

    window.addEventListener("resize", function () {
      if (window.innerWidth >= 1024) {
        closeSidebar();
      }
    });
  }

  /**
   * Initialize the DevBoard application
   */
  function init() {
    const dashboard = document.getElementById("dashboard");

    if (!dashboard) {
      console.warn("[DevBoard] Dashboard container not found.");
      return;
    }

    initSidebar();
    Theme.init();

    console.info("[DevBoard] Application initialized — Phase 1");
  }

  document.addEventListener("DOMContentLoaded", init);
})();
