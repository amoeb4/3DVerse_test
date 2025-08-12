import { useState, useContext, useRef } from "react";
import { Livelink, Canvas, Viewport, CameraController, useCameraEntity, LivelinkContext, DefaultCameraController } from "@3dverse/livelink-react";
import { useEffect } from "react";
import { CameraControllerPresets } from "@3dverse/livelink";
import { LoadingOverlay } from "@3dverse/livelink-react-ui";
import KeyboardHandler from "./keyBindings.tsx";
import CameraEventListener from "./CameraEventListener.jsx";
import ControlPanel, { SpeedProvider, EntityProvider } from "./Interface.jsx";
import { CameraEntityContext } from "./cameraControl.tsx";
import { WebSocketProvider } from "./webSockets.tsx";
import { PartEntitiesProvider } from "./partEntitiesContext.tsx";
import Dtext from "../frontend/text_display.tsx";
import type { CSSProperties } from "react";
import "./App.css";

export function App() {
  const [credentials, setCredentials] = useState<{ sceneId: string } | null>(null);

  return (
    <>
      {!credentials ? (
        <StartupModal onSubmit={setCredentials} />
      ) : (
        <Livelink isTransient={false} sceneId={credentials.sceneId} token="public_ml59vXKlgs9fTJlx" LoadingPanel={LoadingOverlay}>
          <EntityProvider>
            <PartEntitiesProvider>
              <SpeedProvider>
                <WebSocketProvider>
                  <KeyboardHandler />
                  <AppLayout />
              </WebSocketProvider>
              </SpeedProvider>
            </PartEntitiesProvider>
          </EntityProvider>
        </Livelink>
      )}
    </>
  );
}

function StartupModal({ onSubmit }: { onSubmit: (cred: { sceneId: string }) => void }) {
  const [sceneId, setSceneId] = useState("");
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ sceneId });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white/80 backdrop-blur-md text-gray-800 rounded-2xl shadow-2xl p-10 max-w-md w-full border border-gray-200">
        <Dtext />
<form onSubmit={handleSubmit} className="mt-6 space-y-4 w-full max-w-2xl">
<label className="block flex flex-col">
  <input
    type="text"
    className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    value={sceneId}
    onChange={(e) => setSceneId(e.target.value)}
    required
  />
      </label>
          <div className="space-y-2">
            {[
              ["NJ40 2.5", "c8dc2ac0-4601-4279-a01f-9c57a924f725"],
              ["Genoble CEA cell", "a1d7bb38-1a12-46fb-8485-36b29460cd2c"],
              ["Test_Kuka", "516d270a-5a6b-44e6-99c6-44df631bf475"],
              ["Test_primitive", "ec33e19d-da9f-4593-8412-a9c0c32cc5ba"],
            ].map(([label, id]) => (
              <div className="flex justify-center" key={id}>
                <button
                  type="button"
                  onClick={() => setSceneId(id)}
                  className="w-full bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-800 px-5 py-2 rounded-md transition">
                  Load {label}
                </button>
              </div>
            ))}
          </div>
          <div className="flex justify-center pt-4">
            <button
              type="submit"
              className="bg-yellow-600 hover:bg-yellow-600 text-white px-6 py-2 rounded-md font-semibold transition">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AppLayout() {
  const { cameraEntity } = useCameraEntity();
  const { cameraEntity: pipCamera } = useCameraEntity();
  const { isConnecting } = useContext(LivelinkContext);

  const cameraControllerRef = useRef<DefaultCameraController>(null);
  const [cameraControllerPreset, setCameraControllerPreset] = useState(
    CameraControllerPresets.orbital
  );

  const [showPipCamera, setShowPipCamera] = useState(true);
  const presetKeys = Object.keys(CameraControllerPresets) as (keyof typeof CameraControllerPresets)[];

  const moveCamera = () => {
    if (!cameraControllerRef.current) return;
    const targetPosition = [-1.280, 1.465, 0] as const;
    const lookAtPosition = [-22.4, 90, 22.4] as const;
    cameraControllerRef.current.setLookAt(...targetPosition, ...lookAtPosition, true);
  };
  useEffect(() => {
    if (cameraEntity && cameraControllerRef.current) {
      moveCamera();
    }
  }, [cameraEntity]);

  return (
    <CameraEntityContext.Provider value={cameraEntity}>
      <EntityProvider>
        <ControlPanel />
      </EntityProvider>
      <CameraEventListener />
      <div className="absolute bottom-[3%] right-[3%] z-50">
        <button
          className="fixed bottom-[5.4%] right-[1.5%] z-50 p-3 rounded-xl backdrop-blur bg-white/10 border border-white/20 shadow-xl text-white space-y-5 w-[90vw] max-w-[100px]"
          onClick={() => setShowPipCamera(prev => !prev)}>
          {showPipCamera ? "Minimize" : "Display alt. camera"}
        </button>
      </div>
      <Canvas className="w-full h-screen">
        <Viewport cameraEntity={cameraEntity} className="w-full h-full">
          {!isConnecting && (
            <div>
              <a href="https://docs.3dverse.com/livelink.react/" target="_blank" />
            </div>
          )}
          <CameraController ref={cameraControllerRef} preset={cameraControllerPreset} />
          {showPipCamera && (
            <Canvas className="bottom-10 right-4 w-1/4 aspect-video border border-tertiary rounded-xl shadow-xl absolute">
              <Viewport cameraEntity={ pipCamera } className="w-full h-full">
                <CameraController />
              </Viewport>
            </Canvas>)}
        </Viewport>
      </Canvas>
      <div className="absolute top-14 left-1 flex flex-col z-50">
        <div className="flex flex-row">
          {presetKeys.map((presetKey, index) => {
            const preset = CameraControllerPresets[presetKey];
            const name = presetKey.replace("_", " ");
            const isCurrentPreset = preset === cameraControllerPreset;
            return (
              <button key={index} className={`button button-overlay mr-2 ${isCurrentPreset ? "bg-accent" : ""}`}
                onClick={() => setCameraControllerPreset(preset)}>
                {name}
              </button>
            );
          })}
        </div>
      </div>
    </CameraEntityContext.Provider>
  );
}


const modalStyle: CSSProperties = {
  position: "absolute",
  top: "50%",
  left: "50%",
  backgroundColor: "white",
  padding: "2rem",
  borderRadius: "0.5rem",
  boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
  zIndex: 1000,
};

export default App;