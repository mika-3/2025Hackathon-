(() => {
  // ---- DOM取得（失敗すると何も動かないので、ここで確実に検知） ----
  const canvas = document.getElementById("c");
  const sceneLabel = document.getElementById("sceneLabel");
  const itemsLabel = document.getElementById("itemsLabel");
  const statusLabel = document.getElementById("statusLabel");
  const logEl = document.getElementById("log");

  const analyzeBtn = document.getElementById("analyzeBtn");
  const preset = document.getElementById("preset");
  const forceForest = document.getElementById("forceForest");
  const forceCity = document.getElementById("forceCity");
  const forceSea = document.getElementById("forceSea");
  const toggleDebug = document.getElementById("toggleDebug");
  const panicReset = document.getElementById("panicReset");

  const missing = [];
  if (!canvas) missing.push("canvas#c");
  if (!sceneLabel) missing.push("#sceneLabel");
  if (!itemsLabel) missing.push("#itemsLabel");
  if (!statusLabel) missing.push("#statusLabel");
  if (!logEl) missing.push("#log");
  if (!analyzeBtn) missing.push("#analyzeBtn");
  if (!preset) missing.push("#preset");
  if (!forceForest) missing.push("#forceForest");
  if (!forceCity) missing.push("#forceCity");
  if (!forceSea) missing.push("#forceSea");
  if (!toggleDebug) missing.push("#toggleDebug");
  if (!panicReset) missing.push("#panicReset");

  // ---- ログ関数（スマホでも状態が追えるように画面に出す） ----
  let DEBUG = true;
  function log(msg) {
    if (!logEl) return;
    if (!DEBUG) return;
    const ts = new Date().toLocaleTimeString();
    logEl.textContent = `[${ts}] ${msg}\n` + logEl.textContent;
  }

  // ---- ここで動作可否を宣言 ----
  if (missing.length) {
    // index.html と game.js のID不一致が原因
    if (statusLabel) statusLabel.textContent = "NG: DOM不足 " + missing.join(", ");
    if (statusLabel) statusLabel.className = "ng";
    if (logEl) logEl.textContent = `DOMが見つかりません: ${missing.join(", ")}\nindex.html と game.js のIDが一致しているか確認してください。`;
    return;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    statusLabel.textContent = "NG: Canvas context取得失敗";
    statusLabel.className = "ng";
    return;
  }

  statusLabel.textContent = "OK";
  statusLabel.className = "ok";
  log("game.js loaded / canvas OK");

  // ---- ワールド状態 ----
  let world = null;
  let particles = [];

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function makeWorldFromDummy(scene) {
    if (scene === "forest") {
      return { scene: "forest", items: [{ type: "bird", count: 6 }, { type: "wind", count: 3 }] };
    }
    if (scene === "city") {
      return { scene: "city", items: [{ type: "car", count: 5 }, { type: "speech", count: 3 }] };
    }
    return { scene: "sea", items: [{ type: "water", count: 6 }, { type: "seagull", count: 3 }] };
  }

  function applyWorld(w, reason = "") {
    world = w;
    sceneLabel.textContent = w.scene;
    itemsLabel.textContent = w.items.map(x => `${x.type}×${x.count}`).join(", ");
    log(`applyWorld: ${w.scene} ${reason ? "(" + reason + ")" : ""}`);

    particles = [];
    const baseY = 320;
    for (const it of w.items) {
      for (let i = 0; i < it.count; i++) {
        particles.push({
          type: it.type,
          x: rand(20, canvas.width - 20),
          y: rand(40, baseY - 80),
          vx: rand(-0.6, 0.6),
          vy: rand(-0.2, 0.2),
          t: rand(0, Math.PI * 2)
        });
      }
    }
  }

  function drawBackground(scene) {
    if (scene === "forest") {
      ctx.fillStyle = "#eaf7ea";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < 18; i++) {
        const x = i * 60 + 20;
        ctx.fillStyle = "#2f7a3b";
        ctx.beginPath();
        ctx.arc(x, 220, 18, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "#bfe6bf";
      ctx.fillRect(0, 320, canvas.width, 130);
    } else if (scene === "city") {
      ctx.fillStyle = "#eef2ff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < 12; i++) {
        const x = i * 75;
        const h = 80 + (i % 3) * 40;
        ctx.fillStyle = "#9aa7c6";
        ctx.fillRect(x + 10, 320 - h, 55, h);
      }
      ctx.fillStyle = "#c9d1e6";
      ctx.fillRect(0, 320, canvas.width, 130);
      ctx.strokeStyle = "#ffffff";
      ctx.setLineDash([10, 12]);
      ctx.beginPath();
      ctx.moveTo(0, 385);
      ctx.lineTo(canvas.width, 385);
      ctx.stroke();
      ctx.setLineDash([]);
    } else {
      ctx.fillStyle = "#e6fbff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "#7ed3e6";
      for (let y = 260; y < 330; y += 12) {
        ctx.beginPath();
        for (let x = 0; x <= canvas.width; x += 30) {
          ctx.lineTo(x, y + Math.sin(x / 60) * 4);
        }
        ctx.stroke();
      }
      ctx.fillStyle = "#ffe8b6";
      ctx.fillRect(0, 320, canvas.width, 130);
    }
  }

  function drawIcon(p) {
    ctx.save();
    ctx.translate(p.x, p.y);

    if (p.type === "bird" || p.type === "seagull") {
      ctx.fillStyle = "#111";
      ctx.fillRect(-4, -2, 8, 4);
      ctx.fillRect(-8, -6, 4, 2);
      ctx.fillRect(4, -6, 4, 2);
    } else if (p.type === "car") {
      ctx.fillStyle = "#1b3a8a";
      ctx.fillRect(-8, -4, 16, 8);
      ctx.fillStyle = "#111";
      ctx.fillRect(-6, 4, 4, 3);
      ctx.fillRect(2, 4, 4, 3);
    } else if (p.type === "water") {
      ctx.fillStyle = "#147aa6";
      ctx.fillRect(-5, -5, 10, 10);
    } else if (p.type === "rain") {
      ctx.fillStyle = "#3b82f6";
      ctx.fillRect(-1, -6, 2, 8);
    } else if (p.type === "wind") {
      ctx.fillStyle = "#16a34a";
      ctx.fillRect(-7, -2, 14, 2);
      ctx.fillRect(-5, 2, 10, 2);
    } else if (p.type === "speech") {
      ctx.fillStyle = "#6b7280";
      ctx.fillRect(-5, -5, 10, 10);
      ctx.fillRect(-2, 5, 4, 3);
    } else {
      ctx.fillStyle = "#111";
      ctx.fillRect(-4, -4, 8, 8);
    }

    ctx.restore();
  }

  function tick() {
    if (!world) { requestAnimationFrame(tick); return; }

    drawBackground(world.scene);

    for (const p of particles) {
      p.t += 0.03;
      p.x += p.vx + Math.sin(p.t) * 0.2;
      p.y += p.vy;

      if (p.y < 40) p.y = 40;
      if (p.y > 300) p.y = 300;
      if (p.x < 10) p.x = canvas.width - 10;
      if (p.x > canvas.width - 10) p.x = 10;

      if (p.type === "car") {
        p.y = 360;
        p.x += 1.2;
        if (p.x > canvas.width + 10) p.x = -10;
      }
      if (p.type === "rain") {
        p.y += 2.0;
        if (p.y > 310) p.y = 60;
      }
    }

    for (const p of particles) drawIcon(p);

    requestAnimationFrame(tick);
  }

  // ---- ボタンイベント（ここで切り分け） ----
  analyzeBtn.addEventListener("click", () => {
    const w = makeWorldFromDummy(preset.value);
    applyWorld(w, "analyzeBtn");
  });

  forceForest.addEventListener("click", () => applyWorld(makeWorldFromDummy("forest"), "force"));
  forceCity.addEventListener("click", () => applyWorld(makeWorldFromDummy("city"), "force"));
  forceSea.addEventListener("click", () => applyWorld(makeWorldFromDummy("sea"), "force"));

  toggleDebug.addEventListener("click", () => {
    DEBUG = !DEBUG;
    logEl.textContent = DEBUG ? logEl.textContent : "";
    statusLabel.textContent = DEBUG ? "OK (debug ON)" : "OK (debug OFF)";
    statusLabel.className = "ok";
  });

  panicReset.addEventListener("click", () => {
    logEl.textContent = "";
    applyWorld(makeWorldFromDummy("forest"), "reset");
  });

  // 初期表示
  applyWorld(makeWorldFromDummy("forest"), "init");
  tick();
})();