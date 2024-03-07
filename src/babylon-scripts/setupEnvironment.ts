import * as BABYLON from '@babylonjs/core';
import { initXR } from '../babylon-scripts/initXR';

export const setupEnvironment = (scene: BABYLON.Scene, canvas: HTMLCanvasElement): void => {
  initXR(scene, canvas);
};