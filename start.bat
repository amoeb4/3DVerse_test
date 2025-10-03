@echo off
REM =========================
REM Configuration
REM =========================
set FRONTEND_PORT=5173

REM =========================
REM Lancer le frontend Vite
REM =========================
echo 🚀 Lancement du frontend Vite
start cmd /k "npm run dev"

REM =========================
REM Lancer le backend Node.js
REM =========================
echo 🚀 Lancement du backend Node.js
start cmd /k "node src/server.js"

REM =========================
REM Lancer le serveur Python classique
REM =========================
echo 🚀 Lancement du backend Python
start cmd /k "cd server && python client.py"

REM =========================
REM Lancer le serveur Blender Python
REM =========================
echo 🚀 Lancement du serveur Blender
start cmd /k "cd server_blender && python client_blender.py"

REM =========================
REM Lancer OPC-UA / gRPC (optionnel)
REM =========================
echo 🚀 Lancement du serveur OPC-UA
start cmd /k "npx tsx src/server-opcua.ts"

echo ✅ Toutes les instances ont été lancées
echo 🌐 Ouvrez votre navigateur sur http://localhost:%FRONTEND_PORT%
pause

