const RECONNECT_INTERVAL = 5000; // 5 seconds

let ws;

function createWebSocket() {
    try {
        ws = new WebSocket("ws://localhost:3124");

        ws.onopen = () => {
            console.log("WebSocket connection opened");
        };

        ws.onmessage = (event) => {
            console.log("Received message from server:", event.data);
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        ws.onclose = (event) => {
            console.log("WebSocket connection closed:", event.reason);
            // Attempt to reconnect after a delay
            setTimeout(createWebSocket, RECONNECT_INTERVAL);
        };
    } catch (e) {}
}

createWebSocket(); // Initial connection

function updateStatus(status) {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "status", payload: status }));
    }
}

function setIdle() {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "idle" }));
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "updateStatus") {
        updateStatus(message.data);
    }

    if (message.type === "setIdle") {
        setIdle();
    }
});
