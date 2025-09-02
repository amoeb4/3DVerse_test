"use client";
import { useContext, useState } from "react";
import { LivelinkContext, useEntity } from "@3dverse/livelink-react";

export function EntityCreator() {
    const { instance } = useContext(LivelinkContext);
    const [temperature, setTemperature] = useState(50);
    const { entity: torch } = useEntity({
        euid: "10d1462b-2d11-4b9d-b8da-dd4ecbaa6c02",
    });

    const createEntity = async () => {
        const POS_TORCH: [number, number, number] | undefined =
        torch?.ls_to_ws
            ? [
                  torch.ls_to_ws[12],
                  torch.ls_to_ws[13],
                  torch.ls_to_ws[14],
              ]
            : undefined;
        console.log(`entity created at : ${POS_TORCH}`);
        instance?.scene.newEntity({
            name: "My Entity",
            components: {
                local_transform: {
                    position: POS_TORCH,
                    scale: [0.01, 0.01, 0.01],
                },
                mesh_ref: { value: "53daef4f-eef0-4b09-9815-50733891ed10" },
                material_ref: {
                    value: "f2a549e5-4f72-4cef-a5ab-48873c209e0c",
                },

            },
        });        
    };

    return (
        <div className="absolute text-white top-4 left-4 flex flex-col gap-2 bg-black/30 p-3 rounded-xl">
            <button
                className="button button-overlay"
                onClick={createEntity}
                disabled={!instance}>
                Create Entity
            </button>
            <label className="flex flex-col text-white text-sm">
                Température: {temperature}
                <input type="range"
                    min={0}
                    max={100}
                    value={temperature}
                    onChange={(e) => setTemperature(Number(e.target.value))}
                    className="w-40"/>
            </label>
        </div>
    );
}