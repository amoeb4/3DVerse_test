import { usePartEntities } from "./partEntitiesContext";

function getPart() {
  const { entitiesMap } = usePartEntities();

  const part7 = entitiesMap.get("part_7");

  return <div>{part7?.id}</div>;
}

export async function move(entity_uuid)
{
    se
}