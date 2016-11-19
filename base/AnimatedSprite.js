/**
 * @providesModule AnimatedSprite
 */

const THREE = require('three');

import Sprite from 'Sprite';

export default class AnimatedSprite extends Sprite {
  currentTime = 0;
  currentFrame = 0;
  tileDisplayDuration = 16*2;
  reverse = false;
  animating = false;

  constructor(options) {
    super(options);

    const {
      data,
    } = options;

    this.updateTexture(this.material.getTexture());

    this.updateData(data);

    this._updateOffset();
  }

  updateTexture(newTexture) {
    const texture = newTexture;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    this.texture = texture;
    this.mesh.material.map = texture;
    this.mesh.material.needsUpdate = true;
    // this.mesh.material.map.needsUpdate = true;
  }

  updateData(newData) {
    const data = newData;

    this.textureSize = data.meta.size.w;
    this.frames = data.frames;

    this.texture.repeat.set(
      1 / (this.textureSize / this.frames[0].frame.w),
      1 / (this.textureSize / this.frames[0].frame.h),
    );
  }

  update(milliSec) {
    this.currentTime += milliSec;

    while(this.currentTime > this.tileDisplayDuration) {
      this.currentTime -= this.tileDisplayDuration;
      if (this.reverse && this.animating) {
        this.currentFrame--;
        if (this.currentFrame < 0) {
          this.currentFrame = 0;
          this.animating = false;
        }
      } else if (!this.reverse && this.animating) {
        this.currentFrame++;
        if (this.currentFrame === this.frames.length) {
          this.currentFrame = this.frames.length - 1;
          this.animating = false;
        }
      }
      this._updateOffset();
    }

    let nextFrame = this.currentFrame + 1;
    if (nextFrame === this.frames.length) {
      nextFrame = 0;
    }
    return nextFrame;
  }

  _updateOffset() {
    const currentFrame = this.frames[this.currentFrame];

    this.texture.offset.x = currentFrame.frame.x / this.textureSize;
    this.texture.offset.y = currentFrame.frame.y / this.textureSize;
  }
}
