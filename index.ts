// 3 things
// Persistent cookie for any user that accesess the website
//
// Database to store the tasks
//
// UI to create, change and delete tasks

// First, the codestyle, then the presentation page and how to store the HTML
// and CSS inside this project and then we do the thing with cookies
import * as http from "node:http";

const validUris = ["/"];
const COOKIE_TIMEOUT = 30 // 30 seconds

// Due to the method "writeHead()" will write another header fields, the key
// signature in the interface its necessary to make it done

interface ResponseHeader {
	[key: string]: string | undefined;
	"content-type": string;
	"Access-Control-Allow-Origin": string;
	"set-cookie"?: string | undefined;
}

const server = http.createServer((req, res) => {
	let sessionId = Math.floor(new Date().getTime() / 1000).toString(); // Date in seconds
	let cookie : string | undefined = req.headers.cookie;
	let uri : string | undefined = req.url;


	const response_header: ResponseHeader = {
		"content-type": "text/plain",
		"Access-Control-Allow-Origin": "*",
	}

	if (uri && validUris.includes(uri) && cookie)
		console.log(`${uri} -> ${cookie}`);

	else if (uri && !validUris.includes(uri))
		console.log(`${uri} is not valid for cookies`);

	else if (uri && validUris.includes(uri) && !cookie) {
		console.log("This client hasn't set any cookie for this url: " + uri);

		response_header["set-cookie"] =
		"sessionId=" + sessionId + "; Path=/; HttpOnly; Secure; Max-Age=" 
		+ COOKIE_TIMEOUT.toString() + ";" + "SameSite=Strict";

		console.log("Cookie " + response_header["set-cookie"] 
					+ "\nwill be send to the client");
	}

	res
	.writeHead(200, response_header)
	.end("Hello World\n"); // Specifies no more data will be send in this response
})


server.listen(8080, () => {
	console.log("HTTP server init successfully");
});


