/**
 * DevBoard — Tasks Module
 * Phase 4: Task actions — complete, edit, delete, and filters
 */

const Tasks = {
  /** @type {{ tasks: Array, projects: Array, theme: string } | null} */
  appData: null,

  /** @type {string | null} */
  editingTaskId: null,

  /** @type {"all" | "pending" | "completed"} */
  currentFilter: "all",

  VALID_PRIORITIES: ["Low", "Medium", "High"],

  /**
   * Initializes the tasks module with application data
   * @param {{ tasks: Array, projects: Array, theme: string }} appData
   */
  init(appData) {
    this.appData = appData;
    this.bindEvents();
    this.renderTasks();
    this.updateDashboardStats();
  },

  /**
   * Binds event listeners for task actions and filters
   */
  bindEvents() {
    const list = document.getElementById("task-list");
    const filters = document.getElementById("task-filters");
    const cancelBtn = document.getElementById("task-cancel-edit");

    if (list) {
      list.addEventListener("click", function (event) {
        const button = event.target.closest("[data-action]");

        if (!button) {
          return;
        }

        const taskId = button.getAttribute("data-task-id");
        const action = button.getAttribute("data-action");

        if (action === "complete") {
          Tasks.toggleTaskCompletion(taskId);
        } else if (action === "edit") {
          Tasks.prepareTaskEdit(taskId);
        } else if (action === "delete") {
          Tasks.deleteTask(taskId);
        }
      });
    }

    if (filters) {
      filters.addEventListener("click", function (event) {
        const button = event.target.closest("[data-filter]");

        if (!button) {
          return;
        }

        Tasks.setFilter(button.getAttribute("data-filter"));
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener("click", function () {
        Tasks.cancelEdit();
      });
    }
  },

  /**
   * Finds a task by its unique identifier
   * @param {string} taskId
   * @returns {object | undefined}
   */
  getTaskById(taskId) {
    return this.appData.tasks.find(function (task) {
      return task.id === taskId;
    });
  },

  /**
   * Validates task input before creation or update
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
   * Updates an existing task and persists changes
   * @param {string} taskId
   * @param {string} title
   * @param {string} description
   * @param {string} priority
   * @returns {{ success: boolean, error?: string, task?: object }}
   */
  editTask(taskId, title, description, priority) {
    const task = this.getTaskById(taskId);

    if (!task) {
      return { success: false, error: "Task not found." };
    }

    const validation = this.validateTask(title, description, priority);

    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    task.title = validation.data.title;
    task.description = validation.data.description;
    task.priority = validation.data.priority;

    Storage.saveData(this.appData);
    this.cancelEdit();
    this.renderTasks();
    this.updateDashboardStats();

    return { success: true, task: task };
  },

  /**
   * Loads a task into the form for editing
   * @param {string} taskId
   * @returns {{ success: boolean, error?: string }}
   */
  prepareTaskEdit(taskId) {
    const task = this.getTaskById(taskId);

    if (!task) {
      return { success: false, error: "Task not found." };
    }

    const titleInput = document.getElementById("task-title");
    const descriptionInput = document.getElementById("task-description");
    const priorityInput = document.getElementById("task-priority");
    const submitBtn = document.getElementById("task-submit-btn");
    const cancelBtn = document.getElementById("task-cancel-edit");

    if (!titleInput || !descriptionInput || !priorityInput || !submitBtn) {
      return { success: false, error: "Form elements not found." };
    }

    this.editingTaskId = taskId;
    titleInput.value = task.title;
    descriptionInput.value = task.description;
    priorityInput.value = task.priority;
    submitBtn.textContent = "Save Changes";

    if (cancelBtn) {
      cancelBtn.classList.remove("hidden");
    }

    titleInput.focus();
    document.getElementById("task-form").scrollIntoView({ behavior: "smooth", block: "start" });

    return { success: true };
  },

  /**
   * Cancels the current edit session and resets the form
   */
  cancelEdit() {
    this.editingTaskId = null;

    const form = document.getElementById("task-form");
    const submitBtn = document.getElementById("task-submit-btn");
    const cancelBtn = document.getElementById("task-cancel-edit");
    const priorityInput = document.getElementById("task-priority");

    if (form) {
      form.reset();
    }

    if (priorityInput) {
      priorityInput.value = "Medium";
    }

    if (submitBtn) {
      submitBtn.textContent = "Create Task";
    }

    if (cancelBtn) {
      cancelBtn.classList.add("hidden");
    }
  },

  /**
   * Toggles the completed status of a task
   * @param {string} taskId
   * @returns {{ success: boolean, error?: string }}
   */
  toggleTaskCompletion(taskId) {
    const task = this.getTaskById(taskId);

    if (!task) {
      return { success: false, error: "Task not found." };
    }

    task.completed = !task.completed;
    Storage.saveData(this.appData);
    this.renderTasks();
    this.updateDashboardStats();

    return { success: true };
  },

  /**
   * Deletes a task from LocalStorage
   * @param {string} taskId
   * @returns {{ success: boolean, error?: string }}
   */
  deleteTask(taskId) {
    const taskIndex = this.appData.tasks.findIndex(function (task) {
      return task.id === taskId;
    });

    if (taskIndex === -1) {
      return { success: false, error: "Task not found." };
    }

    if (this.editingTaskId === taskId) {
      this.cancelEdit();
    }

    this.appData.tasks.splice(taskIndex, 1);
    Storage.saveData(this.appData);
    this.renderTasks();
    this.updateDashboardStats();

    return { success: true };
  },

  /**
   * Returns tasks filtered by the current filter state
   * @param {"all" | "pending" | "completed"} filter
   * @returns {Array}
   */
  filterTasks(filter) {
    const tasks = this.appData.tasks;

    if (filter === "pending") {
      return tasks.filter(function (task) {
        return !task.completed;
      });
    }

    if (filter === "completed") {
      return tasks.filter(function (task) {
        return task.completed;
      });
    }

    return tasks;
  },

  /**
   * Sets the active task filter and re-renders the list
   * @param {string} filter
   */
  setFilter(filter) {
    if (filter !== "all" && filter !== "pending" && filter !== "completed") {
      return;
    }

    this.currentFilter = filter;
    this.updateFilterButtons();
    this.renderTasks();
  },

  /**
   * Updates visual state of filter buttons
   */
  updateFilterButtons() {
    const buttons = document.querySelectorAll("#task-filters [data-filter]");

    buttons.forEach(function (button) {
      const isActive = button.getAttribute("data-filter") === Tasks.currentFilter;

      if (isActive) {
        button.className =
          "filter-btn rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white";
      } else {
        button.className =
          "filter-btn rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50";
      }
    });
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
    const completeLabel = task.completed ? "Reopen" : "Complete";
    const itemClass = task.completed
      ? "task-item rounded-lg border border-slate-200 bg-slate-50 p-4 opacity-60"
      : "task-item rounded-lg border border-slate-200 bg-slate-50 p-4";
    const titleClass = task.completed
      ? "text-base font-semibold text-slate-900 line-through"
      : "text-base font-semibold text-slate-900";

    const descriptionHtml = task.description
      ? `<p class="mt-2 text-sm text-slate-500">${this.escapeHtml(task.description)}</p>`
      : "";

    return (
      `<li class="${itemClass}" data-task-id="${this.escapeHtml(task.id)}">` +
      `<div class="flex flex-wrap items-start justify-between gap-3">` +
      `<h5 class="${titleClass}">${this.escapeHtml(task.title)}</h5>` +
      `<div class="flex flex-wrap gap-2">` +
      `<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${priorityClass}">${this.escapeHtml(task.priority)}</span>` +
      `<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusClass}">${statusLabel}</span>` +
      `</div></div>${descriptionHtml}` +
      `<div class="mt-4 flex flex-wrap gap-2">` +
      `<button type="button" data-action="complete" data-task-id="${this.escapeHtml(task.id)}" class="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100">${completeLabel}</button>` +
      `<button type="button" data-action="edit" data-task-id="${this.escapeHtml(task.id)}" class="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100">Edit</button>` +
      `<button type="button" data-action="delete" data-task-id="${this.escapeHtml(task.id)}" class="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100">Delete</button>` +
      `</div></li>`
    );
  },

  /**
   * Renders filtered tasks into the task list container
   */
  renderTasks() {
    const list = document.getElementById("task-list");
    const emptyState = document.getElementById("task-list-empty");
    const emptyMessage = document.getElementById("task-list-empty-message");

    if (!list || !this.appData) {
      return;
    }

    const allTasks = this.appData.tasks;
    const filteredTasks = this.filterTasks(this.currentFilter);

    if (filteredTasks.length === 0) {
      list.innerHTML = "";

      if (emptyState) {
        emptyState.classList.remove("hidden");
      }

      if (emptyMessage) {
        if (allTasks.length === 0) {
          emptyMessage.textContent = "No tasks yet. Create your first task above.";
        } else if (this.currentFilter === "pending") {
          emptyMessage.textContent = "No pending tasks.";
        } else if (this.currentFilter === "completed") {
          emptyMessage.textContent = "No completed tasks.";
        } else {
          emptyMessage.textContent = "No tasks to display.";
        }
      }

      return;
    }

    if (emptyState) {
      emptyState.classList.add("hidden");
    }

    list.innerHTML = filteredTasks.map(function (task) {
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
