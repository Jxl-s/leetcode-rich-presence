import RPC from "discord-rpc";
import config from "../config.json";
import { Difficulty } from "./types";

const rpc = new RPC.Client({ transport: "ipc" });

interface StatusProps {
    difficulty: Difficulty;
    problem: string;
    url: string;
}

/**
 * Updates the problem being solved
 */
export const updateStatus = ({ difficulty, problem, url }: StatusProps) => {
    rpc.setActivity({
        largeImageKey: "leetcode_logo",
        largeImageText: config.image,
        smallImageKey: config.difficulties[difficulty].image,
        smallImageText: config.difficulties[difficulty].text,
        state: problem,
        startTimestamp: new Date(),
        buttons: [
            {
                label: "View Problem",
                url,
            },
        ],
    });
};

/**
 * Sets the status to idle
 */
export const setIdle = () => {
    rpc.setActivity({
        largeImageKey: "leetcode_logo",
        largeImageText: config.image,
        state: "Idle",
        startTimestamp: new Date(),
    });
};

/**
 * When the user leaves the web page
 */
export const clearStatus = () => {
    rpc.clearActivity();
};

rpc.on("ready", () => {
    console.log("RPC ready!");
});

export const rpcLogin = async () => rpc.login({ clientId: config.client_id });
