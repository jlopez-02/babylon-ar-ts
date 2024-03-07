import * as BABYLON from '@babylonjs/core';
import { setupPlanesDetection } from "../babylon-scripts/setupPlanesDetection";

export const initXR = async (scene: BABYLON.Scene, canvas: HTMLCanvasElement): Promise<void> => {
  try {
    const xr = await scene.createDefaultXRExperienceAsync({
      uiOptions: {
        sessionMode: "immersive-ar",
        referenceSpaceType: "local",
      },
      optionalFeatures: true,
    });

    setupPlanesDetection(scene, xr);

  } catch (error) {
    console.error("Error al inicializar XR:", error);
  }
};
