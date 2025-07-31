run:
	@echo "Démarrage des services..."
	gnome-terminal --tab -- bash -c "npm run dev; exec bash"
	gnome-terminal --tab -- bash -c "cd src && node server.js; exec bash"
	sleep 0.1
	gnome-terminal --tab -- bash -c "cd server_blender && python3 client.py; exec bash"

