"use strict";

/* =========================================================
   StudyOS — Personal Study Workspace
   All data is stored locally in this browser.
   ========================================================= */

const STORAGE_KEY = "studyos_premium_v1";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const COLORS = {
  violet: "#a78bfa",
  blue: "#65b8ff",
  green: "#55d6a0",
  amber: "#f3c66b",
  rose: "#ff8eae"
};

const SUBJECT_ICONS = ["✦", "◈", "⌘", "◎", "✳", "◇", "▦"];

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function localDate(date = new Date()) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function shiftDate(days, from = new Date()) {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return localDate(d);
}

function safeDate(value) {
  if (!value) return null;
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value, options = {}) {
  const date = safeDate(value);
  if (!date) return "No date";
  return date.toLocaleDateString(undefined, options);
}

function formatMinutes(minutes) {
  const total = Math.max(0, Math.round(Number(minutes) || 0));
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  if (hours && mins) return `${hours}h ${mins}m`;
  if (hours) return `${hours}h`;
  return `${mins} min`;
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function emptyState(icon, title, description) {
  return `
    <div class="empty-state">
      <div class="empty-icon">${icon}</div>
      <strong>${escapeHTML(title)}</strong>
      <p>${escapeHTML(description)}</p>
    </div>`;
}

function defaultState() {
  const today = localDate();
  const tomorrow = shiftDate(1);

  const physicsId = uid();
  const mathsId = uid();
  const programmingId = uid();

  return {
    version: 1,
    profile: {
      name: "Student",
      dailyGoal: 120,
      theme: "dark"
    },
    subjects: [
      {
        id: physicsId,
        name: "Physics",
        color: "violet",
        topics: [
          { id: uid(), name: "Electrostatics", done: false },
          { id: uid(), name: "Current electricity", done: false },
          { id: uid(), name: "Magnetism", done: false },
          { id: uid(), name: "Electromagnetic induction", done: false }
        ]
      },
      {
        id: mathsId,
        name: "Mathematics",
        color: "blue",
        topics: [
          { id: uid(), name: "Differentiation", done: false },
          { id: uid(), name: "Integration", done: false },
          { id: uid(), name: "Matrices", done: false }
        ]
      },
      {
        id: programmingId,
        name: "C Programming",
        color: "green",
        topics: [
          { id: uid(), name: "Arrays", done: false },
          { id: uid(), name: "Functions", done: false },
          { id: uid(), name: "Pointers", done: false }
        ]
      }
    ],
    tasks: [
      {
        id: uid(),
        title: "Revise today's class notes",
        description: "Review the key concepts and mark doubts.",
        subjectId: physicsId,
        priority: "high",
        dueDate: today,
        estimate: 30,
        completed: false,
        createdAt: Date.now()
      },
      {
        id: uid(),
        title: "Solve practice questions",
        description: "Focus on questions that need more practice.",
        subjectId: mathsId,
        priority: "medium",
        dueDate: today,
        estimate: 45,
        completed: false,
        createdAt: Date.now() - 1000
      },
      {
        id: uid(),
        title: "Practice array programs",
        description: "Write and test a few C programs.",
        subjectId: programmingId,
        priority: "low",
        dueDate: tomorrow,
        estimate: 30,
        completed: false,
        createdAt: Date.now() - 2000
      }
    ],
    sessions: [],
    focusGoal: {
      text: "",
      subjectId: ""
    }
  };
}

function normalizeState(data) {
  const base = defaultState();

  if (!data || typeof data !== "object") return base;

  const profile = data.profile && typeof data.profile === "object"
    ? data.profile
    : {};

  const subjects = Array.isArray(data.subjects) ? data.subjects : base.subjects;
  const tasks = Array.isArray(data.tasks) ? data.tasks : [];
  const sessions = Array.isArray(data.sessions) ? data.sessions : [];

  return {
    version: 1,
    profile: {
      name: typeof profile.name === "string" ? profile.name.slice(0, 50) : "Student",
      dailyGoal: Math.min(1440, Math.max(5, Number(profile.dailyGoal) || 120)),
      theme: profile.theme === "light" ? "light" : "dark"
    },
    subjects: subjects.map(subject => ({
      id: String(subject.id || uid()),
      name: String(subject.name || "Untitled subject").slice(0, 60),
      color: COLORS[subject.color] ? subject.color : "violet",
      topics: Array.isArray(subject.topics)
        ? subject.topics.map(topic => ({
            id: String(topic.id || uid()),
            name: String(topic.name || "Untitled topic").slice(0, 120),
            done: Boolean(topic.done)
          }))
        : []
    })),
    tasks: tasks.map(task => ({
      id: String(task.id || uid()),
      title: String(task.title || "Untitled task").slice(0, 120),
      description: String(task.description || "").slice(0, 500),
      subjectId: String(task.subjectId || ""),
      priority: ["low", "medium", "high"].includes(task.priority)
        ? task.priority : "medium",
      dueDate: /^\d{4}-\d{2}-\d{2}$/.test(task.dueDate || "")
        ? task.dueDate : "",
      estimate: Math.min(1440, Math.max(1, Number(task.estimate) || 30)),
      completed: Boolean(task.completed),
      createdAt: Number(task.createdAt) || Date.now(),
      completedAt: Number(task.completedAt) || null
    })),
    sessions: sessions
      .filter(session => session && typeof session === "object")
      .map(session => ({
        id: String(session.id || uid()),
        title: String(session.title || "Study session").slice(0, 120),
        subjectId: String(session.subjectId || ""),
        date: /^\d{4}-\d{2}-\d{2}$/.test(session.date || "")
          ? session.date : localDate(),
        time: /^\d{2}:\d{2}$/.test(session.time || "")
          ? session.time : "16:00",
        duration: Math.min(1440, Math.max(1, Number(session.duration) || 60)),
        createdAt: Number(session.createdAt) || Date.now()
      })),
    focusGoal: {
      text: String(data.focusGoal?.text || "").slice(0, 200),
      subjectId: String(data.focusGoal?.subjectId || "")
    }
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return normalizeState(JSON.parse(raw));
  } catch (error) {
    console.warn("Could not load StudyOS data:", error);
  }

  return defaultState();
}

let state = loadState();

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (error) {
    console.error("Could not save StudyOS data:", error);
    toast("Your browser could not save the data. Check storage space or privacy settings.", "error");
    return false;
  }
}

/* -------------------- Toast messages -------------------- */

function toast(message, type = "success") {
  const region = $("#toastRegion");
  if (!region) return;

  const item = document.createElement("div");
  item.className = `toast ${type === "error" ? "error" : ""}`;
  item.innerHTML = `
    <span class="toast-symbol">${type === "error" ? "!" : "✓"}</span>
    <span>${escapeHTML(message)}</span>`;

  region.appendChild(item);

  window.setTimeout(() => {
    item.style.opacity = "0";
    item.style.transform = "translateY(6px)";
    window.setTimeout(() => item.remove(), 250);
  }, 3200);
}
/* -------------------- Navigation -------------------- */

const PAGE_TITLES = {
  dashboard: "Good to see you.",
  tasks: "Your tasks.",
  planner: "Plan your time.",
  subjects: "Keep learning.",
  focus: "Find your focus.",
  analytics: "Look how far you've come.",
  settings: "Make it yours."
};

function navigate(page) {
  if (!PAGE_TITLES[page]) page = "dashboard";

  $$(".page-section").forEach(section => {
    section.classList.toggle("active", section.id === `page-${page}`);
  });

  $$(".nav-link").forEach(link => {
    link.classList.toggle("active", link.dataset.page === page);
  });

  $("#pageTitle").textContent = PAGE_TITLES[page];
  $("#breadcrumbCurrent").textContent =
    page === "dashboard" ? "Overview" :
    page.charAt(0).toUpperCase() + page.slice(1);

  $("#sidebar").classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });

  if (page === "analytics") renderAnalytics();
  if (page === "tasks") renderAllTasks();
  if (page === "planner") renderPlanner();
}

function bindNavigation() {
  $$("[data-page]").forEach(button => {
    button.addEventListener("click", event => {
      event.preventDefault();
      navigate(button.dataset.page);
    });
  });

  $("#menuToggle").addEventListener("click", () => {
    $("#sidebar").classList.toggle("open");
  });

  document.addEventListener("click", event => {
    if (window.innerWidth > 950) return;
    const sidebar = $("#sidebar");
    const toggle = $("#menuToggle");
    if (
      sidebar.classList.contains("open") &&
      !sidebar.contains(event.target) &&
      !toggle.contains(event.target)
    ) {
      sidebar.classList.remove("open");
    }
  });
}

/* -------------------- Theme and profile -------------------- */

function applyTheme() {
  const light = state.profile.theme === "light";
  document.body.classList.toggle("light-theme", light);
  $("#themeToggle").textContent = light ? "☾" : "☼";
  $("#settingsThemeToggle").setAttribute("aria-checked", String(!light));
}

function toggleTheme() {
  state.profile.theme = state.profile.theme === "light" ? "dark" : "light";
  applyTheme();
  saveState();
}

function renderProfile() {
  const name = state.profile.name.trim() || "Student";
  $("#profileName").textContent = name;
  $("#profileAvatar").textContent = name.charAt(0).toUpperCase();
  $("#settingName").value = state.profile.name;
  $("#settingDailyGoal").value = state.profile.dailyGoal;
}

function bindSettings() {
  $("#themeToggle").addEventListener("click", toggleTheme);
  $("#settingsThemeToggle").addEventListener("click", toggleTheme);

  $("#profileForm").addEventListener("submit", event => {
    event.preventDefault();

    const name = $("#settingName").value.trim();
    const goal = Number($("#settingDailyGoal").value);

    if (!name) {
      toast("Please enter your name.", "error");
      return;
    }

    if (!Number.isFinite(goal) || goal < 5 || goal > 1440) {
      toast("Choose a daily goal between 5 and 1440 minutes.", "error");
      return;
    }

    state.profile.name = name.slice(0, 50);
    state.profile.dailyGoal = goal;

    saveState();
    renderProfile();
    renderDashboard();
    toast("Your profile has been updated.");
  });

  $("#exportDataButton").addEventListener("click", exportBackup);
  $("#importDataButton").addEventListener("click", () => $("#importDataFile").click());
  $("#importDataFile").addEventListener("change", importBackup);
  $("#clearDataButton").addEventListener("click", clearAllData);
}

function updateDateLabels() {
  const now = new Date();
  $("#currentDate").textContent = now.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric"
  });

  $("#plannerDate").value = localDate();
  $("#taskDue").value = localDate();
  $("#sessionDate").value = localDate();
}

/* -------------------- Modal controls -------------------- */

function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  window.setTimeout(() => {
    const field = modal.querySelector("input:not([type=hidden]), textarea, select");
    if (field) field.focus();
  }, 50);
}

function closeModal(modal) {
  if (!modal) return;
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");

  if (!$(".modal-backdrop.open")) document.body.style.overflow = "";
}

function bindModals() {
  $$("[data-close-modal]").forEach(button => {
    button.addEventListener("click", () => closeModal(button.closest(".modal-backdrop")));
  });

  $$(".modal-backdrop").forEach(backdrop => {
    backdrop.addEventListener("click", event => {
      if (event.target === backdrop) closeModal(backdrop);
    });
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      const open = $(".modal-backdrop.open");
      if (open) closeModal(open);
    }
  });
}
/* -------------------- Subjects -------------------- */

function subjectById(id) {
  return state.subjects.find(subject => subject.id === id);
}

function subjectName(id) {
  return subjectById(id)?.name || "";
}

function subjectColor(id) {
  const subject = subjectById(id);
  return COLORS[subject?.color] || COLORS.violet;
}

function subjectOptions(selectedId = "") {
  return `<option value="">No subject</option>` + state.subjects.map(subject => `
    <option value="${escapeHTML(subject.id)}" ${subject.id === selectedId ? "selected" : ""}>
      ${escapeHTML(subject.name)}
    </option>`).join("");
}

function refreshSubjectSelects() {
  const mappings = [
    ["#taskSubject", true],
    ["#sessionSubject", false],
    ["#focusSubject", false]
  ];

  mappings.forEach(([selector, noSubject]) => {
    const select = $(selector);
    if (!select) return;
    const previous = select.value;
    select.innerHTML = noSubject
      ? subjectOptions(previous)
      : `<option value="">Choose a subject</option>` +
        state.subjects.map(subject => `
          <option value="${escapeHTML(subject.id)}">${escapeHTML(subject.name)}</option>
        `).join("");

    if (state.subjects.some(subject => subject.id === previous)) {
      select.value = previous;
    }
  });

  if (state.focusGoal.subjectId && subjectById(state.focusGoal.subjectId)) {
    $("#focusSubject").value = state.focusGoal.subjectId;
  }
}

function topicProgress(subject) {
  const total = subject.topics.length;
  const done = subject.topics.filter(topic => topic.done).length;
  return { total, done, percent: total ? Math.round(done / total * 100) : 0 };
}

function renderDashboardSubjects() {
  const container = $("#dashboardSubjects");
  const subjects = state.subjects.slice(0, 5);

  if (!subjects.length) {
    container.innerHTML = emptyState("▤", "No subjects yet", "Add a subject to track your learning.");
    return;
  }

  container.innerHTML = subjects.map(subject => {
    const progress = topicProgress(subject);
    return `
      <div class="subject-progress-item">
        <div class="subject-progress-top">
          <strong>${escapeHTML(subject.name)}</strong>
          <span>${progress.done}/${progress.total} topics · ${progress.percent}%</span>
        </div>
        <div class="progress-track">
          <i style="width:${progress.percent}%;--subject-color:${COLORS[subject.color]}"></i>
        </div>
      </div>`;
  }).join("");
}

function renderSubjects() {
  const grid = $("#subjectOverviewGrid");
  const roadmap = $("#subjectRoadmap");

  if (!state.subjects.length) {
    grid.innerHTML = emptyState("✦", "Your learning starts here", "Add your first subject to create a roadmap.");
    roadmap.innerHTML = "";
    return;
  }

  grid.innerHTML = state.subjects.map((subject, index) => {
    const progress = topicProgress(subject);
    const color = COLORS[subject.color];
    const soft = `color-mix(in srgb, ${color} 12%, transparent)`;

    return `
      <article class="subject-card" style="--subject-color:${color};--subject-soft:${soft}">
        <div class="subject-card-top">
          <div class="subject-emblem">${SUBJECT_ICONS[index % SUBJECT_ICONS.length]}</div>
          <div class="subject-card-actions">
            <button class="mini-action" data-edit-subject="${escapeHTML(subject.id)}" aria-label="Edit ${escapeHTML(subject.name)}">✎</button>
            <button class="mini-action delete" data-delete-subject="${escapeHTML(subject.id)}" aria-label="Delete ${escapeHTML(subject.name)}">×</button>
          </div>
        </div>
        <h3>${escapeHTML(subject.name)}</h3>
        <p>${progress.total} learning topics · ${progress.done} completed</p>
        <div class="progress-track"><i style="width:${progress.percent}%;background:${color}"></i></div>
        <div class="subject-card-foot"><span>Overall progress</span><strong>${progress.percent}%</strong></div>
      </article>`;
  }).join("");

  roadmap.innerHTML = state.subjects.map(subject => {
    const color = COLORS[subject.color];
    const topicsHTML = subject.topics.length
      ? subject.topics.map(topic => `
        <label class="topic-item ${topic.done ? "done" : ""}">
          <input type="checkbox" data-topic-subject="${escapeHTML(subject.id)}"
            data-topic-id="${escapeHTML(topic.id)}" ${topic.done ? "checked" : ""}>
          <span>${escapeHTML(topic.name)}</span>
        </label>`).join("")
      : `<p class="settings-note">No topics added yet.</p>`;

    return `
      <div class="roadmap-subject">
        <div class="roadmap-heading" style="--subject-color:${color}">
          <i class="roadmap-dot"></i>${escapeHTML(subject.name)}
          <span style="margin-left:auto;color:var(--muted);font-weight:400">
            ${topicProgress(subject).percent}%
          </span>
        </div>
        <div class="topic-list">${topicsHTML}</div>
      </div>`;
  }).join("");

  $$("[data-topic-id]").forEach(input => {
    input.addEventListener("change", () => {
      const subject = subjectById(input.dataset.topicSubject);
      const topic = subject?.topics.find(item => item.id === input.dataset.topicId);
      if (!topic) return;
      topic.done = input.checked;
      saveState();
      renderSubjects();
      renderDashboardSubjects();
      renderAnalytics();
    });
  });

  $$("[data-delete-subject]").forEach(button => {
    button.addEventListener("click", () => deleteSubject(button.dataset.deleteSubject));
  });

  $$("[data-edit-subject]").forEach(button => {
    button.addEventListener("click", () => editSubject(button.dataset.editSubject));
  });
}

function openSubjectModal(subject = null) {
  $("#subjectForm").dataset.editId = subject?.id || "";
  $("#subjectModalTitle").textContent = subject ? "Edit subject" : "Add a subject";
  $("#subjectName").value = subject?.name || "";
  $("#subjectColor").value = subject?.color || "violet";
  $("#subjectTopics").value = subject
    ? subject.topics.map(topic => topic.name).join("\n")
    : "";
  openModal("subjectModal");
}

function editSubject(id) {
  const subject = subjectById(id);
  if (subject) openSubjectModal(subject);
}

function deleteSubject(id) {
  const subject = subjectById(id);
  if (!subject) return;

  if (!confirm(`Delete "${subject.name}"? Its topic progress will be removed. Tasks and sessions will remain but become unassigned.`)) {
    return;
  }

  state.subjects = state.subjects.filter(item => item.id !== id);
  state.tasks.forEach(task => {
    if (task.subjectId === id) task.subjectId = "";
  });
  state.sessions.forEach(session => {
    if (session.subjectId === id) session.subjectId = "";
  });
  if (state.focusGoal.subjectId === id) state.focusGoal.subjectId = "";

  saveState();
  renderAll();
  toast("Subject deleted.");
}

function bindSubjectForm() {
  $("#addSubjectButton").addEventListener("click", () => openSubjectModal());

  $("#subjectForm").addEventListener("submit", event => {
    event.preventDefault();

    const name = $("#subjectName").value.trim();
    const color = $("#subjectColor").value;
    const editId = $("#subjectForm").dataset.editId;

    if (!name) {
      toast("Enter a subject name.", "error");
      return;
    }

    const duplicate = state.subjects.some(subject =>
      subject.name.toLowerCase() === name.toLowerCase() && subject.id !== editId
    );

    if (duplicate) {
      toast("A subject with that name already exists.", "error");
      return;
    }

    const topics = [...new Set($("#subjectTopics").value
      .split("\n")
      .map(topic => topic.trim())
      .filter(Boolean))]
      .map(topicName => ({
        id: uid(),
        name: topicName.slice(0, 120),
        done: false
      }));

    if (editId) {
      const subject = subjectById(editId);
      if (!subject) return;

      const oldTopics = subject.topics;
      subject.name = name.slice(0, 60);
      subject.color = color;
      subject.topics = topics.map(topic => {
        const old = oldTopics.find(item => item.name.toLowerCase() === topic.name.toLowerCase());
        return old ? { ...topic, id: old.id, done: old.done } : topic;
      });
    } else {
      state.subjects.push({
        id: uid(),
        name: name.slice(0, 60),
        color,
        topics
      });
    }

    saveState();
    closeModal($("#subjectModal"));
    renderAll();
    toast(editId ? "Subject updated." : "Subject added.");
    $("#subjectForm").reset();
    delete $("#subjectForm").dataset.editId;
  });
}

/* -------------------- Tasks -------------------- */

function taskById(id) {
  return state.tasks.find(task => task.id === id);
}

function taskDueLabel(task) {
  if (!task.dueDate) return "No due date";
  const today = localDate();

  if (task.dueDate < today && !task.completed) {
    return `Overdue · ${formatDate(task.dueDate, { month: "short", day: "numeric" })}`;
  }
  if (task.dueDate === today) return "Due today";
  if (task.dueDate === shiftDate(1)) return "Due tomorrow";

  return `Due ${formatDate(task.dueDate, { month: "short", day: "numeric" })}`;
}

function taskDueClass(task) {
  if (!task.dueDate) return "";
  if (!task.completed && task.dueDate < localDate()) return "overdue";
  if (task.dueDate === localDate()) return "today";
  return "";
}

function taskRowHTML(task, options = {}) {
  const subject = subjectName(task.subjectId);
  const dueLabel = taskDueLabel(task);
  const isCompleted = task.completed;

  return `
    <div class="task-row ${isCompleted ? "completed" : ""}" data-task-row="${escapeHTML(task.id)}">
      <button class="task-check ${isCompleted ? "checked" : ""}" data-toggle-task="${escapeHTML(task.id)}"
        aria-label="${isCompleted ? "Mark incomplete" : "Complete task"}" aria-pressed="${isCompleted}">
        ${isCompleted ? "✓" : ""}
      </button>
      <div class="task-row-content">
        <div class="task-row-title">${escapeHTML(task.title)}</div>
        ${options.description && task.description
          ? `<div class="task-description">${escapeHTML(task.description)}</div>` : ""}
        <div class="task-row-meta">
          ${subject ? `<span class="subject-pill">${escapeHTML(subject)}</span>` : ""}
          <span class="priority-pill ${task.priority}">${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} priority</span>
          <span class="due-pill ${taskDueClass(task)}">${escapeHTML(dueLabel)}</span>
          <span>${task.estimate} min</span>
        </div>
      </div>
      <div class="task-row-actions">
        <button class="mini-action" data-edit-task="${escapeHTML(task.id)}" aria-label="Edit task">✎</button>
        <button class="mini-action delete" data-delete-task="${escapeHTML(task.id)}" aria-label="Delete task">×</button>
      </div>
    </div>`;
}

function bindTaskRowActions(container) {
  $$("[data-toggle-task]", container).forEach(button => {
    button.addEventListener("click", () => toggleTask(button.dataset.toggleTask));
  });
  $$("[data-edit-task]", container).forEach(button => {
    button.addEventListener("click", () => openTaskModal(taskById(button.dataset.editTask)));
  });
  $$("[data-delete-task]", container).forEach(button => {
    button.addEventListener("click", () => deleteTask(button.dataset.deleteTask));
  });
}

function toggleTask(id) {
  const task = taskById(id);
  if (!task) return;

  task.completed = !task.completed;
  task.completedAt = task.completed ? Date.now() : null;

  saveState();
  renderAll();
  toast(task.completed ? "Nice work! Task completed." : "Task moved back to your list.");
}

function deleteTask(id) {
  const task = taskById(id);
  if (!task) return;

  if (!confirm(`Delete "${task.title}"?`)) return;

  state.tasks = state.tasks.filter(item => item.id !== id);
  saveState();
  renderAll();
  toast("Task deleted.");
}

function openTaskModal(task = null) {
  $("#taskModalTitle").textContent = task ? "Edit your task" : "Create a task";
  $("#taskSubmitButton").innerHTML = task ? "Save changes <span>→</span>" : "Create task <span>→</span>";
  $("#taskId").value = task?.id || "";
  $("#taskTitle").value = task?.title || "";
  $("#taskDescription").value = task?.description || "";
  $("#taskSubject").value = task?.subjectId || "";
  $("#taskPriority").value = task?.priority || "medium";
  $("#taskDue").value = task?.dueDate || localDate();
  $("#taskEstimate").value = task?.estimate || 30;
  openModal("taskModal");
}

function bindTaskForm() {
  const openNewTask = () => {
    refreshSubjectSelects();
    openTaskModal();
  };

  $("#topAddTask").addEventListener("click", openNewTask);
  $("#tasksAddButton").addEventListener("click", openNewTask);
  $("#dashboardAddTask").addEventListener("click", openNewTask);

  $("#taskForm").addEventListener("submit", event => {
    event.preventDefault();

    const title = $("#taskTitle").value.trim();
    const estimate = Number($("#taskEstimate").value);

    if (!title) {
      toast("Give your task a name first.", "error");
      return;
    }
    if (!Number.isFinite(estimate) || estimate < 1 || estimate > 1440) {
      toast("Estimated time must be between 1 and 1440 minutes.", "error");
      return;
    }

    const id = $("#taskId").value;
    const existing = id ? taskById(id) : null;

    const task = {
      id: existing?.id || uid(),
      title: title.slice(0, 120),
      description: $("#taskDescription").value.trim().slice(0, 500),
      subjectId: $("#taskSubject").value,
      priority: $("#taskPriority").value,
      dueDate: $("#taskDue").value,
      estimate,
      completed: existing?.completed || false,
      completedAt: existing?.completedAt || null,
      createdAt: existing?.createdAt || Date.now()
    };

    if (existing) {
      Object.assign(existing, task);
    } else {
      state.tasks.unshift(task);
    }

    saveState();
    closeModal($("#taskModal"));
    $("#taskForm").reset();
    $("#taskId").value = "";
    $("#taskDue").value = localDate();
    $("#taskEstimate").value = 30;

    renderAll();
    toast(existing ? "Task updated." : "Task added to your list.");
  });

  $("#taskSearch").addEventListener("input", renderAllTasks);
  $("#taskFilter").addEventListener("change", renderAllTasks);
  $("#taskSort").addEventListener("change", renderAllTasks);
}

function filteredTasks() {
  const query = $("#taskSearch").value.trim().toLowerCase();
  const filter = $("#taskFilter").value;
  const sort = $("#taskSort").value;
  let tasks = state.tasks.filter(task => {
    const matchesQuery =
      task.title.toLowerCase().includes(query) ||
      task.description.toLowerCase().includes(query) ||
      subjectName(task.subjectId).toLowerCase().includes(query);

    if (!matchesQuery) return false;
    if (filter === "active" && task.completed) return false;
    if (filter === "completed" && !task.completed) return false;
    if (filter === "today" && task.dueDate !== localDate()) return false;

    return true;
  });

  if (sort === "priority") {
    const ranks = { high: 0, medium: 1, low: 2 };
    tasks.sort((a, b) => ranks[a.priority] - ranks[b.priority] || a.createdAt - b.createdAt);
  } else if (sort === "created") {
    tasks.sort((a, b) => b.createdAt - a.createdAt);
  } else {
    tasks.sort((a, b) => {
      if (a.completed !== b.completed) return Number(a.completed) - Number(b.completed);
      const da = a.dueDate || "9999-12-31";
      const db = b.dueDate || "9999-12-31";
      return da.localeCompare(db) || a.createdAt - b.createdAt;
    });
  }

  return tasks;
}

function renderAllTasks() {
  const container = $("#allTasksList");
  if (!container) return;

  const tasks = filteredTasks();
  const completed = state.tasks.filter(task => task.completed).length;
  const pending = state.tasks.length - completed;
  const dueToday = state.tasks.filter(task => !task.completed && task.dueDate === localDate()).length;

  $("#taskOverviewStrip").innerHTML = `
    <div class="task-overview-item"><span>Total tasks</span><strong>${state.tasks.length}</strong></div>
    <div class="task-overview-item"><span>In progress</span><strong>${pending}</strong></div>
    <div class="task-overview-item"><span>Due today</span><strong>${dueToday}</strong></div>`;

  container.innerHTML = tasks.length
    ? tasks.map(task => taskRowHTML(task, { description: true })).join("")
    : emptyState("☷", "Nothing to show", "Try a different filter, or create a new task.");

  bindTaskRowActions(container);
}
/* -------------------- Planner -------------------- */

function openPlannerModal() {
  refreshSubjectSelects();
  $("#plannerForm").reset();
  $("#sessionDate").value = $("#plannerDate").value || localDate();
  $("#sessionTime").value = "16:00";
  $("#sessionDuration").value = "60";
  openModal("plannerModal");
}

function bindPlanner() {
  $("#plannerAddButton").addEventListener("click", openPlannerModal);
  $("#plannerDate").addEventListener("change", renderPlanner);

  $("#plannerForm").addEventListener("submit", event => {
    event.preventDefault();

    const title = $("#sessionTitle").value.trim();
    const date = $("#sessionDate").value;

    if (!title || !date) {
      toast("Add a session title and date.", "error");
      return;
    }

    state.sessions.push({
      id: uid(),
      title: title.slice(0, 120),
      subjectId: $("#sessionSubject").value,
      date,
      time: $("#sessionTime").value || "16:00",
      duration: Number($("#sessionDuration").value) || 60,
      createdAt: Date.now()
    });

    saveState();
    closeModal($("#plannerModal"));
    renderAll();
    navigate("planner");
    toast("Study session scheduled.");
  });
}

function renderPlanner() {
  const container = $("#plannerList");
  const selectedDate = $("#plannerDate").value;

  let sessions = [...state.sessions].filter(session => !selectedDate || session.date === selectedDate);
  sessions.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

  if (!sessions.length) {
    container.innerHTML = emptyState("▦", "A little room in your schedule", "Plan a study session to give your next goal a time and place.");
    return;
  }

  container.innerHTML = sessions.map(session => `
    <div class="planner-item">
      <div class="planner-date">
        <strong>${escapeHTML(formatDate(session.date, { weekday: "short", month: "short", day: "numeric" }))}</strong>
        ${escapeHTML(session.time)}
      </div>
      <div class="planner-timeline" style="background:${subjectColor(session.subjectId)}"></div>
      <div class="planner-item-copy">
        <strong>${escapeHTML(session.title)}</strong>
        <span>${escapeHTML(subjectName(session.subjectId) || "Independent study")} · ${session.duration} min</span>
      </div>
      <div class="planner-item-actions">
        <button class="mini-action" data-start-session="${escapeHTML(session.id)}" aria-label="Start focus session">▶</button>
        <button class="mini-action delete" data-delete-session="${escapeHTML(session.id)}" aria-label="Delete session">×</button>
      </div>
    </div>`).join("");

  $$("[data-delete-session]", container).forEach(button => {
    button.addEventListener("click", () => {
      const id = button.dataset.deleteSession;
      if (!confirm("Delete this planned session?")) return;
      state.sessions = state.sessions.filter(session => session.id !== id);
      saveState();
      renderAll();
      toast("Session removed.");
    });
  });

  $$("[data-start-session]", container).forEach(button => {
    button.addEventListener("click", () => {
      const session = state.sessions.find(item => item.id === button.dataset.startSession);
      if (!session) return;
      state.focusGoal.text = session.title;
      state.focusGoal.subjectId = session.subjectId;
      $("#focusGoal").value = session.title;
      refreshSubjectSelects();
      $("#focusSubject").value = session.subjectId;
      navigate("focus");
      toast("Your planned session is ready.");
    });
  });
}

/* -------------------- Focus timer -------------------- */

const TIMER_CIRCUMFERENCE = 2 * Math.PI * 124;

let timer = {
  mode: "focus",
  totalSeconds: 25 * 60,
  remainingSeconds: 25 * 60,
  running: false,
  endTime: null,
  interval: null
};

function todaySessions() {
  return state.sessions.filter(session => session.date === localDate());
}

function todayFocusRecords() {
  return state.sessions.filter(session =>
    session.date === localDate() && session.isFocusRecord
  );
}

function getFocusRecords() {
  if (!Array.isArray(state.focusRecords)) state.focusRecords = [];
  return state.focusRecords;
}

function focusMinutesForDate(date) {
  return getFocusRecords()
    .filter(record => record.date === date)
    .reduce((sum, record) => sum + (Number(record.minutes) || 0), 0);
}

function focusSessionsForDate(date) {
  return getFocusRecords().filter(record => record.date === date).length;
}

function setTimerMode(mode, minutes) {
  pauseTimer(false);
  timer.mode = mode;
  timer.totalSeconds = minutes * 60;
  timer.remainingSeconds = timer.totalSeconds;
  timer.endTime = null;

  $$(".timer-mode").forEach(button => {
    button.classList.toggle("active", button.dataset.mode === mode);
  });

  $("#timerModeBadge").textContent = mode === "focus" ? "FOCUS" : "BREAK";
  $("#timerOverline").textContent = mode === "focus" ? "TIME TO FOCUS" : "TAKE A BREATH";
  $("#timerStatus").textContent = "Ready when you are";
  $("#timerStart").innerHTML = "▶ Start " + (mode === "focus" ? "focus" : "break");
  updateTimerDisplay();
}

function updateTimerDisplay() {
  const minutes = Math.floor(timer.remainingSeconds / 60);
  const seconds = timer.remainingSeconds % 60;

  $("#timerDisplay").textContent =
    `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const progress = timer.totalSeconds
    ? timer.remainingSeconds / timer.totalSeconds
    : 1;

  $("#timerProgress").style.strokeDasharray = TIMER_CIRCUMFERENCE;
  $("#timerProgress").style.strokeDashoffset = TIMER_CIRCUMFERENCE * (1 - progress);

  document.title = timer.running
    ? `${$("#timerDisplay").textContent} · StudyOS`
    : "StudyOS — Your Personal Study Space";
}

function startTimer() {
  if (timer.running) {
    pauseTimer();
    return;
  }

  if (timer.remainingSeconds <= 0) {
    timer.remainingSeconds = timer.totalSeconds;
  }

  timer.running = true;
  timer.endTime = Date.now() + timer.remainingSeconds * 1000;
  $("#timerStart").textContent = "Ⅱ Pause session";
  $("#timerStatus").textContent = "You're doing great. Stay present.";

  timer.interval = window.setInterval(tickTimer, 250);
  tickTimer();
}

function tickTimer() {
  if (!timer.running || !timer.endTime) return;

  timer.remainingSeconds = Math.max(
    0,
    Math.ceil((timer.endTime - Date.now()) / 1000)
  );

  updateTimerDisplay();

  if (timer.remainingSeconds <= 0) {
    finishTimer();
  }
}

function pauseTimer(showStatus = true) {
  timer.running = false;
  timer.endTime = null;

  if (timer.interval) window.clearInterval(timer.interval);
  timer.interval = null;

  $("#timerStart").textContent = "▶ Resume session";
  if (showStatus) $("#timerStatus").textContent = "Paused. Take your time.";
  updateTimerDisplay();
}

function resetTimer() {
  pauseTimer(false);
  timer.remainingSeconds = timer.totalSeconds;
  $("#timerStart").textContent = "▶ Start " + (timer.mode === "focus" ? "focus" : "break");
  $("#timerStatus").textContent = "Ready when you are";
  updateTimerDisplay();
}

function finishTimer() {
  const finishedMode = timer.mode;
  pauseTimer(false);
  timer.remainingSeconds = 0;
  updateTimerDisplay();

  if (finishedMode === "focus") {
    const records = getFocusRecords();
    records.push({
      id: uid(),
      date: localDate(),
      minutes: Math.round(timer.totalSeconds / 60),
      title: state.focusGoal.text || "Focus session",
      subjectId: state.focusGoal.subjectId || "",
      completedAt: Date.now()
    });
    saveState();

    $("#timerStatus").textContent = "Session complete. Beautiful work!";
    toast("Focus session complete. Take a well-earned break.");
    renderAll();
  } else {
    $("#timerStatus").textContent = "Break complete. Ready when you are?";
    toast("Break finished. Return when you're ready.");
  }

  $("#timerStart").textContent = "↻ Start again";

  if ("Notification" in window && Notification.permission === "granted") {
    try {
      new Notification("StudyOS", {
        body: finishedMode === "focus"
          ? "Your focus session is complete. Take a break!"
          : "Your break is over. Ready to focus again?"
      });
    } catch (_) {}
  }
}

function bindFocusTimer() {
  $$(".timer-mode").forEach(button => {
    button.addEventListener("click", () => {
      setTimerMode(button.dataset.mode, Number(button.dataset.minutes));
    });
  });

  $("#timerStart").addEventListener("click", startTimer);
  $("#timerReset").addEventListener("click", resetTimer);

  $("#saveFocusGoal").addEventListener("click", () => {
    state.focusGoal.text = $("#focusGoal").value.trim().slice(0, 200);
    state.focusGoal.subjectId = $("#focusSubject").value;
    saveState();
    toast("Session intention saved.");
  });

  $("#focusGoal").value = state.focusGoal.text || "";
}

/* -------------------- Dashboard -------------------- */

function getTodayTasks() {
  return state.tasks.filter(task => task.dueDate === localDate());
}

function renderDashboardTasks() {
  const todayTasks = getTodayTasks();
  const completed = todayTasks.filter(task => task.completed).length;
  const total = todayTasks.length;
  const percent = total ? Math.round(completed / total * 100) : 0;

  $("#todayProgressText").textContent = `${completed} of ${total} completed`;
  $("#todayProgressPercent").textContent = `${percent}%`;
  $("#todayProgressBar").style.width = `${percent}%`;

  const container = $("#dashboardTasks");
  const tasks = [...todayTasks].sort((a, b) =>
    Number(a.completed) - Number(b.completed) ||
    ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])
  ).slice(0, 5);

  container.innerHTML = tasks.length
    ? tasks.map(task => taskRowHTML(task)).join("")
    : emptyState("✓", "A clean slate", "Add a task due today to give your day some direction.");

  bindTaskRowActions(container);
}

function renderWeekBars() {
  const container = $("#weekBars");
  const today = new Date();
  const dates = [];

  for (let i = 6; i >= 0; i--) dates.push(shiftDate(-i, today));

  const values = dates.map(date => focusMinutesForDate(date));
  const max = Math.max(...values, 30);

  container.innerHTML = dates.map((date, index) => {
    const value = values[index];
    const height = Math.max(3, value / max * 75);
    const isToday = date === localDate();

    return `
      <div class="week-bar-column" title="${escapeHTML(date)}: ${value} minutes">
        <div class="week-bar ${isToday ? "today" : ""}" style="height:${height}%"></div>
        <span>${new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { weekday: "short" }).slice(0, 1)}</span>
      </div>`;
  }).join("");
}

function renderUpNext() {
  const upcoming = state.tasks
    .filter(task => !task.completed && task.dueDate)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 3);

  const container = $("#upNextList");

  container.innerHTML = upcoming.length
    ? upcoming.map((task, index) => `
      <div class="up-next-item">
        <div class="up-next-icon">${["◎", "◈", "✦"][index]}</div>
        <div class="up-next-copy">
          <strong>${escapeHTML(task.title)}</strong>
          <span>${escapeHTML(taskDueLabel(task))}${subjectName(task.subjectId) ? ` · ${escapeHTML(subjectName(task.subjectId))}` : ""}</span>
        </div>
      </div>`).join("")
    : emptyState("✦", "Nothing urgent", "You're all caught up. Enjoy the breathing room.");
}

function calculateStreak() {
  const activeDates = new Set(
    getFocusRecords()
      .filter(record => Number(record.minutes) > 0)
      .map(record => record.date)
  );

  let streak = 0;
  let date = localDate();

  if (!activeDates.has(date)) date = shiftDate(-1);

  while (activeDates.has(date) && streak < 366) {
    streak++;
    date = shiftDate(-1, new Date(`${date}T12:00:00`));
  }

  return streak;
}

function renderDashboard() {
  const today = localDate();
  const todayFocus = focusMinutesForDate(today);
  const todayRecords = focusSessionsForDate(today);
  const todayTasks = getTodayTasks();
  const completed = todayTasks.filter(task => task.completed).length;
  const pending = state.tasks.filter(task => !task.completed).length;
  const totalTasks = state.tasks.length;
  const completionPercent = totalTasks
    ? Math.round(state.tasks.filter(task => task.completed).length / totalTasks * 100)
    : 0;

  const weekTotal = Array.from({ length: 7 }, (_, index) =>
    focusMinutesForDate(shiftDate(-index))
  ).reduce((sum, value) => sum + value, 0);

  $("#statStudyHours").textContent = weekTotal;
  $("#statCompleted").textContent = completed;
  $("#statPending").textContent = pending;
  $("#statStreak").textContent = calculateStreak();
  $("#focusTodayMinutes").innerHTML = `${todayFocus}<span> min</span>`;
  $("#focusSessionCount").textContent = todayRecords;
  $("#focusMinutesStat").textContent = `${todayFocus} min`;
  $("#completedBar").style.width = `${completionPercent}%`;
  $("#pendingBar").style.width = `${pending ? Math.min(100, pending * 12) : 0}%`;
  $("#completedFoot").textContent = `${completionPercent}% of all tasks completed`;
  $("#pendingFoot").textContent = pending ? "One step at a time" : "All tasks completed!";
  $("#studyTimeFoot").textContent = `${todayFocus} minutes today`;
  $("#navTaskCount").textContent = pending;

  renderDashboardTasks();
  renderWeekBars();
  renderDashboardSubjects();
  renderUpNext();
}
/* -------------------- Analytics -------------------- */

function renderAnalytics() {
  const records = getFocusRecords();
  const totalMinutes = records.reduce((sum, record) => sum + (Number(record.minutes) || 0), 0);
  const totalCompleted = state.tasks.filter(task => task.completed).length;
  const taskCount = state.tasks.length;
  const subjectTopics = state.subjects.reduce((sum, subject) => sum + subject.topics.length, 0);
  const completedTopics = state.subjects.reduce(
    (sum, subject) => sum + subject.topics.filter(topic => topic.done).length, 0
  );

  $("#analyticsStats").innerHTML = `
    <div class="analytics-stat"><span>Total focus time</span><strong>${formatMinutes(totalMinutes)}</strong><small>Across all recorded sessions</small></div>
    <div class="analytics-stat"><span>Focus sessions</span><strong>${records.length}</strong><small>Completed sessions</small></div>
    <div class="analytics-stat"><span>Tasks completed</span><strong>${totalCompleted}</strong><small>Out of ${taskCount} total tasks</small></div>
    <div class="analytics-stat"><span>Topics mastered</span><strong>${completedTopics}/${subjectTopics}</strong><small>Across your subjects</small></div>`;

  renderActivityChart();
  renderCompletionChart();

  const todayMinutes = focusMinutesForDate(localDate());
  const goal = state.profile.dailyGoal;

  if (todayMinutes >= goal) {
    $("#analyticsInsightTitle").textContent = "You reached your daily focus goal!";
    $("#analyticsInsightText").textContent = `You've focused for ${todayMinutes} minutes today. Celebrate that consistency and keep a sustainable pace.`;
  } else if (todayMinutes > 0) {
    $("#analyticsInsightTitle").textContent = "You're already making progress.";
    $("#analyticsInsightText").textContent = `You've focused for ${todayMinutes} of your ${goal}-minute daily goal. Even a short session is a step forward.`;
  } else if (totalMinutes > 0) {
    $("#analyticsInsightTitle").textContent = "Your effort is adding up.";
    $("#analyticsInsightText").textContent = `You've recorded ${formatMinutes(totalMinutes)} of focus time. Start another session whenever you're ready.`;
  } else {
    $("#analyticsInsightTitle").textContent = "Every session counts.";
    $("#analyticsInsightText").textContent = "Start a focus session today and your progress will appear here.";
  }
}

function renderActivityChart() {
  const container = $("#activityChart");
  const dates = [];

  for (let i = 6; i >= 0; i--) dates.push(shiftDate(-i));

  const values = dates.map(date => focusMinutesForDate(date));
  const max = Math.max(...values, 30);

  container.innerHTML = dates.map((date, index) => {
    const value = values[index];
    const height = Math.max(3, value / max * 100);
    const day = new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { weekday: "short" }).slice(0, 3);

    return `
      <div class="activity-column ${date === localDate() ? "today" : ""}" title="${escapeHTML(date)}: ${value} minutes">
        <span class="activity-value">${value || ""}</span>
        <div class="activity-bar-wrap"><div class="activity-bar" style="height:${height}%"></div></div>
        <span class="activity-day">${day}</span>
      </div>`;
  }).join("");
}

function renderCompletionChart() {
  const container = $("#completionChart");
  const total = state.tasks.length;
  const completed = state.tasks.filter(task => task.completed).length;
  const percent = total ? Math.round(completed / total * 100) : 0;

  container.innerHTML = `
    <div class="donut-chart" style="--done-angle:${percent * 3.6}deg">
      <div class="donut-inner"><strong>${percent}%</strong><span>completed</span></div>
    </div>
    <div class="donut-legend">
      <span><i style="background:var(--green)"></i>${completed} completed</span>
      <span><i style="background:var(--surface-3)"></i>${total - completed} remaining</span>
    </div>`;
}

/* -------------------- Backup and restore -------------------- */

function exportBackup() {
  try {
    const data = {
      ...state,
      focusRecords: getFocusRecords(),
      exportedAt: new Date().toISOString(),
      application: "StudyOS"
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json"
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `studyos-backup-${localDate()}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);

    toast("Your backup has been exported.");
  } catch (error) {
    console.error(error);
    toast("Could not export the backup.", "error");
  }
}

function importBackup(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);

      if (!imported || typeof imported !== "object" ||
          !Array.isArray(imported.tasks) ||
          !Array.isArray(imported.subjects)) {
        throw new Error("This file doesn't look like a StudyOS backup.");
      }

      if (!confirm("Import this backup? Your current StudyOS data will be replaced.")) {
        event.target.value = "";
        return;
      }

      state = normalizeState(imported);
      state.focusRecords = Array.isArray(imported.focusRecords)
        ? imported.focusRecords.filter(record =>
            record && /^\d{4}-\d{2}-\d{2}$/.test(record.date || "")
          ).map(record => ({
            id: String(record.id || uid()),
            date: record.date,
            minutes: Math.min(1440, Math.max(0, Number(record.minutes) || 0)),
            title: String(record.title || "Focus session").slice(0, 200),
            subjectId: String(record.subjectId || ""),
            completedAt: Number(record.completedAt) || Date.now()
          }))
        : [];

      saveState();
      renderAll();
      toast("Backup imported successfully.");
    } catch (error) {
      console.error(error);
      toast(error.message || "That file could not be imported.", "error");
    } finally {
      event.target.value = "";
    }
  };

  reader.onerror = () => {
    toast("Could not read that file.", "error");
    event.target.value = "";
  };

  reader.readAsText(file);
}

function clearAllData() {
  const confirmed = confirm(
    "Delete all StudyOS tasks, subjects, planner sessions and focus history? This cannot be undone. Export a backup first if you want to keep your data."
  );

  if (!confirmed) return;

  pauseTimer(false);
  state = defaultState();
  state.focusRecords = [];

  saveState();
  renderAll();
  navigate("dashboard");
  toast("StudyOS has been reset.");
}

/* -------------------- Rendering -------------------- */

function renderAll() {
  refreshSubjectSelects();
  renderProfile();
  renderDashboard();
  renderAllTasks();
  renderPlanner();
  renderSubjects();
  renderAnalytics();
}

function bindAll() {
  bindNavigation();
  bindModals();
  bindSettings();
  bindTaskForm();
  bindSubjectForm();
  bindPlanner();
  bindFocusTimer();
}

function init() {
  // Ensure records from older or imported versions are available.
  if (!Array.isArray(state.focusRecords)) state.focusRecords = [];

  updateDateLabels();
  applyTheme();
  bindAll();
  renderAll();

  // Set a clean initial timer display.
  setTimerMode("focus", 25);

  // Load the saved focus intention after form initialization.
  $("#focusGoal").value = state.focusGoal.text || "";
  refreshSubjectSelects();
  $("#focusSubject").value = state.focusGoal.subjectId || "";

  console.log("StudyOS initialized successfully.");
}

document.addEventListener("DOMContentLoaded", init);
