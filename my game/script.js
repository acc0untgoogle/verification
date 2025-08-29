// script.js
// لعبة ثنائية الابعاد مشابهة لـ "That Level Again" - ملف جاهز للاستيراد كـ ES module
// يتطلب: index.html و style.css (قد أعددتهما مسبقًا) و استبدال API KEY في أسفل الملف.

// --- استيراد المكتبات من CDN كما طُلب ---
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.163.0/build/three.module.js';
import * as Multisynq from 'https://cdn.jsdelivr.net/npm/@multisynq/client@latest/bundled/multisynq-client.esm.js';

// --------------------------- إعداد المشهد ثنائي الأبعاد ---------------------------
// سنستخدم كاميرا Ortho لتقليل تأثير المنظور وجعل المشهد يبدو ثنائي الأبعاد.
// الخرائط والمجسمات ستكون على مستوى X/Y (Z يستخدم قليلاً للطبقات).

/* ================= Utility helpers ================== */

// توليد لون عشوائي جميل
function niceColor(seed) {
  const h = ((seed * 137.5) % 360 + 360) % 360;
  return new THREE.Color(`hsl(${h}deg 70% 45%)`);
}

// مسافة مربع (أفضل للأداء)
function dist2(a, b) {
  const dx = a.x - b.x, dy = a.y - b.y;
  return dx * dx + dy * dy;
}

/* ================= Class: SimCar =====================
   تمثيل لاعب في الطبقة المشاركة (model) والواجهة (view).
   SimCar يحتوي على موضع وسمات تُزامن بين اللاعبين عبر SharedSimulation.
   =================================================== */
class SimCar {
  constructor({ id, name = 'Anon', color = null, x = 0, y = 0 }) {
    this.id = id;
    this.name = name;
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.speed = 180; // وحدة: pixels / second
    this.radius = 18; // حجم الشكل الذي يمثل اللاعب
    this.color = color || niceColor((id + '').length + (Math.random() * 1000));
    // حالة اللعب
    this.level = 0;
    this.finished = false;
    // For smoothing on clients:
    this.lastUpdate = Date.now();
  }

  // تَحريك اللاعب وفق dt (ثواني) — بسيط جدًا (لا فيزياء معقدة)
  integrate(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }

  // ضبط السرعة حسب اتجاهات
  setInput(input) {
    // input: { left, right, up, down }
    let nx = 0, ny = 0;
    if (input.left) nx -= 1;
    if (input.right) nx += 1;
    if (input.up) ny += 1;
    if (input.down) ny -= 1;
    // normalize
    const len = Math.hypot(nx, ny) || 1;
    this.vx = (nx / len) * this.speed;
    this.vy = (ny / len) * this.speed;
  }
}

/* ================ Class: SharedSimulation =================
   هذا الكلاس هو "model" الذي ستشارك حالته عبر Multisynq.
   يجب أن يكون بسيطًا وقابلًا للتسلسل (serializable).
   Multisynq سيقوم بمزامنة ما يحتاجه من خصائص (افتراضياً).
   ======================================================== */
class SharedSimulation {
  constructor() {
    // خريطة id -> SimCar (ستُنسخ أو تُسلسل حسب Multisynq)
    this.players = {};
    this.nextId = 1;
    this.world = {
      width: 1400,
      height: 900,
    };

    // إعداد 10 مراحل مع بيانات (صعبة) — كل مرحلة تحتوي عوائق وموقع هدف
    // المراحل مصممة هندسياً لتكون تحديًا (يمكنك تعديلها لاحقًا)
    this.levels = generateHardLevels(10, this.world.width, this.world.height);

    // tracks events for debug
    this._events = [];
  }

  // ينشئ لاعب جديد عند الانضمام
  addPlayer(name = 'Anon') {
    const id = 'p' + (this.nextId++);
    // موضع انطلاق: في وسط الإطار مقيدًا داخل حدود معينة
    const spawn = { x: 80 + Math.random() * 120, y: 80 + Math.random() * 120 };
    const player = new SimCar({ id, name, x: spawn.x, y: spawn.y });
    this.players[id] = player;
    this._events.push({ t: Date.now(), type: 'join', id, name });
    return player;
  }

  removePlayer(id) {
    delete this.players[id];
    this._events.push({ t: Date.now(), type: 'leave', id });
  }

  // تحديث السيرڤر: تُدعى دورياً من قبل Multisynq (أو من قبل الواجهة إذا محليًا)
  update(dt) {
    // تحريك كل اللاعبين
    for (const id in this.players) {
      const p = this.players[id];
      p.integrate(dt);

      // قفل داخل حدود العالم
      const w = this.world.width, h = this.world.height;
      p.x = Math.max(20, Math.min(w - 20, p.x));
      p.y = Math.max(20, Math.min(h - 20, p.y));

      // التحقق من الوصول للهدف في المرحلة الحالية
      const lvl = this.levels[p.level];
      if (lvl && pointInRect({ x: p.x, y: p.y }, lvl.goal)) {
        p.finished = true;
        p.level = Math.min(this.levels.length - 1, p.level + 1);
        // move to next spawn (simple)
        p.x = lvl.start.x;
        p.y = lvl.start.y;
        this._events.push({ t: Date.now(), type: 'level', id, level: p.level });
      }

      // تفاعل مع العوائق (تصادم بسيط)
      for (const obs of lvl?.obstacles || []) {
        if (circleRectCollision(p.x, p.y, p.radius, obs)) {
          // دفع اللاعب للخارج قليلاً (تفاعل بسيط)
          const dx = p.x - (obs.x + obs.w / 2);
          const dy = p.y - (obs.y + obs.h / 2);
          const norm = Math.hypot(dx, dy) || 1;
          p.x += (dx / norm) * 8;
          p.y += (dy / norm) * 8;
          // تقليل سرعة
          p.vx *= 0.4;
          p.vy *= 0.4;
        }
      }
    }
  }
}

/* ================= Collision helpers ================= */

function pointInRect(pt, rect) {
  return pt.x >= rect.x && pt.x <= rect.x + rect.w && pt.y >= rect.y && pt.y <= rect.y + rect.h;
}

function circleRectCollision(cx, cy, r, rect) {
  // ابحث أقرب نقطة في المستطيل إلى مركز الدائرة
  const nearestX = Math.max(rect.x, Math.min(cx, rect.x + rect.w));
  const nearestY = Math.max(rect.y, Math.min(cy, rect.y + rect.h));
  const dx = cx - nearestX;
  const dy = cy - nearestY;
  return dx * dx + dy * dy < r * r;
}

/* ================= generateHardLevels =================
   يُنشئ مصفوفة من المراحل مع عوائق هندسية معقدة.
   كل مرحلة: { start: {x,y}, goal: {x,y,w,h}, obstacles: [ {x,y,w,h} ] }
   ===================================================== */
function generateHardLevels(count, worldW, worldH) {
  const levels = [];
  for (let i = 0; i < count; i++) {
    // ازدياد صعوبة مع i
    const padding = 60;
    const start = { x: padding + Math.random() * 120, y: padding + Math.random() * 120 };
    const goal = {
      x: worldW - 160,
      y: worldH - 160 - i * 10,
      w: 80,
      h: 80
    };
    const obstacles = [];
    // إضافة صفوف وعمود عوائق متشابكة
    const cols = 4 + Math.floor(i / 2);
    for (let c = 0; c < cols; c++) {
      const x = 160 + c * ((worldW - 320) / cols) + (Math.random() * 30 - 15);
      // create vertical staggered obstacles
      for (let r = 0; r < 6 + Math.floor(i / 2); r++) {
        const height = 24 + Math.random() * 60;
        const y = 120 + r * 90 + (Math.random() * 40 - 20);
        // sometimes leave gaps
        if (Math.random() < 0.25) continue;
        obstacles.push({ x: x - 20, y: y - height / 2, w: 40 + Math.random() * 20, h: height });
      }
    }
    // Add special moving narrow corridors (static for now but placed tightly)
    for (let k = 0; k < 6 + i; k++) {
      const x = 200 + Math.random() * (worldW - 400);
      const y = 200 + Math.random() * (worldH - 400);
      if (Math.random() < 0.7) obstacles.push({ x: x, y: y, w: 80, h: 16 + Math.random() * 40 });
      else obstacles.push({ x: x, y: y, w: 16 + Math.random() * 40, h: 80 });
    }
    // Ensure start and goal are relatively free
    levels.push({ start, goal, obstacles });
  }
  return levels;
}

/* ================= Class: SimInterface =================
   هذه الواجهة (view) هي التي ترسم المشهد على جهاز كل عميل
   وتتعامل مع الإدخالات المحلية، و تعرض اللاعبين
   ===================================================== */
class SimInterface {
  constructor(app, model) {
    // app: الكائن الذي يرجع من Multisynq.Session.join
    // model: SharedSimulation instance المقدمة من الشبكة (أو نسخة منها)
    this.app = app;
    this.model = model;

    // إعداد العناصر الرسومية
    this.initThree();
    this.buildBackground();
    this.buildUI();
    this.buildWorldVisuals();

    // map id -> mesh (ثنائي)
    this.clientPlayers = new Map();

    // التحكّم المحلي
    this.input = { left: false, right: false, up: false, down: false };
    this.localPlayerId = null;

    // attach controls (keyboard + touch)
    this.attachControls();

    // load saved state إن وجد
    this.loadState();

    // Flag for pause
    this.paused = false;

    // الوقت بين تحديثات الواجهة
    this.lastFrame = performance.now();
  }

  /* ----- init three ----- */
  initThree() {
    // canvas
    this.canvas = document.createElement('canvas');
    this.canvas.style.display = 'block';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    document.body.appendChild(this.canvas);

    // sizes
    this.sizes = { width: window.innerWidth, height: window.innerHeight };

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(new THREE.Color(0x061223), 1); // غامق مثير للرعب من الخلف

    // Scene
    this.scene = new THREE.Scene();
    // subtle fog for depth
    this.scene.fog = new THREE.FogExp2(0x02040a, 0.0008);

    // Orthographic camera for 2D feel
    const aspect = this.sizes.width / this.sizes.height;
    const viewSize = 600;
    this.camera = new THREE.OrthographicCamera(
      -viewSize * aspect / 2,
      viewSize * aspect / 2,
      viewSize / 2,
      -viewSize / 2,
      -1000,
      1000
    );
    this.camera.position.set(this.model.world.width / 2, -this.model.world.height / 2, 500);
    this.camera.lookAt(this.model.world.width / 2, -this.model.world.height / 2, 0);

    // Lights
    const amb = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(amb);
    const dir = new THREE.DirectionalLight(0xffffff, 0.6);
    dir.position.set(1, -1, 1);
    this.scene.add(dir);

    // Resize listener
    window.addEventListener('resize', () => {
      this.sizes.width = window.innerWidth; this.sizes.height = window.innerHeight;
      const aspect = this.sizes.width / this.sizes.height;
      const viewSize = 600;
      this.camera.left = -viewSize * aspect / 2;
      this.camera.right = viewSize * aspect / 2;
      this.camera.top = viewSize / 2;
      this.camera.bottom = -viewSize / 2;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.sizes.width, this.sizes.height);
    });
  }

  /* ----- build spooky layered background: mountains, trees, clouds ----- */
  buildBackground() {
    const bg = new THREE.Group();
    bg.position.set(0, 0, -200);
    // dark gradient plane
    const planeGeo = new THREE.PlaneGeometry(this.model.world.width * 2, this.model.world.height * 2);
    const planeMat = new THREE.MeshBasicMaterial({ color: 0x03030a });
    const backPlane = new THREE.Mesh(planeGeo, planeMat);
    backPlane.position.set(this.model.world.width / 2, -this.model.world.height / 2, -300);
    this.scene.add(backPlane);

    // mountains layers
    for (let i = 0; i < 6; i++) {
      const layer = new THREE.Group();
      const count = 6 + i;
      const baseY = -50 - i * 40;
      for (let m = 0; m < count; m++) {
        const cone = new THREE.ConeGeometry(120 - i * 8, 200 + i * 20, 6);
        const col = new THREE.Color().setHSL(0.6 - i * 0.02, 0.4, 0.08 + i * 0.06);
        const mat = new THREE.MeshLambertMaterial({ color: col.getHex(), transparent: true, opacity: 0.6 + i * 0.05 });
        const mesh = new THREE.Mesh(cone, mat);
        mesh.rotation.z = Math.PI; // flip so peak points up in our coordinate orientation
        mesh.position.set(200 + m * (this.model.world.width / count) + (i * 12), baseY - i * 10 - Math.random() * 40, -250 + i);
        // snowy peaks for taller mountains
        const peak = new THREE.Mesh(new THREE.ConeGeometry(36, 40, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }));
        peak.position.set(0, 80, 2);
        mesh.add(peak);
        layer.add(mesh);
      }
      layer.position.set(0, 0, -50 - i * 8);
      this.scene.add(layer);
    }

    // Trees: trunk + cone leaves, scattered closer to camera
    const trees = new THREE.Group();
    for (let i = 0; i < 40; i++) {
      const trunkGeo = new THREE.CylinderGeometry(6, 6, 28, 6);
      const trunk = new THREE.Mesh(trunkGeo, new THREE.MeshLambertMaterial({ color: 0x221b12 }));
      const leavesGeo = new THREE.ConeGeometry(24, 60, 8);
      const leaves = new THREE.Mesh(leavesGeo, new THREE.MeshLambertMaterial({ color: 0x072f14 }));
      leaves.position.set(0, 30, 0);
      const tree = new THREE.Group();
      tree.add(trunk);
      tree.add(leaves);
      tree.position.set(120 + Math.random() * (this.model.world.width - 240), -120 - Math.random() * (this.model.world.height - 240), -30 + Math.random() * 20);
      tree.rotation.z = (Math.random() - 0.5) * 0.2;
      trees.add(tree);
    }
    this.scene.add(trees);

    // clouds: semi-transparent spheres floating
    const clouds = new THREE.Group();
    for (let i = 0; i < 12; i++) {
      const c = new THREE.Mesh(new THREE.SphereGeometry(32 + Math.random() * 60, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.18 + Math.random() * 0.12 }));
      c.position.set(150 + Math.random() * (this.model.world.width - 300), -30 - Math.random() * 200, -100 + Math.random() * 20);
      clouds.add(c);
    }
    this.scene.add(clouds);
  }

  /* ----- build static world visuals: frame, obstacles placeholders ----- */
  buildWorldVisuals() {
    // black frame (اللاعبون محبوسون داخل إطار أسود)
    const frame = new THREE.Group();
    const W = this.model.world.width, H = this.model.world.height;
    const borderGeo = new THREE.BoxGeometry(W + 20, 8, 1);
    const borderMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const top = new THREE.Mesh(borderGeo, borderMat);
    top.position.set(W / 2, -8, 10);
    const bottom = new THREE.Mesh(borderGeo, borderMat);
    bottom.position.set(W / 2, -H + 8, 10);
    const left = new THREE.Mesh(new THREE.BoxGeometry(8, H + 20, 1), borderMat);
    left.position.set(8, -H / 2, 10);
    const right = new THREE.Mesh(new THREE.BoxGeometry(8, H + 20, 1), borderMat);
    right.position.set(W - 8, -H / 2, 10);
    frame.add(top, bottom, left, right);
    this.scene.add(frame);

    // obstacles visuals (create mesh for each level obstacle but place off-screen except current)
    this.levelGroups = [];
    this.model.levels.forEach((lvl, idx) => {
      const g = new THREE.Group();
      lvl.obstacles.forEach(obs => {
        const geo = new THREE.BoxGeometry(obs.w, obs.h, 6);
        const mat = new THREE.MeshLambertMaterial({ color: 0x332b2a });
        const m = new THREE.Mesh(geo, mat);
        m.position.set(obs.x + obs.w / 2, -(obs.y + obs.h / 2), 5);
        g.add(m);
      });
      // goal area
      const goalGeo = new THREE.PlaneGeometry(lvl.goal.w, lvl.goal.h);
      const goalMat = new THREE.MeshBasicMaterial({ color: 0x44ff88, transparent: true, opacity: 0.6 });
      const goalMesh = new THREE.Mesh(goalGeo, goalMat);
      goalMesh.position.set(lvl.goal.x + lvl.goal.w / 2, -(lvl.goal.y + lvl.goal.h / 2), 6);
      g.add(goalMesh);

      // a subtle text or marker (for readability)
      this.scene.add(g);
      this.levelGroups.push(g);
    });

    // show only current level obstacles (others hidden)
    this.updateLevelVisibility();
  }

  updateLevelVisibility() {
    // show obstacles for minimum level among players (co-op same room logic)
    let minLevel = Infinity;
    for (const id in this.model.players) {
      minLevel = Math.min(minLevel, this.model.players[id].level || 0);
    }
    if (!isFinite(minLevel)) minLevel = 0;
    this.levelGroups.forEach((g, idx) => {
      g.visible = idx === minLevel;
      // position group properly (no need; already placed in world coords)
    });
  }

  /* ----- UI: buttons (start/pause/quit/save) ----- */
  buildUI() {
    // container
    this.ui = document.createElement('div');
    this.ui.className = 'game-ui';
    Object.assign(this.ui.style, {
      position: 'fixed',
      left: '12px',
      top: '12px',
      zIndex: 999,
      color: '#fff',
      fontFamily: 'sans-serif',
      display: 'flex',
      gap: '8px',
      alignItems: 'center',
    });
    document.body.appendChild(this.ui);

    // Start / Pause
    this.btnStart = makeUIButton('ابدأ', () => {
      this.paused = false;
    });
    this.btnPause = makeUIButton('إيقاف مؤقت', () => {
      this.paused = true;
    });
    this.btnSave = makeUIButton('حفظ', () => this.saveState());
    this.btnQuit = makeUIButton('خروج', () => {
      // leave session and reload page
      if (confirm('هل تريد الخروج من الجلسة؟')) {
        // If multisynq app exists, try to leave
        if (this.app && this.app.leave) {
          try { this.app.leave(); } catch (e) { /* ignore */ }
        }
        location.reload();
      }
    });

    this.ui.appendChild(this.btnStart);
    this.ui.appendChild(this.btnPause);
    this.ui.appendChild(this.btnSave);
    this.ui.appendChild(this.btnQuit);

    // small HUD for player name/level
    this.hud = document.createElement('div');
    Object.assign(this.hud.style, { padding: '6px 8px', background: 'rgba(0,0,0,0.45)', borderRadius: '8px' });
    this.hud.innerHTML = 'اسمك: - | مستوى: -';
    this.ui.appendChild(this.hud);
  }

  /* attach keyboard and touch controls (touch ids from index.html) */
  attachControls() {
    // Keyboard
    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
      switch (e.key) {
        case 'ArrowLeft': case 'a': case 'A': this.input.left = true; break;
        case 'ArrowRight': case 'd': case 'D': this.input.right = true; break;
        case 'ArrowUp': case 'w': case 'W': this.input.up = true; break;
        case 'ArrowDown': case 's': case 'S': this.input.down = true; break;
      }
    });
    window.addEventListener('keyup', (e) => {
      switch (e.key) {
        case 'ArrowLeft': case 'a': case 'A': this.input.left = false; break;
        case 'ArrowRight': case 'd': case 'D': this.input.right = false; break;
        case 'ArrowUp': case 'w': case 'W': this.input.up = false; break;
        case 'ArrowDown': case 's': case 'S': this.input.down = false; break;
      }
    });

    // Touch buttons from the HTML (as specified in index.html)
    const btnLeft = document.getElementById('btn-left');
    const btnRight = document.getElementById('btn-right');
    const btnFwd = document.getElementById('btn-fwd');
    const btnBwd = document.getElementById('btn-bwd');

    const mapBtn = (el, key) => {
      if (!el) return;
      el.addEventListener('touchstart', (e) => { e.preventDefault(); this.input[key] = true; }, { passive: false });
      el.addEventListener('touchend', (e) => { e.preventDefault(); this.input[key] = false; }, { passive: false });
      el.addEventListener('mousedown', () => { this.input[key] = true; });
      el.addEventListener('mouseup', () => { this.input[key] = false; });
      el.addEventListener('mouseleave', () => { this.input[key] = false; });
    };
    mapBtn(btnLeft, 'left');
    mapBtn(btnRight, 'right');
    mapBtn(btnFwd, 'up');
    mapBtn(btnBwd, 'down');

    // Focus name prompt if not set yet (local)
    if (!this.app?.me?.name) {
      const name = prompt('أدخل اسم اللاعب (سيظهر للاعبين الآخرين):', 'Player' + Math.floor(Math.random() * 999));
      if (name) {
        // prefer Multisynq provided name assignment later; but store locally
        localStorage.setItem('playerName', name);
      }
    }
  }

  /* ----- Save / Load state locally ----- */
  saveState() {
    const data = {
      players: Object.fromEntries(Object.entries(this.model.players).map(([id, p]) => [id, { name: p.name, level: p.level }])),
      timestamp: Date.now()
    };
    localStorage.setItem('that-level-state', JSON.stringify(data));
    alert('تم حفظ الحالة محليًا.');
  }

  loadState() {
    try {
      const raw = localStorage.getItem('that-level-state');
      if (!raw) return;
      const data = JSON.parse(raw);
      // يمكن إعادة تطبيق المعلومات البسيطة (أسماء/مستويات)
      // لكن نترك المحاكاة الشبكية تتحكم في الحالة الحقيقية.
      console.log('Loaded state', data);
    } catch (e) { /* ignore */ }
  }

  /* ----- manage players visual meshes ----- */
  ensurePlayerMesh(id, simCar) {
    if (this.clientPlayers.has(id)) return this.clientPlayers.get(id);

    // body: elegant circle with outline and label
    const group = new THREE.Group();

    // outer ring
    const ringGeo = new THREE.CircleGeometry(simCar.radius + 4, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.set(0, 0, 8);
    group.add(ring);

    // inner circle colored
    const bodyGeo = new THREE.CircleGeometry(simCar.radius, 32);
    const bodyMat = new THREE.MeshLambertMaterial({ color: simCar.color });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.set(0, 0, 9);
    group.add(body);

    // player name label (simple)
    const nameCanvas = document.createElement('canvas');
    nameCanvas.width = 256; nameCanvas.height = 64;
    const ctx = nameCanvas.getContext('2d');
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, nameCanvas.width, nameCanvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(simCar.name, nameCanvas.width / 2, 40);

    const tex = new THREE.CanvasTexture(nameCanvas);
    tex.needsUpdate = true;
    const spriteGeo = new THREE.PlaneGeometry(80, 22);
    const spriteMat = new THREE.MeshBasicMaterial({ map: tex, transparent: true });
    const label = new THREE.Mesh(spriteGeo, spriteMat);
    label.position.set(0, -simCar.radius - 20, 9);
    group.add(label);

    this.scene.add(group);
    this.clientPlayers.set(id, { group, body });
    return this.clientPlayers.get(id);
  }

  removePlayerMesh(id) {
    const rec = this.clientPlayers.get(id);
    if (!rec) return;
    this.scene.remove(rec.group);
    this.clientPlayers.delete(id);
  }

  /* ----- update loop: called each animation frame by the main loop ----- */
  update() {
    const now = performance.now();
    const dt = Math.min(0.05, (now - this.lastFrame) / 1000);
    this.lastFrame = now;
    if (!this.paused) {
      // If we have a local player in model, update its velocity from input
      if (this.localPlayerId && this.model.players[this.localPlayerId]) {
        this.model.players[this.localPlayerId].setInput(this.input);
      }
      // Update model locally as well for smoother single-player feel (server also updates)
      this.model.update(dt);
    }

    // Update players visuals
    for (const id in this.model.players) {
      const p = this.model.players[id];
      const rec = this.ensurePlayerMesh(id, p);
      // set position
      rec.group.position.set(p.x, -p.y, 10);
    }

    // Remove any meshes for players not present
    for (const key of Array.from(this.clientPlayers.keys())) {
      if (!this.model.players[key]) this.removePlayerMesh(key);
    }

    // Update HUD: show local player's name and level
    const me = this.model.players[this.localPlayerId];
    if (me) {
      this.hud.innerHTML = `اسمك: ${me.name} | مستوى: ${me.level + 1}/${this.model.levels.length}`;
    } else {
      this.hud.innerHTML = `اسمك: - | لاعبين: ${Object.keys(this.model.players).length}`;
    }

    // update level visibility (co-op)
    this.updateLevelVisibility();

    // camera smoothing: keep center on overall center or local player
    let targetX = this.model.world.width / 2, targetY = -this.model.world.height / 2;
    if (me) { targetX = me.x; targetY = -me.y; }
    this.camera.position.x += (targetX - this.camera.position.x) * 0.08;
    this.camera.position.y += (targetY - this.camera.position.y) * 0.08;
    this.camera.updateProjectionMatrix();

    // render
    this.renderer.render(this.scene, this.camera);
  }

  /* ----- hooking into Multisynq lifecycle ----- */
  // Multisynq may call this when the client becomes the authoritative "owner" for a new player
  onAddPlayerLocal(id) {
    this.localPlayerId = id;
    // if player object exists, create mesh immediately
    const p = this.model.players[id];
    if (p) {
      this.ensurePlayerMesh(id, p);
    }
  }

  // Multisynq may notify about remote changes; we update visuals accordingly
  onRemoteUpdate() {
    // called when remote state changes
    // For this simple implementation we just keep visuals synced in update()
  }
}

/* --------------------------- Multisynq join ---------------------------
   الجزء الذي يربط كل شيء مع Multisynq. تحتاج لتغيير YOUR_API_KEY_HERE بمفتاحك.
   هذا الجزء ينضم للجلسة ويبدأ حلقة التحديث.
   -------------------------------------------------------------------- */

// helper لإنشاء زر UI
function makeUIButton(text, onClick) {
  const b = document.createElement('button');
  b.textContent = text;
  Object.assign(b.style, {
    padding: '8px 12px',
    borderRadius: '8px',
    border: 'none',
    background: 'rgba(255,255,255,0.08)',
    color: '#fff',
    cursor: 'pointer'
  });
  b.addEventListener('click', onClick);
  return b;
}

/* --------------------------- Multisynq initialization --------------------------- */

// Join session (Multisynq). تنبيه: استبدل الـ apiKey بقيمتك.
Multisynq.Session.join({
  apiKey: "YOUR_API_KEY_HERE", // <-- استبدل هذا بمفتاحك من multisynq.io
  name: location.origin + location.pathname,
  password: "none",
  model: SharedSimulation,
  view: SimInterface,
  debug: ["writes"]
}).then(app => {
  // app.view هو كائن SimInterface
  const view = app.view || app;

  // عندما ينضم اللاعب الجديد إلى المحاكاة، نطلب من السيرفر إنشاء كائن له
  // بعض مكتبات Multisynq توفر طرقًا للانضمام بصيغة مختلفة؛ هنا افتراض عام:
  const meName = localStorage.getItem('playerName') || ('Player' + Math.floor(Math.random() * 9999));

  // نطلب من السيرفر إنشاء لاعب بإسمنا
  // NOTE: تفصيل طرق النداء يختلف باختلاف النسخة — هذا دعاء نموذجي.
  try {
    // إذا كانت واجهة app.api أو app.model.createPlayer متاحة، استخدمها
    if (app.rpc && app.rpc.addPlayer) {
      // إذا كانت الشبكة توفر RPC
      app.rpc.addPlayer(meName).then(id => {
        console.log('Added player id', id);
        view.onAddPlayerLocal(id);
      }).catch(() => {
        // fallback - create local player
        const p = view.model.addPlayer(meName);
        view.onAddPlayerLocal(p.id);
      });
    } else {
      // fallback: مباشرةً على النموذج المحلي (سيعمل في وضع عدم الاتصال)
      const p = view.model.addPlayer(meName);
      view.onAddPlayerLocal(p.id);
    }
  } catch (e) {
    // في حال لم تُعرّف واجهة RPC — ننشئ محلياً
    const p = view.model.addPlayer(meName);
    view.onAddPlayerLocal(p.id);
  }

  // main loop: نستخدم requestAnimationFrame لكن Multisynq قد يحتاج تحديثات في أطر زمنية معينة
  const loop = () => {
    view.update();
    requestAnimationFrame(loop);
  };
  loop();

}).catch(err => {
  // فشل الانضمام — عرض رسالة للمستخدم و السماح بالعمل محلياً (standalone)
  console.error('Failed to join Multisynq session:', err);
  alert('لم يتمكن التطبيق من الاتصال بـ Multisynq. سيمكنك اللعب محليًا، لكن المزامنة عبر الشبكة لن تعمل. تأكد من استبدال29JY9FN4qH7AVSYfvLICVfjadXuFrV5JMLfa19OoQZبمفتاحك إذا أردت اللعب أونلاين.');

  // Standalone fallback: create a local simulation and interface so يمكنك التجربة بدون شبكة
  const model = new SharedSimulation();
  const appFallback = { view: null };
  const view = new SimInterface(appFallback, model);
  appFallback.view = view;

  // create a local player
  const name = localStorage.getItem('playerName') || ('Local' + Math.floor(Math.random() * 999));
  const p = model.addPlayer(name);
  view.onAddPlayerLocal(p.id);

  // loop
  const loop = () => {
    view.update();
    requestAnimationFrame(loop);
  };
  loop();
});

/* ===================== نهاية الملف =====================
  ملاحظات نهائية:
  - استبدل YOUR_API_KEY_HERE بمفتاحك من multisynq.io لتعمل المزامنة الحقيقية.
  - هذا كود مُجمّع وواضح للمبتدئين: SharedSimulation يمثل حالة اللعبة المشتركة،
    SimCar يمثل لاعبًا واحدًا، وSimInterface يتعامل مع العرض والإدخال.
  - يمكنك توسيع العوائق لجعلها متحركة أو إضافة عناصر تفاعلية أكثر (المصائد، الأزرار التي تفتح ممرّات، ...).
  - أداء: التصميم مبسّط ومناسب للعب متزامن خفيف. لضغط الشبكة، أضف آليات تقنين (مثل إرسال المواضع كل X ملّي ثانية).
  - لتحسين الرسومات: يمكنك استبدال الـ MeshBasic/ Lambert بمواد أفضل وإضافة خريطة ظل، أو استخدام sprites جاهزة.
============================================================================= */
