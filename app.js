const STORAGE_KEY = "task_reminder_v1";

const CATEGORY_LABELS = {
  morning: "🌅 Morning",
  night: "🌙 Night",
  todo: "📋 To Do",
  buy: "🛒 To Buy",
  good: "✨ Good to Have",
  reminder: "⏰ Reminder",
};

const PRIORITY_LABELS = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

let tasks = [];
let currentFilter = "all";
let currentStatus = "all";

// DOM refs
const form = document.getElementById("task-form");
const titleInput = document.getElementById("task-title");
const categorySelect = document.getElementById("task-category");
const prioritySelect = document.getElementById("task-priority");
const dueInput = document.getElementById("task-due");
const notesInput = document.getElementById("task-notes");
const taskList = document.getElementById("task-list");
const clearCompletedBtn = document.getElementById("clear-completed");
const exportBtn = document.getElementById("export-btn");
const importInput = document.getElementById("import-input");
const clearAllBtn = document.getElementById("clear-all-btn");

// ---------- Persistence ----------
function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    tasks = raw ? JSON.parse(raw) : [];
  } catch {
    tasks = [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// ---------- Helpers ----------
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function formatDue(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function isOverdue(iso, completed) {
  if (!iso || completed) return false;
  return new Date(iso) < new Date();
}

// ---------- CRUD ----------
function addTask(data) {
  const task = {
    id: uid(),
    title: data.title.trim(),
    category: data.category,
    priority: data.priority,
    notes: data.notes.trim(),
    due: data.due || null,
    completed: false,
    createdAt: new Date().toISOString(),
  };
  tasks.unshift(task);
  saveTasks();
  render();
}

function toggleComplete(id) {
  const t = tasks.find((x) => x.id === id);
  if (t) {
    t.completed = !t.completed;
    saveTasks();
    render();
  }
}

function deleteTask(id) {
  tasks = tasks.filter((x) => x.id !== id);
  saveTasks();
  render();
}

function clearCompleted() {
  tasks = tasks.filter((x) => !x.completed);
  saveTasks();
  render();
}

function clearAll() {
  if (confirm("Delete ALL tasks? This cannot be undone.")) {
    tasks = [];
    saveTasks();
    render();
  }
}

// ---------- Filtering ----------
function getFilteredTasks() {
  return tasks.filter((t) => {
    const catOk = currentFilter === "all" || t.category === currentFilter;
    const statusOk =
      currentStatus === "all" ||
      (currentStatus === "active" && !t.completed) ||
      (currentStatus === "completed" && t.completed);
    return catOk && statusOk;
  });
}

// ---------- Render ----------
function renderStats() {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const active = total - completed;
  document.getElementById("stat-total").textContent = `${total} task${total !== 1 ? "s" : ""}`;
  document.getElementById("stat-active").textContent = `${active} active`;
  document.getElementById("stat-completed").textContent = `${completed} done`;
}

function renderTask(task) {
  const overdue = isOverdue(task.due, task.completed);
  const dueText = formatDue(task.due);

  return `
    <article class="task-card ${task.completed ? "completed" : ""}" data-id="${task.id}">
      <input type="checkbox" class="task-check" ${task.completed ? "checked" : ""} aria-label="Mark complete" />
      <div class="task-body">
        <div class="task-title">${escapeHtml(task.title)}</div>
        <div class="task-meta">
          <span class="badge category">${CATEGORY_LABELS[task.category] || task.category}</span>
          <span class="badge priority-${task.priority}">${PRIORITY_LABELS[task.priority]}</span>
        </div>
        ${task.notes ? `<div class="task-notes">${escapeHtml(task.notes)}</div>` : ""}
        ${dueText ? `<div class="task-due ${overdue ? "overdue" : ""}">${overdue ? "⚠ Overdue: " : "Due: "}${dueText}</div>` : ""}
      </div>
      <div class="task-actions">
        <button class="icon-btn delete" title="Delete" aria-label="Delete task">🗑️</button>
      </div>
    </article>
  `;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function render() {
  const filtered = getFilteredTasks();
  renderStats();

  if (filtered.length === 0) {
    taskList.innerHTML = `
      <div class="empty-state">
        <div style="font-size:2.5rem">📭</div>
        <p>No tasks here yet.<br>Add one above!</p>
      </div>
    `;
    return;
  }

  // Sort: incomplete first, then by priority (high > medium > low), then by due date
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  filtered.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    if (a.due && b.due) return new Date(a.due) - new Date(b.due);
    if (a.due) return -1;
    if (b.due) return 1;
    return 0;
  });

  taskList.innerHTML = filtered.map(renderTask).join("");
}

// ---------- Events ----------
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = titleInput.value.trim();
  if (!title) return;

  addTask({
    title,
    category: categorySelect.value,
    priority: prioritySelect.value,
    notes: notesInput.value,
    due: dueInput.value || null,
  });

  form.reset();
  prioritySelect.value = "medium";
  titleInput.focus();
});

taskList.addEventListener("click", (e) => {
  const card = e.target.closest(".task-card");
  if (!card) return;
  const id = card.dataset.id;

  if (e.target.classList.contains("task-check")) {
    toggleComplete(id);
  } else if (e.target.classList.contains("delete") || e.target.closest(".delete")) {
    if (confirm("Delete this task?")) {
      deleteTask(id);
    }
  }
});

clearCompletedBtn.addEventListener("click", () => {
  if (tasks.some((t) => t.completed)) {
    if (confirm("Remove all completed tasks?")) clearCompleted();
  }
});

// Filter buttons
document.querySelectorAll(".filter-btn[data-filter]").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn[data-filter]").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    render();
  });
});

document.querySelectorAll(".filter-btn[data-status]").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn[data-status]").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentStatus = btn.dataset.status;
    render();
  });
});

// Set initial active for status
document.querySelector('.filter-btn[data-status="all"]').classList.add("active");

// Export / Import
exportBtn.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `task-reminder-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

importInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const imported = JSON.parse(ev.target.result);
      if (!Array.isArray(imported)) throw new Error("Invalid format");
      if (confirm(`Import ${imported.length} tasks? This will replace current list.`)) {
        tasks = imported;
        saveTasks();
        render();
      }
    } catch {
      alert("Could not import: invalid JSON file.");
    }
    importInput.value = "";
  };
  reader.readAsText(file);
});

clearAllBtn.addEventListener("click", clearAll);

// Init
loadTasks();
render();
titleInput.focus();
