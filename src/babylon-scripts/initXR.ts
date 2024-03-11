import * as BABYLON from '@babylonjs/core';
//import { setupPlanesDetection } from "../babylon-scripts/setupPlanesDetection";
import { XrExperienceWithPlaneDetection } from './planeDetection';

// type SessionModes = "immersive-ar" | "immersive-vr" | "inline";
// type ReferenceSpaceType = "local-floor" | "bounded-floor" | "unbounded" | "local" | "viewer";

export const initXR = async (scene: BABYLON.Scene, canvas: HTMLCanvasElement): Promise<void> => {
  try {
    const xr = await scene.createDefaultXRExperienceAsync({
      uiOptions: {
        sessionMode: "immersive-ar",
        referenceSpaceType: "local",
      },
      optionalFeatures: true,
    });

    const xrPlaneDetection = new XrExperienceWithPlaneDetection({scene: scene, xr: xr});

    xrPlaneDetection.addFeaturesToSession();
    xrPlaneDetection.createPlaneMeshesFromXrPlane();

  } catch (error) {
    console.error("Error al inicializar XR:", error);
  }
};
