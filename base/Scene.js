/**
 * @providesModule Scene
 */

const THREE = require('three');

import _ from 'lodash';
import { Dimensions } from 'react-native';

export default class Scene {
  _scene = null;
  _gameObjects = [];

  constructor() {
    const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

    const width = 100;
    this.width = width;
    const height = (screenHeight / screenWidth) * width;
    this.height = height;

    const camera = new THREE.OrthographicCamera(
      width / - 2,
      width / 2,
      height / 2,
      height / - 2,
      1, 10000,
    );

    camera.position.z = 1000;

    this._scene = new THREE.Scene();
    this._camera = camera;
  }

  add(gameObj) {
    this._gameObjects.push(gameObj);
    gameObj.getMeshes().forEach(mesh => {
      this._scene.add(mesh);
    })
  }

  getObjectsByTag(tag) {
    return _.filter(this._gameObjects, obj => obj.tag === tag);
  }

  getObject(pred) {
    return _.find(this._gameObjects, pred);
  }

  update(dt) {
    this._gameObjects.forEach(obj => obj.update(dt));
  }

  getScene() {
    return this._scene;
  }

  getCamera() {
    return this._camera;
  }
}
