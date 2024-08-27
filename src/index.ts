import { createServer } from "http";
import { WebSocketServer } from "ws";
import { clearStatus, rpcLogin, setIdle, updateStatus } from "./rpc";
import { port_number } from "../config.json";
import { Difficulty } from "./types";

const server = createServer();
const wss = new WebSocketServer({ server });

(async () => {
    await rpcLogin();
    updateStatus({
        difficulty: Difficulty.Hard,
        problem: "25. Reverse Nodes in k-Group",
        url: "https://leetcode.com/problems/reverse-nodes-in-k-group",
    });

    wss.on("connection", (ws) => {
        ws.on("message", (message) => {
            try {
                // Status Updates
                const data = JSON.parse(message.toString());
                if (data.type === "status") {
                    updateStatus(data.payload);
                } else if (data.type === "idle") {
                    setIdle();
                }
            } catch (e) {
                console.log(e);
            }
        });

        ws.on("close", () => {
            // Handle disconnections
            if (wss.clients.size <= 0) {
                clearStatus();
            }
        });
    });

    server.listen(port_number, () => {
        console.log(`WebSocket server ready at port ${port_number}!`);
    });
})();
