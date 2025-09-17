import grpc from "@grpc/grpc-js"
import protoloader from "@grpc/proto-loader"
var PROTO_PATH = "./cnc.proto";

var packageDefinition = protoloader.loadSync(
    PROTO_PATH,
    {keepCase: true,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true
    });

var protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
// The protoDescriptor object has the full package hierarchy

var CNCService : any = protoDescriptor.CNCService;

var client = new CNCService('localhost:50051', grpc.credentials.createInsecure());

function onResponse(arg1,response){
    console.log("GRPC request response : ", arg1, response);
    setTimeout(query_rpc_server, 1000);
}

function query_rpc_server()
{
    var request = client.ReadVariable({node_id : "ns=2;s=Axis1.Position",
                         node_id2 : "ns=2;s=Axis1.Position",
                         node_id3 : "ns=2;s=Axis1.Position"}, onResponse);
    console.log("Desktop");
}

query_rpc_server();