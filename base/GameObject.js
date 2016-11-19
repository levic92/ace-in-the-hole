/**
 * @providesModule GameObject
 */

const THREE = require('three');

export default class GameObject {
  scene = null;
  tag = null;
  _mesh = null;
  _helperMesh = null;

  xBoundsPadding = 0;
  yBoundsPadding = 0;

  // Vectors
  position = new THREE.Vector2(0, 0);
  velocity = new THREE.Vector2(0, 0);
  acceleration = new THREE.Vector2(0, 0);
  velocityMin = new THREE.Vector2(-1000, -1000);
  velocityMax = new THREE.Vector2(1000, 1000);

  // Mass
  mass = 1;

  constructor(scene) {
    this.scene = scene;
  }

  applyForce(force) {
    const forceVector = force.divideScalar(this.mass);
    this.acceleration = this.acceleration.add(forceVector);
  }

  applyGravity(y) {
    const gravity = new THREE.Vector2(0, y * this.mass);
    this.applyForce(gravity);
  }

  update(dt) {
    // update velocity based on acceleration
    this.velocity = this.velocity.add(
      this.acceleration
    );

    this.velocity.clamp(this.velocityMin, this.velocityMax);

    // calculate location
    this.position = this.position.add(
      this.velocity
    );

    // update the sprites position
    this.updateMesh();

    if (this._mesh && this._helperMesh) {
      this._helperMesh.update(this._mesh);
    }

    // clear accleration
    this.acceleration = this.acceleration.multiplyScalar(0);
  }

  // Getters/setters

  getMeshes() {
    return [
      this._mesh,
      // this._helperMesh,
    ];
  }

  setMesh(mesh) {
    this._mesh = mesh;
    this._helperMesh = new THREE.BoxHelper(this._mesh);
  }

  updateMesh() {
    this._mesh.position.set(
      this.position.x,
      this.position.y,
      0,
    );

    if (this._helperMesh) {
      this._helperMesh.update(this._mesh);
    }
  }

  getBoundingBox() {
    const mesh = this._mesh;
    const box = new THREE.Box3();
    box.setFromObject(mesh);
    const width = box.max.x - box.min.x;
    const height = box.max.y - box.min.y;
    // console.log(this.xBoundsPadding);
    return {
      width: width - (this.xBoundsPadding * 2),
      height: height - (this.yBoundsPadding * 2),
      x: this.position.x - (width / 2) + this.xBoundsPadding,
      y: this.position.y + (height / 2) + this.yBoundsPadding,
    };
  }
}
