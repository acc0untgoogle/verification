export function initMap(scene) {
    const geometry = new THREE.PlaneGeometry(50, 50);
    const material = new THREE.MeshBasicMaterial({ color: 0x228B22, side: THREE.DoubleSide });
    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = Math.PI / 2;
    scene.add(plane);
}
