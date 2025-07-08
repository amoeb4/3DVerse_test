import asyncio
import websockets
import json

import asyncio
import json
import websockets

async def send_command(uri):
    try:
        async with websockets.connect(uri) as websocket:
            print("Connecté au serveur WebSocket.")
            while True:
                line = input("Commande (ex: Cube -P 1.0 2.0 3.0) : ").strip()
                if not line:
                    continue
                if line.lower() in ('exit', 'quit', 'q'):
                    print("Fermeture du client...")
                    break

                parts = line.split()
                if len(parts) != 5:
                    print("Format invalide. Exemple : Cube -P 1.0 2.0 3.0")
                    continue

                name, mode = parts[0], parts[1].upper()
                try:
                    coords = [float(parts[2]), float(parts[3]), float(parts[4])]
                except ValueError:
                    print("Coordonnées invalides. Utilisez des nombres.")
                    continue

                if mode == "-P":
                    key = "location"
                    message = json.dumps({"name": name, key: coords, "mode": mode})
                    await websocket.send(message)
                    print(f"Commande envoyée : {message}")

                elif mode == "-A":
                    key = "rotation"
                    message = json.dumps({"name": name, key: coords, "mode": mode})
                    await websocket.send(message)
                    print(f"Commande envoyée : {message}")

                elif mode == "-S":
                    key = "location"
                    print("Démarrage de la simulation -S (100 steps)")
                    for i in range(100):
                        step_coords = [
                            coords[0] + (i / 100),
                            coords[1] + (i / 100),
                            coords[2] + (i / 100)
                        ]
                        message = json.dumps({"name": name, key: step_coords, "mode": mode})
                        await websocket.send(message)
                        print(f"[{i+1}/100] Commande envoyée : {message}")
                        await asyncio.sleep(0.2)  # 200 ms entre chaque envoi

                else:
                    print("Mode inconnu. Utilisez -P, -A ou -S")
                    continue

    except KeyboardInterrupt:
        print("\nInterruption clavier détectée, fermeture du client.")
    except Exception as e:
        print(f"Erreur : {e}")

async def main():
    uri = "ws://localhost:8767"
    while True:
        try:
            await send_command(uri)
            break
        except (ConnectionRefusedError, websockets.exceptions.InvalidURI) as e:
            print(f"Connexion refusée : {e}. Nouvelle tentative dans 5 secondes...")
            await asyncio.sleep(5)
        except KeyboardInterrupt:
            print("\nInterruption clavier détectée, arrêt du programme.")
            break

if __name__ == "__main__":
    asyncio.run(main())
