import {readFile} from "fs";
import {createServer, IncomingMessage, OutgoingHttpHeaders, ServerResponse} from "http";
import {resolve, join} from "path";

import {lookup as mimeLookup} from "mime-types";
import yargs from "yargs";

const [, scriptName, ...argv] = process.argv;
const {port, baseDir, cors} = yargs(argv)
    .scriptName(scriptName)
    .options({
        "port": {
            alias: "p",
            type: "number",
            default: 8081,
            description: "The port to listen on"
        },
        "base-dir": {
            alias: "d",
            type: "string",
            default: ".",
            description: "The directory to serve content from",
            normalize: true
        },
        "cors": {
            alias: "c",
            type: "boolean",
            default: true,
            description: "Whether to enable CORS"
        },
    })
    .locale("en")
    .parseSync();

const corsHeader = cors ? {"Access-Control-Allow-Origin": "*"} : {};

function handler(request: IncomingMessage, response: ServerResponse) {
    const targetFilePath = resolve(join(baseDir, request.url!));

    console.log(`Request: ${request.url} -> ${targetFilePath}`);

    readFile(`${baseDir}${request.url}`, (error, content) => {
        if (error) {
            if (error.code === "ENOENT") {
                response.writeHead(404).end("Not Found");
            } else {
                response.writeHead(500).end(`Error: ${error.code}`);
            }
        } else {
            const headers: OutgoingHttpHeaders = {
                "Content-Type": mimeLookup(request.url!) || "application/octet-stream",
                ...corsHeader,
            }
            response.writeHead(200, headers).end(content, "utf-8");
        }
    });
}

createServer(handler).listen(port);

console.log(`Listening on http://127.0.0.1:${port}`);
console.log(`Serving content from ${resolve(baseDir)}`);
