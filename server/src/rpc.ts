import { Client } from "discord-rpc";
import { Difficulty } from "./types";
import { z } from "zod";

import {
    CLIENT_ID,
    DIFFICULTIES,
    LEETCODE_IMAGE_KEY,
    PING_GRACE_PERIOD,
    RETRY_DELAY,
} from "./constants";

let rpc = new Client({ transport: "ipc" });
let rpcReady = false;

// To prevent multiple status updates
const State = {
    // State in the rich presence
    problem: "",
    language: "",
    customStatus: "",

    // State in the extension
    previousPing: 0,

    // Resetter function
    reset: () => {
        State.problem = "";
        State.language = "";
        State.customStatus = "";
    },
};

const statusSchema = z.object({
    difficulty: z.enum([Difficulty.Easy, Difficulty.Medium, Difficulty.Hard]),
    problem: z.string(),
    url: z.string(),
    language: z.string(),
});

type StatusProps = z.infer<typeof statusSchema>;

/**
 * Updates the problem being solved
 */
export const updateStatus = async (props: StatusProps) => {
    State.previousPing = Date.now();

    try {
        const { difficulty, problem, url, language } =
            statusSchema.parse(props);

        if (!rpcReady) return;
        if (State.problem === problem && State.language === language) return;

        State.reset();
        State.problem = problem;
        State.language = language;

        await rpc.setActivity({
            largeImageKey: "leetcode_logo",
            largeImageText: LEETCODE_IMAGE_KEY,
            smallImageKey: DIFFICULTIES[difficulty].image,
            smallImageText: DIFFICULTIES[difficulty].text,
            details: problem,
            state: `Language: ${language}`,
            startTimestamp: new Date(),
            buttons: [
                {
                    label: "View Problem",
                    url,
                },
            ],
        });
    } catch (e) {
        if (e instanceof z.ZodError) {
            console.error("[RPC] Validation errors in updateStatus");
        } else {
            console.error("[RPC] Unexpected error in updateStatus");
        }
    }
};

const customStatus = z.enum(["Idle", "Browsing"]);
type CustomStatus = z.infer<typeof customStatus>;

/**
 * Sets the status to idle
 */
export const setCustom = async (status: CustomStatus) => {
    State.previousPing = Date.now();

    try {
        status = customStatus.parse(status);

        if (!rpcReady) return;
        if (State.customStatus === status) return;

        State.reset();
        State.customStatus = status;

        await rpc.setActivity({
            largeImageKey: LEETCODE_IMAGE_KEY,
            largeImageText: "LeetCode",
            details: status,
            startTimestamp: new Date(),
        });
    } catch (e) {
        if (e instanceof z.ZodError) {
            console.error("[RPC] Validation errors in setCustom");
        } else {
            console.error("[RPC] Unexpected error in setCustom");
        }
    }
};

/**
 * When the user leaves the web page
 */
export const clearStatus = () => {
    State.reset();
    rpc.clearActivity();
};

async function login() {
    State.reset();

    rpc = new Client({ transport: "ipc" });
    rpc.on("ready", () => {
        rpcReady = true;
        console.log("[RPC] RPC ready!");
    });

    rpc.on("disconnected", () => {
        rpcReady = false;
        console.log("[RPC] RPC Disconnected");
        rpc.destroy();

        setTimeout(login, RETRY_DELAY);
    });

    try {
        await rpc.login({ clientId: CLIENT_ID });
    } catch (error) {
        console.error("[RPC] Error logging in");
        setTimeout(login, RETRY_DELAY);
    }
}

// Clear status if the user is inactive
setInterval(() => {
    if (Date.now() - State.previousPing > PING_GRACE_PERIOD) {
        clearStatus();
    }
}, 1000);

login();
