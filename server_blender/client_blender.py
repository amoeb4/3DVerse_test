import asyncio
import websockets
import json

async def send_command(uri):
    try:
        async with websockets.connect(uri) as websocket:
            print("✅ Connecté au serveur WebSocket.")
            while True:
                line = input("Commande (ex: Cube -P 1.0 2.0 3.0) : ").strip()
                if not line:
                    continue
                if line.lower() in ('exit', 'quit', 'q'):
                    print("👋 Fermeture du client...")
                    break
                parts = line.split()
                if len(parts) != 5:
                    print("❌ Format invalide. Exemple : Cube -P 1.0 2.0 3.0")
                    continue
                name, mode = parts[0], parts[1].upper()
                try:
                    coords = [float(parts[2]), float(parts[3]), float(parts[4])]
                except ValueError:
                    print("❌ Coordonnées invalides. Utilisez des nombres.")
                    continue
                if mode in ("-P", "-I", "-S", "-A"):
                    key = "location" if mode in ("-P", "-I", "-S") else "rotation"
                    message = json.dumps({"name": name, key: coords, "mode": mode})
                else:
                    print("❌ Mode inconnu. Utilisez -P, -I, -A ou -S")
                    continue
                await websocket.send(message)
                print(f"📤 Commande envoyée : {message}")
    except KeyboardInterrupt:
        print("\n🛑 Interruption clavier détectée, fermeture du client.")
    except Exception as e:
        print(f"❌ Erreur : {e}")

async def main():
    uri = "ws://localhost:8767"
    while True:
        try:
            await send_command(uri)
            break
        except (ConnectionRefusedError, websockets.exceptions.InvalidURI) as e:
            print(f"⚠️ Connexion refusée : {e}. Nouvelle tentative dans 5 secondes...")
            await asyncio.sleep(5)
        except KeyboardInterrupt:
            print("\n🛑 Interruption clavier détectée, arrêt du programme.")
            break

if __name__ == "__main__":
    asyncio.run(main())
