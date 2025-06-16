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

const root = document.querySelector('#root') // or const root = document.body

root.addEventListener('H', (e) => {
  if (e.target.tagName === 'BUTTON' && e.target.className === 'my-button') {
    e.stopPropagation()
    window.alert("Click registered");
  }
})

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
            className="border border-black px-3 py-1"
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
<div className="flex justify-center">
  <button
    type="submit"
    onClick={(e) =>
      setSceneId("776d1d2a-5c8e-4a96-9360-1536329a0db0")
    }
    className="border border-black px-4 py-2 rounded hover:bg-gray-100">
    Empty layout
  </button>
</div>
        <button type="submit" hidden></button>
      </form>
    </div>
  );
}


function AppLayout() {
  const { cameraEntity } = useCameraEntity();
  const { isConnecting } = useContext(LivelinkContext);

  const control_interface = {
    position: "fixed",
    left: "5%",
    right: "5%",
    top: "3%",
    backgroundColor: "#455a64",
    color: "white",
    padding: "2rem",
    borderRadius: "7px",
    boxShadow: "0px 0px 20px rgba(255, 255, 255, 0.81)",
    zIndex: 1000,
  };

  return (
    <>
      <div style={control_interface}>
        <h1>Control Panel</h1>
        <button className="right 7% border border-white px-4 py-2 rounded hover:bg-gray-100">DO A FLIP!!!</button>
      </div>
      <Canvas className="w-full h-screen">
        <Viewport cameraEntity={cameraEntity} className="w-full h-full">
          {!isConnecting && (
            <div>
              <a href="https://docs.3dverse.com/livelink.react/" target="_blank" />
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
  padding: "20px",
  borderRadius: "8px",
  boxShadow: "0px 0px 20px rgba(0, 0, 0, 0.3)",
  zIndex: 9999,
};

export default App;
