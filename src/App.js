import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

const SCENE_ID = "e0be46dc-7db8-4b44-97e0-b4fff984e41c";

function App() {
  const viewerRef = useRef(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const res = await axios.post("http://localhost:5000/api/setup-user");
        console.log("✅ Token reçu:", res.data.userToken.user_token);
        setToken(res.data.userToken.user_token);
      } catch (err) {
        console.error("❌ Erreur lors de la récupération du token:", err);
      }
    };

    fetchToken();
  }, []);

  useEffect(() => {
    if (!token) return;

    const waitForD3VAndLaunch = async () => {
      // ⏳ Attente jusqu'à ce que window.D3V soit défini
      while (!window.D3V) {
        console.log("⏳ En attente du SDK 3DVerse...");
        await new Promise((res) => setTimeout(res, 100));
      }

      console.log("✅ SDK 3DVerse prêt :", window.D3V);

      try {
        const client = new window.D3V.Client({
          container: viewerRef.current,
          userToken: token,
        });

        await client.loadScene(SCENE_ID);
        const camera = await client.getActiveCamera();
        camera.focusOnScene();

        console.log("✅ Viewer 3DVerse lancé !");
      } catch (error) {
        console.error("❌ Erreur lors du lancement du viewer :", error);
      }
    };

    waitForD3VAndLaunch();
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

