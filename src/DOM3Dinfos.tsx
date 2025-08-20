import { DOM3DOverlay, DOM3DElement } from "@3dverse/livelink-react";

export default function Dom3DInfos() {
  return (
    <DOM3DOverlay>
      <DOM3DElement worldPosition={[-1.7, 0.6, 0]} scaleFactor={0.0016}>
        <p className="bg-underground p-4 rounded-lg text-white">
          Base<br />Axe Z
        </p>
      </DOM3DElement>

      <DOM3DElement worldPosition={[-0.3, 0.8, 0]} scaleFactor={0.0016}>
        <p className="bg-underground p-4 rounded-lg text-white">
          Epaule<br />Axe X
        </p>
      </DOM3DElement>

      <DOM3DElement worldPosition={[-1.20, 1.69, 0]} scaleFactor={0.0016}>
        <p className="bg-underground p-4 rounded-lg text-white">
          Coude 1<br />Axe Z
        </p>
      </DOM3DElement>

      <DOM3DElement worldPosition={[-0.6, 2.28, 0.1]} scaleFactor={0.0016}>
        <p className="bg-underground p-4 rounded-lg text-white">
          Bras<br />Axe Z
        </p>
      </DOM3DElement>

      <DOM3DElement worldPosition={[0.4, 2.25, 0.1]} scaleFactor={0.0016}>
        <p className="bg-underground p-4 rounded-lg text-white">
          Coude 2<br />Axe Z
        </p>
      </DOM3DElement>

      <DOM3DElement worldPosition={[0.6, 1.65, 0.1]} scaleFactor={0.0016}>
        <p className="bg-underground p-4 rounded-lg text-white">
          Coude 3<br />Axe X
        </p>
      </DOM3DElement>

      <DOM3DElement worldPosition={[1.6, 0.7, 0]} scaleFactor={0.0019}>
        <p className="bg-underground p-4 rounded-lg text-white">
          Impression pièce<br />x%
        </p>
      </DOM3DElement>
    </DOM3DOverlay>
  );
}