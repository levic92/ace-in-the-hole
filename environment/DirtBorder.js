/**
 * @providesModule DirtBorder
 */

const THREE = require('three');

import Material from 'Material';
import Sprite from 'Sprite';
import GameObject from 'GameObject';

export default class DirtBorder extends GameObject {
  constructor(scene) {
    super(scene);
    this.setup();
  }

  setup() {
    const dirtBorderLeftMat = new Material('dirt-left');
    const dirtBorderRightMat = new Material('dirt-right');
    const dirtMat = new Material('dirt');

    const scene = this.scene;
    const spriteSize = sizeX = sizeY = 7.5;

    const dirtObj = new THREE.Object3D();

    for (let y = 0; y < scene.height; y += spriteSize) {
      const dirtSpriteLeft = new Sprite({ material: dirtMat, sizeX, sizeY });
      const dirtSpriteLeftBorder = new Sprite({ material: dirtBorderRightMat, sizeX, sizeY });
      const dirtSpriteRight = new Sprite({ material: dirtMat, sizeX, sizeY });
      const dirtSpriteRightBorder = new Sprite({ material: dirtBorderLeftMat, sizeX, sizeY });

      dirtSpriteLeft.mesh.position.set(
        -(scene.width / 2 - spriteSize / 2),
        (scene.height / 2 - spriteSize / 2) - y,
        0,
      );

      dirtSpriteLeftBorder.mesh.position.set(
        -(scene.width / 2 - spriteSize / 2) + spriteSize,
        (scene.height / 2 - spriteSize / 2) - y,
        0,
      );

      dirtSpriteRight.mesh.position.set(
        (scene.width / 2 - spriteSize / 2),
        (scene.height / 2 - spriteSize / 2) - y,
        0,
      );
      dirtSpriteRight.mesh.rotation.z = Math.PI;

      dirtSpriteRightBorder.mesh.position.set(
        (scene.width / 2 - spriteSize / 2) - spriteSize,
        (scene.height / 2 - spriteSize / 2) - y,
        0,
      );

      dirtObj.add(dirtSpriteLeft.mesh);
      dirtObj.add(dirtSpriteLeftBorder.mesh);
      dirtObj.add(dirtSpriteRight.mesh);
      dirtObj.add(dirtSpriteRightBorder.mesh);
    }

    this.setMesh(dirtObj);
    scene.add(this);
  }

  update() {

  }
}
