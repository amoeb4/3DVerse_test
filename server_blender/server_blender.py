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
                location = data.get("location")

                if name and location:
                    obj = bpy.data.objects.get(name)
                    if obj:
                        print(f">>> Objet trouvé : {obj.name}, position actuelle : {obj.location}")
                        obj.location = location
                        print(f">>> Position mise à jour vers : {obj.location}")
                    else:
                        print(f">>> Objet '{name}' introuvable dans la scène")
                else:
                    print(">>> JSON incomplet : champs 'name' ou 'location' manquant")
            except Exception as e:
                print(f">>> Erreur dans le traitement du message : {e}")
    except Exception as e:
        print(f">>> Erreur dans la connexion WebSocket : {e}")

async def main():
    print(">>> Coroutine principale démarrée")
    async with websockets.serve(handler, "localhost", 8767):
        print(">>> Serveur WebSocket prêt sur ws://localhost:8767")
        await asyncio.Future()  # boucle infinie

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
