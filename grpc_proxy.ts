import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import { fileURLToPath } from "url";
import { dirname } from "path";

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

// ✅ Service correct
const CLMService: any = protoDescriptor.CLMService;

// ✅ Client correct
const client = new CLMService("127.0.0.1:50051", grpc.credentials.createInsecure());

// Exemple d’appel
function query_rpc_server() {
  client.ReadData({}, (err: any, response: any) => {
    if (err) {
      console.error("❌ gRPC ReadData error:", err);
    } else {
      console.log("✅ ReadData response:", response);
    }
    setTimeout(query_rpc_server, 1000);
  });
}
query_rpc_server();
