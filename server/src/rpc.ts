import RPC from "discord-rpc";
import { Difficulty } from "./types";
import { z } from "zod";
import { State } from "./state";
import { DIFFICULTIES, LEETCODE_IMAGE_KEY } from "./constants";

export const rpc = new RPC.Client({ transport: "ipc" });
let rpcReady = false;

const statusSchema = z.object({
    difficulty: z.enum([Difficulty.Easy, Difficulty.Medium, Difficulty.Hard]),
    problem: z.string(),
    url: z.string(),
    lineCount: z.number(),
});

type StatusProps = z.infer<typeof statusSchema>;

/**
 * Updates the problem being solved
 */
export const updateStatus = async (props: StatusProps) => {
    try {
        const { difficulty, problem, url, lineCount } = statusSchema.parse(props);
        console.log("State: ", problem, "with", lineCount, "lines");

        if (State.problem === problem || !rpcReady) return;

        State.reset();
        State.problem = problem;

        await rpc.setActivity({
            largeImageKey: "leetcode_logo",
            largeImageText: LEETCODE_IMAGE_KEY,
            smallImageKey: DIFFICULTIES[difficulty].image,
            smallImageText: DIFFICULTIES[difficulty].text,
            details: problem,
            state: `Lines Written: ${lineCount}`,
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
            console.error("[RPC] Validation errors:", e.errors);
        } else {
            console.error("[RPC] Unexpected error:", e);
        }
    }
};

const customStatus = z.enum(["Idle", "Browsing"]);
type CustomStatus = z.infer<typeof customStatus>;

/**
 * Sets the status to idle
 */
export const setCustom = async (status: CustomStatus) => {
    try {
        status = customStatus.parse(status);
        console.log("State: ", status);
        if (State.customStatus === status || !rpcReady) return;

        State.reset();
        State.customStatus = status;

        await rpc.setActivity({
            largeImageKey: LEETCODE_IMAGE_KEY,
            largeImageText: "LeetCode",
            details: "Idle",
            startTimestamp: new Date(),
        });
    } catch (e) {
        if (e instanceof z.ZodError) {
            console.error("[RPC] Validation errors:", e.errors);
        } else {
            console.error("[RPC] Unexpected error:", e);
        }
    }
};

/**
 * When the user leaves the web page
 */
export const clearStatus = () => {
    if (rpcReady) {
        rpc.clearActivity();
    }

    State.reset();
};

rpc.on("ready", () => {
    rpcReady = true;
    console.log("[RPC] RPC ready!");
});

rpc.on("disconnected", () => {
    rpcReady = false;
    console.log("[RPC] RPC Disconnected");
});
