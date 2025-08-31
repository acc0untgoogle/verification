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

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x101215);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;

const hemi = new THREE.HemisphereLight(0xffffff, 0x222244, 0.6);
scene.add(hemi);
const dir = new THREE.DirectionalLight(0xffffff, 0.8);
dir.position.set(10,20,10);
dir.castShadow = true;
scene.add(dir);

const controls = new PointerLockControls(camera, canvas);
camera.position.set(0, 1.7, 5);

const player = new Player(camera, controls);
const weapon = new Weapon(camera, (clip, total) => ammoEl.textContent = clip + '/' + total);
weapon.attach(scene);
// load your weapon model
weapon.loadModel('assets/weapon.fbx');
const bots = new BotManager(scene);

const loader = new GLTFLoader();
tryLoadMap(loader, scene, 'assets/map.glb').catch(()=>{ createBasicMap(scene); });

bots.spawnRandom(3);
// add your character as enemy
bots.addGLTFCharacter('assets/character.fbx', { health: 120 });

const clock = new THREE.Clock();
function loop(){
  requestAnimationFrame(loop);
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
  renderer.render(scene, camera);
}
loop();

const raycaster = new THREE.Raycaster();
function hitscan(origin, dir, dist=200){
  raycaster.set(origin, dir.normalize());
  raycaster.far = dist;
  const candidates = [];
  scene.traverse(o=>{ if(o.userData?.hittable) candidates.push(o); });
  const intersects = raycaster.intersectObjects(candidates, true);
  return intersects[0];
}

const tmpGeo = new THREE.SphereGeometry(0.03, 6, 6);
const tmpMat = new THREE.MeshBasicMaterial({color:0xffffaa});
function spawnSpark(point){
  const m = new THREE.Mesh(tmpGeo, tmpMat);
  m.position.copy(point);
  scene.add(m);
  setTimeout(()=>scene.remove(m), 120);
}

addEventListener('resize', ()=>{
  camera.aspect = innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
});

startBtn.addEventListener('click', ()=>{ controls.lock(); });
controls.addEventListener('lock', ()=>{ startBtn.style.display='none'; });
controls.addEventListener('unlock', ()=>{ startBtn.style.display='flex'; });

export function setMap(url){ tryLoadMap(loader, scene, url); }
export function setWeaponModel(url){ weapon.loadModel(url); }
export function addCharacter(url, options){ bots.addGLTFCharacter(url, options); }
