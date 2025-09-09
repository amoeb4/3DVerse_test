// opcua-client.ts
import {
  OPCUAClient,
  MessageSecurityMode,
  SecurityPolicy,
  AttributeIds,
  TimestampsToReturn,
  ReadValueIdOptions,
} from "node-opcua";
import WebSocket from "ws";

// 1️⃣ Mapping OPC-UA joint → entité 3Dverse
const jointToPartMap: Record<string, string> = {
  A1: "part_1",
  A2: "part_2",
  A3: "part_3",
  A4: "part_4",
  A5: "part_5",
  A6: "part_6",
};

async function main() {
  try {
    // 2️⃣ Connexion WebSocket vers ton bridge/jumeau numérique
    const ws = new WebSocket("ws://localhost:8767");
    ws.on("open", () => console.log("✅ Connected to WebSocket bridge"));

    // 3️⃣ Création du client OPC-UA
    const client = OPCUAClient.create({
      endpointMustExist: false,
      securityMode: MessageSecurityMode.None,
      securityPolicy: SecurityPolicy.None,
    });

    const endpointUrl = "opc.tcp://localhost:4840/UA/Robot6Axes";
    await client.connect(endpointUrl);
    console.log("✅ Connected to OPC-UA server");

    const session = await client.createSession();
    console.log("✅ Session created");

    // 4️⃣ Subscription globale
    const subscription = await session.createSubscription2({
      requestedPublishingInterval: 500,
      requestedLifetimeCount: 100,
      requestedMaxKeepAliveCount: 10,
      maxNotificationsPerPublish: 10,
      publishingEnabled: true,
      priority: 10,
    });

    // 5️⃣ Surveiller chaque joint
    for (const joint of Object.keys(jointToPartMap)) {
      const nodeId = `ns=1;s=${joint}`;
      const itemToMonitor: ReadValueIdOptions = {
        nodeId,
        attributeId: AttributeIds.Value,
      };

      const monitoredItem = await subscription.monitor(
        itemToMonitor,
        { samplingInterval: 100, discardOldest: true, queueSize: 10 },
        TimestampsToReturn.Both
      );

      monitoredItem.on("changed", (value) => {
        const angleDeg = value.value.value;
        const entity = jointToPartMap[joint];

        console.log(`🔄 ${joint} -> ${entity} = ${angleDeg.toFixed(2)}°`);

        if (ws.readyState === WebSocket.OPEN) {
          ws.send(
            JSON.stringify({
              entity,
              rotation: {
                axis: "z",
                angleDeg,
              },
            })
          );
        }
      });
    }

    process.on("SIGINT", async () => {
      console.log("\n🛑 Closing session...");
      await subscription.terminate();
      await session.close();
      await client.disconnect();
      console.log("✅ Disconnected cleanly");
      process.exit(0);
    });
  } catch (err) {
    console.error("❌ Error:", err);
  }
}

main();