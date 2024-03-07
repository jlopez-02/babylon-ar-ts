import React from 'react';
import { useBabylonScene } from '../hooks/useBabylonScene';


const PreviewContainer: React.FC = () => {

  useBabylonScene();

  return (
    <canvas
      id="renderCanvas"
    ></canvas>
  );
};

export default PreviewContainer;