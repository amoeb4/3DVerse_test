from cnc_client import create_stub

def main():
    stub, cnc_pb2 = create_stub(host="localhost", port=50051)

    try:
        # Lire la valeur de l'axe 1
        request = cnc_pb2.ReadRequest(node_id="ns=2;s=Axis1.Position")
        response = stub.ReadVariable(request)
        print("Valeur lue:", response.value)
    except Exception as e:
        print("Erreur lors de la lecture:", e)

if __name__ == "__main__":
    main()

