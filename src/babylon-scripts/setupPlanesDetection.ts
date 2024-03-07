import * as BABYLON from '@babylonjs/core';
import { createModel, updateModelPosition } from '../babylon-scripts/modelBuilder';

export const setupPlanesDetection = (scene: BABYLON.Scene, xr: BABYLON.WebXRDefaultExperience): void => {
  

  try {
    const xrFeatureName = BABYLON.WebXRFeatureName.PLANE_DETECTION;
    const xrPlanes = xr.baseExperience.featuresManager.enableFeature(
        xrFeatureName,
        "latest",
        { enable: true }
    ) as BABYLON.WebXRPlaneDetector;

    isPlaneDetectionActive(scene, xrPlanes);

    } catch (error) {
        console.error("Error al habilitar la detección de planos:", error);
    }

};

const isPlaneDetectionActive = (scene: BABYLON.Scene, xrPlanes: BABYLON.WebXRPlaneDetector): void => {
    let model = createModel(scene);
    xrPlanes.onPlaneAddedObservable.add((plane) => {
        updateModelPosition(plane, model, scene);
    });

    xrPlanes.onPlaneUpdatedObservable.add((plane) => {
        
    });

    xrPlanes.onPlaneRemovedObservable.add((plane) => {

    });
}