import bpy
import asyncio
import threading
import websockets
import json

print(">>> Script WebSocket lancé")

async def handler(websocket):
    print(">>> Nouveau client connecté")
    try:
        async for message in websocket:
            print(f">>> Message reçu : {message}")
            try:
                data = json.loads(message)
                print(f">>> JSON décodé : {data}")
                name = data.get("name")
                if "location" in data:
                    location = data["location"]
                    obj = bpy.data.objects.get(name)
                    if obj:
                        print(f">>> Déplacement de '{name}' à {location}")
                        obj.location = location
                    else:
                        print(f">>> Objet '{name}' introuvable")

                elif "increment" in data:
                    delta = data["increment"]
                    obj = bpy.data.objects.get(name)
                    if obj:
                        print(f">>> Incrémentation de '{name}' de {delta}")
                        obj.location.x += delta[0]
                        obj.location.y += delta[1]
                        obj.location.z += delta[2]
                    else:
                        print(f">>> Objet '{name}' introuvable")
                elif "rotation" in data:
                    rot = data["rotation"]
                    obj = bpy.data.objects.get(name)
                    if obj:
                        print(f">>> Rotation de '{name}' vers {rot}")
                        obj.rotation_euler = rot
                    else:
                        print(f">>> Objet '{name}' introuvable")
                else:
                    print(">>> Données non reconnues :", data)
            except Exception as e:
                print(f">>> Erreur dans le traitement du message : {e}")
    except Exception as e:
        print(f">>> Erreur dans la connexion WebSocket : {e}")

async def main():
    print(">>> Coroutine principale démarrée")
    async with websockets.serve(
        handler,
        "localhost",
        8767,
        ping_interval=None
    ):
        print(">>> Serveur WebSocket prêt sur ws://localhost:8767")
        await asyncio.Future()
def start_server():
    print(">>> Initialisation serveur WebSocket")
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        loop.run_until_complete(main())
    except Exception as e:
        print(f">>> Erreur lors du lancement du serveur : {e}")
    finally:
        loop.close()
if "ws_server_thread" not in globals():
    ws_server_thread = threading.Thread(target=start_server, daemon=True)
    ws_server_thread.start()
    print(">>> Thread serveur WebSocket lancé.")
else:
    print(">>> Serveur déjà en cours d'exécution.")

