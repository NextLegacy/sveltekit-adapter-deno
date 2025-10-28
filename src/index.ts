import { env } from "./env.ts";

import process from "node:process";

import { handler } from "./handler.ts";

export const socketPath = env("SOCKET_PATH", false);
export const hostname = env("HOST", "0.0.0.0");
export const port = env("PORT", !socketPath && "3000");

const shutdownTimeout = parseInt(env("SHUTDOWN_TIMEOUT", "30"));
const idleTimeout = parseInt(env("IDLE_TIMEOUT", "0"));
const listenPid = parseInt(env("LISTEN_PID", "0"));
const listenFds = parseInt(env("LISTEN_FDS", "0"));

if (listenPid !== 0 && listenPid !== Deno.pid) {
    throw new Error(`received LISTEN_PID ${listenPid} but current process id is ${Deno.pid}`);
}

if (listenFds > 1) {
    throw new Error(`only one socket is allowed for socket activation, but LISTEN_FDS was set to ${listenFds}`);
}

const socketActivation = listenPid === Deno.pid && listenFds === 1;

let activeRequests = 0;
let shutdownTimeoutId: number | undefined;
let idleTimeoutId: number | undefined;

const controller = new AbortController();
const serveOptions = { signal: controller.signal };

if (socketPath) {
    try {
        await Deno.remove(socketPath);
    } catch (error) {
        if (!(error instanceof Deno.errors.NotFound)) {
            console.error("Problem removing stale socket:", error);
        }
    }
    serveOptions.path = socketPath;
} else {
    serveOptions.hostname = hostname;
    serveOptions.port = port;
}

const serveHandler: Deno.ServeHandler<Deno.NetAddr> = async (request, info) => {
    activeRequests++;

    if (socketActivation && idleTimeoutId) {
        clearTimeout(idleTimeoutId);
        idleTimeoutId = undefined;
    }

    const response = await handler(request, info);

    activeRequests--;

    if (shutdownTimeoutId) {
        checkIfCanShutdown();
    }

    if (activeRequests === 0 && socketActivation && idleTimeout > 0) {
        idleTimeoutId = setTimeout(() => gracefulShutdown("IDLE"), idleTimeout * 1000);
    }

    return response;
};

function checkIfCanShutdown() {
    if (!shutdownTimeoutId) return;
    if (activeRequests !== 0) return;

    clearTimeout(shutdownTimeoutId);

    if (idleTimeoutId) {
        clearTimeout(idleTimeoutId);
        idleTimeoutId = undefined;
    }
}

function gracefulShutdown(reason: string) {
    console.log(`Shutting down server...`);

    if (shutdownTimeoutId) {
        return;
    }

    shutdownTimeoutId = setTimeout(() => {
        console.log(`Shutdown timeout (${shutdownTimeout}s) reached. Forcing close.`);
        controller.abort();
    }, shutdownTimeout * 1000);

    // @ts-expect-error No overload matches this call.
    process.emit("sveltekit:shutdown", reason);

    controller.abort();

    checkIfCanShutdown();
}

Deno.addSignalListener("SIGINT", () => gracefulShutdown("SIGINT"));

if (Deno.build.os !== "windows") {
    Deno.addSignalListener("SIGTERM", () => gracefulShutdown("SIGTERM"));
}

export const server = Deno.serve(serveOptions, serveHandler);
