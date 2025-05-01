import { dirname, fromFileUrl, join } from "@std/path";
import { parseAsBytes, getContentTypeFromPath } from "./utils.ts";
import { env } from "./env.ts";
import { Server } from "SERVER";
import { createReadableStream } from "@sveltejs/kit/node";

import { base, manifest, prerendered } from "MANIFEST";

const server = new Server(manifest);

const bodySizeLimit = parseAsBytes(env("BODY_SIZE_LIMIT", "512K") as string);

if (isNaN(bodySizeLimit)) {
    throw new Error(`Invalid BODY_SIZE_LIMIT: '${env("BODY_SIZE_LIMIT", "512K")}'. Please provide a numeric value.`);
}

const dir = dirname(fromFileUrl(import.meta.url));
const assetDir = join(dir, "client" + base);

const prerenderedDir = join(dir, "prerendered");
const staticDir = join(dir, "static");

await server.init({
    env: Deno.env.toObject(),
    read: (file: string) => createReadableStream(join(assetDir, file))
});

export const handler: Deno.ServeHandler<Deno.NetAddr> = async (request, info) => {
    const url = new URL(request.url);
    const pathname = url.pathname;

    if (pathname.startsWith(`${base}/`) || pathname === base) {
        try {
            const filePath = join(assetDir, pathname.slice(base.length) || "/");
            const fileInfo = await Deno.stat(filePath);

            if (fileInfo.isFile) {
                const content = await Deno.readFile(filePath);
                const contentType = getContentTypeFromPath(filePath);

                const headers: Record<string, string> = {
                    "content-type": contentType
                };

                if (pathname.startsWith(`${base}/${manifest.appPath}/immutable/`)) {
                    headers["cache-control"] = "public,max-age=31536000,immutable";
                }

                return new Response(content, {
                    status: 200,
                    headers
                });
            }
        } catch {
            void 0;
        }
    }

    const staticPath = join(staticDir, pathname);

    let fileInfo: Deno.FileInfo;
    try {
        fileInfo = await Deno.stat(staticPath);
        if (fileInfo.isFile) {
            const content = await Deno.readFile(staticPath);
            return new Response(content, {
                status: 200,
                headers: {
                    "content-type": getContentTypeFromPath(staticPath)
                }
            });
        }
    } catch {
        void 0;
    }

    if (prerendered.has(pathname)) {
        const filePath = join(prerenderedDir, pathname === "/" ? "/index.html" : pathname);
        const content = await Deno.readFile(filePath);
        return new Response(content, {
            status: 200,
            headers: {
                "content-type": "text/html"
            }
        });
    }

    const withTrailingSlash = pathname.endsWith("/") ? pathname : pathname + "/";
    const withoutTrailingSlash = pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;

    if (prerendered.has(withTrailingSlash) && pathname !== withTrailingSlash) {
        return new Response(null, {
            status: 308,
            headers: {
                location: withTrailingSlash + url.search
            }
        });
    } else if (prerendered.has(withoutTrailingSlash) && pathname !== withoutTrailingSlash) {
        return new Response(null, {
            status: 308,
            headers: {
                location: withoutTrailingSlash + url.search
            }
        });
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
        if (request.headers.get("content-length")) {
            const contentLength = parseInt(request.headers.get("content-length") || "0");
            if (contentLength > bodySizeLimit) {
                return new Response("Payload Too Large", { status: 413 });
            }
        }
    }

    return await server.respond(request, {
        getClientAddress: () => info.remoteAddr.hostname
    });
};
