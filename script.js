let balance = 0;
let streak = 1;
let selected = [];
let history = [];

const balanceEl = document.getElementById("balance");
const table = document.getElementById("numberTable");
const wagerInput = document.getElementById("wager");
const notifyEl = document.getElementById("notification");
const historyList = document.getElementById("historyList");
const receipt = document.getElementById("receiptLog");
const coin = document.getElementById("coin");

for (let i = 1; i <= 12; i++) {
  const d = document.createElement("div");
  d.className = "number";
  d.textContent = i;
  d.onclick = () => toggleNumber(i, d);
  table.appendChild(d);
}

function toggleNumber(n, el) {
  if (selected.includes(n)) {
    selected = selected.filter(x => x !== n);
    el.classList.remove("selected");
  } else if (selected.length < 3) {
    selected.push(n);
    el.classList.add("selected");
  }
}

document.querySelectorAll(".topup button").forEach(b => {
  b.onclick = () => {
    const amt = Number(b.dataset.add);
    balance += amt;
    update();
    log(`Top up +$${amt}`);
  };
});

function getCellCenter(cell) {
  const rect = cell.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

function bounceOnCells(path, index = 0, onFinish) {
  if (index >= path.length) {
    if (onFinish) onFinish();
    return;
  }
  const { x, y } = getCellCenter(path[index]);
  coin.style.left = (x - 16) + "px";
  coin.style.top = (y - 16 - 20) + "px"; 
  setTimeout(() => bounceOnCells(path, index + 1, onFinish), 300);
}

document.getElementById("tossBtn").onclick = () => {
  const wager = Number(wagerInput.value);
  const totalBet = wager * selected.length;

  if (wager <= 0 || wager % 10 !== 0) return notify("Invalid wager");
  if (!selected.length) return notify("Select numbers");
  if (totalBet > balance) return notify("Insufficient Balance");

  balance -= totalBet;
  update();
  log(`Bet $${wager} on [${selected.join(", ")}]`);

  const cells = [...document.querySelectorAll(".number")];
  cells.forEach(c => c.classList.remove("win"));

  const path = [];
  for (let i = 0; i < 4; i++) {
    path.push(cells[Math.floor(Math.random() * cells.length)]);
  }
  const winCell = cells[Math.floor(Math.random() * cells.length)];
  path.push(winCell);

  bounceOnCells(path, 0, () => {
    winCell.classList.add("win");
    const winNum = Number(winCell.textContent);

    history.unshift(winNum);
    history = history.slice(0, 3);
    renderHistory();

    if (selected.includes(winNum)) {
      const winProfit = wager * streak;
      const totalPayout = wager + winProfit; // Fix: Show full refund + win
      
      balance += totalPayout;
      streak = Math.min(streak + 1, 5);
      
      notify(`You Won $${totalPayout}`); 
      log(`WIN ${winNum} +$${totalPayout} (x${streak - 1})`, "win");
    } else {
      streak = 1;
      notify("You Lost! Try Again!");
      log(`LOSE ${winNum}`, "lose");
    }
    update();
  });
};

function update() { balanceEl.textContent = balance; }
function notify(msg) {
  notifyEl.textContent = msg;
  setTimeout(() => notifyEl.textContent = "", 2000);
}

function renderHistory() {
  historyList.innerHTML = "";
  history.forEach((n, index) => {
    const d = document.createElement("div");
    d.textContent = n;
    d.className = (index === 0) ? "latest-win" : "old-win";
    historyList.appendChild(d);
  });
}

function log(msg, type = "") {
  const d = document.createElement("div");
  d.className = `receipt-entry ${type}`;
  d.textContent = msg;
  receipt.prepend(d);
  if (receipt.children.length > 20) receipt.lastChild.remove();
}

/* Background Particles */
const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");
function resize() { canvas.width = innerWidth; canvas.height = innerHeight; }
window.onresize = resize;
resize();
const dots = Array.from({ length: 60 }, () => ({
  x: Math.random() * canvas.width, y: Math.random() * canvas.height,
  r: Math.random() * 1.5 + 0.5, v: Math.random() * 0.4 + 0.1
}));
function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  dots.forEach(d => {
    d.y -= d.v; if (d.y < 0) d.y = canvas.height;
    ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.fill();
  });
  requestAnimationFrame(animate);
}
animate();
