import bpy
import asyncio
import threading
import websockets
import json

print(">>> Script WebSocket lancé")

async def smooth_increment(obj, prop, target, sleep_ms=50):
    current = getattr(obj, prop).copy()
    steps = 10
    delta = [(t - c) / steps for c, t in zip(current, target)]

    for i in range(steps):
        for j in range(3):
            current[j] += delta[j]
        setattr(obj, prop, current)
        await asyncio.sleep(sleep_ms / 1000)

    setattr(obj, prop, target)

async def handler(websocket):
    print(">>> Nouveau client connecté")
    try:
        async for message in websocket:
            print(f">>> Message reçu : {message}")
            try:
                data = json.loads(message)
                print(f">>> JSON décodé : {data}")
                
                name = data.get("name")
                obj = bpy.data.objects.get(name)

                if not obj:
                    print(f">>> Objet '{name}' introuvable")
                    continue

                # --- Mode smooth ---
                if "smooth" in data:
                    flag = data["smooth"]
                    
                    if flag == "A" and "rotation" in data:
                        target = data["rotation"]
                        print(f">>> Smooth rotation de '{name}' vers {target}")
                        await smooth_increment(obj, "rotation_euler", target)

                    elif flag == "I" and "increment" in data:
                        print(">>> Smooth increment non implémenté")
                        pass

                    elif flag == "P" and "location" in data:
                        target = data["location"]
                        print(f">>> Smooth déplacement de '{name}' vers {target}")
                        await smooth_increment(obj, "location", target)

                    else:
                        print(">>> Smooth flag avec données invalides ou manquantes")

                else:
                    if "location" in data:
                        location = data["location"]
                        print(f">>> Déplacement de '{name}' à {location}")
                        obj.location = location

                    elif "increment" in data:
                        delta = data["increment"]
                        print(f">>> Incrémentation de '{name}' de {delta}")
                        obj.location.x += delta[0]
                        obj.location.y += delta[1]
                        obj.location.z += delta[2]

                    elif "rotation" in data:
                        rot = data["rotation"]
                        print(f">>> Rotation de '{name}' vers {rot}")
                        obj.rotation_euler = rot

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
        "0.0.0.0",
        8767,
        ping_interval=None
    ):
        print(">>> Serveur WebSocket prêt sur ws://0.0.0.0:8767")
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
