import { useState, useContext, useEffect } from "react";
import { Slider } from "@material-tailwind/react";
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
import KeyboardHandler from "./keyBindings.tsx";

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
          <KeyboardHandler /> {}
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
<div className= "flex justify-center">
        <button className="border position:centered border-black px-4 py-2 rounded hover:bg-gray-100" type="submit">Submit</button>
</div>
</div>
      </form>
    </div>
  );
}

import CameraEventListener from "./CameraEventListener";

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
    boxShadow: "0px 0px 20px rgba(88, 87, 87, 0.81)",
    zIndex: 1000,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center", 
  };

  return (
    <>
      <div style={control_interface}>
        <h1>Control Panel</h1>
        <button className="border cursor-pointer border-white px-4 py-2 rounded hover:bg-gray-100">DO A FLIP!!!</button>
        <button className="border cursor-pointer border-white px-4 py-2 rounded hover:bg-gray-100">Apply changes</button>
      <input type="range"  min="0"  max="100"  defaultValue={70}  className="w-64 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-500"/>
      </div>
      <CameraEventListener />
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
  padding: "50px",
  borderRadius: "10px",
  boxShadow: "0px 0px 20px rgba(0, 0, 0, 0.3)",
  zIndex: 9999,
};

export default App;
