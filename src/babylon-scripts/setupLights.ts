import * as BABYLON from '@babylonjs/core';

export const setupLights = (scene: BABYLON.Scene): void => {
  const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 1, 0), scene);
  light.intensity = 0.7;
};