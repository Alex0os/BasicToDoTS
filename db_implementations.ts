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
	// where cookie_expiration_date < NOW()::TIMESTAMP(0) at time zone 'utc';
	const createUserTable =
		`CREATE TABLE users (
			id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
			cookie_id VARCHAR(15),
			cookie_expiration_date_utc TIMESTAMP
	);`; 

	const createTasksTable = 
		`CREATE TABLE tasks (
			id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
			user_id BIGINT REFERENCES users (id),
			title VARCHAR(255),
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
	return newDate.toISOString().replace("T", " ").replace(/\..*$/, ""); 
}

// Query to delete users when their cookie expires:
// delete from users
// where cookie_expiration_date_utc < now() at time zone 'utc';

export async function createUser(cookie_id: string): Promise<void> {
	const psqlConnection = await connect({
		user: "Matixannder",
		host: "localhost",
		port: 5432,
		database: "TODOAppDB",
	});

	// First we see if the user already exists
	const raw_sessionId = cookie_id.replace(/sessionId=/g, "");
	await psqlConnection.query(`SELECT * FROM users WHERE cookie_id='${raw_sessionId}'`);
	
	// It won't try to create the user again

	const createUserQuery = 
		`INSERT INTO users (cookie_id, cookie_expiration_date_utc)
		VALUES (${raw_sessionId}, '${cookieTimeStamp()}');`;

	try {
		await psqlConnection.query(createUserQuery);
	} catch (e) {
		console.log("An error happened");
		console.log(e);
	}
}
