import "jsr:@std/dotenv/load";

const expected = new Set([
    "SOCKET_PATH",
    "HOST",
    "PORT",
    "ORIGIN",
    "XFF_DEPTH",
    "ADDRESS_HEADER",
    "PROTOCOL_HEADER",
    "HOST_HEADER",
    "PORT_HEADER",
    "BODY_SIZE_LIMIT",
    "SHUTDOWN_TIMEOUT",
    "IDLE_TIMEOUT"
]);

const expected_unprefixed = new Set(["LISTEN_PID", "LISTEN_FDS"]);

if (ENV_PREFIX) {
    for (const name in Deno.env.toObject()) {
        if (!name.startsWith(ENV_PREFIX)) continue;
        const unprefixed = name.slice(ENV_PREFIX.length);
        if (expected.has(unprefixed)) continue;
        throw new Error(
            `You should change envPrefix (${ENV_PREFIX}) to avoid conflicts with existing environment variables — unexpectedly saw ${name}`
        );
    }
}

// deno-lint-ignore no-explicit-any
function env(name: string, fallback: any) {
    const prefix = expected_unprefixed.has(name) ? "" : ENV_PREFIX;
    const prefixed = prefix + name;

    return Deno.env.get(prefixed) ?? fallback;
}

export { env };
