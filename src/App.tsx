import {  useState,  useContext,  useRef,  useEffect,  createContext,  useCallback } from "react";
import {  Livelink,  Canvas,  Viewport,  CameraController,  useCameraEntity,  LivelinkContext,  DefaultCameraController } from "@3dverse/livelink-react";
import { CameraControllerPresets } from "@3dverse/livelink";
import { LoadingOverlay } from "@3dverse/livelink-react-ui";import KeyboardHandler from "./keyBindings.tsx";
import CameraEventListener from "./CameraEventListener";
import ControlPanel, { SpeedProvider, EntityProvider } from "./Interface.jsx";
import { CameraEntityContext } from "./cameraControl.tsx";
import "./App.css";
import type { CameraControllerPreset } from "@3dverse/livelink";

const WSContext = createContext({
  register: (_setTransform: any, _name: string) => {},
});

function WebSocketProvider({ children }) {
  console.log("✅ WebSocketProvider mounted");

  const registry = useRef<{ setter: any; name: string }[]>([]);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8767");

    console.log("🔌 Socket created. ReadyState:", socket.readyState);

    socket.onopen = () => {
      console.log("✅ WebSocket connected, readyState:", socket.readyState);
    };

    socket.onmessage = (event) => {
      console.log("📨 Raw WebSocket message:", event.data);
      try {
        const data = JSON.parse(event.data);
        console.log("✅ Parsed message:", data);

        const entry = registry.current.find((e) => e.name === data.name);
        console.log("📦 Registry content:", registry.current);

        if (entry && entry.setter) {
          console.log("🔁 Updating entity transform for:", data.name);
          const transform: any = {};
          if (data.mode === "-P" && data.location) {
            transform.position = data.location;
          } else if (data.mode === "-A" && data.rotation) {
            transform.rotation = data.rotation;
          }
          entry.setter(transform);
        } else {
          console.warn("⚠️ Entity not registered:", data.name);
        }
      } catch (err) {
        console.error("❌ JSON parse error:", event.data, err);
      }
    };

    socket.onerror = (error) => {
      console.error("❌ WebSocket error:", error);
    };

    socket.onclose = () => {
      console.warn("⚠️ WebSocket closed");
    };

    return () => {
      console.log("🔒 Closing WebSocket");
      socket.close();
    };
  }, []);

  const register = useCallback((setter: any, name: string) => {
    console.log(`🔧 Registered entity: ${name}`);
    registry.current.push({ setter, name });
  }, []);

  return <WSContext.Provider value={{ register }}>{children}</WSContext.Provider>;
}

export function useWebSocket() {
  return useContext(WSContext);
}

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
          <WebSocketProvider>
            <SpeedProvider>
              <KeyboardHandler />
              <AppLayout />
            </SpeedProvider>
          </WebSocketProvider>
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
            ["Compaqt V.2", "6e6cdc4e-df12-41b8-94ad-d963b8b0e71d"],
            ["Grenoble CEA cell", "282c2734-02f4-478c-a21b-6454e2f98be9"],
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
