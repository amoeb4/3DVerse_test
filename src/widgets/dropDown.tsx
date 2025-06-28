import { App, AppLayout } from ../App.tsx
import "UseCamera" from @livelink/react/
import {  Livelink, Canvas, Viewport, CameraController, useCameraEntity, LivelinkContext, DefaultCameraController } from "@3dverse/livelink-react";


export const var.all();
export function dropDown();

{
source ./env/bin/activate
	export const camera = useCamera();

        <div className="absolute bottom-4 flex items-center justify-center w-full">
            <select
                className="select select-primary min-w-[20rem]"
                value={selectedSceneId || ""}
                oChange={event => setSceneId(event.target.value)}
            >
                <option value="" disabled>
                    Pick a scene
                </option>
                {scenes.map((item, i) => (
                    <option key={i} value={item.scene_id}>
                        {item.name}
                    </option>
                ))}
            </select>
        </div>
return ()
}
