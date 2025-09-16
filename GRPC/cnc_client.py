import grpc
import cnc_pb2, cnc_pb2_grpc

def create_stub(host="localhost", port=50051):
    channel = grpc.insecure_channel(f"{host}:{port}")
    stub = cnc_pb2_grpc.CNCServiceStub(channel)
    return stub, cnc_pb2

