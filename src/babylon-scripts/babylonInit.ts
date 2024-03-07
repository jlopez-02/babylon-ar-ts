import * as BABYLON from '@babylonjs/core';
import earcut from 'earcut';
import { createScene } from '../babylon-scripts/createScene';

export const initBabylonScene = (canvas: HTMLCanvasElement) => {
  window.earcut = earcut;

  const engine = new BABYLON.Engine(canvas, true, {
    preserveDrawingBuffer: true,
    stencil: true,
    disableWebGL2Support: false,
  });

  const scene = createScene(engine, canvas);

  return { engine, scene };
};