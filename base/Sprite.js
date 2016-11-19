/**
 * @providesModule Sprite
 */

const THREE = require('three');

export default class Sprite {
  geometry = null;
  material = null;
  mesh = null;
  size = null;

  constructor({ material, sizeX = 10, sizeY = 10 }) {
    const geometry = new THREE.PlaneBufferGeometry(sizeX, sizeY);
    const mesh = new THREE.Mesh(geometry, material.getMaterial());

    this.size = new THREE.Vector2(sizeX, sizeY);
    this.geometry = geometry;
    this.material = material;
    this.mesh = mesh;
  }
}
