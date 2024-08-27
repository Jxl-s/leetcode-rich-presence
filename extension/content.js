function getStatus() {
    const problemTitleElement =
        document.querySelector("div[data-cy='question-title']") ||
        document.querySelector(".text-title-large");

    const difficultyElement =
        document.querySelector("div[diff='easy']") ||
        document.querySelector("div[diff='medium']") ||
        document.querySelector("div[diff='hard']") ||
        document.querySelector(".text-difficulty-easy") ||
        document.querySelector(".text-difficulty-medium") ||
        document.querySelector(".text-difficulty-hard");

    const url = window.location.href.split("?")[0];

    if (problemTitleElement && difficultyElement) {
        const problem =
            problemTitleElement.textContent?.trim() || "Unknown Problem";
        const difficulty =
            difficultyElement.textContent?.trim().toLowerCase() || "hard";

        return {
            type: "status",
            payload: {
                difficulty: difficulty,
                problem: problem,
                url: url,
            },
        };
    }

    return {
        type: "idle",
    };
}

getStatus();

function sendStatusUpdate() {
    const status = getStatus();
    if (status.type === "status") {
        chrome.runtime.sendMessage({
            type: "updateStatus",
            data: status.payload,
        });
    } else if (status.type === "idle") {
        chrome.runtime.sendMessage({ type: "setIdle" });
    }
}

setInterval(sendStatusUpdate, 1000);
document.addEventListener("DOMContentLoaded", sendStatusUpdate);
