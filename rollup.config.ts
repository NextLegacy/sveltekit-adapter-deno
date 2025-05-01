import type { Plugin } from "rollup";
import type { Options } from "@swc/core";
import type { MergedRollupOptions } from "rollup";
import _swc from "@rollup/plugin-swc";

const swc = _swc as unknown as (options?: Options) => Plugin;

const rollup: MergedRollupOptions[] = [
    {
        input: "src/index.ts",
        output: [
            {
                file: "build/index.ts",
                format: "esm"
            }
        ],
        plugins: [swc()],
        external: ["@sveltejs/kit", "@sveltejs/kit/node", "MANIFEST", "@std/path", "SERVER"]
    },
    {
        input: "src/env.ts",
        output: [
            {
                file: "build/env.ts",
                format: "esm"
            }
        ],
        plugins: [swc()]
    },
    {
        input: "src/utils.ts",
        output: [
            {
                file: "build/utils.ts",
                format: "esm"
            }
        ],
        plugins: [swc()]
    },
    {
        input: "src/handler.ts",
        output: [
            {
                file: "build/handler.ts",
                format: "esm"
            }
        ],
        plugins: [swc()],
        external: ["@sveltejs/kit", "@sveltejs/kit/node", "MANIFEST", "@std/path", "SERVER"]
    }
];

export default rollup;
