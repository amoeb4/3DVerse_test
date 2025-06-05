import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

const SCENE_ID = "e0be46dc-7db8-4b44-97e0-b4fff984e41c"; // Remplace par ton vrai ID

function App() {
  const viewerRef = useRef(null);
  const [token, setToken] = useState(null);

  // 1. Récupération du token utilisateur depuis ton backend
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const res = await axios.post("http://localhost:5000/api/setup-user");
        console.log("Token reçu:", res.data.userToken.user_token);
        setToken(res.data.userToken.user_token);
      } catch (err) {
        console.error("Erreur lors de la récupération du token:", err);
      }
    };

    fetchToken();
  }, []);

  // 2. Lancement du viewer dès que le token est prêt et le SDK chargé
  useEffect(() => {
    if (!token) return;
    if (!window.verse) {
      console.error("SDK 3DVerse non chargé");
      return;
    }

    const launchViewer = async () => {
      try {
        const app = await window.verse.launch({
          container: viewerRef.current,
          userToken: token,
          sceneUUID: SCENE_ID,
          viewport: {
            type: "orbit", // type de caméra
          },
        });

        console.log("3DVerse Viewer lancé !", app);

        // Optionnel : tu peux garder une référence à `app` dans un useRef si besoin

      } catch (error) {
        console.error("Erreur lors du lancement du viewer 3DVerse :", error);
      }
    };

    launchViewer();
  }, [token]);

  return (
    <div style={{ height: "100vh", width: "100vw", margin: 0, padding: 0 }}>
      <h1>My 3DVerse Viewer</h1>
      <div
        ref={viewerRef}
        style={{ width: "100%", height: "600px", border: "1px solid #ccc" }}
      />
    </div>
  );
}

export default App;
