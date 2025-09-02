"use client";
import { useContext } from "react";
import { LivelinkContext } from "@3dverse/livelink-react";

export function EntityCreator() {
    const { instance } = useContext(LivelinkContext);
    if (!instance) {
        return null;
    }

    const MATERIAL_REFS = [
        "5bd5d2c565d3-4cdb-adb1-c85ae1502840", // Light
        "afbcef75-7c52-4a90-b6e6-d19dcc04c3ad", // Green
        "9b848934-e592-41a9-895f-11ab01892b1d", // Wood
        "c9650d73-0f0b-4064-843f-ff0bb8d506e7", // Dark
        "438bca58-a9e8-41db-910e-4174ac93437f", // Dark Green
        "78b48c3a-9988-433a-9237-9ea5dc7a57e5", // Orange
        "6f39abc9-9147-498e-9530-b41a6f8c2e2a", // Purple
    ] as const;

    const SPAWN_SURFACE_SIZE = 3 as const;

   const createEntity = () => {
        instance.scene.newEntity({
            name: "My Entity",
            components: {
                local_transform: {
                    position: [
                        Math.random() * SPAWN_SURFACE_SIZE * 2 -
                            SPAWN_SURFACE_SIZE,
                        0,
                        Math.random() * (SPAWN_SURFACE_SIZE - 1) * 2 - 2,
                    ],
                    scale: [
                        0.1 + Math.random(),
                        0.1 + Math.random(),
                        0.1 + Math.random(),
                    ],
                },
                mesh_ref: { value: "0577814f-4677-420b-89e8-1e5a4dd56914" },
                material_ref: {
                    value: MATERIAL_REFS[
                        Math.floor(Math.random() * MATERIAL_REFS.length)
                    ],
                },
            },
        });
    };


    return (
        <button
            className="button button-overlay absolute top-4 left-4"
            onClick={createEntity}>
            Create Entity
        </button>
    );
}
