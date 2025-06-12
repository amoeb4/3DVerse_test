//------------------------------------------------------------------------------
import {
    Livelink,
    Canvas,
    Viewport,
    CameraController,
    useCameraEntity,
} from "@3dverse/livelink-react";
import { LoadingOverlay } from "@3dverse/livelink-react-ui";
import "./App.css";

//------------------------------------------------------------------------------
const scene_id = "6391ff06-c881-441d-8ada-4184b2050751";
const token = "public_i1-8nmpu9dTKaQvl";

//------------------------------------------------------------------------------
export function App() { 
    return (
        <div className="app-container">
            <div className="livelink-container">
                <Livelink
                    sceneId={scene_id}
                    token={token}
                    LoadingPanel={LoadingOverlay}
                >
                    <AppLayout />
                </Livelink>
            </div>
        </div>
    );
}

//------------------------------------------------------------------------------
function AppLayout() {
    const { cameraEntity } = useCameraEntity();
    return (
        <div className="app-layout">
            <Canvas className="canvas-container">
                <Viewport 
                    cameraEntity={cameraEntity} 
                    className="viewport-container"
                >
                    <CameraController />
                </Viewport>
            </Canvas>
        </div>
    );
}