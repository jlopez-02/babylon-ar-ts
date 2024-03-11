import {
    Engine,
    Scene,
    WebXRDefaultExperience,
    Mesh,
    WebXRFeatureName,
    WebXRFeaturesManager,
    StandardMaterial,
    Color3,
    WebXRPlaneDetector,
    IWebXRPlane,
    Nullable,
    PolygonMeshBuilder,
    Quaternion,
    Vector2,
} from '@babylonjs/core';
import * as BABYLON from '@babylonjs/core';
import { createModel } from './modelBuilder';


type classArguments = {
    scene: BABYLON.Scene,
    xr: BABYLON.WebXRDefaultExperience
}

interface IWebXRPlaneWithMesh extends IWebXRPlane {
    mesh?: Mesh;
}

export class XrExperienceWithPlaneDetection {
    _scene: Scene;
    _xr: WebXRDefaultExperience;
    _fm: WebXRFeaturesManager | null;
    _xrPlanes: WebXRPlaneDetector | null;
    _planes: Mesh[] = [];

    constructor(args: classArguments) {
        if (!Engine.isSupported()) {
            throw 'WebGL not supported';
        }
        this._scene = args.scene;
        this._xr = args.xr;
        this._fm = null;
        this._xrPlanes = null;
        this._planes = [];

    }


    addFeaturesToSession() {
        if (this._xr === null) {
            return;
        }
        this._fm = this._xr.baseExperience.featuresManager;

        try {
            this._xrPlanes = this._fm.enableFeature(WebXRFeatureName.PLANE_DETECTION, "latest") as WebXRPlaneDetector;
            console.log("Detección de planos activa");
            
        } catch (error) {
            console.error(error);
        }
    }

    createPlaneMeshesFromXrPlane(): void {
       
        let mat: Nullable<StandardMaterial>;

        if (this._xrPlanes === null) {
            return;
        }

        let model = createModel(this._scene);
        model.scaling._x = model.scaling._x * 2;

        let normal = new BABYLON.Vector3();
        let position = new BABYLON.Vector3();
        let floorNormal = new BABYLON.Vector3();
        let wallNormal = new BABYLON.Vector3();
        let conH = 0;
        let conV = 0;
        let cubeSize = 0.1;

        this._xrPlanes.onPlaneAddedObservable.add((plane: IWebXRPlaneWithMesh) => {
            mat = new StandardMaterial("mat", this._scene);
            mat.alpha = 0.35;
            mat.diffuseColor = Color3.Random();
            this.initPolygon(plane, mat);
            
            let transformationMatrix = plane.transformationMatrix.m;
            let planeMatrix = BABYLON.Matrix.FromArray(transformationMatrix);

            console.log("PlaneMatrix:");
            console.log(planeMatrix);

            normal = new BABYLON.Vector3(
                planeMatrix.m[8],
                planeMatrix.m[9],
                planeMatrix.m[10]
            );

            normal.normalize();

            position = BABYLON.Vector3.TransformCoordinates(
                BABYLON.Vector3.Zero(),
                planeMatrix
            );

            if(plane.xrPlane.orientation.match("Horizontal")){
                console.log("Horizontal plane");

                if (conH < 1) {
                    floorNormal = normal;
                    console.log(floorNormal);
                    model.position.y = position.y + cubeSize / 2;
      
                    conH++;
                }
                
            }else if(plane.xrPlane.orientation.match("Vertical")){
                console.log("Vertical plane");

                if (conV < 1) {
                    console.log(wallNormal);
                    model.position.x = position.x - cubeSize / 2;
                    model.position.z = position.z - cubeSize / 2;
      
                    const planeMatrix = BABYLON.Matrix.FromArray(transformationMatrix);
                    const planeNormal = new BABYLON.Vector3(planeMatrix.m[8], planeMatrix.m[9], planeMatrix.m[10]);
                    planeNormal.normalize();
      
                    let angle = Math.atan2(planeNormal.x, planeNormal.z);
                    model.rotation.y = angle + Math.PI / 2;
      
                    conV++;
                }
            }
            console.log("====================================================");
        });

        this._xrPlanes.onPlaneUpdatedObservable.add((plane: IWebXRPlaneWithMesh) => {
            if (this._planes[plane.id].material) {
                mat = this._planes[plane.id].material as StandardMaterial;
                this._planes[plane.id].dispose(false, false);
            }
            const some = plane.polygonDefinition.some(p => !p);
            if (some) {
                return;
            }
            this.initPolygon(plane, mat!);
        });

        this._xrPlanes.onPlaneRemovedObservable.add((plane: IWebXRPlaneWithMesh) => {
            if (plane && this._planes[plane.id]) {
                this._planes[plane.id].dispose()
            }
        })

        if (this._xr !== null) {
            this._xr.baseExperience.sessionManager.onXRSessionInit.add(() => {
                this._planes.forEach((plane: Mesh) => plane.dispose());
                while (this._planes.pop());
            });
        }
    }

    initPolygon(plane: IWebXRPlaneWithMesh, mat?: StandardMaterial): Mesh {
        plane.polygonDefinition.push(plane.polygonDefinition[0]);
        const polygonTriangulation = new PolygonMeshBuilder(plane.xrPlane.orientation, plane.polygonDefinition.map((p) => new Vector2(p.x, p.z)), this._scene);
        const polygon = polygonTriangulation.build(false, 0.01);

        polygon.createNormals(false);

        plane.mesh = polygon;

        if (mat) {
            polygon.material = mat;
        }

        plane.mesh.rotationQuaternion = new Quaternion();
        plane.mesh.checkCollisions = true;
        plane.mesh.receiveShadows = true;

        //plane.transformationMatrix.decompose(polygon.scaling, polygon.rotationQuaternion, polygon.position);
        plane.transformationMatrix.decompose(plane.mesh.scaling, plane.mesh.rotationQuaternion, plane.mesh.position);
        this._planes[plane.id] = (polygon);

        return polygon;
    }
}

