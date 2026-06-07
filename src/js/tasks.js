/**
 * DevBoard — Tasks Module
 * Phase 3: Task creation and rendering
 */

const Tasks = {
  /** @type {{ tasks: Array, projects: Array, theme: string } | null} */
  appData: null,

  VALID_PRIORITIES: ["Low", "Medium", "High"],

  /**
   * Initializes the tasks module with application data
   * @param {{ tasks: Array, projects: Array, theme: string }} appData
   */
  init(appData) {
    this.appData = appData;
    this.renderTasks();
    this.updateDashboardStats();
  },

  /**
   * Validates task input before creation
   * @param {string} title
   * @param {string} description
   * @param {string} priority
   * @returns {{ valid: boolean, error?: string, data?: { title: string, description: string, priority: string } }}
   */
  validateTask(title, description, priority) {
    const trimmedTitle = (title || "").trim();

    if (!trimmedTitle) {
      return { valid: false, error: "Title is required." };
    }

    const normalizedPriority = this.VALID_PRIORITIES.includes(priority)
      ? priority
      : "Medium";

    return {
      valid: true,
      data: {
        title: trimmedTitle,
        description: (description || "").trim(),
        priority: normalizedPriority,
      },
    };
  },

  /**
   * Generates a unique task identifier
   * @returns {string}
   */
  generateId() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }

    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  },

  /**
   * Creates a new task and persists it to LocalStorage
   * @param {string} title
   * @param {string} description
   * @param {string} priority
   * @returns {{ success: boolean, error?: string, task?: object }}
   */
  createTask(title, description, priority) {
    const validation = this.validateTask(title, description, priority);

    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const task = {
      id: this.generateId(),
      title: validation.data.title,
      description: validation.data.description,
      priority: validation.data.priority,
      completed: false,
      projectId: null,
      createdAt: Date.now(),
    };

    this.appData.tasks.push(task);
    Storage.saveData(this.appData);
    this.renderTasks();
    this.updateDashboardStats();

    return { success: true, task: task };
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

  /**
   * Returns Tailwind classes for a priority badge
   * @param {string} priority
   * @returns {string}
   */
  getPriorityBadgeClass(priority) {
    switch (priority) {
      case "High":
        return "bg-red-50 text-red-700 ring-red-600/20";
      case "Medium":
        return "bg-amber-50 text-amber-700 ring-amber-600/20";
      default:
        return "bg-slate-100 text-slate-600 ring-slate-500/20";
    }
  },

  /**
   * Builds the HTML string for a single task card
   * @param {object} task
   * @returns {string}
   */
  buildTaskCard(task) {
    const priorityClass = this.getPriorityBadgeClass(task.priority);
    const statusLabel = task.completed ? "Completed" : "Pending";
    const statusClass = task.completed
      ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
      : "bg-amber-50 text-amber-700 ring-amber-600/20";

    const descriptionHtml = task.description
      ? `<p class="mt-2 text-sm text-slate-500">${this.escapeHtml(task.description)}</p>`
      : "";

    return (
      `<li class="task-item rounded-lg border border-slate-200 bg-slate-50 p-4">` +
      `<div class="flex flex-wrap items-start justify-between gap-3">` +
      `<h5 class="text-base font-semibold text-slate-900">${this.escapeHtml(task.title)}</h5>` +
      `<div class="flex flex-wrap gap-2">` +
      `<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${priorityClass}">${this.escapeHtml(task.priority)}</span>` +
      `<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusClass}">${statusLabel}</span>` +
      `</div></div>${descriptionHtml}</li>`
    );
  },

  /**
   * Renders all tasks into the task list container
   */
  renderTasks() {
    const list = document.getElementById("task-list");
    const emptyState = document.getElementById("task-list-empty");

    if (!list || !this.appData) {
      return;
    }

    const tasks = this.appData.tasks;

    if (tasks.length === 0) {
      list.innerHTML = "";
      if (emptyState) {
        emptyState.classList.remove("hidden");
      }
      return;
    }

    if (emptyState) {
      emptyState.classList.add("hidden");
    }

    list.innerHTML = tasks.map(function (task) {
      return Tasks.buildTaskCard(task);
    }).join("");
  },

  /**
   * Updates dashboard stat cards based on current task data
   */
  updateDashboardStats() {
    if (!this.appData) {
      return;
    }

    const tasks = this.appData.tasks;
    const total = tasks.length;
    const completed = tasks.filter(function (task) {
      return task.completed;
    }).length;
    const pending = total - completed;

    const totalEl = document.querySelector('[data-stat="total"]');
    const pendingEl = document.querySelector('[data-stat="pending"]');
    const completedEl = document.querySelector('[data-stat="completed"]');

    if (totalEl) {
      totalEl.textContent = String(total);
    }

    if (pendingEl) {
      pendingEl.textContent = String(pending);
    }

    if (completedEl) {
      completedEl.textContent = String(completed);
    }
  },
};
