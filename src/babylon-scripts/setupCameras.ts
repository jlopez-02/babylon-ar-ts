import * as BABYLON from '@babylonjs/core';

export const setupCameras = (scene: BABYLON.Scene, canvas: HTMLCanvasElement): void => {
  const camera = new BABYLON.ArcRotateCamera("camera1", Math.PI / 2, Math.PI / 4, 50, BABYLON.Vector3.Zero(), scene);
  camera.attachControl(canvas, true);
};