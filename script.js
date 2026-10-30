// ---- Elements ----
const goalInput = document.getElementById("goalInput");
const addBtn = document.getElementById("addBtn");
const resetBtn = document.getElementById("resetBtn");
const countText = document.getElementById("countText");
const ringFill = document.getElementById("ringFill");
const historyList = document.getElementById("historyList");

// ---- Storage keys ----
const STORAGE_KEY = "waterTrackerData";

// ---- Load data ----
function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) return JSON.parse(raw);
  return { goal: 8, history: {} }; // { "2025-01-15": 5, ... }
}

// ---- Save data ----
function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ---- Get today's date string (YYYY-MM-DD) ----
function todayKey() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

// ---- Render everything ----
function render() {
  const data = loadData();
  const today = todayKey();
  const count = data.history[today] || 0;
  const goal = data.goal;

  // Update count text
  countText.textContent = `${count} / ${goal}`;

  // Update ring (circumference = 2 * π * 52 ≈ 327)
  const circumference = 327;
  const progress = Math.min(count / goal, 1);
  ringFill.style.strokeDashoffset = circumference * (1 - progress);

  // Update goal input
  goalInput.value = goal;

  // Update history list (last 7 days, newest first)
  historyList.innerHTML = "";
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ key, count: data.history[key] || 0 });
  }

  days.forEach(({ key, count }) => {
    const li = document.createElement("li");
    const label = key === today ? "Today" : formatDate(key);
    li.innerHTML = `<span>${label}</span><span class="bar">${count} glasses</span>`;
    historyList.appendChild(li);
  });
}

// ---- Format date nicely ----
function formatDate(key) {
  const d = new Date(key);
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

// ---- Add a glass ----
addBtn.addEventListener("click", () => {
  const data = loadData();
  const today = todayKey();
  data.history[today] = (data.history[today] || 0) + 1;
  saveData(data);
  render();
});

// ---- Reset today ----
resetBtn.addEventListener("click", () => {
  if (!confirm("Reset today's count?")) return;
  const data = loadData();
  const today = todayKey();
  data.history[today] = 0;
  saveData(data);
  render();
});

// ---- Change goal ----
goalInput.addEventListener("change", () => {
  const data = loadData();
  const val = parseInt(goalInput.value, 10);
  data.goal = isNaN(val) || val < 1 ? 8 : Math.min(val, 20);
  saveData(data);
  render();
});

// ---- Initial render ----
render();
