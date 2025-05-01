/**
 * Parses the given value into number of bytes.
 *
 * @param value - Size in bytes. Can also be specified with a unit suffix kilobytes (K), megabytes (M), or gigabytes (G).
 * @returns The size in bytes as a number
 */
export function parseAsBytes(value: string): number {
    const multiplier =
        {
            K: 1024,
            M: 1024 * 1024,
            G: 1024 * 1024 * 1024
        }[value[value.length - 1]?.toUpperCase()] ?? 1;
    return Number(multiplier !== 1 ? value.substring(0, value.length - 1) : value) * multiplier;
}

/**
 * Get content type based on file extension
 */
export function getContentTypeFromPath(path: string): string {
    const ext = path.split(".").pop()?.toLowerCase() || "";
    const contentTypes: Record<string, string> = {
        html: "text/html",
        js: "application/javascript",
        css: "text/css",
        json: "application/json",
        png: "image/png",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        gif: "image/gif",
        svg: "image/svg+xml",
        ico: "image/x-icon",
        webp: "image/webp",
        woff: "font/woff",
        woff2: "font/woff2",
        ttf: "font/ttf",
        eot: "application/vnd.ms-fontobject",
        otf: "font/otf",
        txt: "text/plain",
        xml: "application/xml",
        webmanifest: "application/manifest+json"
    };

    return contentTypes[ext] || "application/octet-stream";
}
