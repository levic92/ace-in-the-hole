/**
 * @providesModule Game
 */

import Exponent from 'exponent';
import React from 'react';
import { Alert, PanResponder, Dimensions, View, Text } from 'react-native';
import Button from 'react-native-button';

const THREE = require('three');

import THREEView from 'THREEView';
import Scene from 'Scene';
import Material from 'Material';
import Sprite from 'Sprite';
import AnimatedSprite from 'AnimatedSprite';

import DirtBorder from 'DirtBorder';
import DogCharacter from 'DogCharacter';
import JumpPlatform from 'JumpPlatform';

export default class Game extends React.Component {
  state = {
    loaded: false,
    gameOver: false,
    score: 0,
  };

  componentDidMount() {
    this.scene = new Scene();

    // Add Dirt Border
    const dirtBorder = new DirtBorder(this.scene);

    // Add Platforms
    generatePlatforms(this.scene);

    this.dogCharacter = new DogCharacter(this.scene, {
      incrementScore: this._handleScoreUpdate,
      onGameEnd: this._handleGameEnd,
    });

    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {},
      onPanResponderRelease: () => {},
      onPanResponderTerminate: () => {},
      onShouldBlockNativeResponder: () => false,
    });

    this.setState({
      loaded: true,
    });
  }

  update = (dt) => {
    this.scene.update(dt);
  }

  _handleScoreUpdate = (delta) => {
    this.setState({
      score: this.state.score + delta,
    });
  }

  _handleGameEnd = () => {
    this.setState({
      gameOver: true,
    });
  }

  _handleRestart = () => {
    resetPlatforms(this.scene);
    this.dogCharacter.reset();
    this.setState({
      gameOver: false,
      score: 0,
    });
  }

  render() {
    if (!this.state.loaded) return null;

    return (
      <View style={{ flex: 1 }}>
        <THREEView
          {...this.props}
          {...this.panResponder.panHandlers}
          scene={this.scene.getScene()}
          camera={this.scene.getCamera()}
          tick={this.update}
        />
        <GameOverlay
          score={this.state.score}
          gameOver={this.state.gameOver}
          onRestart={this._handleRestart}
        />
      </View>
    );
  }
};

class GameOverlay extends React.Component {
  render() {
    return (
      <View style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, backgroundColor: 'transparent' }}>
        <View style={{ flex: 1 }}>
          {this.props.gameOver ?
            <GameOver score={this.props.score} onRestart={this.props.onRestart} />
            :
            <Text style={{ paddingTop: 10, paddingLeft: 10, color: 'white', fontSize: 30, fontWeight: 'bold' }}>{parseInt(this.props.score)}</Text>
          }
        </View>
      </View>
    );
  }
}

class GameOver extends React.Component {
  render() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: 'white', fontSize: 30, fontWeight: 'bold' }}>
          Game Over
        </Text>
        <Text style={{ color: 'white', fontSize: 30, fontWeight: 'bold' }}>
          Score: {parseInt(this.props.score)}
        </Text>
        <Button onPress={this.props.onRestart}>
          Restart?
        </Button>
      </View>
    )
  }
}

const NUM_PLATFORMS = 30;

function generatePlatforms(scene) {
  let minY = -1;
  let maxStep = 14;

  for(let i = 0; i < NUM_PLATFORMS; i++) {
    const p = new JumpPlatform(scene);
    const [newMinY, newMaxStep] = p.reset(minY, maxStep);
    minY = newMinY;
    maxStep = newMaxStep;
  }

  scene.data = {
    minY,
    maxStep,
  }
}

function resetPlatforms(scene) {
  let minY = -1;
  let maxStep = 14;

  const platforms = scene.getObjectsByTag('platform');

  for (let i = 0; i < platforms.length; i++) {
    const p = platforms[i];
    const [newMinY, newMaxStep] = p.reset(minY, maxStep);
    minY = newMinY;
    maxStep = newMaxStep;
  }

  scene.data = {
    minY,
    maxStep,
  }
}
