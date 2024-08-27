import RPC from "discord-rpc";
import config from "../config.json";
import { Difficulty } from "./types";
import { z } from "zod";
import { State } from "./state";

const REFRESH_TIMER = 5 * 5000;
const rpc = new RPC.Client({ transport: "ipc" });

const statusSchema = z.object({
    difficulty: z.enum([Difficulty.Easy, Difficulty.Medium, Difficulty.Hard]),
    problem: z.string(),
    url: z.string(),
});

type StatusProps = z.infer<typeof statusSchema>;
/**
 * Updates the problem being solved
 */
export const updateStatus = (props: StatusProps) => {
    try {
        const { difficulty, problem, url } = statusSchema.parse(props);
        if (
            State.problem === problem &&
            Date.now() - State.last_update <= REFRESH_TIMER
        )
            return;

        State.idle = false;
        State.problem = problem;
        State.last_update = Date.now();

        rpc.setActivity({
            largeImageKey: "leetcode_logo",
            largeImageText: config.image,
            smallImageKey: config.difficulties[difficulty].image,
            smallImageText: config.difficulties[difficulty].text,
            details: problem,
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
            console.error("Validation errors:", e.errors);
        } else {
            console.error("Unexpected error:", e);
        }
    }
};

/**
 * Sets the status to idle
 */
export const setIdle = () => {
    if (State.idle === true && Date.now() - State.last_update <= REFRESH_TIMER)
        return;

    State.idle = true;
    State.problem = "";
    State.last_update = Date.now();

    rpc.setActivity({
        largeImageKey: "leetcode_logo",
        largeImageText: config.image,
        details: "Idle",
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
