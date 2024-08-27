import { createServer } from "http";
import { WebSocketServer } from "ws";
import { clearStatus, rpcLogin, setIdle, updateStatus } from "./rpc";
import { port_number } from "../config.json";

const server = createServer();
const wss = new WebSocketServer({ server });

(async () => {
    try {
        await rpcLogin();
    } catch (error) {
        console.error("Failed to login RPC:", error);
        process.exit(1);
    }

    wss.on("connection", (ws) => {
        console.log("WebSocket client connected!");
        ws.on("message", async (message) => {
            console.log("message received", message.toString());

            try {
                const data = JSON.parse(message.toString());
                if (data.type === "status") {
                    await updateStatus(data.payload);
                } else if (data.type === "idle") {
                    await setIdle();
                }
            } catch (e) {
                console.error("Failed to process message:", e);
            }
        });

        ws.on("close", () => {
            console.log("WebSocket client disconnected!");
            if (wss.clients.size <= 0) {
                clearStatus();
            }
        });

        ws.on("error", (error) => {
            console.error("WebSocket error:", error);
        });
    });

    server.listen(port_number, () => {
        console.log(`WebSocket server ready at port ${port_number}!`);
    });
})();
