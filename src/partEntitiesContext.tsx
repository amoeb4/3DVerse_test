import { createContext, useContext, useEffect, useState } from "react";
import { LivelinkContext } from "@3dverse/livelink-react";
import { Entity } from "@3dverse/livelink";
import { mat4, vec3, quat } from "gl-matrix";
import type { Vec3, Quat } from "@3dverse/livelink.core";
import { debugEntityTransform } from "./debugTools";
//import { OneFactor, StereoCamera } from "three";
//import { add } from "three/tsl";
//import { GPU_CHUNK_BYTES } from "three/src/renderers/common/Constants.js";

export type EntityWithParentId = Entity & {
  __parentId: string | null;
  ls_to_ws_local?: mat4;
};

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

  mat4.getTranslation(translation, matrix);
  mat4.getRotation(rotation, matrix);

  const position: Vec3 = Array.from(translation) as Vec3;
  const orientation: Quat = Array.from(rotation) as Quat;
  const eulerOrientation: Vec3 = quaternionToEuler(orientation);

  entity.local_transform = {
    position,
    orientation,
    eulerOrientation,
  };
}

function getRotationMatrix(matrix: mat4): mat4 {
  const rot = mat4.clone(matrix as mat4);
  rot[12] = 0;
  rot[13] = 0;
  rot[14] = 0;
  return rot;
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





export async function rotateHierarchy(
  rootName: string,
  delta: [number, number, number], // en radians
  entitiesMap: Map<string, EntityWithParentId>
) {
  const entities = [...entitiesMap.values()];
  const rootIndex = entities.findIndex((e) => e.name === rootName);

  if (rootIndex === -1) {
    console.warn(`❌ Entité ${rootName} non trouvée`);
    return;
  }

  console.log('📦 Application de rotation à toutes les entités à partir de :', rootName);

  const rootEntity = entities[rootIndex];

  // 1. Calcul du quaternion delta à partir des angles en radians
  const deltaQuat = quat.create();
  quat.fromEuler(
    deltaQuat,
    (delta[0] * 180) / Math.PI,
    (delta[1] * 180) / Math.PI,
    (delta[2] * 180) / Math.PI
  );

  // 2. Extraire la rotation monde de la racine (en ignorant la translation)
  const rootRotMatrix = mat4.clone(rootEntity.ls_to_ws as mat4);
  rootRotMatrix[12] = 0;
  rootRotMatrix[13] = 0;
  rootRotMatrix[14] = 0;

  const rootRotQuat = quat.create();
  mat4.getRotation(rootRotQuat, rootRotMatrix);

  // 3. Calculer la rotation delta exprimée dans le repère monde
  const deltaWorldQuat = quat.create();
  quat.mul(deltaWorldQuat, rootRotQuat, deltaQuat);

  // 4. Appliquer la rotation à la hiérarchie linéaire
for (let i = rootIndex; i < entities.length; i++) {
  const entity = entities[i];

  debugEntityTransform(entity, 'Avant');

  // Position locale de l'entité par rapport au parent
  const pos_local = vec3.create();
  if (entity.parent) {
    mat4.getTranslation(pos_local, entity.ls_to_ws as mat4);
    // mais pour position locale correcte, il faut la calculer via ws_to_ls inverse du parent
    const parent_ws_to_ls = entity.parent.ws_to_ls as mat4;
    vec3.transformMat4(pos_local, pos_local, parent_ws_to_ls);
  } else {
    // si pas de parent, position locale = position monde
    mat4.getTranslation(pos_local, entity.ls_to_ws as mat4);
  }

  // Nouvelle rotation mondiale
  const currentRot = quat.create();
  mat4.getRotation(currentRot, entity.ls_to_ws as mat4);
  const newRot = quat.create();
  quat.mul(newRot, deltaWorldQuat, currentRot);

  // Appliquer la rotation delta à la position locale (seulement si pas root)
  if (i > rootIndex) {
    vec3.transformQuat(pos_local, pos_local, deltaWorldQuat);
  }

  // Calculer la nouvelle matrice monde à partir de la nouvelle rotation + position locale modifiée
  let newGlobalMatrix: mat4;

  if (entity.parent) {
    // Position monde = rotation monde du parent * position locale + translation parent
    const parent_ls_to_ws = entity.parent.ls_to_ws as mat4;
    newGlobalMatrix = mat4.create();
    mat4.fromRotationTranslation(newGlobalMatrix, newRot, [0, 0, 0]); // rotation sans translation pour l'instant

    // Transformer position locale par la transformation parent (rotation + translation)
    const pos_world = vec3.create();
    vec3.transformMat4(pos_world, pos_local, parent_ls_to_ws);

    // Mettre la translation dans la matrice
    newGlobalMatrix[12] = pos_world[0];
    newGlobalMatrix[13] = pos_world[1];
    newGlobalMatrix[14] = pos_world[2];

  } else {
    // Pour la racine, pas de parent
    newGlobalMatrix = mat4.fromRotationTranslation(mat4.create(), newRot, pos_local);
  }

  // Calcul de la matrice locale (par rapport au parent)
  const parent_ws_to_ls = entity.parent?.ws_to_ls
    ? mat4.clone(entity.parent.ws_to_ls as mat4)
    : mat4.create();

  const newLocalMatrix = mat4.multiply(mat4.create(), parent_ws_to_ls, newGlobalMatrix);

  applyMatrixToEntity(entity, newLocalMatrix);

  debugEntityTransform(entity, 'Après');
  console.log(`🔁 Tourné ${entity.name}`);
}

  console.log(`✅ Rotation appliquée à tous les éléments depuis ${rootName}`);
}







/// >>> Add mod movehierarchy : command = [name], [mod], [x], [y], [z];


export async function moveHierarchy(
  rootName: string,
  delta: [number, number, number],
  entitiesMap: Map<string, EntityWithParentId>
) {
  const entities = [...entitiesMap.values()];
  const rootEntity = entities.find((e) => e.name === rootName);

  if (!rootEntity) {
    console.warn(`❌ Entité ${rootName} non trouvée`);
    return;}

  const deltaLocalVec = vec3.fromValues(...delta);
  const rootRotationMatrix = getRotationMatrix(mat4.clone(rootEntity.ls_to_ws as mat4));
  const deltaGlobal = vec3.transformMat4(vec3.create(), deltaLocalVec, rootRotationMatrix);

  for (const entity of entities)
  {
    // Adapter ce delta à l’orientation locale de l’entité pour conserver sa direction propre
    const entityRotationMatrix = getRotationMatrix(mat4.clone(entity.ws_to_ls as mat4));
    const adjustedDelta = vec3.transformMat4(vec3.create(), deltaGlobal, entityRotationMatrix);

    const newGlobalMatrix = mat4.clone(entity.ls_to_ws as mat4);
    mat4.translate(newGlobalMatrix, newGlobalMatrix, adjustedDelta);

    const parent_ws_to_ls = entity.parent?.ws_to_ls ? mat4.clone(entity.parent.ws_to_ls as mat4) : mat4.create();
    const newLocalMatrix = mat4.multiply(mat4.create(), parent_ws_to_ls, newGlobalMatrix);
    applyMatrixToEntity(entity, newLocalMatrix);
    console.log(`➡️ Déplacé ${entity.name} avec delta ajusté ${adjustedDelta}`);
  }
  console.log(`✅ Déplacement hiérarchique terminé depuis ${rootName}`);
}