import grpc
from concurrent import futures
import cnc_pb2, cnc_pb2_grpc

class CNCServiceServicer(cnc_pb2_grpc.CNCServiceServicer):
    def ReadVariable(self, request, context):
        # Retourne une valeur fictive
        return cnc_pb2.ReadResponse(value="123.45")

    def WriteVariable(self, request, context):
        # Accepte toujours l'écriture
        return cnc_pb2.WriteResponse(success=True)

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    cnc_pb2_grpc.add_CNCServiceServicer_to_server(CNCServiceServicer(), server)
    server.add_insecure_port('[::]:50051')
    server.start()
    print("Serveur gRPC mock lancé sur le port 50051")
    server.wait_for_termination()

if __name__ == "__main__":
    serve()

