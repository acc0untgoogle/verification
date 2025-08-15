let bots = [];

export function initBots(scene) {
    for (let i = 0; i < 5; i++) {
        const geometry = new THREE.BoxGeometry(1, 2, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const bot = new THREE.Mesh(geometry, material);
        bot.position.set(Math.random() * 20 - 10, 1, Math.random() * 20 - 10);
        scene.add(bot);
        bots.push(bot);
    }
}

export function updateBots(delta) {
    bots.forEach(bot => {
        bot.position.z += Math.sin(Date.now() * 0.001) * delta;
    });
}
