import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';

export function tryLoadMap(loader, scene, url){
  return new Promise((resolve,reject)=>{
    if(!url){ reject(); return; }
    loader.load(url, (gltf)=>{
      gltf.scene.traverse(o=>{ o.castShadow = true; o.receiveShadow = true; o.userData.hittable = true; });
      scene.add(gltf.scene);
      resolve();
    }, undefined, reject);
  });
}

export function createBasicMap(scene){
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(80,80),
    new THREE.MeshStandardMaterial({color:0x2b4c2b, roughness:.9})
  );
  ground.rotation.x = -Math.PI/2;
  ground.receiveShadow = true;
  ground.userData.hittable = true;
  scene.add(ground);

  const boxMat = new THREE.MeshStandardMaterial({color:0x507a8a, metalness:.1, roughness:.8});
  for(let i=0;i<12;i++){
    const box = new THREE.Mesh(new THREE.BoxGeometry(1+Math.random()*3, 1+Math.random()*2, 1+Math.random()*3), boxMat);
    box.position.set((Math.random()*2-1)*30, box.geometry.parameters.height/2, (Math.random()*2-1)*30);
    box.castShadow = true; box.receiveShadow = true;
    box.userData.hittable = true;
    scene.add(box);
  }
}
