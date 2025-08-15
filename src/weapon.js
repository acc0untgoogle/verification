import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.155.0/examples/jsm/loaders/GLTFLoader.js';

export class Weapon{
  constructor(camera, onAmmoChange){
    this.camera = camera;
    this.onAmmoChange = onAmmoChange || (()=>{});

    this.fireRate = 10;
    this.clipSize = 30;
    this.reserveAmmo = 120;
    this.reloadTime = 1.7;
    this.damage = 25;
    this.recoil = 0.012;
    this.adsFov = 55;
    this.hipFov = 75;

    this.canShoot = true;
    this.cooldown = 0;
    this.clip = this.clipSize;
    this.isReloading = false;
    this.isADS = false;
    this.muzzle = null;

    this.loader = new GLTFLoader();

    this.mouse = { left:false, right:false };
    addEventListener('mousedown', e=>{
      if(e.button===0) this.mouse.left = true;
      if(e.button===2){ this.mouse.right = true; this.setADS(true); }
    });
    addEventListener('mouseup', e=>{
      if(e.button===0) this.mouse.left = false;
      if(e.button===2){ this.mouse.right = false; this.setADS(false); }
    });
    addEventListener('keydown', e=>{
      if(e.code==='KeyR') this.reload();
      if(e.code==='KeyG') this.flash();
    });
  }

  attach(scene){
    this.group = new THREE.Group();
    this.camera.add(this.group);
    this.group.position.set(0.28, -0.22, -0.6);

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.2,0.12,0.6), new THREE.MeshStandardMaterial({color:0x222222, metalness:.5, roughness:.5}));
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.025,0.025,0.45,12), new THREE.MeshStandardMaterial({color:0x555555, metalness:.8, roughness:.3}));
    barrel.rotation.z = Math.PI/2;
    barrel.position.set(0,0,-0.45);
    this.muzzle = new THREE.Object3D();
    this.muzzle.position.set(0,0,-0.8);
    this.group.add(body);
    this.group.add(barrel);
    this.group.add(this.muzzle);

    this.onAmmoChange(this.clip, this.reserveAmmo);
  }

  loadModel(url){
    this.loader.load(url, (gltf)=>{
      this.group.clear();
      this.group.add(gltf.scene);
      this.muzzle = new THREE.Object3D();
      this.muzzle.position.set(0,0,-0.8);
      this.group.add(this.muzzle);
    });
  }

  setADS(state){
    this.isADS = state;
    this.camera.fov = state ? this.adsFov : this.hipFov;
    this.camera.updateProjectionMatrix();
    if(this.group){
      this.group.position.set(state?0.02:0.28, state?-0.12:-0.22, state?-0.4:-0.6);
      this.group.rotation.set(state?0:-0.05, state?0:-0.2, 0);
    }
  }

  shoot(direction, onHit){
    if(this.isReloading || this.clip<=0) return;
    this.clip--;
    this.onAmmoChange(this.clip, this.reserveAmmo);

    if(this.muzzle){
      const flash = new THREE.Mesh(new THREE.ConeGeometry(0.06,0.15,8), new THREE.MeshBasicMaterial({color:0xffee88}));
      flash.rotation.x = Math.PI/2;
      flash.position.copy(this.muzzle.getWorldPosition(new THREE.Vector3()));
      flash.quaternion.copy(this.camera.quaternion);
      this.camera.parent?.add?.(flash) || this.camera.add(flash);
      setTimeout(()=> flash.removeFromParent(), 40);
    }

    this.camera.rotation.x -= this.recoil * (this.isADS?0.6:1.0);

    const origin = this.camera.getWorldPosition(new THREE.Vector3());
    const dir = direction.clone();
    if(onHit) onHit(origin, dir);
  }

  reload(){
    if(this.isReloading) return;
    if(this.clip===this.clipSize) return;
    if(this.reserveAmmo<=0) return;
    this.isReloading = true;
    setTimeout(()=>{
      const need = this.clipSize - this.clip;
      const take = Math.min(need, this.reserveAmmo);
      this.clip += take;
      this.reserveAmmo -= take;
      this.isReloading = false;
      this.onAmmoChange(this.clip, this.reserveAmmo);
    }, this.reloadTime*1000);
  }

  flash(){
    const el = document.createElement('div');
    el.style.position='fixed'; el.style.inset='0'; el.style.background='#fff';
    el.style.opacity='0.9'; el.style.pointerEvents='none';
    document.body.appendChild(el);
    setTimeout(()=> el.remove(), 120);
  }

  update(dt, dir, onHit){
    const interval = 1/this.fireRate;
    this.cooldown -= dt;
    if(this.mouse.left && this.cooldown<=0){
      this.cooldown = interval;
      this.shoot(dir, onHit);
    }
  }
}
