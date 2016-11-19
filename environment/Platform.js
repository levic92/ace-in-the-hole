/**
 * @providesModule JumpPlatform
 */

const THREE = require('three');

import Material from 'Material';
import Sprite from 'Sprite';
import GameObject from 'GameObject';

export default class JumpPlatform extends GameObject {
  tag = 'platform';
  size = new THREE.Vector2(15, 5);
  materials = [];

  shouldBounce = false;
  isMoving = true;

  constructor(scene) {
    super(scene);
    this.setup();
  }

  setup() {
    const platformMiddleMat = new Material('platform-middle');
    const platformRightMat = new Material('platform-right');
    const platformLeftMat = new Material('platform-left');

    this.materials = [ platformMiddleMat, platformRightMat, platformLeftMat ];

    const platformMiddleSprite = new Sprite({
      material: platformMiddleMat,
      sizeX: 5,
      sizeY: 5,
    });
    const platformRightSprite = new Sprite({
      material: platformRightMat,
      sizeX: 5,
      sizeY: 5,
    });
    const platformLeftSprite = new Sprite({
      material: platformLeftMat,
      sizeX: 5,
      sizeY: 5,
    });

    platformLeftSprite.mesh.position.set(-5, 0, 0);
    platformRightSprite.mesh.position.set(5, 0, 0);

    const platform = new THREE.Object3D();
    platform.add(platformMiddleSprite.mesh);
    platform.add(platformRightSprite.mesh);
    platform.add(platformLeftSprite.mesh);

    this.setMesh(platform);

    this.scene.add(this);
  }

  update(dt) {
    super.update(dt);

    if (this.shouldBounce) {
      // start the bounce
      if (this.velocity.y === 0) {
        this.velocity.y = -1.1;
      }

      if (this.velocity.y < 0 &&
          this.position.y < this.bounceStart - 2.5) {
        this.velocity.y *= -1;
      } else if (
        this.velocity.y > 0 &&
        this.position.y >= this.bounceStart) {
        this.velocity.y = 0;
        this.shouldBounce = false;
      }
    }

    if (this.isMoving) {
      const maxRight = (this.scene.width / 2) - 15 - 7.5;
      const maxLeft = -(this.scene.width / 2) + 15 + 7.5;
      if (this.position.x > maxRight) {
        this.position.x = maxRight;
        this.velocity.x *= -1;
      } else if (this.position.x < maxLeft) {
        this.position.x = maxLeft;
        this.velocity.x *= -1;
      }
    }
  }

  bounce() {
    this.shouldBounce = true;
    this.bounceStart = this.position.y;
  }

  reset(minY, currMaxStep) {
    const MIN_STEP = 5;
    const MAX_STEP = 23;

    const START_STEP = 14;

    if (!minY) {
      minY = this.scene.data.minY;
    }
    if (!currMaxStep) {
      currMaxStep = this.scene.data.maxStep;
    }

    let y = minY;
    if (y < 0) {
      y = START_STEP;
    } else {
      y += parseInt(random()) % (currMaxStep - MIN_STEP) + MIN_STEP;
      if (currMaxStep < MAX_STEP) {
        currMaxStep += .5;
      }
    }

    let x;
    if (y === START_STEP) {
      x = 0;
    } else {
      const min = -50 + 15 + (this.size.x / 2);
      const max = 50 - 15 - (this.size.x / 2);
      x = Math.random() * (max - min) + min;
    }

    const screenBottom = -(this.scene.height / 2);
    const platformY = screenBottom + y + (this.size.y / 2);

    this.position.x = x;
    this.position.y = platformY;
    // also reset velocity, acceleration
    this.acceleration = new THREE.Vector2(0, 0);

    this.isMoving = Math.random() > .5;

    // set initial velocity
    if (this.isMoving) {
      const maxVel = .4;
      const minVel = .05;
      const movVel = Math.random() * (maxVel - minVel) + minVel;
      this.velocity.x = random() % 2 ? movVel : -movVel;
    } else {
      this.velocity.x = 0;
    }

    this.velocity.y = 0;

    return [y + 5, currMaxStep];
  }
}

function random() {
  return Math.random() * (Math.pow(2, 31) - 1);
}
