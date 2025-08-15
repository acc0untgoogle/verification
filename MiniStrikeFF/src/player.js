let player, cameraRef;

export function initPlayer(scene, camera) {
    cameraRef = camera;
    const geometry = new THREE.BoxGeometry(1, 2, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00aaff });
    player = new THREE.Mesh(geometry, material);
    scene.add(player);
    player.position.y = 1;
}

export function updatePlayer(delta) {
    const speed = 5 * delta;
    if (keys['w']) player.position.z -= speed;
    if (keys['s']) player.position.z += speed;
    if (keys['a']) player.position.x -= speed;
    if (keys['d']) player.position.x += speed;

    cameraRef.position.x = player.position.x;
    cameraRef.position.z = player.position.z + 5;
    cameraRef.lookAt(player.position);
}

let keys = {};
window.addEventListener('keydown', (e) => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);
