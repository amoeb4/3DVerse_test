import bpy
import asyncio
import threading
import websockets
import json

print(">>> Script WebSocket lancé")

async def smooth_increment(obj, prop, target, sleep_ms=50):
    # obj = objet Blender
    # prop = 'location' ou 'rotation_euler'
    # target = liste [x,y,z]
    # sleep_ms = temps entre chaque incrément (en ms)

    # Récupère la valeur actuelle
    current = getattr(obj, prop).copy()
    steps = 10  # nombre d'étapes (tu peux ajuster)
    
    # Calcul des pas (diff / steps)
    delta = [(t - c) / steps for c, t in zip(current, target)]
    
    for i in range(steps):
        for j in range(3):
            current[j] += delta[j]
        setattr(obj, prop, current)
        await asyncio.sleep(sleep_ms / 1000)  # conversion ms -> secondes
    # Pour assurer la valeur finale exacte
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
                
                # Check flag S (smooth/incrémentation progressive)
                if "smooth" in data:
                    flag = data["smooth"]  # 'P', 'I' ou 'A' attendu
                    if flag == "A" and "rotation" in data:
                        target = data["rotation"]
                        print(f">>> Smooth rotation de '{name}' vers {target}")
                        await smooth_increment(obj, "rotation_euler", target)
                    elif flag == "I" and "increment" in data:
                        # Optionnel: gérer incrément smooth sur position (à adapter)
                        pass
                    elif flag == "P" and "location" in data:
                        # Optionnel: smooth déplacement position
                        pass
                    else:
                        print(">>> Smooth flag avec données invalides ou manquantes")
                else:
                    # Commandes classiques
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


