import React, { useEffect } from "react";
import earcut from 'earcut';
import * as BABYLON from '@babylonjs/core';
import { IWebXRPlane, Mesh, StandardMaterial, WebXRPlaneDetector } from "@babylonjs/core";


const PreviewContainer2 = () => {
    interface IWebXRPlaneWithMesh extends IWebXRPlane {
        mesh?: Mesh;
    }

  window.earcut = earcut;

  useEffect(() => {
    const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
    let engine = new BABYLON.Engine(canvas, true, {
        preserveDrawingBuffer: true,
        stencil: true,
        disableWebGL2Support: false,
      });
    let scene = new BABYLON.Scene(engine);
    let xr = null;
    const createDefaultEngine = () =>
      new BABYLON.Engine(canvas, true, {
        preserveDrawingBuffer: true,
        stencil: true,
        disableWebGL2Support: false,
      });

    const startRenderLoop = (engine: BABYLON.Engine, scene: BABYLON.Scene) => {
      engine.runRenderLoop(() => {
        if (scene && scene.activeCamera) {
          scene.render();
        }
      });
    };

    const createScene = async () => {
      scene = new BABYLON.Scene(engine);
      const camera = new BABYLON.ArcRotateCamera(
        "camera1",
        Math.PI / 2,
        Math.PI / 4,
        50,
        BABYLON.Vector3.Zero(),
        scene
      );
      camera.attachControl(canvas, true);

      const light = new BABYLON.HemisphericLight(
        "light1",
        new BABYLON.Vector3(0, 1, 0),
        scene
      );
      light.intensity = 0.7;

      return scene;
    };

    const planeTypesDetected = {
      horizontal: false,
      vertical: false,
    };
    const checkPlanesDetected = () => {
      return planeTypesDetected.horizontal && planeTypesDetected.vertical;
    };

    const initFunction = async () => {
      engine = await createDefaultEngine();
      if (!engine) throw "Engine should not be null.";
      scene = await createScene();
      startRenderLoop(engine, scene);

      const xr = await scene.createDefaultXRExperienceAsync({
        uiOptions: {
          sessionMode: "immersive-ar",
          referenceSpaceType: "local",
        },
        optionalFeatures: true,
      });

      // Asegúrate de que la detección de planos está habilitada
      const xrFeatureName = BABYLON.WebXRFeatureName.PLANE_DETECTION;
      const xrPlanes = xr.baseExperience.featuresManager.enableFeature(
        xrFeatureName,
        "latest",
        {
          enable: true,
        }
      ) as WebXRPlaneDetector;
      let cubeSize = 0.1; // Definir el tamaño del cubo
      let cube = BABYLON.MeshBuilder.CreateBox(
        "cube",
        { size: cubeSize },
        scene
      );

      const planes: Mesh[] = [];
      let conV = 0;
      let conH = 0;
      let position = new BABYLON.Vector3();
      let normal = new BABYLON.Vector3();
      let floorNormal = null;
      let wallNormal = new BABYLON.Vector3();
      // Manejar eventos cuando se agregan nuevos planos
      xrPlanes.onPlaneAddedObservable.add((plane: IWebXRPlaneWithMesh) => {
        console.log(plane);
        console.log(plane.transformationMatrix.m);
        let planeMatrix = BABYLON.Matrix.FromArray(plane.transformationMatrix.m);

        console.log("PlaneMatrix: ");
        console.log(planeMatrix);

        normal = new BABYLON.Vector3(
          planeMatrix.m[8],
          planeMatrix.m[9],
          planeMatrix.m[10]
        );

        normal.normalize();
        

        let transformationMatrix = plane.transformationMatrix.m;
        if (
          transformationMatrix instanceof Float32Array &&
          transformationMatrix.length === 16
        ) {
          // Convertir la matriz de transformación de Float32Array a una matriz de Babylon.js
          let babylonMatrix = BABYLON.Matrix.FromArray(transformationMatrix);

          // Utilizar la matriz para extraer la posición
          position = BABYLON.Vector3.TransformCoordinates(
            BABYLON.Vector3.Zero(),
            babylonMatrix
          );

          //alignWithWall = BABYLON.Vector3.RotationFromAxis(BABYLON.Vector3.Zero(), BABYLON.Axis.Y, normal);
        } else {
          console.error(
            "La matriz de transformación no está en el formato correcto."
          );
        }

        if (plane.polygonDefinition.length >= 0) {
          const isVertical = plane.xrPlane.orientation.match("Vertical"); // Umbral para horizontalidad
          if (!isVertical) {
            if (conH < 1) {
              floorNormal = normal;
              console.log(floorNormal);
              planeTypesDetected.horizontal = true;
              cube.position.y = position.y + cubeSize / 2;

              conH++;
            }

            console.log("Plano HORIZONTAL detectado");
          } else {
            planeTypesDetected.vertical = true;

            if (conV < 1) {
              console.log(wallNormal);
              cube.position.x = position.x - cubeSize / 2;
              cube.position.z = position.z - cubeSize / 2;

              const planeMatrix = BABYLON.Matrix.FromArray(plane.transformationMatrix.m);
              const planeNormal = new BABYLON.Vector3(planeMatrix.m[8], planeMatrix.m[9], planeMatrix.m[10]);
              planeNormal.normalize();

              let angle = Math.atan2(planeNormal.x, planeNormal.z);
              cube.rotation.y = angle + Math.PI / 2;

              conV++;
            }

            console.log("Plano VERTICAL detectado");
          }

          if (checkPlanesDetected() && conV === 1) {
          }
        }

        plane.polygonDefinition.push(plane.polygonDefinition[0]);
        var polygon_triangulation = new BABYLON.PolygonMeshBuilder(
          "name",
          plane.polygonDefinition.map((p) => new BABYLON.Vector2(p.x, p.z)),
          scene,
          earcut
        );
        var polygon = polygon_triangulation.build(false, 0.01);
        plane.mesh = polygon;
        planes[plane.id] = plane.mesh;
        const mat = new BABYLON.StandardMaterial("mat", scene);
        mat.alpha = 0.5;
        // pick a random color
        mat.diffuseColor = BABYLON.Color3.Random();
        polygon.createNormals(false);
        plane.mesh.material = mat;

        plane.mesh.rotationQuaternion = new BABYLON.Quaternion();
        plane.transformationMatrix.decompose(
          plane.mesh.scaling,
          plane.mesh.rotationQuaternion,
          plane.mesh.position
        );
      });

      xrPlanes.onPlaneUpdatedObservable.add((plane: IWebXRPlaneWithMesh) => {
        let mat;
        mat = new StandardMaterial("mat", scene);
        if (plane.mesh) {
          // keep the material, dispose the old polygon
          mat = plane.mesh.material;
          plane.mesh.dispose(false, false);
        }
        const some = plane.polygonDefinition.some((p) => !p);
        if (some) {
          return;
        }
        plane.polygonDefinition.push(plane.polygonDefinition[0]);
        var polygon_triangulation = new BABYLON.PolygonMeshBuilder(
          "name",
          plane.polygonDefinition.map((p) => new BABYLON.Vector2(p.x, p.z)),
          scene,
          earcut
        );
        var polygon = polygon_triangulation.build(false, 0.01);
        polygon.createNormals(false);
        plane.mesh = polygon;
        planes[plane.id] = plane.mesh;
        plane.mesh.material = mat;
        plane.mesh.rotationQuaternion = new BABYLON.Quaternion();
        plane.transformationMatrix.decompose(
          plane.mesh.scaling,
          plane.mesh.rotationQuaternion,
          plane.mesh.position
        );
        console.log("==================================================");
      });

      xrPlanes.onPlaneRemovedObservable.add((plane) => {
        if (plane && planes[plane.id]) {
          planes[plane.id].dispose();
        }
      });

      xr.baseExperience.sessionManager.onXRSessionInit.add(() => {
        planes.forEach((plane) => plane.dispose());
        while (planes.pop()) {}
      });
    };
    initFunction();
    window.addEventListener("resize", () => engine.resize());
  }, []);

  return (
    <canvas
      id="renderCanvas"
      style={{ width: "100%", height: "100%" }}
    ></canvas>
  );
};

export default PreviewContainer2;