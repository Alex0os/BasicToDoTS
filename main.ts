// 3 things
// Persistent cookie for any user that accesess the website
//
// Database to store the tasks
//
// UI to create, change and delete tasks

import { createServer } from "node:http";

import serverUrls from "./controller";
import createDB from "./db_implementations";

const COOKIE_TIMEOUT = 1 // 31 seconds

const server = createServer((req, res) => {
	const obtainedRes = serverUrls(req);

	res
	.writeHead(obtainedRes.codeStatus, obtainedRes.header)
	.end(obtainedRes.body); // Specifies no more data will be send in this response
})


function cookieTimeStamp(): string {
	let date = new Date().getTime();
	date += COOKIE_TIMEOUT * 1000;

	let newDate = new Date(date);
	return newDate.toISOString().replace("T", " ").replace(/\..*$/, "") + ":+00"; 
	// Use UTC because with that you'll be able to store and compare
	// independently from where or who send the request and got the cookie
}


(async function initServer() {
	await createDB();

	server.listen(8080, () => {
		console.log("HTTP server init successfully");
	});
})();
