# SvelteKit Adapter for Deno 🦕

[![npm package](https://img.shields.io/npm/v/@nextlegacy/sveltekit-adapter-deno)](https://www.npmjs.com/package/@nextlegacy/sveltekit-adapter-deno)
[![License](https://img.shields.io/npm/l/@nextlegacy/sveltekit-adapter-deno)](LICENSE)
[![Version](https://img.shields.io/github/v/release/nextlegacy/sveltekit-adapter-deno?include_prereleases)](https://github.com/nextlegacy/sveltekit-adapter-deno/releases)

> Adapter for SvelteKit apps that generates a standalone Deno server. 🦕

This adapter aims to be a drop-in replacement for [`@sveltejs/adapter-node`](https://kit.svelte.dev/docs/adapter-node), utilizing Deno's built-in [`Deno.serve`](https://docs.deno.com/api/deno/~/Deno.serve) for handling HTTP requests and serving static files, removing the need for Node.js ecosystem dependencies like Polka or Sirv. ✨

For more information on SvelteKit adapters in general, see the [official documentation](https://svelte.dev/docs/kit/adapters).

## Key Features 🔥

*   **🦕 Deno Runtime**: Uses Deno's built-in features for handling HTTP requests and serving static files.
*   **📦 Basically no runtime Dependencies**: Finished build only uses Deno's standard library and Node.js compatible imports.
*   **🔄 Drop-in Replacement**: Designed to work seamlessly as a replacement for `adapter-node` in most configurations.

## Installation 🛠️

Install the adapter as a development dependency in your SvelteKit project:

```bash
# Using deno
deno install npm:@nextlegacy/sveltekit-adapter-deno

# Using npm
npm install -D @nextlegacy/sveltekit-adapter-deno

# Using yarn
yarn add -D @nextlegacy/sveltekit-adapter-deno

# Using pnpm
pnpm add -D @nextlegacy/sveltekit-adapter-deno
```

## Usage 🚀

1.  **Configure `svelte.config.js`**: Update your configuration to use the adapter:

    ```javascript
    import adapter from "@nextlegacy/sveltekit-adapter-deno";

    /** @type {import("@sveltejs/kit").Config} */
    const config = {
      kit: {
        adapter: adapter({
          // Optional: specify adapter options here (see Configuration below)
        }),

        // other kit options...
      }
    };

    export default config;
    ```

2.  **Build your application**: Use the Deno task defined in your `deno.json` (or the corresponding npm script):

    ```bash
    # Using Deno tasks (recommended)
    deno task build

    # Or using npm scripts (if configured)
    # npm run build
    ```

3.  **Run the Deno server**: Execute the generated entry point `build/index.ts` with Deno, granting necessary permissions:

    ```bash
    deno run --allow-net --allow-read --allow-env build/index.ts
    ```

## Example Project 🌟

For a complete example setup, check out my template repository:
[NextLegacy/SvelteKit-Deno-Tempalte](https://github.com/nextlegacy/sveltekit-deno-template)

## Configuration ⚙️

This adapter accepts the same options object as the official [`@sveltejs/adapter-node`](https://kit.svelte.dev/docs/adapter-node#options):

| Option        | Type      | Default     | Description                                                                                                                                 |
| ------------- | --------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `out`         | `string`  | `'build'`   | The directory to write the server files to.                                                                                                 |
| `precompress` | `boolean` | `true`      | If `true`, precompresses static assets using gzip and brotli.                                                                               |
| `envPrefix`   | `string`  | `''`        | Specifies a prefix for environment variables passed to the server. See [SvelteKit docs](https://kit.svelte.dev/docs/adapter-node#environment-variables). |

Refer to the [`adapter-node` documentation](https://kit.svelte.dev/docs/adapter-node#options) for details on all available options.

## Environment Variables 📑

This adapter recognizes a subset of the environment variables used by [`@sveltejs/adapter-node`](https://kit.svelte.dev/docs/kit/adapter-node#environment-variables) to control the built server's behavior.

**Note:** Variables related to client address headers (`ADDRESS_HEADER`, `XFF_DEPTH`), origin determination (`ORIGIN`, `PROTOCOL_HEADER`, `HOST_HEADER`, `PORT_HEADER`), and systemd socket activation (`LISTEN_PID`, `LISTEN_FDS`) are **not** currently implemented in this adapter.

The following variables are supported:

| Variable           | Default                                | Description                                                                      |
| ------------------ | -------------------------------------- | -------------------------------------------------------------------------------- |
| `HOST`             | `'0.0.0.0'`                            | The IP address to bind to.                                                       |
| `PORT`             | `3000` (if `SOCKET_PATH` unset)        | The port to listen on.                                                           |
| `SOCKET_PATH`      | `false`                                | Unix socket path to listen on (overrides `HOST`/`PORT`).                          |
| `BODY_SIZE_LIMIT`  | `512K`                                 | Maximum request body size (e.g., `512K`, `1M`, `Infinity`).                    |
| `SHUTDOWN_TIMEOUT` | `30`                                   | Seconds to wait for graceful shutdown.                                           |
| `IDLE_TIMEOUT`     | `0`                                    | Seconds of inactivity before server exits (useful for socket activation).        |

For a detailed explanation of each variable and its usage, please refer to the [**`@sveltejs/adapter-node` Environment Variables Documentation**](https://svelte.dev/docs/kit/adapter-node#environment-variables).

## Benchmarks 📊

I plan to add better real-world benchmarks soon. For now, here's a simple proof of concept benchmark using [`autocannon`](https://github.com/mcollina/autocannon) and a relatively simple SvelteKit project that I had lying around:

_(Note: Benchmarks run using `autocannon -c 100 -d 5 -p 10`. Your results may vary based on hardware and application complexity.)_
*(run locally w/ Deno 2.3.1)*

**@nextlegacy/adapter-deno:**

```
┌─────────┬────────┬────────┬────────┬────────┬───────────┬──────────┬────────┐
│ Stat    │ 2.5%   │ 50%    │ 97.5%  │ 99%    │ Avg       │ Stdev    │ Max    │
├─────────┼────────┼────────┼────────┼────────┼───────────┼──────────┼────────┤
│ Latency │ 147 ms │ 222 ms │ 239 ms │ 240 ms │ 219.4 ms  │ 23.84 ms │ 250 ms │
└─────────┴────────┴────────┴────────┴────────┴───────────┴──────────┴────────┘
┌───────────┬─────────┬─────────┬─────────┬─────────┬─────────┬─────────┬─────────┐
│ Stat      │ 1%      │ 2.5%    │ 50%     │ 97.5%   │ Avg     │ Stdev   │ Min     │
├───────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│ Req/Sec   │ 4,203   │ 4,203   │ 4,523   │ 4,535   │ 4,453.2 │ 126.89  │ 4,201   │
├───────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│ Bytes/Sec │ 70.8 MB │ 70.8 MB │ 76.2 MB │ 76.4 MB │ 75 MB   │ 2.15 MB │ 70.8 MB │
└───────────┴─────────┴─────────┴─────────┴─────────┴─────────┴─────────┴─────────┘
```

**@sveltejs/adapter-node:**

```
┌─────────┬────────┬────────┬────────┬────────┬───────────┬─────────┬────────┐
│ Stat    │ 2.5%   │ 50%    │ 97.5%  │ 99%    │ Avg       │ Stdev   │ Max    │
├─────────┼────────┼────────┼────────┼────────┼───────────┼─────────┼────────┤
│ Latency │ 250 ms │ 336 ms │ 448 ms │ 481 ms │ 345.96 ms │ 48.07 ms│ 535 ms │
└─────────┴────────┴────────┴────────┴────────┴───────────┴─────────┴────────┘
┌───────────┬─────────┬─────────┬─────────┬─────────┬─────────┬─────────┬─────────┐
│ Stat      │ 1%      │ 2.5%    │ 50%     │ 97.5%   │ Avg     │ Stdev   │ Min     │
├───────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│ Req/Sec   │ 2,197   │ 2,197   │ 2,967   │ 3,131   │ 2,807   │ 336.18  │ 2,197   │
├───────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│ Bytes/Sec │ 37 MB   │ 37 MB   │ 50 MB   │ 52.8 MB │ 47.3 MB │ 5.66 MB │ 37 MB   │
└───────────┴─────────┴─────────┴─────────┴─────────┴─────────┴─────────┴─────────┘
```


## Production Readiness ✅

I am slowly starting to use this adapter in production environments as a drop-in replacement for `adapter-node` without issues so far.

However, as a community project leveraging newer Deno APIs, I recommend performing thorough testing for your specific use case before deploying to critical production systems. 🧪 While it aims for stability and follows [`@sveltejs/adapter-node`](https://kit.svelte.dev/docs/adapter-node)'s behavior closely, 100% production readiness compared to the more battle-tested [`@sveltejs/adapter-node`](https://kit.svelte.dev/docs/adapter-node) cannot be guaranteed at this stage.

## Repository 💾

You can find the source code on GitHub:
[https://github.com/nextlegacy/sveltekit-adapter-deno](https://github.com/nextlegacy/sveltekit-adapter-deno)

## Contributing & Support ♥️

Contributions are welcome! Please feel free to open an issue or submit a pull request.

You can also contact me on various platforms: [✨nextlegacy.de/contact](https://nextlegacy.de/contact)

## License 📜

[MIT](LICENSE)
