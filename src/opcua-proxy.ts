import { OPCUAClient, AttributeIds, TimestampsToReturn } from "node-opcua";
import WebSocket from "ws";

const ws = new WebSocket("ws://localhost:8767");
const endpointUrl = "opc.tcp://localhost:4840/UA/My3DServer";

async function run() {
  const client = OPCUAClient.create({ endpointMustExist: false });
  await client.connect(endpointUrl);
  const session = await client.createSession();
  console.log("✅ Connected to OPC-UA server");
  // Create subscription
  const sub = await session.createSubscription2({
    requestedPublishingInterval: 500,
    requestedMaxKeepAliveCount: 20,
    requestedLifetimeCount: 60,
    maxNotificationsPerPublish: 10,
    publishingEnabled: true,
    priority: 10,
  });
  // Monitor SelectedEntity
  const monitoredItem = await sub.monitor(
    {
      nodeId: "ns=1;s=3Dverse.SelectedEntity",
      attributeId: AttributeIds.Value,
    },
    {
      samplingInterval: 200,
      queueSize: 1,
      discardOldest: true,
    },
    TimestampsToReturn.Both
  );
  monitoredItem.on("changed", (dataValue) => {
    console.log("🎯 Selected entity changed via OPC-UA:", dataValue.value.value);
    ws.send(JSON.stringify({ select: dataValue.value.value }));
  });
}

run();