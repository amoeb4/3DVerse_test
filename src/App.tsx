import {  useState,  useContext,  useRef } from "react";
import {  Livelink,  Canvas,  Viewport,  CameraController,  useCameraEntity,  LivelinkContext,  DefaultCameraController } from "@3dverse/livelink-react";
import { CameraControllerPresets } from "@3dverse/livelink";
import { LoadingOverlay } from "@3dverse/livelink-react-ui";import KeyboardHandler from "./keyBindings.tsx";
import CameraEventListener from "./CameraEventListener.jsx";
import ControlPanel, { SpeedProvider, EntityProvider } from "./Interface.jsx";
import { CameraEntityContext } from "./cameraControl.tsx";
import "./App.css";
import { WebSocketProvider } from "./webSockets.tsx";
import type { CameraControllerPreset } from "@3dverse/livelink";
import { EntitySync } from "./webSockets.tsx";

export function App() {
  const [credentials, setCredentials] = useState(null);

  return (
    <>
      {!credentials ? (
        <StartupModal onSubmit={setCredentials} />
      ) : (
        <Livelink
          sceneId={credentials.sceneId}
          token="public_ml59vXKlgs9fTJlx"
          LoadingPanel={LoadingOverlay}
        >
          <EntityProvider>
            <WebSocketProvider>
              <EntitySync name="Cone" />
              <EntitySync name="Cube" />
              <EntitySync name="Cylinder" />
              <SpeedProvider>
                <KeyboardHandler />
                <AppLayout />
              </SpeedProvider>
            </WebSocketProvider>
          </EntityProvider>
        </Livelink>
      )}
    </>
  );
}

function StartupModal({ onSubmit }) {
  const [sceneId, setSceneId] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ sceneId });
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
          {[
            ["NJ40 2.5", "c8dc2ac0-4601-4279-a01f-9c57a924f725"],
            ["Grenoble CEA cell", "a1d7bb38-1a12-46fb-8485-36b29460cd2c"],
            ["Test_Kuka", "516d270a-5a6b-44e6-99c6-44df631bf475"],
            ["Test_primitive", "ec33e19d-da9f-4593-8412-a9c0c32cc5ba"],
          ].map(([label, id]) => (
            <div className="flex justify-center" key={id}>
              <button type="button" onClick={() => setSceneId(id)} className="border border-black px-4 py-2 rounded hover:bg-gray-100">
                Load {label}
              </button>
            </div>
          ))}
          <div className="flex justify-center mt-4">
            <button type="submit" className="border border-black px-4 py-2 rounded hover:bg-gray-100">
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
  const [cameraControllerPreset, setCameraControllerPreset] = useState<CameraControllerPreset>(
    CameraControllerPresets.orbital
  );

  const presetKeys = Object.keys(CameraControllerPresets) as (keyof typeof CameraControllerPresets)[];

  const moveCamera = () => {
    const targetPosition = [-30, 250, 150] as const;
    const lookAtPosition = [-280, -100, -120] as const;
    cameraControllerRef.current?.setLookAt(...targetPosition, ...lookAtPosition, true);
  };

  return (
    <CameraEntityContext.Provider value={cameraEntity}>
    <EntityProvider>
     <ControlPanel />
     <EntitySync />
    </EntityProvider>
      <CameraEventListener />
      <Canvas className="w-full h-screen">
        <Viewport cameraEntity={cameraEntity} className="w-full h-full">
          {!isConnecting && (
            <div>
              <a href="https://docs.3dverse.com/livelink.react/" target="_blank" />
            </div>
          )}
          <CameraController ref={cameraControllerRef} preset={cameraControllerPreset} />
          <Canvas className="bottom-10 right-4 w-1/4 aspect-video border border-tertiary rounded-xl shadow-xl">
            <Viewport cameraEntity={pipCamera} className="w-full h-full">
              <CameraController />
            </Viewport>
          </Canvas>
        </Viewport>
      </Canvas>
      <div className="absolute top-14 left-1 flex flex-col">
        <div className="flex flex-row">
          <button className="button button-overlay mr-2" onClick={moveCamera}>
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
