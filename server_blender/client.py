import asyncio
import json
import websockets

# Initialiser les positions à 0 pour les parts 1 à 6
positions = {
    f"part_{i}": [0.0, 0.0, 0.0] for i in range(1, 7)
}

async def send_command(uri):
    try:
        async with websockets.connect(uri) as websocket:
            print("Connecté au serveur WebSocket.")
            while True:
                line = input("Attente d'une commande... : ").strip()
                if not line:
                    continue
                if line.lower() in ('exit', 'quit', 'q'):
                    print("Fermeture du client...")
                    break

                # Séparer par virgule, trim chaque sous-commande
                raw_commands = [cmd.strip() for cmd in line.split(",") if cmd.strip()]

                for raw_cmd in raw_commands:
                    # --- PAUSE ---
                    if raw_cmd.lower().startswith("pause "):
                        try:
                            ms = float(raw_cmd.split()[1])
                            print(f"Pause de {ms} ms...")
                            await asyncio.sleep(ms / 1000)
                        except (IndexError, ValueError):
                            print(f"Commande 'pause' invalide : '{raw_cmd}'")
                        continue

                    # --- RESET ---
                    if raw_cmd.lower() == "reset":
                        print("Reset en cours...")
                        for name, pos in positions.items():
                            if any(c != 0.0 for c in pos):
                                inverse = [-v for v in pos]
                                message = json.dumps({"name": name, "location": inverse})
                                await websocket.send(message)
                                print(f"Commande RESET envoyée : {message}")
                                await asyncio.sleep(0.01)
                                positions[name] = [0.0, 0.0, 0.0]
                        continue

                    # --- COMMANDE DE POSITION ---
                    parts = raw_cmd.split()
                    if len(parts) not in (4, 5):
                        print(f"Format invalide pour la commande : '{raw_cmd}'")
                        print("Exemple attendu : part_1 1.0 2.0 3.0")
                        continue

                    name = parts[0]
                    try:
                        delta = [float(parts[1]), float(parts[2]), float(parts[3])]
                    except ValueError:
                        print(f"Coordonnées invalides dans la commande : '{raw_cmd}'")
                        continue

                    # Initialiser si nouvelle part
                    if name not in positions:
                        positions[name] = [0.0, 0.0, 0.0]

                    # Ajouter les delta à la position existante
                    current = positions[name]
                    updated = [current[i] + delta[i] for i in range(3)]
                    positions[name] = updated

                    message = json.dumps({"name": name, "location": updated})
                    await websocket.send(message)
                    print(f"Commande envoyée : {message}")

                    # Pause 10ms avant la suivante
                    await asyncio.sleep(0.01)

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