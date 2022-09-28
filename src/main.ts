import { readFile } from "fs";
import { createServer, IncomingMessage, OutgoingHttpHeaders, ServerResponse } from "http";
import { extname, resolve } from "path";

import yargs from "yargs";
import { lookup } from "mime-types";

const { port, baseDir, cors } = yargs(process.argv.slice(2))
    .options({
        "port": { alias: "p", type: "number", default: 8081, description: "The port to listen on" },
        "base-dir": { alias: "d", type: "string", default: "/public", description: "The directory to serve content from" },
        "cors": { alias: "c", type: "boolean", default: true, description: "Whether to enable CORS" },
    })
    .locale("en-US")
    .parseSync();

const corsHeader = cors ? { "Access-Control-Allow-Origin": "*" } : {};

function handler(request: IncomingMessage, response: ServerResponse) {
    console.log(`Request ${request.url}`);

    readFile(`.${baseDir}${request.url}`, (error, content) => {
        if (error) {
            if (error.code === "ENOENT") {
                response.writeHead(404).end("Not Found");
            } else {
                response.writeHead(500).end(`Error: ${error.code}`);
            }
        } else {
            const headers: OutgoingHttpHeaders = {
                "Content-Type": lookup(extname(request.url!)) || "application/octet-stream",
                ...corsHeader,
            }
            response.writeHead(200, headers).end(content, "utf-8");
        }
    });
}

createServer(handler).listen(port);

console.log(`Listening on http://127.0.0.1:${port}`);
console.log(`Serving content from ${resolve("." + baseDir)}`)
