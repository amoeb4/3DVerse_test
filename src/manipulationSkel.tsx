// import { setOrientation } from "./keyBindings";
import { getDescendants } from "./partEntitiesContext";
import type { Entity } from "@3dverse/livelink";
import { posKey, oriKey } from "./keyBindings";
import { eulerToQuat } from "./Interface";

//function getPart() {
//  const { entitiesMap } = usePartEntities();
//
//  const part7 = entitiesMap.get("part_7");
//
//  return <div>{part7?.id}</div>;
//}
//
//export async function move(entity)
//{
//
//    setOrientation(entity.entity_uuid, )
//}

export async function moveEntityAndChildren(
  rootName: string,
  delta: [number, number, number],
  entitiesMap: Map<string, Entity>,
  instance: any
) {
  const root = [...entitiesMap.values()].find((e) => e.name === rootName);
  if (!root) {
    console.warn(`❌ Entité ${rootName} non trouvée`);
    return;
  }
  const descendants = await getDescendants(root, entitiesMap);
  const allToMove = [root, ...descendants];
  const entityList = allToMove.map((e) => ({ id: e.id }));
  try {
    await posKey(instance, entityList, ...delta);
    await oriKey(instance, entityList, 0, 0, 0, eulerToQuat);
    console.log(`✅ Déplacement + orientation appliqués à ${entityList.length} entités`);
  } catch (err) {
    console.error("❌ Erreur lors du déplacement avec posKey / oriKey :", err);
  }
}