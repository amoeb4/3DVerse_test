import asyncio
import json
import websockets

# Positions actuelles des pièces
positions = {f"part_{i}": [0.0, 0.0, 0.0] for i in range(1, 7)}
# Historique des positions précédentes (nouvelle commande en tête)
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
                        total_cmds = len(command_buffer)
                        for idx, (name, previous_pos) in enumerate(command_buffer, start=1):
                            positions[name] = previous_pos
                            message = json.dumps({"name": name, "location": positions[name]})
                            await websocket.send(message)
                            print(f"[{idx}/{total_cmds}] Position restaurée : {message}")
                            await asyncio.sleep(1)  # Pause entre chaque reset
                        command_buffer.clear()
                        continue

                    # --- LIST ---
                    if raw_cmd.lower() == "list":
                        print("📜 Command buffer :")
                        if not command_buffer:
                            print("  (vide)")
                        else:
                            for idx, (name, pos) in enumerate(command_buffer, start=1):
                                print(f"  {idx}. {name} -> {pos}")
                        continue

                    # --- PARSE COMMANDE ---
                    parts = raw_cmd.split()
                    if len(parts) != 4:
                        print(f"Format invalide pour la commande : '{raw_cmd}'")
                        print("Exemple attendu : part_1 1.0 2.0 3.0 ou part_1+= 1.0 2.0 3.0")
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
                    print(f"Avant modification, {name} = {old_pos}")
                    if is_increment:
                        updated = [old_pos[i] + values[i] for i in range(3)]
                    else:
                        updated = values
                    print(f"Après modification, {name} = {updated}")

                    positions[name] = updated

                    command_buffer.insert(0, (name, old_pos))
                    print(f"Buffer mis à jour : {[(n,p) for n,p in command_buffer]}")

                    # Envoi au serveur
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