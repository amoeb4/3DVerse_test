# APP VLM-Robotics avec 3DVerse #

composants principaux : React, Node, 3Dverse, ws, esLint, vite

*-------------------------------------------------------------*

Utilisations :

'npm run dev' : Lancer le site en mode développement

'npm run build' : Construire l'executable à déployer

'npm run preview' : Lancer le site avec l'intégration Vite

'npm run server' : Lancer le serveur de communication par Websocket *WIP*

*-------------------------------------------------------------*

Une fois le site lancé, ouvrir un navigateur (chrome de préfèrence) et lancer http://localhost:5173/ 

Renseigner le Scene UUID du projet 3Dverse à consulter, ou appuyer sur "Empty layout" pour accéder à une version de test d'affichage légère.

*-------------------------------------------------------------*

Utilisation du serveur :

La syntaxe est la suivante : "[!commande] (entité) (valeur)"

Toute commande doit commencer par '!', auquel cas, elle ne sera pas interpretée

vous pouvez obtenir la liste des commandes avec la commande "!help"

le nom de l'entité correspond à son UUID (ex : 123-456-78910112-420)

la valeur est exprimée en int

*-------------------------------------------------------------*

Développé par David FRANCOIS(amoeb4) et Clément BILLY(billygrosmollets) pour la societé VLM-Robotics
