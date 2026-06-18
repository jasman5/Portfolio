/* ============ CURSOR: dot + trailing particles ============ */
const dot = document.getElementById("cursorDot");
const canvas = document.getElementById("cursor-canvas");
const ctx = canvas.getContext("2d");
let W = (canvas.width = window.innerWidth);
let H = (canvas.height = window.innerHeight);
window.addEventListener("resize", () => {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
});

let mouseX = W / 2,
  mouseY = H / 2;
let particles = [];

const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

window.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  dot.style.left = mouseX + "px";
  dot.style.top = mouseY + "px";

  if (!reduceMotion) {
    for (let i = 0; i < 2; i++) {
      particles.push({
        x: mouseX + (Math.random() - 0.5) * 4,
        y: mouseY + (Math.random() - 0.5) * 4,
        r: Math.random() * 3 + 1.5,
        life: 1,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6 - 0.2,
        hue: Math.random() > 0.5 ? "132,88,179" : "160,210,235",
      });
    }
  }
  if (particles.length > 160) particles.splice(0, particles.length - 160);
});

window.addEventListener(
  "mousedown",
  () => (dot.style.transform = "translate(-50%,-50%) scale(0.7)"),
);
window.addEventListener(
  "mouseup",
  () => (dot.style.transform = "translate(-50%,-50%) scale(1)"),
);

function animateParticles() {
  ctx.clearRect(0, 0, W, H);
  particles.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 0.022;
    ctx.beginPath();
    ctx.arc(p.x, p.y, Math.max(p.r * p.life, 0), 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${p.hue},${p.life * 0.55})`;
    ctx.fill();
  });
  particles = particles.filter((p) => p.life > 0);
  requestAnimationFrame(animateParticles);
}
animateParticles();

// hover state for interactive elements
const hoverables = "button, a, .corner, .toc-item";
document.addEventListener("mouseover", (e) => {
  if (e.target.closest(hoverables)) dot.classList.add("hover");
});
document.addEventListener("mouseout", (e) => {
  if (e.target.closest(hoverables)) dot.classList.remove("hover");
});

/* ============ BOOK LOGIC ============ */
const hero = document.getElementById("hero");
const bookClosed = document.getElementById("bookClosed");
const bookOpenWrap = document.getElementById("bookOpenWrap");
const nav = document.getElementById("nav");
const bookClose = document.getElementById("bookClose");
const staticLeft = document.getElementById("staticLeft");
const staticRight = document.getElementById("staticRight");
const cornerNext = document.getElementById("cornerNext");
const cornerPrev = document.getElementById("cornerPrev");

const NUM_LEAVES = 4; // leaf i: front = r{i}, back = l{i+1}
let currentSpread = 0; // 0..NUM_LEAVES  (0 = cover spread showing l0/r0)

function getTpl(id) {
  const t = document.getElementById("tpl-" + id);
  return t ? t.content.cloneNode(true) : document.createElement("div");
}

function fillSlot(el, id) {
  el.innerHTML = "";
  el.appendChild(getTpl(id));
}

// initialize all leaf faces
const leaves = [];
for (let i = 0; i < NUM_LEAVES; i++) {
  const leafEl = document.getElementById("leaf" + i);
  const front = leafEl.querySelector(".leaf-front");
  const back = leafEl.querySelector(".leaf-back");
  fillSlot(front, "r" + i);
  fillSlot(back, "l" + (i + 1));
  leaves.push(leafEl);
}
fillSlot(staticLeft, "l0");
fillSlot(staticRight, "r0"); // will be hidden once leaf0 sits on top, but kept as fallback

function renderSpread() {
  for (let i = 0; i < NUM_LEAVES; i++) {
    leaves[i].classList.toggle("flipped", i < currentSpread);
    leaves[i].style.zIndex = currentSpread > i ? 10 + i : 20 - i;
  }
}
renderSpread();

function goNext() {
  if (currentSpread < NUM_LEAVES) {
    currentSpread++;
    renderSpread();
  }
}
function goPrev() {
  if (currentSpread > 0) {
    currentSpread--;
    renderSpread();
  }
}

// page index mapping for nav (logical page 0..7 -> spread)
// page 0 = contents (spread0 right), 1=about(spread0 left after turn / spread1 left)...
// Simplify: spread N shows left = l{N}, right = r{N}
const pageMap = {
  0: 0, // contents -> spread 0 (right = r0 = contents)
  1: 1, // about -> spread 1 left = l1
  2: 1,
  3: 2, // projects -> spread2 left = l2
  4: 2,
  5: 3, // skills -> spread3 left = l3
  6: 3,
  7: 4, // contact -> spread4 left = l4
};

document.querySelectorAll(".nav-link").forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = pageMap[btn.dataset.page] ?? 0;
    currentSpread = target;
    renderSpread();
    updateActiveNav(btn);
  });
});
document.querySelectorAll(".toc-item").forEach((item) => {
  item.addEventListener("click", () => {
    const target = pageMap[item.dataset.goto] ?? 0;
    currentSpread = target;
    renderSpread();
  });
});

function updateActiveNav(activeBtn) {
  document
    .querySelectorAll(".nav-link")
    .forEach((b) => b.classList.remove("active"));
  if (activeBtn) activeBtn.classList.add("active");
}

cornerNext.addEventListener("click", goNext);
cornerPrev.addEventListener("click", goPrev);

// keyboard navigation
window.addEventListener("keydown", (e) => {
  if (!bookOpenWrap.classList.contains("show")) return;
  if (e.key === "ArrowRight") goNext();
  if (e.key === "ArrowLeft") goPrev();
  if (e.key === "Escape") closeBook();
});

function openBook() {
  hero.classList.add("hidden");
  bookOpenWrap.classList.add("show");
  nav.classList.add("show");
  document.body.classList.remove("hero-active");
  currentSpread = 0;
  renderSpread();
}
function closeBook() {
  bookOpenWrap.classList.remove("show");
  nav.classList.remove("show");
  setTimeout(() => {
    hero.classList.remove("hidden");
    document.body.classList.add("hero-active");
  }, 250);
}

document.body.classList.add("hero-active");
bookClosed.addEventListener("click", openBook);
bookClose.addEventListener("click", closeBook);
