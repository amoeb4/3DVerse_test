import asyncio
import websockets
import json

async def send_command(uri):
    try:
        async with websockets.connect(uri) as websocket:
            print("Connecté au serveur WebSocket.")
            while True:
                line = input("Entrez commande (ex: Cube 1.0 2.0 3.0) : ").strip()
                if not line:
                    continue
                if line.lower() in ('exit', 'quit', 'q'):
                    print("Fermeture du client...")
                    break  # Sort de la boucle
                parts = line.split()
                if len(parts) != 4:
                    print("Format invalide. Exemple : Cube 1.0 2.0 3.0")
                    continue

                name = parts[0]
                try:
                    location = [float(parts[1]), float(parts[2]), float(parts[3])]
                except ValueError:
                    print("Les coordonnées doivent être des nombres.")
                    continue

                message = json.dumps({"name": name, "location": location})
                await websocket.send(message)
                print(f"Commande envoyée : {message}")
    except KeyboardInterrupt:
        print("\nInterruption clavier détectée, fermeture du client.")

async def main():
    uri = "ws://localhost:8767"
    while True:
        try:
            await send_command(uri)
            break  # Quitte la boucle si send_command se termine normalement
        except (ConnectionRefusedError, websockets.exceptions.InvalidURI) as e:
            print(f"Erreur de connexion : {e}. Nouvelle tentative dans 5 secondes...")
            await asyncio.sleep(5)
        except KeyboardInterrupt:
            print("\nInterruption clavier détectée, arrêt du programme.")
            break

if __name__ == "__main__":
    asyncio.run(main())

