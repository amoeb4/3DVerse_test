// grpcClient.ts
import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import { fileURLToPath } from "url";
import { dirname } from "path";
import WebSocket from "ws";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROTO_PATH = __dirname + "/cnc.proto";

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const CLMService: any = protoDescriptor.CLMService;

const client = new CLMService(
  "localhost:50051",
  grpc.credentials.createInsecure()
);

// --- 🔧 Parseur ---
type ParsedLocation = {
  name: string;
  location: [number, number, number, number];
};

function parseReadDataResponse(
  response: any,
  name = "part_1"
): ParsedLocation | null {
  if (!response?.values || !Array.isArray(response.values)) return null;
  const floats = response.values
    .map((v: any) => v.float_value ?? null)
    .filter((v: number | null) => v !== null);
  if (floats.length < 3) return null;

  const [x, y, z, w = 0] = floats;

  return {
    name,
    location: [x, y, z, w],
  };
}

const ws = new WebSocket("ws://localhost:8767");
ws.on("open", () => {
  console.log("🔗 Connected to WebSocket server");
});
// --- 🔄 Boucle de polling ---
function query_rpc_server() {
  client.ReadData({}, (err: any, response: any) => {
    if (err) {
      console.error("❌ gRPC ReadData error:", err);
    } else {
      console.log("✅ ReadData response:", response);

      const parsed = parseReadDataResponse(response, "part_1");
      if (parsed && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(parsed));
        // 🔄 Alternative "legacy"
        // ws.send(`${parsed.name} ${parsed.location.join(" ")}`);
      }
    }
    setTimeout(query_rpc_server, 1000);
  });
}

query_rpc_server();