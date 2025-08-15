export function initWeapon(scene, camera) {
    const geometry = new THREE.BoxGeometry(0.2, 0.2, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
    weapon = new THREE.Mesh(geometry, material);
    weapon.position.set(0.3, -0.2, -1);
    camera.add(weapon);
}

export function updateWeapon(delta) {
    // يمكن إضافة نظام إطلاق هنا لاحقًا
}

let weapon;
