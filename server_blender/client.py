import asyncio
import json
import websockets

positions = {f"part_{i}": [0.0, 0.0, 0.0] for i in range(1, 7)}
command_buffer = []

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

                raw_commands = [cmd.strip() for cmd in line.split(",") if cmd.strip()]

                for raw_cmd in raw_commands:
                    if raw_cmd.lower() == "list":
                        print("📜 Command buffer :")
                        if not command_buffer:
                            print("  (vide)")
                        else:
                            for idx, cmd in enumerate(command_buffer, start=1):
                                print(f"  {idx}. {cmd}")
                        continue

                    if raw_cmd.lower() == "reset":
                        print("Reset en cours...")
                        total_cmds = len(command_buffer)
                        for idx, cmd in enumerate(command_buffer, start=1):
                            parts = cmd.split()
                            if len(parts) != 4:
                                print(f"Commande dans le buffer mal formatée, ignorée : '{cmd}'")
                                continue
                            name = parts[0]
                            try:
                                values = [float(parts[1]), float(parts[2]), float(parts[3])]
                            except ValueError:
                                print(f"Coordonnées invalides dans la commande buffer, ignorée : '{cmd}'")
                                continue
                            inverse_values = [-v for v in values]
                            message = json.dumps({"name": name, "location": inverse_values})
                            await websocket.send(message)
                            print(f"[{idx}/{total_cmds}] Commande inverse envoyée : {message}")
                            await asyncio.sleep(1)
                        command_buffer.clear()
                        continue
                    
                    command_buffer.insert(0, raw_cmd)

                    # Parse et envoi au serveur
                    parts = raw_cmd.split()
                    if len(parts) != 4:
                        print(f"Format invalide pour la commande : '{raw_cmd}'")
                        continue

                    name = parts[0]
                    is_increment = False
                    if name.endswith("+="):
                        is_increment = True
                        name = name[:-2]

                    try:
                        values = [float(parts[1]), float(parts[2]), float(parts[3])]
                    except ValueError:
                        print(f"Coordonnées invalides dans la commande : '{raw_cmd}'")
                        continue

                    if name not in positions:
                        positions[name] = [0.0, 0.0, 0.0]

                    old_pos = positions[name].copy()

                    if is_increment:
                        updated = [old_pos[i] + values[i] for i in range(3)]
                    else:
                        updated = values

                    positions[name] = updated

                    message = json.dumps({"name": name, "location": updated})
                    await websocket.send(message)
                    print(f"Commande envoyée : {message}")

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