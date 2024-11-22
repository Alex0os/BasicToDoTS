// 3 things
// Persistent cookie for any user that accesess the website
//
// Database to store the tasks
//
// UI to create, change and delete tasks

import { createServer } from "node:http";
import { connect } from "ts-postgres";

import serverUrls from "./controller";

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

async function createDB(): Promise<void> {
	const psqlConnection = await connect({
		user: "Matixannder",
		host: "localhost",
		port: 5432,
		database: "TODOAppDB",
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

	const createTasksTable = 
		`CREATE TABLE tasks (
			id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
			user_id BIGINT REFERENCES users (id),
			title varchar(255),
			description TEXT
	);`;


	try {
		await psqlConnection.query(createUserTable);
	} catch (e) {
		console.log("User's table already exists");
	}

	try {
		await psqlConnection.query(createTasksTable);
	}  catch (e) {
		console.log("Tasks table already exists");
	}

}

(async function initServer() {
	await createDB();


	server.listen(8080, () => {
		console.log("HTTP server init successfully");
	});
})();
