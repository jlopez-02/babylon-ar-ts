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
            console.log(error);
        }
    }

    createPlaneMeshesFromXrPlane(): void {
        interface IWebXRPlaneWithMesh extends IWebXRPlane {
            mesh?: Mesh;
        }

        let mat: Nullable<StandardMaterial>;

        if (this._xrPlanes === null) {
            return;
        }

        let model = createModel(this._scene);

        this._xrPlanes.onPlaneAddedObservable.add((plane: IWebXRPlaneWithMesh) => {
            mat = new StandardMaterial("mat", this._scene);
            mat.alpha = 0.35;
            mat.diffuseColor = Color3.Random();
            this.initPolygon(plane, mat);
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

    initPolygon(plane: IWebXRPlane, mat?: StandardMaterial): Mesh {
        plane.polygonDefinition.push(plane.polygonDefinition[0]);
        const polygonTriangulation = new PolygonMeshBuilder(plane.xrPlane.orientation, plane.polygonDefinition.map((p) => new Vector2(p.x, p.z)), this._scene);
        const polygon = polygonTriangulation.build(false, 0.01);

        polygon.createNormals(false);

        if (mat) {
            polygon.material = mat;
        }

        polygon.rotationQuaternion = new Quaternion();
        polygon.checkCollisions = true;
        polygon.receiveShadows = true;

        plane.transformationMatrix.decompose(polygon.scaling, polygon.rotationQuaternion, polygon.position);

        this._planes[plane.id] = (polygon);

        return polygon;
    }
}

