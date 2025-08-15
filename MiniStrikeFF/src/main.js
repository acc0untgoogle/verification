import { initPlayer, updatePlayer } from './player.js';
import { initWeapon, updateWeapon } from './weapon.js';
import { initBots, updateBots } from './bots.js';
import { initMap } from './map.js';

let scene, camera, renderer;
let clock;

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gameCanvas') });
    renderer.setSize(window.innerWidth, window.innerHeight);
    clock = new THREE.Clock();

    initMap(scene);
    initPlayer(scene, camera);
    initWeapon(scene, camera);
    initBots(scene);

    camera.position.set(0, 2, 5);
    animate();
}

function animate() {
    requestAnimationFrame(animate);
    let delta = clock.getDelta();
    updatePlayer(delta);
    updateWeapon(delta);
    updateBots(delta);
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

init();
