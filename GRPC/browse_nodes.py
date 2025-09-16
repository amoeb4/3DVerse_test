from opcua import Client

OPC_UA_ENDPOINT = "opc.tcp://192.168.0.100:4840"

def browse_nodes(node, depth=0, max_depth=3):
    try:
        children = node.get_children()
    except Exception as e:
        print(" " * depth * 2, f"[ERROR] {e}")
        return

    for child in children:
        try:
            display_name = child.get_display_name().Text
            node_id = child.nodeid.to_string()
            value = None
            try:
                value = child.get_value()
            except:
                pass  # Certaines nodes ne sont pas lisibles
            print(" " * depth * 2, f"{display_name} | {node_id} | {value}")
        except Exception as e:
            print(" " * depth * 2, f"[ERROR] {e}")

        if depth < max_depth:
            browse_nodes(child, depth + 1, max_depth)

def main():
    client = Client(OPC_UA_ENDPOINT)
    try:
        client.connect()
        root = client.get_root_node()
        print("Exploration de l'arborescence OPC UA :")
        browse_nodes(root, depth=0, max_depth=3)
    except Exception as e:
        print(f"[ERROR] Connexion OPC UA: {e}")
    finally:
        client.disconnect()

if __name__ == "__main__":
    main()

