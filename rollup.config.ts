import type { Plugin } from "rollup";
import type { Options } from "@swc/core";
import type { MergedRollupOptions } from "rollup";
import _swc from "@rollup/plugin-swc";
import _nodeResolve, { type RollupNodeResolveOptions } from "@rollup/plugin-node-resolve";

const swc = _swc as unknown as (options?: Options) => Plugin;
const nodeResolve = _nodeResolve as unknown as (options?: RollupNodeResolveOptions) => Plugin;
const rollup: MergedRollupOptions[] = [
    {
        input: "src/index.ts",
        output: [
            {
                file: "build/index.ts",
                format: "esm"
            }
        ],
        plugins: [swc(), nodeResolve({
            preferBuiltins: true,
        })],
        
        external: ["@sveltejs/kit", "@sveltejs/kit/node", "MANIFEST", "SERVER"]
    },
];

export default rollup;
