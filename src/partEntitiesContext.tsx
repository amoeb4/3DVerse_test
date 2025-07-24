import { createContext, useContext, useEffect, useState } from "react";
import { LivelinkContext } from "@3dverse/livelink-react";
// import type { Transform } from "@3dverse/livelink";
import { Entity } from "@3dverse/livelink";
import { mat4, vec3, quat } from "gl-matrix";
import type { Vec3, Quat } from "@3dverse/livelink.core";

export type EntityWithParentId = Entity & {
  __parentId: string | null;
};

//type DebugTransform = keyof Transform;

function quaternionToEuler(q: Quat): Vec3 {
  const [x, y, z, w] = q;
  const sinr_cosp = 2 * (w * x + y * z);
  const cosr_cosp = 1 - 2 * (x * x + y * y);
  const roll = Math.atan2(sinr_cosp, cosr_cosp);

  const sinp = 2 * (w * y - z * x);
  const pitch = Math.abs(sinp) >= 1 ? Math.sign(sinp) * Math.PI / 2 : Math.asin(sinp);

  const siny_cosp = 2 * (w * z + x * y);
  const cosy_cosp = 1 - 2 * (y * y + z * z);
  const yaw = Math.atan2(siny_cosp, cosy_cosp);

  return [roll, pitch, yaw];
}

export function applyMatrixToEntity(entity: Entity, matrix: mat4) {
  const translation = vec3.create();
  const rotation = quat.create();
  const scale = vec3.create();

  mat4.getTranslation(translation, matrix);
  mat4.getRotation(rotation, matrix);
  mat4.getScaling(scale, matrix);

  const position: Vec3 = Array.from(translation) as Vec3;
  const orientation: Quat = Array.from(rotation) as Quat;
  const eulerOrientation: Vec3 = quaternionToEuler(orientation);
  const scaleVec: Vec3 = Array.from(scale) as Vec3;

  entity.local_transform = {
    position,
    orientation,
    eulerOrientation,
    scale: scaleVec,
  };
}

export async function moveEntityHierarchyMatrixFast(
  rootName: string,
  delta: [number, number, number],
  entitiesMap: Map<string, EntityWithParentId>,
  instance: any
) {
  const root = entitiesMap.get(rootName);
  if (!root) return console.warn("❌ Root not found");

  const descendants = await getDescendants(root, entitiesMap);

  const root_ls_to_ws = root.ls_to_ws;
  const new_root_ls_to_ws = mat4.clone(root_ls_to_ws);
  mat4.translate(new_root_ls_to_ws, new_root_ls_to_ws, vec3.fromValues(...delta));

  const new_root_ws_to_ls = mat4.invert(mat4.create(), new_root_ls_to_ws);
  const updated_root_local = mat4.multiply(mat4.create(), new_root_ws_to_ls!, root_ls_to_ws);
  applyMatrixToEntity(root, updated_root_local);

  for (const child of descendants) {
    const childWorldMatrix = child.ls_to_ws;
    const newParentInverse = mat4.invert(mat4.create(), new_root_ls_to_ws)!;
    const newChildLocalMatrix = mat4.multiply(mat4.create(), newParentInverse, childWorldMatrix);
    applyMatrixToEntity(child, newChildLocalMatrix);
  }

  console.log(`✅ Déplacement appliqué avec matrices à ${descendants.length + 1} entités`);
}

export async function getDescendants(
  root: EntityWithParentId,
  entitiesMap: Map<string, EntityWithParentId>
): Promise<EntityWithParentId[]> {
  const descendants: EntityWithParentId[] = [];
  const visited = new Set<string>();
  const walk = (entity: EntityWithParentId) => {
    visited.add(entity.id);
    for (const [, child] of entitiesMap) {
      if (child.__parentId === entity.id && !visited.has(child.id)) {
        descendants.push(child);
        walk(child);
      }
    }
  };
  walk(root);
  return descendants;
}

type PartEntitiesContextType = {
  entities: EntityWithParentId[];
  entitiesMap: Map<string, EntityWithParentId>;
};

export const PartEntitiesContext = createContext<PartEntitiesContextType>({
  entities: [],
  entitiesMap: new Map(),
});

export function PartEntitiesProvider({ children }: { children: React.ReactNode }) {
  const { instance } = useContext(LivelinkContext);
  const [entities, setEntities] = useState<EntityWithParentId[]>([]);
  const [entitiesMap, setEntitiesMap] = useState<Map<string, EntityWithParentId>>(new Map());

  useEffect(() => {
    const fetchEntities = async () => {
      if (!instance) {
        console.warn("⛔ instance Livelink non disponible");
        return;
      }

      console.log("🔍 fetchEntities lancé…");

      try {
        const foundEntities = await instance.scene.findEntitiesWithComponents({
          mandatory_components: ["local_transform"],
          forbidden_components: [],
        });

        console.log(`📦 ${foundEntities.length} entités récupérées depuis la scène`);

        const filtered = foundEntities.filter(
          (entity) => typeof entity.name === "string" && /^part_\d+$/.test(entity.name)
        );

        console.log(`🧽 ${filtered.length} entités filtrées avec le pattern /part_\\d+/`);

        const enriched: EntityWithParentId[] = filtered.map((entity) => {
          (entity as EntityWithParentId).__parentId = entity.parent?.id ?? null;
          return entity as EntityWithParentId;
        });

        enriched.sort((a, b) => {
          const numA = parseInt(a.name!.split("_")[1], 10);
          const numB = parseInt(b.name!.split("_")[1], 10);
          return numA - numB;
        });

        console.log("Entités triées et enrichies :", enriched.map((e) => e.name));

        setEntities(enriched);
        setEntitiesMap(new Map(enriched.map((e) => [e.name!, e])));

        console.log(`✅ Chargé ${enriched.length} entités dans entitiesMap`);
      } catch (err) {
        console.error("❌ Erreur chargement des entités part_x :", err);
      }
    };

    fetchEntities();
  }, [instance]);

  return (
    <PartEntitiesContext.Provider value={{ entities, entitiesMap }}>
      {children}
    </PartEntitiesContext.Provider>
  );
}
