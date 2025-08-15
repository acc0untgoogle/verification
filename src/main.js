import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.155/examples/jsm/loaders/GLTFLoader.js';

const startButton = document.getElementById("startButton");
const loadingScreen = document.getElementById("loadingScreen");
const loadingText = document.getElementById("loadingText");
const loadingBar = document.getElementById("loadingBar");
const hud = document.getElementById("hud");

// إنشاء المشهد
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("game") });
renderer.setSize(window.innerWidth, window.innerHeight);

// إضاءة
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 5);
scene.add(light);

// أرضية بسيطة
const floorGeometry = new THREE.PlaneGeometry(100, 100);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

camera.position.set(0, 2, 5);

// عند الضغط على "ابدأ"
startButton.addEventListener("click", () => {
  startButton.style.display = "none";
  loadingScreen.style.display = "flex";

  const loader = new GLTFLoader();
  loader.load(
    'assets/map.glb', // ضع هنا مسار الخريطة
    (gltf) => {
      scene.add(gltf.scene);
      loadingScreen.style.display = "none";
      hud.style.display = "block";
      startGame();
    },
    (xhr) => {
      let percent = (xhr.loaded / xhr.total) * 100;
      loadingText.innerText = `جاري التحميل... ${percent.toFixed(0)}%`;
      loadingBar.style.width = percent + "%";
    },
    (error) => {
      console.error("خطأ في تحميل الخريطة", error);
    }
  );
});

function startGame() {
  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
