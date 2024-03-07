import * as BABYLON from '@babylonjs/core';
import { setupCameras } from '../babylon-scripts/setupCameras';
import { setupLights } from '../babylon-scripts/setupLights';
import { setupEnvironment } from '../babylon-scripts/setupEnvironment';

export const createScene = (engine: BABYLON.Engine, canvas: HTMLCanvasElement): BABYLON.Scene => {
  const scene = new BABYLON.Scene(engine);
  setupCameras(scene, canvas);
  setupLights(scene);
  setupEnvironment(scene, canvas);

  return scene;
};