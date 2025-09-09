import { useEffect, useState } from "react";
import { DOM3DOverlay, DOM3DElement, DOMEntity, useEntity } from "@3dverse/livelink-react";
import { vec3, mat4 } from "gl-matrix";
import type { EntityWithParentId } from "./partEntitiesContext";

interface Dom3DInfosProps {
  entitiesMap?: Map<string, EntityWithParentId>;
}

export default function Dom3DInfos({ entitiesMap }: Dom3DInfosProps) {
  const { entity: part_1 } = useEntity({ euid: "3bd3e72c-3082-466d-af8b-b477735d6c68" });
  const { entity: part_2 } = useEntity({ euid: "ecf78ebe-0ca1-4bb4-98ce-49222bd745b2" });
  const { entity: part_3 } = useEntity({ euid: "2ff894de-d51d-4b28-8794-31cf16bbb957" });
  const { entity: part_4 } = useEntity({ euid: "c5dd1b61-85d4-471d-a460-b35301f319f1" });
  const { entity: part_5 } = useEntity({ euid: "a6721617-08ec-4bef-911e-35baee70fa7d" });
  const { entity: part_6 } = useEntity({ euid: "f5215d69-b99d-4890-859d-409051d8295d" });
  const { entity: part_7 } = useEntity({ euid: "7a97a4b6-62e7-4adf-89a8-6c700a917e88" });
  const { entity: part_8 } = useEntity({ euid: "bca1e55e-0191-4011-a9be-b7aae005277a" });

  return (
    <DOM3DOverlay>
      {(
        <DOMEntity entity={part_1} anchor="right-bottom" scaleFactor={0.0014}>
          <p className="bg-underground p-4 rounded-lg text-white">Base<br />Axe Z</p>
        </DOMEntity>
      )}

      {(
        <DOMEntity entity={part_2} anchor="left-bottom"scaleFactor={0.0014}>
          <p className="bg-underground p-4 rounded-lg text-white">Epaule<br />Axe X</p>
        </DOMEntity>
      )}

      {(
        <DOMEntity entity={part_3} anchor="right-bottom" scaleFactor={0.0014}>
          <p className="bg-underground p-4 rounded-lg text-white">Coude 1<br />Axe Z</p>
        </DOMEntity>
      )}

      {(
        <DOMEntity entity={part_4} anchor="left-bottom" scaleFactor={0.0014}>
          <p className="bg-underground p-4 rounded-lg text-white">Bras<br />Axe Z</p>
        </DOMEntity>
      )}

      {(
        <DOMEntity entity={part_5} anchor="right-bottom" scaleFactor={0.0014}>
          <p className="bg-underground p-4 rounded-lg text-white">Coude 2<br />Axe Z</p>
        </DOMEntity>
      )}

      {(
        <DOMEntity entity={part_6} anchor="right-top" scaleFactor={0.0014}>
          <p className="bg-underground p-4 rounded-lg text-white">Coude 3<br />Axe X</p>
        </DOMEntity>
      )}

      {(
        <DOMEntity entity={part_7} anchor="right-top" scaleFactor={0.0014}>
          <p className="bg-underground p-4 rounded-lg text-white">Vireur<br />Axe X</p>
        </DOMEntity>
      )}

      {(
        <DOMEntity entity={part_8} anchor="right-top" scaleFactor={0.0014}>
          <p className="bg-underground p-4 rounded-lg text-white">Plateau<br />Axe X</p>
        </DOMEntity>
      )}
    </DOM3DOverlay>
  );
}