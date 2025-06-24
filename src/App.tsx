import { useState, useContext } from "react";
import {
  Livelink,
  Canvas,
  Viewport,
  CameraController,
  useCameraEntity,
  LivelinkContext,
} from "@3dverse/livelink-react";
import { LoadingOverlay } from "@3dverse/livelink-react-ui";
import "./App.css";
import KeyboardHandler from "./keyBindings.tsx"; // ✅ Chemin corrigé
import CameraEventListener from "./CameraEventListener";
import ControlPanel, { SpeedProvider } from "./Interface.jsx";

export function App() {
  const [credentials, setCredentials] = useState(null);

  return (
    <>
      {!credentials ? (
        <StartupModal onSubmit={setCredentials} />
      ) : (
        <Livelink
          sceneId={credentials.sceneId}
          token="public_OvrLzN5abV1Qa65V"
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
                setSceneId("776d1d2a-5c8e-4a96-9360-1536329a0db0")
              }
              className="border border-black px-4 py-2 rounded hover:bg-gray-100"
            >
              Load empty layout
            </button>
          </div>
        </div>
        <div className="space-y-2 mt-4">
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() =>
                setSceneId("dc5e3854-c764-4c1b-8d9a-e15143706752")
              }
              className="border border-black px-4 py-2 rounded hover:bg-gray-100"
            >
              Load Grenoble CEA cell
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
  const { isConnecting } = useContext(LivelinkContext);

  return (
    <>
      <ControlPanel />
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
          <CameraController />
        </Viewport>
      </Canvas>
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
