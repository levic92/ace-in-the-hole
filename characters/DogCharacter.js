/**
 * @providesModule DogCharacter
 */

import { Accelerometer } from 'exponent';

const THREE = require('three');

import Material from 'Material';
import AnimatedSprite from 'AnimatedSprite';
import GameObject from 'GameObject';

export default class DogCharacter extends GameObject {
  _currentAccelerometerVal = { x: 0 };
  size = new THREE.Vector2(25, 25);
  score = 0;
  xBoundsPadding = 5;

  animations = {
    jump: false,
  };

  controlsEnabled = false;
  isFalling = true;
  gameIsEnding = false;
  gameEnded = false;

  constructor(scene, options = {}) {
    super(scene);

    const {
      incrementScore,
      onGameEnd,
    } = options;

    this.incrementScore = incrementScore;
    this.onGameEnd = onGameEnd || function() {};

    this.setup();
  }

  setup() {
    this.dogJumpMat = new Material('dog-jump');
    this.deadDogMat = new Material('dead-dog');
    // TODO: do this properly and make it actually animate
    const dog = new AnimatedSprite({
      material: this.dogJumpMat,
      data: require('../assets/sheets/dog-jump-2.json'),
      sizeX: this.size.x,
      sizeY: this.size.y,
    });

    // Add this to the scene
    dog.mesh.doubleSided = true;
    this.setMesh(dog.mesh);
    this.scene.add(this);

    this.dogSprite = dog;

    // Add a physics body to control the sprite
    this.velocityMin = new THREE.Vector2(-100, -1000);
    this.velocityMax = new THREE.Vector2(100, 1000);

    // Setup Accelerometer
    Accelerometer.setUpdateInterval(20)
    Accelerometer.addListener((e) => {
      this._currentAccelerometerVal = lowPass(e, this._currentAccelerometerVal);
    });

    this.reset();
  }

  reset() {
    this.position.set(0, -45, 0);
    this.velocity.set(0, 0);
    this.acceleration.set(0, 0);

    this.controlsEnabled = false;
    this.isFalling = true;
    this.gameIsEnding = false;
    this.gameEnded = false;

    this.dogSprite.animating = false;
    this.dogSprite.currentFrame = 0;
    this.dogSprite.updateTexture(this.dogJumpMat.getTexture());
    this.dogSprite.updateData(require('../assets/sheets/dog-jump-2.json'));
  }

  update(dt) {
    // Apply forces

    // Calculate velocity from accelerometer
    if (this.controlsEnabled) {
      const vx = this.velocity.x;
      const alpha = dt / (.3 + dt);
      const smoothedVx = (alpha * this._currentAccelerometerVal.x * 5000) + (1.0 - alpha) * vx;

      this.velocity.x = smoothedVx * dt; // smooth velocity from accelerometer

      if (smoothedVx > 30) {
        this._mesh.scale.x = 1;
      } else if (smoothedVx < -30) {
        this._mesh.scale.x = -1;
      }
    }

    // gravity
    if (this.isFalling) {
      this.applyForce(new THREE.Vector2(0, -0.1));
    } else {
      this.velocity.y = 0;
    }

    // update the game
    super.update(dt);

    // check world left/right edges
    this.checkWorldEdges();

    // check platform or bottom
    this.checkPlatforms();

    this.animatePlatforms();

    if (this.position.y > 30) {
      this.position.y = 30;
    }

    if (this.velocity.y < 0 && !this.gameIsEnding) {
      this.dogSprite.reverse = true;
      this.dogSprite.animating = true;
    }

    this.dogSprite.update(1000 * dt);
  }

  checkWorldEdges() {
    const scene = this.scene;

    const left = -(scene.width / 2) + 15;
    const right = (scene.width / 2) - 15;
    const spriteXOffset = (this.size.x / 2) - 2;
    if (this.position.x > right - spriteXOffset) {
      // this.velocity.x *= -1;
      this.position.x = right - spriteXOffset;
    }
    else if (this.position.x < left + spriteXOffset) {
      // this.velocity.x *= -1;
      this.position.x = left + spriteXOffset;
    }

    this.updateMesh();
  }

  checkPlatforms() {
    const scene = this.scene;

    if (this.velocity.y < 0 &&
        !this.gameIsEnding &&
        !this.gameEnded) {
      const platforms = this.scene.getObjectsByTag('platform');

      for (let i = 0; i < platforms.length; i++) {
        const platform = platforms[i];
        if (this.isOnPlatform(platform)) {
          // Make sure we start from the right place
          this.position.y = platform.getBoundingBox().y + this.size.y / 2;
          // Jump!
          this.jump();
          // Bounce that platform
          platform.bounce();
          return;
        }
      }
    }

    const screenBottom = -(scene.height / 2);
    const spriteYOffset = this.size.y / 2;
    if (!this.gameEnded && this.getBoundingBox().y < screenBottom) {
      if (this.gameIsEnding) {
        this.gameIsEnding = false;
        this.gameEnded = true;

        this.position.y = -100;
        this.isFalling = false;

        this.onGameEnd();
      } else {
        this.velocity.y = 5;
        this.position.y = screenBottom + spriteYOffset;
        this.gameIsEnding = true;

        this.dogSprite.animating = false;
        this.dogSprite.currentFrame = 0;
        this.dogSprite.updateTexture(this.deadDogMat.getTexture());
        this.dogSprite.updateData(require('../assets/sheets/dead-dog.json'));
      }
    }

    this.updateMesh();
  }

  jump(platform) {
    this.velocity.y = 3 + Math.abs(this.velocity.x);
    this.controlsEnabled = true;
    this.dogSprite.reverse = false;
    this.dogSprite.currentFrame = 0;
    this.dogSprite.animating = true;
  }

  jumpHigher() {
    this.velocity.y = 4.5 + Math.abs(this.velocity.x);
  }

  animatePlatforms() {
    // normal platform movement
    if (!this.gameIsEnding && !this.gameEnded) {
      if (this.position.y > 20) {
        const delta = this.position.y - 20;
        this.position.y = 20;

        const platforms = this.scene.getObjectsByTag('platform');

        for (let i = 0; i < platforms.length; i++) {
          const platform = platforms[i];
          let pos = platform.position.clone();
          pos.add(new THREE.Vector2(0, -delta));

          if (pos.y < -(this.scene.height / 2) - 2.5) {
            const [minY, maxStep] = platform.reset();

            this.scene.data = {
              minY,
              maxStep,
            }
          } else {
            if (platform.shouldBounce) {
              platform.shouldBounce = false;
              platform.velocity.y = 0;
            }
            platform.position = pos;
          }
        }

        this.incrementScore(delta);
      }
    } else if (this.gameIsEnding) {
      const platforms = this.scene.getObjectsByTag('platform');

      for (let i = 0; i < platforms.length; i++) {
        const platform = platforms[i];
        platform.velocity.y = 3.5;
        platform.applyForce(new THREE.Vector2(0, .3));
      }
    }
  }

  isOnPlatform(platform) {
    const thisBox = this.getBoundingBox();
    const platformBox = platform.getBoundingBox();

    const bottomLeft = new THREE.Vector2(thisBox.x, thisBox.y - thisBox.height);
    const bottomRight = new THREE.Vector2(thisBox.x + thisBox.width, thisBox.y - thisBox.height);

    return containsPoint(platformBox, bottomLeft) ||
      containsPoint(platformBox, bottomRight);
  }
}

function containsPoint(box, point) {
  const ix = box.x;
  const iy = box.y;
  const ax = box.x + box.width;
  const ay = box.y - box.height;

  return !(
    point.x < Math.min(ix, ax) || point.x > Math.max(ix, ax) ||
    point.y < Math.min(iy, ay) || point.y > Math.max(iy, ay)
  );
}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

function lowPass(input, output) {
  const ALPHA = 0.1;

  if (!output) {
    return { ...input };
  }
  output.x = output.x + ALPHA * (input.x - output.x);
  output.y = output.x + ALPHA * (input.x - output.x);
  output.z = output.x + ALPHA * (input.x - output.x);
  return output;
}
