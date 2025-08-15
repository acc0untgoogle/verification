import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.155.0/examples/jsm/loaders/GLTFLoader.js';

export class BotManager{
  constructor(scene){
    this.scene = scene;
    this.loader = new GLTFLoader();
    this.bots = [];
  }

  spawnRandom(n=5){
    for(let i=0;i<n;i++){
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.6,1.6,0.6), new THREE.MeshStandardMaterial({color:0x9c2f2f}));
      m.position.set((Math.random()*2-1)*12, 0.8, (Math.random()*2-1)*12);
      m.castShadow = true;
      m.userData = { damageable:true, health:100, hittable:true };
      this.scene.add(m);
      this.bots.push({ object:m, state:'idle' });
    }
  }

  addGLTFCharacter(url, options={}){
    this.loader.load(url, (gltf)=>{
      gltf.scene.traverse(o=>{
        o.userData.hittable = true;
      });
      gltf.scene.userData.damageable = true;
      gltf.scene.userData.health = options.health ?? 100;
      this.scene.add(gltf.scene);
      this.bots.push({ object:gltf.scene, state:'idle' });
    });
  }

  applyDamage(obj, dmg){
    obj.userData.health = (obj.userData.health ?? 100) - dmg;
    if(obj.userData.health<=0){
      obj.parent?.remove(obj);
      this.bots = this.bots.filter(b=>b.object!==obj);
    }
  }

  update(dt, playerPos){
    for(const b of this.bots){
      const pos = new THREE.Vector3();
      b.object.getWorldPosition(pos);
      const dir = new THREE.Vector3().subVectors(playerPos, pos);
      dir.y = 0; const dist = dir.length();
      if(dist>0.1){
        dir.normalize();
        b.object.position.addScaledVector(dir, 1.8*dt);
      }
    }
  }
}
