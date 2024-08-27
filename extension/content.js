function getProblemUrl() {
    const parts = window.location.href.split("/");
    const baseIndex = parts.indexOf("problems") + 1;

    const baseUrl = parts.slice(0, baseIndex + 1).join("/");
    return baseUrl;
}

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

    const languageElement =
        document.querySelector(".ant-select-selection-selected-value") ||
        document.querySelector("button.group.font-normal > div")?.parentElement

    const url = getProblemUrl();

    if (problemTitleElement && difficultyElement) {
        const problem =
            problemTitleElement.textContent?.trim() || "Unknown Problem";

        const difficulty =
            difficultyElement.textContent?.trim().toLowerCase() || "hard";

        const language =
            languageElement.textContent?.trim() || "Unknown Language";

        return {
            type: "status",
            payload: {
                difficulty: difficulty,
                problem: problem,
                language: language,
                url: url,
            },
        };
    }

    return {
        type: "custom",
        payload: "Idle",
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
    } else if (status.type === "custom") {
        chrome.runtime.sendMessage({
            type: "setCustom",
            data: status.payload,
        });
    }
}

setInterval(sendStatusUpdate, 1000);
document.addEventListener("DOMContentLoaded", sendStatusUpdate);
