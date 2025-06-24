import { useEffect, useContext } from "react";
import { quat, vec3 } from "gl-matrix";
import { SpeedContext } from "./Interface";

export async function posKey(
  instance: any,
  entities: { id: string }[],
  param1: number,
  param2: number,
  param3: number
) {
  for (const entity of entities) {
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
          position: [x + param1, y + param2, z + param3] as [
            number,
            number,
            number
          ],
        };
      }
    }
  }
}

export async function oriKey(
  instance: any,
  entities: { id: string }[],
  param1: number,
  param2: number,
  param3: number,
  eulerToQuat: (x: number, y: number, z: number) => [
    number,
    number,
    number,
    number
  ]
) {
  for (const entity of entities) {
    const [fullEntity] = await instance.scene.findEntities({
      entity_uuid: entity.id,
    });
    if (fullEntity) {
      // Correction ici: orientation est un quaternion à 4 valeurs
      const [x, y, z, w] = fullEntity.local_transform.orientation || [0, 0, 0, 1];

      if (param1 === -90 && param2 === 0 && param3 === 0) {
        fullEntity.local_transform = {
          orientation: eulerToQuat(-90, 0, 0),
        };
      } else {
        fullEntity.local_transform = {
          orientation: eulerToQuat(x + param1, y + param2, z + param3),
        };
      }
    }
  }
}

export async function camKey(
  instance: any,
  entities: { id: string }[],
  moveX: number,
  moveY: number,
  moveZ: number
) {
  for (const entity of entities) {
    const [fullEntity] = await instance.scene.findEntities({
      entity_uuid: entity.id,
    });
    if (!fullEntity) continue;

    const name = fullEntity?.name?.toLowerCase?.();
    const type = fullEntity?.type?.toLowerCase?.();
    const isCamera = name === "camera" || type === "camera";
    if (!isCamera) continue;

    const position = vec3.fromValues(...fullEntity.local_transform.position);
    const orientation = fullEntity.local_transform.orientation || [0, 0, 0, 1];
    const rotationQuat = quat.fromValues(...orientation);

    if (moveX === 0 && moveY === 0 && moveZ === 0) {
      fullEntity.local_transform.position = [200, 86, 30];
      const defaultQuat = quat.create();
      quat.fromEuler(defaultQuat, 3.5, 88, 0);
      fullEntity.local_transform.orientation = [
        defaultQuat[0],
        defaultQuat[1],
        defaultQuat[2],
        defaultQuat[3],
      ];
      continue;
    }

    const localMove = vec3.fromValues(moveX, moveY, moveZ);
    const worldMove = vec3.create();
    vec3.transformQuat(worldMove, localMove, rotationQuat);
    vec3.add(position, position, worldMove);
    fullEntity.local_transform.position = [
      position[0],
      position[1],
      position[2],
    ];
  }
}

export function nfoKey(entities: { id: string; name?: string }[]) {
  const entitiesWithNames = entities.map((entity) => ({
    uuid: entity.id,
    name: entity.name || "(sans nom)",
  }));
  console.table(entitiesWithNames);
}

// --- Ajout d'un composant React par défaut pour KeyboardHandler ---

export default function KeyboardHandler() {
  const { speed } = useContext(SpeedContext);

  useEffect(() => {
    if (!speed) return;

    const handleKeyDown = async (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      // Ici tu peux appeler les fonctions ci-dessus (posKey, oriKey, camKey, nfoKey)
      // Exemple d'usage minimal :
      // const instance = ... ; const entities = ... ; à compléter selon ton contexte
      // await camKey(instance, entities, 0, 0, 1 * speed);
      console.log("Key pressed:", key, "Speed:", speed);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [speed]);

  return null;
}
