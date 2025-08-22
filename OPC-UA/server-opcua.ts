// server-opcua.ts
import { 
    OPCUAServer,
    Variant,
    DataType
} from "node-opcua";

async function startServer() {
    // 1️⃣ Création du serveur OPC-UA
    const server = new OPCUAServer({
        port: 4840, // port local
        resourcePath: "/UA/Robot6Axes",
        buildInfo: {
            productName: "Robot6AxesSimulator",
            buildNumber: "1",
            buildDate: new Date()
        }
    });

    await server.initialize();

    // 2️⃣ Création de l'espace de noms
    const addressSpace = server.engine.addressSpace!;
    const namespace = addressSpace.getOwnNamespace();

    // 3️⃣ Ajout des joints du robot (A1 → A6)
    const robotFolder = namespace.addObject({
        organizedBy: addressSpace.rootFolder.objects,
        browseName: "Robot6Axes"
    });

    const jointNames = ["A1", "A2", "A3", "A4", "A5", "A6"];
    const variables: Record<string, { value: number }> = {};

    jointNames.forEach(joint => {
        variables[joint] = { value: 0 };

        namespace.addVariable({
            componentOf: robotFolder,
            browseName: joint,
            nodeId: `ns=1;s=${joint}`, // identifiant unique
            dataType: "Double",
            value: {
                get: () => {
                    return new Variant({ dataType: DataType.Double, value: variables[joint].value });
                },
                set: (variant) => {
                    console.log(`Joint ${joint} set to`, variant.value);
                    variables[joint].value = variant.value;
                    return true;
                }
            }
        });
    });

    // 🔄 Simulateur : met à jour toutes les secondes
    setInterval(() => {
        jointNames.forEach(joint => {
            variables[joint].value = Math.random() * 180 - 90;
        });
    }, 1000);

    // 4️⃣ Démarrage du serveur
    await server.start();
    console.log("✅ OPC-UA Server is running at opc.tcp://localhost:4840/UA/Robot6Axes");

    // 5️⃣ Gestion des signaux pour arrêt propre
    process.on("SIGINT", async () => {
        console.log("\n🛑 Stopping OPC-UA Server...");
        await server.shutdown(1000);
        console.log("✅ Server stopped.");
        process.exit(0);
    });

    process.on("SIGTERM", async () => {
        console.log("\n🛑 Server received SIGTERM");
        await server.shutdown(1000);
        console.log("✅ Server stopped.");
        process.exit(0);
    });
}

startServer().catch(console.error);