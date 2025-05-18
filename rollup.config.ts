import type { Plugin } from "rollup";
import type { Options } from "@swc/core";
import type { MergedRollupOptions } from "rollup";

import _swc from "@rollup/plugin-swc";
import _nodeResolve, { type RollupNodeResolveOptions } from "@rollup/plugin-node-resolve";
import _commonjs, { type RollupCommonJSOptions } from "@rollup/plugin-commonjs";
import _json, { type RollupJsonOptions } from "@rollup/plugin-json";

const swc = _swc as unknown as (options?: Options) => Plugin;
const nodeResolve = _nodeResolve as unknown as (options?: RollupNodeResolveOptions) => Plugin;
const commonjs = _commonjs as unknown as (options?: RollupCommonJSOptions) => Plugin;
const json = _json as unknown as (options?: RollupJsonOptions) => Plugin;

const rollup: MergedRollupOptions[] = [
    {
        input: "src/index.ts",
        output: [
            {
                file: "build/index.ts",
                format: "esm"
            }
        ],
        plugins: [
            swc(),
            nodeResolve({
                preferBuiltins: true
            }),
            commonjs({
                strictRequires: true
            }),
            json()
        ],

        external: ["@sveltejs/kit", "@sveltejs/kit/node", "MANIFEST", "SERVER"]
    }
];

export default rollup;
