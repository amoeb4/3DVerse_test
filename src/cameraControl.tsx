import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import CameraControls from "@3dverse/livelink-camera-controls";
import { useCameraEntity, Viewport, Canvas } from "@3dverse/livelink-react";

const CameraControlsContext = createContext<CameraControls | null>(null);

type CameraControlsProviderProps = {
  children: ReactNode;
};

export const CameraControlsProvider = ({ children }: CameraControlsProviderProps) => {
  const { cameraEntity } = useCameraEntity();
  const [controls, setControls] = useState<CameraControls | null>(null);

  useEffect(() => {
    if (!cameraEntity) {
      console.log("Pas de cameraEntity disponible");
      return;
    }

    const domElement = Canvas;
    if (!domElement) {
      console.warn("Canvas non trouvé");
      return;
    }

    const cameraLens = (cameraEntity as any).components?.camera;

    if (!cameraLens) {
      console.warn("La caméra WebGL (lens) n'a pas été trouvée dans cameraEntity");
      return;
    }

    const newControls = new CameraControls(cameraEntity, cameralens, Viewport);

    setControls(newControls);

    return () => {
      newControls.dispose();
      setControls(null);
    };
  }, [cameraEntity]);

  return (
    <CameraControlsContext.Provider value={controls}>
      {children}
    </CameraControlsContext.Provider>
  );
};

export const useCameraControls = () => {
  return useContext(CameraControlsContext);
};
