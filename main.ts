// 3 things
// Persistent cookie for any user that accesess the website
//
// Database to store the tasks
//
// UI to create, change and delete tasks

import * as http from "node:http";
import * as fs from "fs";
import path, { join } from "node:path";
import { connect } from "ts-postgres";

const COOKIE_TIMEOUT = 1 // 31 seconds


interface ResponseHeader {
	[key: string]: string | undefined;
	"content-type": string;
	"Access-Control-Allow-Origin": string;
	"set-cookie"?: string | undefined;
}

const server = http.createServer((req, res) => {
	let reqCookie = req.headers.cookie;
	let reqUri = req.url;
	let body = "Hello world without HTML";

	const response_header: ResponseHeader = {
		"content-type": "text/html",
		"Access-Control-Allow-Origin": "*",
	}


	if (reqUri === "/" && !reqCookie) {
		const cookieId = Math.floor(new Date().getTime() / 1000).toString(); // Date in seconds
		const parentFolder = path.resolve(__dirname, "..");
		body = fs.readFileSync(join(parentFolder, "public", "index.html"), "utf8")

		response_header["set-cookie"] =
		"sessionId=" + cookieId + "; Path=/; HttpOnly; Secure; Max-Age=" 
		+ COOKIE_TIMEOUT.toString() + ";" + "SameSite=Strict";

		console.log("Cookie: " + response_header["set-cookie"] +
					"\nwill be send to the client");
	}

	res
	.writeHead(200, response_header)
	.end(body); // Specifies no more data will be send in this response
})




function cookieTimeStamp(): string {
	let date = new Date().getTime();
	date += COOKIE_TIMEOUT * 1000;

	let newDate = new Date(date);
	return newDate.toISOString().replace("T", " ").replace(/\..*$/, "") + ":+00"; 
	// Use UTC because with that you'll be able to store and compare
	// independently from where or who send the request and got the cookie
}

async function createDB(): Promise<void> {
	const psqlConnection = await connect({
		user: "Matixannder",
		host: "localhost",
		port: 5432,
		database: "TODOAppDB",
		keepAlive: true
	});

	// This is the command that I'll use when I have to compare the timestamps
	// select * from users 
	// where cookie_expiration_date < NOW() at time zone 'utc';
	const createUserTable =
		`CREATE TABLE users (
			id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
			cookie_id VARCHAR(10),
			cookie_expiration_date_utc TIMESTAMP
	);`; 

	await psqlConnection.query(createUserTable);
}

(async function initServer() {
	try {
		await createDB();
	} 
	catch (e) {
		console.log("Table already exists");
	}

	

	server.listen(8080, () => {
		console.log("HTTP server init successfully");
	});
})();