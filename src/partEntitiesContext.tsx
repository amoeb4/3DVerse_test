import { createContext, useContext, useEffect, useState } from "react";
import { LivelinkContext } from "@3dverse/livelink-react";
import { Entity } from "@3dverse/livelink";
import type { Vec3, Quat } from "@3dverse/livelink.core";
import { debugEntityTransform } from "./debugTools";
import * as THREE from 'three';
//import { OneFactor, StereoCamera } from "three";
//import { add } from "three/tsl";
//import { GPU_CHUNK_BYTES } from "three/src/renderers/common/Constants.js";
import { mat4, quat, vec3 } from 'gl-matrix';
import { WrenchScrewdriverIcon } from "@heroicons/react/20/solid";
import { eulerToQuat } from "./Interface";

export type EntityWithParentId = Entity & {
  __parentId: string | null;
  ls_to_ws_local?: mat4;
  localPos: vec3;
  localRot: quat;
  ls_to_ws: mat4;
  worldPos?: vec3;
  worldRot?: quat;
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


/// >>> Add mod movehierarchy : command = [name], [mod], [x], [y], [z];


//export async function moveHierarchy(
//  rootName: string,
//  delta: [number, number, number],
//  entitiesMap: Map<string, EntityWithParentId>
//) {
//  const entities = [...entitiesMap.values()];
//  const rootEntity = entities.find((e) => e.name === rootName);
//
//  if (!rootEntity) {
//    console.warn(`❌ Entité ${rootName} non trouvée`);
//    return;}
//
//  const deltaLocalVec = vec3.fromValues(...delta);
//  const rootRotationMatrix = getRotationMatrix(mat4.clone(rootEntity.ls_to_ws as mat4));
//  const deltaGlobal = vec3.transformMat4(vec3.create(), deltaLocalVec, rootRotationMatrix);
//
//  for (const entity of entities)
//  {
//    // Adapter ce delta à l’orientation locale de l’entité pour conserver sa direction propre
//    const entityRotationMatrix = getRotationMatrix(mat4.clone(entity.ws_to_ls as mat4));
//    const adjustedDelta = vec3.transformMat4(vec3.create(), deltaGlobal, entityRotationMatrix);
//
//    const newGlobalMatrix = mat4.clone(entity.ls_to_ws as mat4);
//    mat4.translate(newGlobalMatrix, newGlobalMatrix, adjustedDelta);
//
//    const parent_ws_to_ls = entity.parent?.ws_to_ls ? mat4.clone(entity.parent.ws_to_ls as mat4) : mat4.create();
//    const newLocalMatrix = mat4.multiply(mat4.create(), parent_ws_to_ls, newGlobalMatrix);
//    applyMatrixToEntity(entity, newLocalMatrix);
//    console.log(`➡️ Déplacé ${entity.name} avec delta ajusté ${adjustedDelta}`);
//  }
//  console.log(`✅ Déplacement hiérarchique terminé depuis ${rootName}`);
//}
//





export function rotateHierarchy(
  rootName: string,
  deltaDeg: [number, number, number],
  entitiesMap: Map<string, EntityWithParentId>
) {
  const entities = [...entitiesMap.values()];
  const root = entities.find((e) => e.name === rootName);
  if (!root) return console.warn(`${rootName} introuvable`);

  const deltaRad = deltaDeg.map((d) => (d * Math.PI) / 180);

  const rootMatrix = new THREE.Matrix4().fromArray([...root.ls_to_ws]);
  const obj = new THREE.Object3D();
  obj.applyMatrix4(rootMatrix);
  obj.updateMatrixWorld(true);

  obj.rotateX(deltaRad[0]);
  obj.rotateY(deltaRad[1]);
  obj.rotateZ(deltaRad[2]);

  obj.updateMatrixWorld(true);
  const newMatrix = obj.matrixWorld.clone();

  applyRotationToEntity(root, [...newMatrix.elements]);
  console.log(`🔁 Rotation appliquée à ${root.name}`);

  propagate(root, entities);
}



export function applyRotationToEntity(entity: Entity, matrix: mat4) {
  const rotation = quat.create();
  mat4.getRotation(rotation, matrix);
  const orientation: Quat = Array.from(rotation) as Quat;
  entity.local_transform = {
    orientation,
  };
}


function propagate(
  parent: EntityWithParentId,
  allEntities: EntityWithParentId[]
) {
  const parentIndex = allEntities.findIndex((e) => e.name === parent.name);
  const child = allEntities[parentIndex + 1];
  if (!child) return console.log(`🛑 Aucun enfant trouvé pour ${parent.name}`);

  const originalParentMatrix = new THREE.Matrix4().fromArray([...parent.ls_to_ws]);
  const originalChildMatrix = new THREE.Matrix4().fromArray([...child.ls_to_ws]);

  const relativeMatrix = new THREE.Matrix4()
    .copy(originalParentMatrix)
    .invert()
    .multiply(originalChildMatrix);

  const updateMatrixfromChildren = new THREE.Matrix4().fromArray([...PartEntitiesContext.parents.ls_to_ws]);
  const updatedParentMatrix = new THREE.Matrix4().fromArray([...parent.ls_to_ws]);

  const newGlobalMatrix = new THREE.Matrix4().multiplyMatrices(updatedParentMatrix, relativeMatrix);

  const pos = new THREE.Vector3();
  const rot = new THREE.Quaternion();
  const scale = new THREE.Vector3();
  newGlobalMatrix.decompose(pos, rot, scale);

  child.local_transform = {
    position: [pos.x, pos.y, pos.z],
    orientation: [rot.x, rot.y, rot.z, rot.w],
  };

  console.log(
    `✅ ${child.name} mis à jour → pos: (${pos.x.toFixed(3)}, ${pos.y.toFixed(3)}, ${pos.z.toFixed(3)})`
  );
}