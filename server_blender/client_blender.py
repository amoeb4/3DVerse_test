import asyncio
import json
import websockets

async def send_command(uri):
    try:
        async with websockets.connect(uri) as websocket:
            print("Connecté au serveur WebSocket.")
            while True:
                line = input("Commande (ex: Cube 1.0 2.0 3.0) : ").strip()
                if not line:
                    continue
                if line.lower() in ('exit', 'quit', 'q'):
                    print("Fermeture du client...")
                    break

                parts = line.split()
                if len(parts) != 4:
                    print("Format invalide. Exemple : Cube 1.0 2.0 3.0")
                    continue

                name = parts[0]
                try:
                    coords = [float(parts[1]), float(parts[2]), float(parts[3])]
                except ValueError:
                    print("Coordonnées invalides. Utilisez des nombres.")
                    continue

                mode = "-P"
                key = "location"
                message = json.dumps({"name": name, key: coords, "mode": mode})
                await websocket.send(message)
                print(f"Commande envoyée : {message}")

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
