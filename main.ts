// 3 things
// Persistent cookie for any user that accesess the website
//
// Database to store the tasks
//
// UI to create, change and delete tasks

import { createServer } from "node:http";

import { serverUrls, COOKIE_TIMEOUT } from "./controller";
import { createTable } from "./db_implementations";


const server = createServer((req, res) => {
	const obtainedRes = serverUrls(req);

	res
	.writeHead(obtainedRes.codeStatus, obtainedRes.header)
	.end(obtainedRes.body); // Specifies no more data will be send in this response
});




(async function initServer() {
	await createTable();

	server.listen(8080, () => {
		console.log("HTTP server init successfully");
	});
})();
