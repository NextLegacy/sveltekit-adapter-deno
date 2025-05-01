import { rollup } from "rollup";

import { fileURLToPath } from "node:url";
import { nodeResolve } from "@rollup/plugin-node-resolve";

const files = fileURLToPath(new URL("./build", import.meta.url).href);

export default function (opts = {}) {
    const { out = "build", precompress = true, envPrefix = "HELLO_WORLD" } = opts;

    return {
        name: "sveltekit-adapter-deno",
        adapt: async (builder) => {
            const tmp = builder.getBuildDirectory("sveltekit-adapter-deno");

            builder.rimraf(out);
            builder.rimraf(tmp);
            builder.mkdirp(tmp);

            builder.log.minor("Copying assets");
            builder.writeClient(`${out}/client${builder.config.kit.paths.base}`);
            builder.writePrerendered(`${out}/prerendered${builder.config.kit.paths.base}`);

            if (precompress) {
                builder.log.minor("Compressing assets");
                await Promise.all([builder.compress(`${out}/client`), builder.compress(`${out}/prerendered`)]);
            }

            builder.log.minor("Building server");

            builder.writeServer(tmp);

            Deno.writeTextFileSync(
                `${tmp}/manifest.js`,
                [
                    `export const manifest = ${builder.generateManifest({ relativePath: "./" })};`,
                    `export const prerendered = new Set(${JSON.stringify(builder.prerendered.paths)});`,
                    `export const base = ${JSON.stringify(builder.config.kit.paths.base)};`
                ].join("\n\n")
            );

            const denoJson = JSON.parse(Deno.readTextFileSync("deno.json"));
            const packageJson = JSON.parse(Deno.readTextFileSync("package.json"));
            const dependencies = packageJson.dependencies || {};
            const imports = denoJson.imports || {};

            const input = {
                index: `${tmp}/index.js`,
                manifest: `${tmp}/manifest.js`
            };

            const external = [...Object.keys(imports), ...Object.keys(dependencies)].map((d) => new RegExp(`^${d}(\\/.*)?$`));

            const bundle = await rollup({
                input,
                external,
                plugins: [
                    nodeResolve({
                        preferBuiltins: true,
                        exportConditions: ["node"]
                    })
                ]
            });

            await bundle.write({
                dir: `${out}/server`,
                format: "esm",
                sourcemap: true,
                chunkFileNames: "chunks/[name]-[hash].js"
            });

            builder.copy(files, out, {
                replace: {
                    ENV_PREFIX: JSON.stringify(envPrefix),
                    MANIFEST: "./server/manifest.js",
                    SERVER: "./server/index.js"
                }
            });
        }
    };
}
