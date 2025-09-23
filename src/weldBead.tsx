"use client";
import { useContext, useEffect, useState } from "react";
import { LivelinkContext, useEntity } from "@3dverse/livelink-react";

export function EntityCreator() {
    const { instance } = useContext(LivelinkContext);
    const [temperature, setTemperature] = useState(50);
    const [latency, setLatency] = useState(0);
    const { entity: torch } = useEntity({
        euid: "d0d44c23-2d15-48d6-93ee-a46422890baf",
    });

    const MATERIAL_REFS = [
        "5a54e41e-164c-47f8-bf4b-c8d00c3b61aa", // cold
        "561b317b-017f-410b-a04e-f925519dea62",
        "3a2488f6-aa20-4698-883a-6eb5693964f9",
        "cdcbac06-a458-4f35-b868-34ac8d57ddaa",
        "92548856-c45a-45b5-a9d5-45c77bc7660b",
        "63b13bc0-5491-414e-8980-ba67e32ff91f", // average
        "21514595-395d-45a7-9c20-2a12bc1b520c",
        "529dd88c-c943-41f0-88a7-b96419e1e8b8",
        "de9844ab-3c9e-4ce7-9e2b-dec91474d11d",
        "58ab98c3-25d3-4187-a407-24158f213996", // hot
    ] as const;
    // Fonction pour déterminer le matériau selon la température
    const getMaterialFromTemperature = (temp: number) => {
        const index = Math.min(
            MATERIAL_REFS.length - 1,
            Math.floor(temp / 10)
        );
        return MATERIAL_REFS[index];
    };

    const createEntity = async () => {
        const POS_TORCH: [number, number, number] | undefined =
            torch?.global_transform.position;

        instance?.scene.newEntity({
            name: "My Entity",
            components: {
                local_transform: {
                    position: POS_TORCH,
                    scale: [0.003, 0.003, 0.005],
                },
                mesh_ref: { value: "53daef4f-eef0-4b09-9815-50733891ed10" },
                material_ref: {
                    value: getMaterialFromTemperature(temperature),
                },
            },
        });
    };

    useEffect(() => {
        const timer = setInterval(() => {
            setLatency(instance?.latency || 0);
        }, 33);
        return () => {
            clearInterval(timer);
        }
    }, [setLatency]);

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
                <br/>
                Latency: {`${latency.toFixed(0)}ms`}
                <input
                    type="range"
                    min={0}
                    max={100}
                    value={temperature}
                    onChange={(e) => setTemperature(Number(e.target.value))}
                    className="w-40"
                />
            </label>
        </div>
    );
}
