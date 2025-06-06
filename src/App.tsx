import {
    Livelink,
    Canvas,
    Viewport,
    CameraController,
    useCameraEntity,
} from "@3dverse/livelink-react";
import { LoadingOverlay } from "@3dverse/livelink-react-ui";

const scene_id = "6391ff06-c881-441d-8ada-4184b2050751";
const token = "public_i1-8nmpu9dTKaQvl";

function App() {
    return (
        <Livelink
            sceneId={scene_id}
            token={token}
            LoadingPanel={LoadingOverlay}
        >
            <AppLayout />
        </Livelink>
    );
}

function AppLayout() {
    const { cameraEntity } = useCameraEntity();

    return (
        <Canvas className="max-h-screen">
            <Viewport cameraEntity={cameraEntity} className="w-full h-full">
                <CameraController />
            </Viewport>
        </Canvas>
    );
}

export default App;

