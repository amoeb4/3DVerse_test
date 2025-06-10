import {
    Livelink,
    Canvas,
    Viewport,
    CameraController,
    useCameraEntity,
} from "@3dverse/livelink-react";

import { LoadingOverlay } from "@3dverse/livelink-react-ui";

const scene_id = "66299402-5a92-4f50-97d6-c30f04a38e1b";
const token = "public_OvrLzN5abV1Qa65V";

export function App() {
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

function Canvas(params: PropsWithChildren<CanvasContext & HTMLProps<HTMLDivElement>>): JSX.Element;

function AppLayout() {
    const { cameraEntity } = useCameraEntity();

    return (
			<Canvas className="w-screen h-screen bg-red-500" height={1000} width={1000}>
            <Viewport cameraEntity={cameraEntity} className="w-full h-full">
                <CameraController />
            </Viewport>
        </Canvas>

    );
}
