import { connect } from "ts-postgres";

import { COOKIE_TIMEOUT } from "./controller";

export async function createTable(): Promise<void> {
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

function cookieTimeStamp(): string {
	let date = new Date().getTime();
	date += COOKIE_TIMEOUT * 1000;

	let newDate = new Date(date);
	return newDate.toISOString().replace("T", " ").replace(/\..*$/, "") + ":+00"; 
	// Use UTC because with that you'll be able to store and compare
	// independently from where or who send the request and got the cookie
}

export async function createUser(cookie_id: string): Promise<void> {
	const psqlConnection = await connect({
		user: "Matixannder",
		host: "localhost",
		port: 5432,
		database: "TODOAppDB",
	});


	const createUserQuery = 
		`INSERT INTO users (cookie_id, cookie_expiration_date)
		VALUES (${cookie_id}, ${cookieTimeStamp()});`;

	try {
		await psqlConnection.query(createUserQuery);
	} catch (e) {
		console.log("An error happened");
		console.log(e);
	}
}
