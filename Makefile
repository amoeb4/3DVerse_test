run:
	@echo "Lancement de l'application en cours"
	gnome-terminal --tab -- bash -c "npm run dev; exec bash"
	gnome-terminal --tab -- bash -c "cd src && node server.js; exec bash"
	sleep 0.1
	gnome-terminal --tab -- bash -c "cd server_blender && python3 client.py; exec bash"
	sleep 1
		@if command -v xdg-open > /dev/null; then \
		xdg-open http://localhost:5173; \
	else \
		echo "xdg-open non trouvé, ouvre http://localhost:5173 manuellement."; \
	fi

	ec
