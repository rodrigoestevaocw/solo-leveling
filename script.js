const levels = ["E","D","C","B","A","S","SS","SS+"];
const requirements = [5,20,35,50,65,80,95];

let data = JSON.parse(localStorage.getItem("system")) || {
  levelIndex: 0,
  exp: 0,
  tasksInLevel: 0,
  completedDays: 0,
  lastCompleted: null,
  missedDays: 0
};

function today() {
  return new Date().toDateString();
}

function save() {
  localStorage.setItem("system", JSON.stringify(data));
}

function showOverlay(text) {
  const overlay = document.getElementById("overlay");
  const overlayText = document.getElementById("overlay-text");
  overlayText.textContent = text;
  overlay.classList.remove("hidden");
  setTimeout(() => overlay.classList.add("hidden"), 2000);
}

function systemReset() {
  data = {
    levelIndex: 0,
    exp: 0,
    tasksInLevel: 0,
    completedDays: 0,
    lastCompleted: null,
    missedDays: 0
  };
  showOverlay("SYSTEM RESET");
  save();
}

function checkPenalty() {
  if (!data.lastCompleted) return;

  const last = new Date(data.lastCompleted);
  const now = new Date();
  const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));

  if (diffDays >= 1) {
    data.missedDays += diffDays;

    if (data.missedDays >= 2) {
      systemReset();
      return;
    } else {
      if (data.levelIndex > 0) data.levelIndex--;
      data.tasksInLevel = 0;
      showOverlay("LEVEL DOWN");
    }

    data.lastCompleted = today();
    save();
  }
}

function generateQuest() {
  const base = 10 + data.completedDays * 5;
  const run = 1 + Math.floor(data.completedDays / 2);

  return [
    `${base} Push-ups`,
    `${base} Squats`,
    `${base} Sit-ups`,
    `${run} km Run`
  ];
}

function completeQuest() {
  if (data.lastCompleted === today()) return;

  data.completedDays++;
  data.tasksInLevel++;
  data.exp += (data.levelIndex + 1) * 100;
  data.lastCompleted = today();
  data.missedDays = 0;

  if (data.tasksInLevel >= requirements[data.levelIndex]) {
    data.levelIndex++;
    data.tasksInLevel = 0;
    showOverlay("LEVEL UP");
  }

  save();
  render();
}

function render() {
  document.getElementById("level").textContent = levels[data.levelIndex];
  document.getElementById("exp").textContent = data.exp;
  document.getElementById("tasks").textContent = data.tasksInLevel;

  const progress = (data.tasksInLevel / requirements[data.levelIndex]) * 100;
  document.getElementById("progress").style.width = `${progress}%`;

  const list = document.getElementById("quest-list");
  list.innerHTML = "";
  generateQuest().forEach(q => {
    const li = document.createElement("li");
    li.textContent = q;
    list.appendChild(li);
  });
}

document.getElementById("complete-btn").addEventListener("click", completeQuest);

checkPenalty();
render();
save();
