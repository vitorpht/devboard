/**
 * DevBoard — Projects Module
 * Phase 5: Project management and task association
 */

const Projects = {
  /** @type {{ tasks: Array, projects: Array, theme: string } | null} */
  appData: null,

  /** @type {string | null} */
  activeProjectId: null,

  /**
   * Initializes the projects module with application data
   * @param {{ tasks: Array, projects: Array, theme: string }} appData
   */
  init(appData) {
    this.appData = appData;
    this.bindEvents();
    this.renderProjects();
    this.updateTaskProjectSelector();
    this.updateDashboardStats();
  },

  /**
   * Binds event listeners for project filtering
   */
  bindEvents() {
    const list = document.getElementById("project-list");

    if (!list) {
      return;
    }

    list.addEventListener("click", function (event) {
      const button = event.target.closest("[data-project-filter]");

      if (!button) {
        return;
      }

      const projectId = button.getAttribute("data-project-filter");

      if (projectId === "all") {
        Projects.setActiveProject(null);
      } else {
        Projects.setActiveProject(projectId);
      }
    });
  },

  /**
   * Finds a project by its unique identifier
   * @param {string} projectId
   * @returns {object | undefined}
   */
  getProjectById(projectId) {
    return this.appData.projects.find(function (project) {
      return project.id === projectId;
    });
  },

  /**
   * Validates project input before creation
   * @param {string} name
   * @param {string} description
   * @returns {{ valid: boolean, error?: string, data?: { name: string, description: string } }}
   */
  validateProject(name, description) {
    const trimmedName = (name || "").trim();

    if (!trimmedName) {
      return { valid: false, error: "Project name is required." };
    }

    const isDuplicate = this.appData.projects.some(function (project) {
      return project.name.trim().toLowerCase() === trimmedName.toLowerCase();
    });

    if (isDuplicate) {
      return { valid: false, error: "A project with this name already exists." };
    }

    return {
      valid: true,
      data: {
        name: trimmedName,
        description: (description || "").trim(),
      },
    };
  },

  /**
   * Generates a unique project identifier
   * @returns {string}
   */
  generateId() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }

    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  },

  /**
   * Creates a new project and persists it to LocalStorage
   * @param {string} name
   * @param {string} description
   * @returns {{ success: boolean, error?: string, project?: object }}
   */
  createProject(name, description) {
    const validation = this.validateProject(name, description);

    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const project = {
      id: this.generateId(),
      name: validation.data.name,
      description: validation.data.description,
      createdAt: Date.now(),
    };

    this.appData.projects.push(project);
    Storage.saveData(this.appData);
    this.renderProjects();
    this.updateTaskProjectSelector();
    this.updateDashboardStats();

    return { success: true, project: project };
  },

  /**
   * Returns the number of tasks associated with a project
   * @param {string} projectId
   * @returns {number}
   */
  getTaskCount(projectId) {
    return this.appData.tasks.filter(function (task) {
      return task.projectId === projectId;
    }).length;
  },

  /**
   * Filters tasks by the selected project
   * @param {Array} tasks
   * @param {string | null} projectId
   * @returns {Array}
   */
  filterTasksByProject(tasks, projectId) {
    if (!projectId) {
      return tasks;
    }

    return tasks.filter(function (task) {
      return task.projectId === projectId;
    });
  },

  /**
   * Sets the active project filter and updates the task list
   * @param {string | null} projectId
   */
  setActiveProject(projectId) {
    this.activeProjectId = projectId;
    this.updateProjectFilterButtons();
    Tasks.setProjectFilter(projectId);
  },

  /**
   * Updates visual state of project filter buttons
   */
  updateProjectFilterButtons() {
    const buttons = document.querySelectorAll("[data-project-filter]");

    buttons.forEach(function (button) {
      const filterId = button.getAttribute("data-project-filter");
      const isAllActive = !Projects.activeProjectId && filterId === "all";
      const isProjectActive =
        Projects.activeProjectId && filterId === Projects.activeProjectId;

      if (isAllActive || isProjectActive) {
        button.className =
          "project-filter-btn w-full rounded-lg border border-violet-200 bg-violet-50 p-4 text-left ring-2 ring-violet-500/20";
      } else {
        button.className =
          "project-filter-btn w-full rounded-lg border border-slate-200 bg-slate-50 p-4 text-left hover:border-slate-300 hover:bg-white";
      }
    });
  },

  /**
   * Populates the task form project selector with existing projects
   */
  updateTaskProjectSelector() {
    const select = document.getElementById("task-project");

    if (!select) {
      return;
    }

    const currentValue = select.value;
    select.innerHTML = '<option value="">No Project</option>';

    this.appData.projects.forEach(function (project) {
      const option = document.createElement("option");
      option.value = project.id;
      option.textContent = project.name;
      select.appendChild(option);
    });

    const optionExists = Array.from(select.options).some(function (option) {
      return option.value === currentValue;
    });

    select.value = optionExists ? currentValue : "";
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
   * Builds the HTML string for a single project card
   * @param {object} project
   * @returns {string}
   */
  buildProjectCard(project) {
    const taskCount = this.getTaskCount(project.id);
    const taskLabel = taskCount === 1 ? "task" : "tasks";

    const descriptionHtml = project.description
      ? `<p class="mt-1 text-sm text-slate-500">${this.escapeHtml(project.description)}</p>`
      : "";

    return (
      `<li>` +
      `<button type="button" data-project-filter="${this.escapeHtml(project.id)}" class="project-filter-btn w-full rounded-lg border border-slate-200 bg-slate-50 p-4 text-left hover:border-slate-300 hover:bg-white">` +
      `<div class="flex items-start justify-between gap-3">` +
      `<div>` +
      `<h5 class="text-base font-semibold text-slate-900">${this.escapeHtml(project.name)}</h5>` +
      `${descriptionHtml}` +
      `</div>` +
      `<span class="shrink-0 rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-medium text-violet-700 ring-1 ring-inset ring-violet-600/20">${taskCount} ${taskLabel}</span>` +
      `</div></button></li>`
    );
  },

  /**
   * Renders all projects into the project list container
   */
  renderProjects() {
    const list = document.getElementById("project-list");
    const emptyState = document.getElementById("project-list-empty");

    if (!list || !this.appData) {
      return;
    }

    const allProjectsButton =
      `<li>` +
      `<button type="button" data-project-filter="all" class="project-filter-btn w-full rounded-lg border border-violet-200 bg-violet-50 p-4 text-left ring-2 ring-violet-500/20">` +
      `<h5 class="text-base font-semibold text-slate-900">All Projects</h5>` +
      `<p class="mt-1 text-sm text-slate-500">Show tasks from every project</p>` +
      `</button></li>`;

    if (this.appData.projects.length === 0) {
      list.innerHTML = allProjectsButton;

      if (emptyState) {
        emptyState.classList.remove("hidden");
      }

      this.updateProjectFilterButtons();
      return;
    }

    if (emptyState) {
      emptyState.classList.add("hidden");
    }

    list.innerHTML =
      allProjectsButton +
      this.appData.projects.map(function (project) {
        return Projects.buildProjectCard(project);
      }).join("");

    this.updateProjectFilterButtons();
  },

  /**
   * Updates the Active Projects dashboard stat card
   */
  updateDashboardStats() {
    const projectsEl = document.querySelector('[data-stat="projects"]');

    if (projectsEl && this.appData) {
      projectsEl.textContent = String(this.appData.projects.length);
    }
  },
};
