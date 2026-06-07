/**
 * DevBoard — Main Application Entry Point
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
   * Shows a validation error on the task form
   * @param {string} message
   */
  function showFormError(elementId, message) {
    const errorEl = document.getElementById(elementId);

    if (!errorEl) {
      return;
    }

    errorEl.textContent = message;
    errorEl.classList.add("is-visible");
  }

  function clearFormError(elementId) {
    const errorEl = document.getElementById(elementId);

    if (!errorEl) {
      return;
    }

    errorEl.textContent = "";
    errorEl.classList.remove("is-visible");
  }

  function showTaskFormError(message) {
    showFormError("task-form-error", message);
  }

  function clearTaskFormError() {
    clearFormError("task-form-error");
  }

  function showProjectFormError(message) {
    showFormError("project-form-error", message);
  }

  function clearProjectFormError() {
    clearFormError("project-form-error");
  }

  /**
   * Registers event listeners for the task form
   */
  function initTaskForm() {
    const form = document.getElementById("task-form");

    if (!form) {
      return;
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      clearTaskFormError();

      const titleInput = document.getElementById("task-title");
      const descriptionInput = document.getElementById("task-description");
      const priorityInput = document.getElementById("task-priority");
      const projectInput = document.getElementById("task-project");

      let result;

      if (Tasks.editingTaskId) {
        result = Tasks.editTask(
          Tasks.editingTaskId,
          titleInput.value,
          descriptionInput.value,
          priorityInput.value,
          projectInput.value
        );
      } else {
        result = Tasks.createTask(
          titleInput.value,
          descriptionInput.value,
          priorityInput.value,
          projectInput.value
        );

        if (result.success) {
          form.reset();
          priorityInput.value = "Medium";
          projectInput.value = "";
        }
      }

      if (!result.success) {
        showTaskFormError(result.error);
        titleInput.focus();
        return;
      }

      if (!Tasks.editingTaskId) {
        titleInput.focus();
      }
    });
  }

  /**
   * Registers event listeners for the project form
   */
  function initProjectForm() {
    const form = document.getElementById("project-form");

    if (!form) {
      return;
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      clearProjectFormError();

      const nameInput = document.getElementById("project-name");
      const descriptionInput = document.getElementById("project-description");

      const result = Projects.createProject(nameInput.value, descriptionInput.value);

      if (!result.success) {
        showProjectFormError(result.error);
        nameInput.focus();
        return;
      }

      form.reset();
      nameInput.focus();
    });
  }

  /**
   * Initialize the DevBoard application
   */
  function init() {
    if (!document.getElementById("tasks-section")) {
      return;
    }

    initSidebar();

    const appData = Storage.loadData();

    Theme.init(appData);
    Projects.init(appData);
    Tasks.init(appData);
    initProjectForm();
    initTaskForm();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
