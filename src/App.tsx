import { useState, useContext, useRef } from "react";
import { CameraEntityContext } from "./cameraControl.tsx";
import {  Livelink, Canvas, Viewport, CameraController, useCameraEntity, LivelinkContext, DefaultCameraController } from "@3dverse/livelink-react";
import { CameraControllerPresets } from "@3dverse/livelink";
import { LoadingOverlay } from "@3dverse/livelink-react-ui";
import "./App.css";
import KeyboardHandler from "./keyBindings.tsx";
import CameraEventListener from "./CameraEventListener";
import type { CameraControllerPreset } from "@3dverse/livelink";
import ControlPanel, { SpeedProvider, EntityProvider } from "./Interface.jsx";

export function App() {
  const [credentials, setCredentials] = useState(null);

  return (
    <>
      {!credentials ? (
        <StartupModal onSubmit={setCredentials} />
      ) : (
        <Livelink
          sceneId={credentials.sceneId}
          token="public_k4WYhr1przbiqsR-"
          LoadingPanel={LoadingOverlay}
        >
          <SpeedProvider>
            <KeyboardHandler />
            <AppLayout />
          </SpeedProvider>
        </Livelink>
      )}
    </>
  );
}

function StartupModal({ onSubmit }) {
  const [sceneId, setSceneId] = useState("");
  const [token, setToken] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ sceneId, token });
  };

  return (
    <div style={modalStyle}>
      <form onSubmit={handleSubmit}>
        <label>
          Scene ID :
          <input
            type="text"
            className="border border-black px-3 py-1"
            value={sceneId}
            onChange={(e) => setSceneId(e.target.value)}
            required
          />
        </label>
        <div className="space-y-2 mt-4">
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() =>
                setSceneId("6e6cdc4e-df12-41b8-94ad-d963b8b0e71d")
              }
              className="border border-black px-4 py-2 rounded hover:bg-gray-100"
            >
              Load Compaqt V.2
            </button>
          </div>
        </div>
        <div className="space-y-2 mt-4">
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() =>
                setSceneId("282c2734-02f4-478c-a21b-6454e2f98be9")
              }
              className="border border-black px-4 py-2 rounded hover:bg-gray-100">
              Load Grenoble CEA cell
            </button>
          </div>
        </div>
                <div className="space-y-2 mt-4">
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() =>
                setSceneId("2090b58a-70f4-4965-badc-55b3684b3f9f")
              }
              className="border border-black px-4 py-2 rounded hover:bg-gray-100">
              Load Test_Kuka
            </button>
          </div>
        </div>
        <div className="space-y-2 mt-4">
          <div className="flex justify-center">
            <button
              className="border position:centered border-black px-4 py-2 rounded hover:bg-gray-100"
              type="submit"
            >
              Submit
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function AppLayout() {
  const { cameraEntity } = useCameraEntity();
  const { cameraEntity: pipCamera } = useCameraEntity();
  const { isConnecting } = useContext(LivelinkContext);

    const cameraControllerRef = useRef<DefaultCameraController>(null);
    const [cameraControllerPreset, setCameraControllerPreset] =
        useState<CameraControllerPreset>(CameraControllerPresets.orbital);

    const presetKeys = Object.keys(
        CameraControllerPresets,
    ) as (keyof typeof CameraControllerPresets)[];

    const moveCamera = () => {
        const targetPosition = [-30, 250, 150] as const;
        const lookAtPosition = [-280, -100, -120] as const;
        cameraControllerRef.current?.setLookAt(
            ...targetPosition,
            ...lookAtPosition,
            true,
        );
    };

return (
  <>
    <CameraEntityContext.Provider value={cameraEntity}>
      <EntityProvider>
        <ControlPanel />
      </EntityProvider>
      <CameraEventListener />

      <Canvas className="w-full h-screen">
        <Viewport cameraEntity={cameraEntity} className="w-full h-full">
          {!isConnecting && (
            <div>
              <a
                href="https://docs.3dverse.com/livelink.react/"
                target="_blank"
              />
            </div>
          )}
          <CameraController
            ref={cameraControllerRef}
            preset={cameraControllerPreset}
          />
          <Canvas className="bottom-10 right-4 w-1/4 aspect-video border border-tertiary rounded-xl shadow-xl">
          <Viewport
              cameraEntity={pipCamera}
              className="w-full h-full"
          >
          <CameraController />
          </Viewport>
        </Canvas>
        </Viewport>
      </Canvas>
      {}
      <div className="absolute top-14 left-1 flex flex-col">
        <div className="flex flex-row">
          <button
            className="button button-overlay mr-2"
            onClick={moveCamera}
          >
            Move Camera
          </button>
          {presetKeys.map((presetKey, index) => {
            const preset = CameraControllerPresets[presetKey];
            const name = presetKey.replace("_", " ");
            const isCurrentPreset = preset === cameraControllerPreset;
            return (
              <button
                key={index}
                className={`button button-overlay mr-2 ${isCurrentPreset ? "bg-accent" : ""}`}
                onClick={() => setCameraControllerPreset(preset)}
              >
                {name}
              </button>
            );
          })}
        </div>
      </div>
    </CameraEntityContext.Provider>
  </>
);
}

const modalStyle = {
  position: "fixed",
  top: "30%",
  left: "30%",
  backgroundColor: "#fff",
  padding: "50px",
  borderRadius: "10px",
  boxShadow: "0px 0px 20px rgba(0, 0, 0, 0.3)",
  zIndex: 9999,
};

export default App;
