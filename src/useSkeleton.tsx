import { LivelinkContext, useEntity } from "@3dverse/livelink-react";
import { useContext, useEffect } from "react";
import { Entity } from "@3dverse/livelink";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TransformControls } from "three/addons/controls/TransformControls.js";

export function CreateJoints() {
    const { instance } = useContext(LivelinkContext);
    const { entity: controller } = useEntity({
        euid: "dbe0b7de-fd0c-46d8-a90c-8a9f2f896002",
    });

    useEffect(() => {
        if (!instance || !controller) {
            console.log("En attente de l'instance ou du contrôleur...");
            return;
        }
        traverseAndCollectJoints(controller).then((joints) => {
            console.log(`🦴 ${joints.length} joints collectés.`);
        });
    }, [instance, controller]);

    return null;
}

type JointEntry = { entity: Entity; parent: Entity | null };

export async function traverseAndCollectJoints(entity: Entity, parent: Entity | null = null): Promise<JointEntry[]> {
    const joints: JointEntry[] = [];

    console.log("Oui");
    async function traverse(entity: Entity, parent: Entity | null) {
        joints.push({ entity, parent });
        if (parent) {
            console.log(`Joint créé entre "${parent.name}" -> "${entity.name}"`);
        } else {
            console.log(`Racine trouvée : "${entity.name}"`);
        }

        const children = await entity.getChildren();
        for (const child of children) {
            await traverse(child, entity);
        }
    }

    await traverse(entity, parent);
    return joints;
}