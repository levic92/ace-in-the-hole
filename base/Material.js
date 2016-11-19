/**
 * @providesModule Material
 */

import THREEView from 'THREEView';

const THREE = require('three');

import Assets from 'Assets';

const materialRegistry = {};

export default class Material {
  _texture: null;
  _material: null;

  constructor(assetName) {
    if (materialRegistry[assetName]) {
      console.log('loading material from registry');
      this._texture = materialRegistry[assetName].texture;
      this._material = materialRegistry[assetName].material;
      return;
    }

    const texture = THREEView.textureFromAsset(Assets[assetName]);
    texture.minFilter = texture.magFilter = THREE.NearestFilter;
    texture.needsUpdate = true;

    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,  // Use the image's alpha channel for alpha.
    });

    material.side = THREE.DoubleSide;

    this._texture = texture;
    this._material = material;

    materialRegistry[assetName] = {
      texture,
      material,
    };
  }

  getTexture() {
    return this._texture;
  }

  getMaterial() {
    return this._material;
  }
}
