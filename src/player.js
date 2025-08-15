import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';

export class Player{
  constructor(camera, controls){
    this.object = new THREE.Object3D();
    this.object.position.set(0, 1.7, 0);
    this.camera = camera;
    this.controls = controls;
    this.controls.getObject().position.copy(this.object.position);

    this.keys = {};
    addEventListener('keydown', e=> this.keys[e.code]=true);
    addEventListener('keyup', e=> this.keys[e.code]=false);

    this.speed = 6;
    this.sprintMultiplier = 1.6;
  }

  getDirection(){
    const dir = new THREE.Vector3();
    this.camera.getWorldDirection(dir);
    return dir;
  }

  update(dt){
    const forward = new THREE.Vector3();
    this.camera.getWorldDirection(forward);
    forward.y = 0; forward.normalize();

    const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0,1,0)).negate();

    let vel = new THREE.Vector3();
    if(this.keys['KeyW']) vel.add(forward);
    if(this.keys['KeyS']) vel.sub(forward);
    if(this.keys['KeyA']) vel.sub(right);
    if(this.keys['KeyD']) vel.add(right);

    const sprint = (this.keys['ShiftLeft'] || this.keys['ShiftRight']) ? this.sprintMultiplier : 1.0;
    vel.normalize().multiplyScalar(this.speed * sprint * dt);

    this.controls.moveRight(vel.x);
    this.controls.moveForward(vel.z);
    this.controls.getObject().position.y = 1.7;
  }
}
