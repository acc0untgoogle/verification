import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';
import { PointerLockControls } from 'https://cdn.jsdelivr.net/npm/three@0.155.0/examples/jsm/controls/PointerLockControls.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.155.0/examples/jsm/loaders/GLTFLoader.js';
import { Player } from './player.js';
import { Weapon } from './weapon.js';
import { createBasicMap, tryLoadMap } from './map.js';
import { BotManager } from './bots.js';

const canvas = document.getElementById('game');
const startBtn = document.getElementById('start');
const ammoEl = document.getElementById('ammo');
const hud = document.getElementById('hud');

// إخفاء الـ HUD في البداية
hud.style.display = 'none';

// إعداد المشهد والكاميرا
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x101215);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;

// إضاءة
const hemi = new THREE.HemisphereLight(0xffffff, 0x222244, 0.6);
scene.add(hemi);
const dir = new THREE.DirectionalLight(0xffffff, 0.8);
dir.position.set(10,20,10);
dir.castShadow = true;
scene.add(dir);

// تحكم اللاعب
const controls = new PointerLockControls(camera, canvas);
camera.position.set(0, 1.7, 5);

// تهيئة اللاعب والسلاح
const player = new Player(camera, controls);
const weapon = new Weapon(camera, (clip, total) => ammoEl.textContent = clip + '/' + total);
weapon.attach(scene);
weapon.loadModel('assets/weapon.fbx');

const bots = new BotManager(scene);

// تحميل الخريطة
const loader = new GLTFLoader();
tryLoadMap(loader, scene, 'assets/map.glb').catch(()=>{ createBasicMap(scene); });

// إضافة أعداء
bots.spawnRandom(3);
bots.addGLTFCharacter('assets/character.fbx', { health: 120 });

// متغير لوب اللعبة
let gameStarted = false;

// عند الضغط على زر البداية
startBtn.addEventListener('click', () => {
    startBtn.style.display = 'none';
    hud.style.display = 'block';
    controls.lock();
    gameStarted = true;
});

// إظهار وإخفاء الزر عند الخروج من اللعب
controls.addEventListener('lock', () => { startBtn.style.display = 'none'; });
controls.addEventListener('unlock', () => { startBtn.style.display = 'flex'; });

// لوب اللعبة
const clock = new THREE.Clock();
function loop(){
  requestAnimationFrame(loop);

  if (gameStarted) {
    const dt = Math.min(clock.getDelta(), 0.05);
    player.update(dt);
    weapon.update(dt, player.getDirection(), (origin, dir)=>{
      const hit = hitscan(origin, dir, 200);
      if(hit){
        if(hit.object.userData?.damageable){ bots.applyDamage(hit.object, weapon.damage); }
        spawnSpark(hit.point);
      }
    });
    bots.update(dt, player.object.position);
  }

  renderer.render(scene, camera);
}
loop();

// دالة ضرب الأشعة
const raycaster = new THREE.Raycaster();
function hitscan(origin, dir, dist=200){
  raycaster.set(origin, dir.normalize());
  raycaster.far = dist;
  const candidates = [];
  scene.traverse(o=>{ if(o.userData?.hittable) candidates.push(o); });
  const intersects = raycaster.intersectObjects(candidates, true);
  return intersects[0];
}

// مؤثر الشرارة عند الإصابة
const tmpGeo = new THREE.SphereGeometry(0.03, 6, 6);
const tmpMat = new THREE.MeshBasicMaterial({color:0xffffaa});
function spawnSpark(point){
  const m = new THREE.Mesh(tmpGeo, tmpMat);
  m.position.copy(point);
  scene.add(m);
  setTimeout(()=>scene.remove(m), 120);
}

// عند تغيير حجم الشاشة
addEventListener('resize', ()=>{
  camera.aspect = innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
});

// لتغيير الماب أو السلاح أو إضافة شخصية
export function setMap(url){ tryLoadMap(loader, scene, url); }
export function setWeaponModel(url){ weapon.loadModel(url); }
export function addCharacter(url, options){ bots.addGLTFCharacter(url, options); }
