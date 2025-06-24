import { useContext, useEffect } from "react";
import { LivelinkContext } from "@3dverse/livelink-react";
import { useSpeed } from "./Interface"; // 🧠 Import du hook

export default function KeyboardHandler() {
  const { instance } = useContext(LivelinkContext);
  const { speed } = useSpeed(); // 📦 Utilisation de la vitesse

  useEffect(() => {
    if (!instance) return;

    const handleKeyDown = async (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      try {
        const entities = await instance.scene.findEntitiesWithComponents({
          mandatory_components: ["local_transform"],
          forbidden_components: [],
        });

        if (key === "j") nfoKey(entities);
        if (key === "m") posKey(instance, entities, 10, 10, 10);
        if (key === "r") posKey(instance, entities, 0, 0, 0);
        if (key === "k") oriKey(instance, entities, 10, 10, 10);
        if (key === "l") oriKey(instance, entities, -90, 0, 0);

        const move = (x = 0, y = 0, z = 0) => camKey(instance, entities, x * speed, y * speed, z * speed);

        if (key === "z") move(-1, 0, 0);
        if (key === "s") move(1, 0, 0);
        if (key === "q") move(0, 0, 1);
        if (key === "d") move(0, 0, -1);
        if (key === "+") move(0, 1, 0);
        if (key === "-") move(0, -1, 0);

        if (key === " ") camKey(instance, entities, 0, 0, 0);
      } catch (error) {
        console.error("Erreur lors de la manipulation des entités :", error);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [instance, speed]);

  return null;
}

async function posKey(instance: any, entities: { id: string }[], param1: number, param2: number, param3: number)
{  for (const entity of entities) {
    const [fullEntity] = await instance.scene.findEntities({
      entity_uuid: entity.id,
    });
    if (fullEntity) {
      const [x, y, z] = fullEntity.local_transform.position;
      if (param1 === 0 && param2 === 0 && param3 === 0) {
        fullEntity.local_transform = {
          position: [0, 0, 0] as [number, number, number],
        };
      } else {
        fullEntity.local_transform = {
          position: [x + param1, y + param2, z + param3] as [number, number, number],
        };
      }
    }
  }
}

async function oriKey(instance: any, entities: { id: string }[], param1: number, param2: number, param3: number)
{  for (const entity of entities) {
    const [fullEntity] = await instance.scene.findEntities({
      entity_uuid: entity.id,
    });
    if (fullEntity) {
      const [x, y, z] = fullEntity.local_transform.orientation;
      if (param1 === -90 && param2 === 0 && param3 === 0) {
        fullEntity.local_transform = {
          orientation: [-90, 0, 0] as [number, number, number],
        };
      } else {
        fullEntity.local_transform = {
          orientation: [x + param1, y + param2, z + param3] as [number, number, number],
        };
      }
    }
  }
}

async function camKey(instance: any, entities: { id: string }[], param1: number, param2: number, param3: number)
{
  for (const entity of entities) {
    const [fullEntity] = await instance.scene.findEntities({
      entity_uuid: entity.id,
    });
    const name = fullEntity?.name?.toLowerCase?.();
    const type = fullEntity?.type?.toLowerCase?.();
    const isCamera = name === "camera" || type === "camera";
    if (fullEntity && isCamera) {
      const [x, y, z] = fullEntity.local_transform.position;
      if (param1 === 0 && param2 === 0 && param3 === 0) {
        fullEntity.local_transform = {
          position: [200, 86, 30] as [number, number, number],
        };
        fullEntity.local_transform = {
          orientation: [3.5, 88, 0] as [number, number, number],
        };
      } else {
        fullEntity.local_transform = {
          position: [x + param1, y + param2, z + param3] as [ number, number, number ],
        };
      }
    }
  }
}

function nfoKey(entities: { id: string; name?: string }[]) {
  const entitiesWithNames = entities.map((entity) => ({
    uuid: entity.id,
    name: entity.name || "(sans nom)",
  }));
  console.table(entitiesWithNames);
}

