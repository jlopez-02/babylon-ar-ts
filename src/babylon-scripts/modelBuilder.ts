import * as BABYLON from '@babylonjs/core';

export const createModel = (scene: BABYLON.Scene): BABYLON.Mesh => {
  const cubeSize = 0.1;
  return BABYLON.MeshBuilder.CreateBox("cube", { size: cubeSize }, scene);
};

export const updateModelPosition = (plane: BABYLON.IWebXRPlane, cube: BABYLON.Mesh, scene: BABYLON.Scene): void => {
  let planeMatrix = BABYLON.Matrix.FromArray(plane.transformationMatrix.m);
  
};
