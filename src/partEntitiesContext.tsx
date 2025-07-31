import { createContext, useContext, useEffect, useState } from "react";
import { LivelinkContext } from "@3dverse/livelink-react";
import { Entity } from "@3dverse/livelink";
import type { Vec3, Quat } from "@3dverse/livelink.core";
import { debugEntityTransform } from "./debugTools";
//import { OneFactor, StereoCamera } from "three";
//import { add } from "three/tsl";
//import { GPU_CHUNK_BYTES } from "three/src/renderers/common/Constants.js";

export type EntityWithParentId = Entity & {
  __parentId: string | null;
  ls_to_ws_local?: mat4;
  localPos: vec3; // position locale par rapport au parent
  localRot: quat; // rotation locale par rapport au parent
  ls_to_ws: mat4;
  worldPos?: vec3;  // <- ajoute ça
  worldRot?: quat;  // <- ajoute ça
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

import { mat4, quat, vec3 } from 'gl-matrix';

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

  // Fonction pour calculer les transforms locales (pos + rot) par rapport au parent, si non déjà calculées
  function computeLocalTransforms() {
    for (const entity of entities) {
      if (!entity.parent) {
        // Racine : local = global
        entity.localPos = vec3.create();
        mat4.getTranslation(entity.localPos, entity.ls_to_ws);
        entity.localRot = quat.create();
        mat4.getRotation(entity.localRot, entity.ls_to_ws);
      } else {
        // Local = inverse(parent global) * global
        const parentInv = mat4.invert(mat4.create(), entity.parent.ls_to_ws);
        if (!parentInv) {
          console.warn(`❌ Impossible d'inverser la matrice parent de ${entity.name}`);
          continue;
        }
        const localMat = mat4.multiply(mat4.create(), parentInv, entity.ls_to_ws);
        entity.localPos = vec3.create();
        mat4.getTranslation(entity.localPos, localMat);
        entity.localRot = quat.create();
        mat4.getRotation(entity.localRot, localMat);
      }
    }
  }

function updateGlobalMatrices(
  entity: EntityWithParentId,
  entities: EntityWithParentId[]
) {
  // Calcul matrice locale
  const localMat = mat4.fromRotationTranslation(mat4.create(), entity.localRot, entity.localPos);

  let globalMat: mat4;
  if (entity.parent) {
    globalMat = mat4.multiply(mat4.create(), entity.parent.ls_to_ws, localMat);
  } else {
    globalMat = localMat;
  }

  // Extraction position et rotation globale
  const worldPos = vec3.create();
  mat4.getTranslation(worldPos, globalMat);

  const worldRot = quat.create();
  mat4.getRotation(worldRot, globalMat);

  // Stockage custom
  entity.worldPos = worldPos;
  entity.worldRot = worldRot;

  // Trouver tous les enfants (entities dont parent === entity)
  const children = entities.filter(e => e.parent === entity);

  for (const child of children) {
    updateGlobalMatrices(child, entities);
  }
}



  // Calcul initial des transforms locales
  computeLocalTransforms();

  const rootEntity = entities[rootIndex];

  // Appliquer delta rotation sur la rotation locale de la racine
  const deltaQuat = quat.create();
  quat.fromEuler(
    deltaQuat,
    (delta[0] * 180) / Math.PI,
    (delta[1] * 180) / Math.PI,
    (delta[2] * 180) / Math.PI
  );

  quat.mul(rootEntity.localRot, rootEntity.localRot, deltaQuat);

  // Mise à jour des matrices globales à partir de la racine
  updateGlobalMatrices(rootEntity, entities);


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