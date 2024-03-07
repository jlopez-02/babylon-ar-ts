import { useEffect } from 'react';
import { initBabylonScene } from '../babylon-scripts/babylonInit';

export const useBabylonScene = (): void => {
  useEffect(() => {
    const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
    const { engine, scene } = initBabylonScene(canvas);

    engine.runRenderLoop(() => {
      scene.render();
    });

    window.addEventListener('resize', () => engine.resize());

    return () => {
      engine.dispose();
    };
  }, []);
};