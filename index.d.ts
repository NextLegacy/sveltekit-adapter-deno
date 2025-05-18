import type { Adapter } from "@sveltejs/kit";

export type AdapterOptions = {
    out?: string;
    precompress?: boolean;
    envPrefix?: string;
};

declare global {
    const ENV_PREFIX: string;
}

export default function plugin(options?: AdapterOptions): Adapter;
