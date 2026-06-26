/* ===== GRID / CONSTELLATION BACKGROUND ===== */
(function() {
  const gc = document.getElementById("grid-canvas");
  const gctx = gc.getContext("2d");
  let gW, gH;
  const dots = [];
  const DOT_COUNT = 55;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion:reduce)").matches;

  function resizeGrid() {
    gW = gc.width = window.innerWidth;
    gH = gc.height = window.innerHeight;
  }
  resizeGrid();
  window.addEventListener("resize", resizeGrid);

  for (let i = 0; i < DOT_COUNT; i++) {
    dots.push({
      x: Math.random() * gW, y: Math.random() * gH,
      r: Math.random() * 1.2 + 0.4,
      vx: (Math.random() - .5) * .22, vy: (Math.random() - .5) * .22,
      opacity: Math.random() * .35 + .1,
    });
  }

  function drawGrid() {
    gctx.clearRect(0, 0, gW, gH);
    if (!document.body.classList.contains("hero-active")) { requestAnimationFrame(drawGrid); return; }

    if (!reduceMotion) dots.forEach(d => { d.x += d.vx; d.y += d.vy; if (d.x < 0) d.x = gW; if (d.x > gW) d.x = 0; if (d.y < 0) d.y = gH; if (d.y > gH) d.y = 0; });

    // lines between close dots
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const dx = dots[i].x - dots[j].x, dy = dots[i].y - dots[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 130) {
          gctx.beginPath();
          gctx.moveTo(dots[i].x, dots[i].y);
          gctx.lineTo(dots[j].x, dots[j].y);
          gctx.strokeStyle = `rgba(180,210,240,${.07 * (1 - dist/130)})`;
          gctx.lineWidth = .5;
          gctx.stroke();
        }
      }
    }
    dots.forEach(d => {
      gctx.beginPath();
      gctx.arc(d.x, d.y, d.r, 0, Math.PI*2);
      gctx.fillStyle = `rgba(180,210,240,${d.opacity})`;
      gctx.fill();
    });
    requestAnimationFrame(drawGrid);
  }
  drawGrid();
})();

/* ===== CURSOR PARTICLES ===== */
const dot = document.getElementById("cursorDot");
const cursorGlow = document.getElementById("cursorGlow");
const canvas = document.getElementById("cursor-canvas");
const ctx = canvas.getContext("2d");
let W = canvas.width = window.innerWidth;
let H = canvas.height = window.innerHeight;
window.addEventListener("resize", () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; });

let mouseX = W/2, mouseY = H/2;
let particles = [];
const reduceMotion = window.matchMedia("(prefers-reduced-motion:reduce)").matches;

window.addEventListener("mousemove", (e) => {
  mouseX = e.clientX; mouseY = e.clientY;
  dot.style.left = mouseX + "px";
  dot.style.top  = mouseY + "px";
  cursorGlow.style.left = mouseX + "px";
  cursorGlow.style.top  = mouseY + "px";

  if (!reduceMotion && document.body.classList.contains("hero-active")) {
    for (let i = 0; i < 2; i++) {
      particles.push({
        x: mouseX + (Math.random()-.5)*4,
        y: mouseY + (Math.random()-.5)*4,
        r: Math.random()*2.5 + 1,
        life: 1,
        vx: (Math.random()-.5)*.5,
        vy: (Math.random()-.5)*.5 - .15,
        hue: Math.random() > .5 ? "132,88,179" : "126,207,239",
      });
    }
    if (particles.length > 140) particles.splice(0, particles.length - 140);
  }
});
window.addEventListener("mousedown", () => dot.style.transform = "translate(-50%,-50%) scale(.65)");
window.addEventListener("mouseup",   () => dot.style.transform = "translate(-50%,-50%) scale(1)");

function animateParticles() {
  ctx.clearRect(0, 0, W, H);
  particles.forEach(p => {
    p.x += p.vx; p.y += p.vy; p.life -= .025;
    ctx.beginPath();
    ctx.arc(p.x, p.y, Math.max(p.r * p.life, 0), 0, Math.PI*2);
    ctx.fillStyle = `rgba(${p.hue},${p.life*.5})`;
    ctx.fill();
  });
  particles = particles.filter(p => p.life > 0);
  requestAnimationFrame(animateParticles);
}
animateParticles();

// hover states
const hoverables = "button, a, .corner, .toc-item, .skill-chip, .project-card";
document.addEventListener("mouseover", e => { if (e.target.closest(hoverables)) dot.classList.add("hover"); });
document.addEventListener("mouseout",  e => { if (e.target.closest(hoverables)) dot.classList.remove("hover"); });

/* ===== BOOK LOGIC ===== */
const hero       = document.getElementById("hero");
const bookClosed = document.getElementById("bookClosed");
const bookOpenWrap = document.getElementById("bookOpenWrap");
const nav        = document.getElementById("nav");
const bookClose  = document.getElementById("bookClose");
const staticLeft = document.getElementById("staticLeft");
const staticRight= document.getElementById("staticRight");
const cornerNext = document.getElementById("cornerNext");
const cornerPrev = document.getElementById("cornerPrev");
const progressFill = document.getElementById("progressFill");

const NUM_LEAVES = 4;
let currentSpread = 0;

function getTpl(id) {
  const t = document.getElementById("tpl-" + id);
  return t ? t.content.cloneNode(true) : document.createElement("div");
}
function fillSlot(el, id) {
  el.innerHTML = "";
  el.appendChild(getTpl(id));
}

const leaves = [];
for (let i = 0; i < NUM_LEAVES; i++) {
  const leafEl = document.getElementById("leaf" + i);
  fillSlot(leafEl.querySelector(".leaf-front"), "r" + i);
  fillSlot(leafEl.querySelector(".leaf-back"),  "l" + (i+1));
  leaves.push(leafEl);
}
fillSlot(staticLeft,  "l0");
fillSlot(staticRight, "r0");

function triggerReveal(el) {
  const pc = el.querySelector(".page-content");
  if (!pc) return;
  pc.classList.remove("revealed");
  requestAnimationFrame(() => requestAnimationFrame(() => pc.classList.add("revealed")));
}

function updateProgress() {
  progressFill.style.width = (currentSpread / NUM_LEAVES * 100) + "%";
}

function renderSpread() {
  for (let i = 0; i < NUM_LEAVES; i++) {
    const wasFlipped = leaves[i].classList.contains("flipped");
    const shouldFlip = i < currentSpread;
    leaves[i].classList.toggle("flipped", shouldFlip);
    leaves[i].style.zIndex = currentSpread > i ? 10 + i : 20 - i;

    if (shouldFlip !== wasFlipped) {
      setTimeout(() => {
        const face = shouldFlip ? leaves[i].querySelector(".leaf-back") : leaves[i].querySelector(".leaf-front");
        triggerReveal(face);
      }, 500);
    }
  }
  updateProgress();
}
renderSpread();

function goNext() { if (currentSpread < NUM_LEAVES) { currentSpread++; renderSpread(); } }
function goPrev() { if (currentSpread > 0) { currentSpread--; renderSpread(); } }

const pageMap = { 0:0, 1:1, 2:1, 3:2, 4:2, 5:3, 6:3, 7:4 };

document.querySelectorAll(".nav-link").forEach(btn => {
  btn.addEventListener("click", () => {
    const target = pageMap[btn.dataset.page] ?? 0;
    currentSpread = target; renderSpread();
    document.querySelectorAll(".nav-link").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

// TOC delegated (works on cloned templates)
document.addEventListener("click", e => {
  const item = e.target.closest(".toc-item");
  if (item) { const target = pageMap[item.dataset.goto] ?? 0; currentSpread = target; renderSpread(); }
});

cornerNext.addEventListener("click", goNext);
cornerPrev.addEventListener("click", goPrev);

window.addEventListener("keydown", e => {
  if (!bookOpenWrap.classList.contains("show")) return;
  if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); goNext(); }
  if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); }
  if (e.key === "Escape") closeBook();
});

function openBook() {
  hero.classList.add("hidden");
  bookOpenWrap.classList.add("show");
  nav.classList.add("show");
  document.body.classList.remove("hero-active");
  currentSpread = 0; renderSpread();
  // reveal first visible pages
  setTimeout(() => {
    triggerReveal(staticRight);
    triggerReveal(leaves[0].querySelector(".leaf-front"));
  }, 300);
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

// touch / swipe
let touchStartX = 0;
bookOpenWrap.addEventListener("touchstart", e => { touchStartX = e.touches[0].clientX; }, {passive:true});
bookOpenWrap.addEventListener("touchend", e => {
  const diff = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 50) { if (diff > 0) goNext(); else goPrev(); }
}, {passive:true});