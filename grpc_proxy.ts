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
  "192.168.100.139:50051",
  grpc.credentials.createInsecure()
);
if (!client) console.error("Ya pas Weshh");
function parsePart1FromResponse(response: any): { name: string; location: number[] } | null {
  if (!response?.values || !Array.isArray(response.values)) return null;

  const target = response.values[5]?.float_value ?? null;
  if (target === null || isNaN(target)) return null;

  return {
    name: "part_1",
    location: [0, 0, target],
  };
}

const ws = new WebSocket("ws://localhost:8767");
ws.on("open", () => {
  console.log("🔗 Connected to WebSocket server");
});
function query_rpc_server() {
  client.ReadData({}, (err: any, response: any) => {
    if (err) {
      console.error("❌ gRPC ReadData error:", err);
    } else {
      console.log("✅ ReadData response:", response);
      const msg = parsePart1FromResponse(response);
      if (msg && ws.readyState === WebSocket.OPEN) {
       if (msg.location.every((v) => v === 0)) {
          console.log("⏩ Location == [0,0,0], rien envoyé");
        } else {
          ws.send(JSON.stringify(msg));
          console.log("📨 Sent:", msg);
        }
      }
    }""
    setTimeout(query_rpc_server, 1000);
  });
}

query_rpc_server();