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
          <AppLayout />
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
            value={sceneId}
            onChange={(e) => setSceneId(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
{/*
  Token :
  <input
    type="text"
    value="public_OvrLzN5abV1Qa65V"
    onSubmit={(e) => setToken(e.target.value)}
    required
  />
*/}
        </label>
        <br />
        <button type="submit" onClick={(e) => setSceneId("776d1d2a-5c8e-4a96-9360-1536329a0db0")} >Empty layout</button>
        <button type="submit" hidden></button>
      </form>
    </div>
  );
}

function AppLayout() {
  const { cameraEntity } = useCameraEntity();
  const { isConnecting } = useContext(LivelinkContext);

  return (
    <Canvas className="max-h-screen">
      <Viewport cameraEntity={cameraEntity} className="w-full h-full">
        {!isConnecting && (
          <div>
            <a href="https://docs.3dverse.com/livelink.react/" target="_blank">
            </a>
          </div>
        )}
        <CameraController />
      </Viewport>
    </Canvas>
  );
}

const modalStyle = {
  position: "fixed",
  top: "30%",
  left: "30%",
  backgroundColor: "#fff",
  padding: "20px",
  borderRadius: "8px",
  boxShadow: "0px 0px 20px rgba(0, 0, 0, 0.3)",
  zIndex: 9999,
};

//------------------------------------------------------------------------------
export default App;
