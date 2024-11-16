// 3 things
// Persistent cookie for any user that accesess the website
//
// Database to store the tasks
//
// UI to create, change and delete tasks

import * as http from "node:http";
import * as fs from "fs";
import path, { join } from "node:path";

const COOKIE_TIMEOUT = 1 // 30 seconds


interface ResponseHeader {
	[key: string]: string | undefined;
	"content-type": string;
	"Access-Control-Allow-Origin": string;
	"set-cookie"?: string | undefined;
}

const server = http.createServer((req, res) => {
	let sessionId = Math.floor(new Date().getTime() / 1000).toString(); // Date in seconds
	let reqCookie = req.headers.cookie;
	let reqUri = req.url;

	const response_header: ResponseHeader = {
		"content-type": "text/html",
		"Access-Control-Allow-Origin": "*",
	}

	const parentFolder = path.resolve(__dirname, "..");
	let body = "Hello world without HTML";

	if (reqUri === "/" && !reqCookie) {
		body = fs.readFileSync(join(parentFolder, "public", "index.html"), "utf8")

		response_header["set-cookie"] =
		"sessionId=" + sessionId + "; Path=/; HttpOnly; Secure; Max-Age=" 
		+ COOKIE_TIMEOUT.toString() + ";" + "SameSite=Strict";

		console.log("Cookie: " + response_header["set-cookie"] +
					"\nwill be send to the client");
	}

	res
	.writeHead(200, response_header)
	.end(body); // Specifies no more data will be send in this response
})


server.listen(8080, () => {
	console.log("HTTP server init successfully");
});

