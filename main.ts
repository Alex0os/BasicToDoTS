// 3 things
// Persistent cookie for any user that accesess the website
//
// Database to store the tasks
//
// UI to create, change and delete tasks

import { createServer } from "node:http";

import { serverUrls } from "./controller";
import { createTable, createTask } from "./db_implementations";


const server = createServer((req, res) => {
	if (req.method?.toLowerCase() === "post") {
		if (!req.headers.cookie)
			// TODO: Server should return a bad request response
			process.exit("No cookie given");


		let reqBody = '';
		req.on("data", (buffer) => {
			reqBody = buffer;
		});

		req.on("end", () => {
			createTask(req.headers.cookie as string, JSON.parse(reqBody.toString()));
		});
	} else if (req.method?.toLowerCase() === "get") {
		serverUrls(req).then((obtainedRes) => {
			res
			.writeHead(obtainedRes.codeStatus, obtainedRes.header)
			.end(obtainedRes.body);
		});
	}
});


(async function initServer() {
	await createTable();

	server.listen(8080, () => {
		console.log("HTTP server init successfully");
	});
})();
